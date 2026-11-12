import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldErrors, Resolver, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useEscolasWithFilters } from "@/hooks";
import { useSEO } from "@/hooks/useSEO";
import { apiClient } from "@/services/api/client";
import { prePassageiroApi } from "@/services/api/pre-passageiro.api";
import {
  convertDateBrToISO,
  formatShortName,
} from "@/utils/formatters";
import { moneyToNumber } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { getMessage } from "@/constants/messages";

import {
  buildPrePassageiroSchema,
  prePassageiroSchema,
  PrePassageiroFormData,
} from "@/schemas/prePassageiroSchema";
import {
  CamposFormularioExternoConfig,
  DEFAULT_CAMPOS_FORMULARIO_EXTERNO,
  normalizeRespostasComplementares,
  resolveCamposFormularioExterno,
  resolvePerguntasPersonalizadas,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";
import { useAttribution } from "@/hooks/business/useAttribution";
import { collectClientRegistrationMetadata } from "@/utils/client-metadata.utils";
import { getDefaultAnoLetivo } from "@/utils/domain";

export { prePassageiroSchema, type PrePassageiroFormData };

interface PublicMotoristaData {
  id: string;
  nome: string;
  apelido: string | null;
  logo_url: string | null;
  display_name?: string | null;
  campos_formulario_externo?: CamposFormularioExternoConfig;
}

export function usePassageiroExternalForm() {
  useSEO({
    noindex: true,
  });

  useAttribution();

  const { motoristaId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [motoristaApelido, setMotoristaApelido] = useState<string | null>(null);
  const [motoristaDisplayName, setMotoristaDisplayName] = useState<string>("");
  const [motoristaLogoUrl, setMotoristaLogoUrl] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState<CamposFormularioExternoConfig>(
    DEFAULT_CAMPOS_FORMULARIO_EXTERNO
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState([
    "passageiro",
    "responsavel",
    "cobranca",
    "endereco",
    "observacoes",
  ]);

  const { data: escolasList = [] } = useEscolasWithFilters(
    motoristaId,
    { ativo: "true" },
    {
      enabled: !!motoristaId,
      isPublic: true,
    }
  ) as { data: import("@/types/escola").Escola[] };

  const formConfigRef = useRef(formConfig);
  formConfigRef.current = formConfig;

  const dynamicResolver: Resolver<PrePassageiroFormData> = useMemo(() => {
    return (values, context, options) => {
      const currentSchema = buildPrePassageiroSchema(formConfigRef.current);
      return zodResolver(currentSchema)(values, context, options);
    };
  }, []);

  const form = useForm<PrePassageiroFormData>({
    resolver: dynamicResolver,
    defaultValues: {
      nome: "",
      nome_responsavel: "",
      parentesco_responsavel: "",
      cpf_responsavel: "",
      telefone_responsavel: "",
      email_responsavel: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      complemento: "",
      observacoes: "",
      valor_cobranca: "",
      dia_vencimento: "",
      escola_id: "",
      turma: "",
      sala: "",
      nome_professor: "",
      periodo: "",
      modalidade: "",
      ano_letivo: getDefaultAnoLetivo(),
      data_nascimento: "",
      genero: "",
      data_inicio_transporte: "",
      data_fim_transporte: "",
      horario_entrada: "",
      horario_saida: "",
      dados_complementares: [],
    },
    mode: "onBlur",
  });

  const buildInitialDadosComplementares = (config: CamposFormularioExternoConfig) => {
    const ativas = resolvePerguntasPersonalizadas(config.perguntas_personalizadas).filter(
      (p) => p.ativo
    );
    return ativas.map((p) => ({
      id: p.id,
      pergunta: p.pergunta,
      tipo: p.tipo,
      resposta_booleana: null,
      resposta_texto: "",
    }));
  };

  useEffect(() => {
    const validateMotorista = async () => {
      if (!motoristaId) {
        navigate(ROUTES.PUBLIC.ROOT);
        return;
      }

      const { data } = await apiClient
        .get<PublicMotoristaData>(`/public/motoristas/${motoristaId}/validate`)
        .catch(() => ({ data: null }));

      if (!data) {
        toast.error(getMessage("sistema.erro.linkInvalido"), {
          description: getMessage("sistema.erro.linkInvalidoDescricao"),
        });
        navigate(ROUTES.PUBLIC.ROOT);
        return;
      }

      const displayName =
        data.display_name || data.apelido || formatShortName(data.nome, true);
      setMotoristaApelido(displayName);
      setMotoristaDisplayName(displayName);
      setMotoristaLogoUrl(data.logo_url || null);

      const resolvedConfig = resolveCamposFormularioExterno(
        data.campos_formulario_externo
      );
      formConfigRef.current = resolvedConfig;
      setFormConfig(resolvedConfig);
      form.setValue(
        "dados_complementares",
        buildInitialDadosComplementares(resolvedConfig)
      );

      setLoading(false);
    };

    validateMotorista();
  }, [motoristaId, navigate]);

  const onFormError = (errors: FieldErrors<PrePassageiroFormData>) => {
    toast.error("Por favor, verifique os campos destacados em vermelho.");
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  };

  const handleSubmit = async (data: PrePassageiroFormData) => {
    try {
      setSubmitting(true);

      if (!motoristaId) {
        toast.error("sistema.erro.motoristaNaoIdentificado");
        return;
      }

      const payload = {
        ...data,
        telefone_responsavel: String(data.telefone_responsavel || "").replace(
          /\D/g,
          ""
        ),
        cpf_responsavel: String(data.cpf_responsavel || "").replace(/\D/g, ""),
        valor_cobranca: data.valor_cobranca
          ? moneyToNumber(String(data.valor_cobranca))
          : null,
        dia_vencimento: data.dia_vencimento
          ? parseInt(String(data.dia_vencimento), 10)
          : null,
        ano_letivo: parseInt(String(data.ano_letivo), 10),
      };

      if (payload.data_nascimento) {
        payload.data_nascimento = convertDateBrToISO(payload.data_nascimento);
      }
      if (payload.data_inicio_transporte) {
        payload.data_inicio_transporte = convertDateBrToISO(payload.data_inicio_transporte);
      }
      if (payload.data_fim_transporte) {
        payload.data_fim_transporte = convertDateBrToISO(payload.data_fim_transporte);
      }
      payload.horario_entrada = payload.horario_entrada?.trim() || null;
      payload.horario_saida = payload.horario_saida?.trim() || null;

      const { dispositivo_cadastro, metadados_cadastro } = collectClientRegistrationMetadata();

      const perguntasAtivas = resolvePerguntasPersonalizadas(
        formConfigRef.current.perguntas_personalizadas
      ).filter((p) => p.ativo);
      const rawRespostas = data.dados_complementares || [];
      const respostasCompletas = perguntasAtivas.map((p, idx) => {
        const item = rawRespostas.find((r) => r?.id === p.id) || rawRespostas[idx];
        return {
          id: p.id,
          pergunta: p.pergunta,
          tipo: p.tipo,
          resposta_booleana:
            item?.resposta_booleana !== undefined ? item.resposta_booleana : null,
          resposta_texto: item?.resposta_texto || "",
        };
      });

      await prePassageiroApi.createPrePassageiro({
        ...payload,
        dados_complementares: normalizeRespostasComplementares(
          respostasCompletas
        ),
        escola_id: payload.escola_id === "none" ? null : payload.escola_id,
        usuario_id: motoristaId,
        dispositivo_cadastro,
        metadados_cadastro,
      });

      setSuccess(true);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            error?: string;
            details?: Array<{ path: (string | number)[]; message: string }>;
          };
        };
        message?: string;
      };

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Tente novamente mais tarde.";

      if (err.response?.data?.details) {
        const issues = err.response.data.details;
        issues.forEach((issue) => {
          const field = issue.path.join(".") as keyof PrePassageiroFormData;
          form.setError(field, { type: "manual", message: issue.message });
        });
        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "cobranca",
          "endereco",
          "observacoes",
        ]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (
        errorMsg.toLowerCase().includes("telefone") ||
        err.response?.status === 409
      ) {
        form.setError("telefone_responsavel", {
          type: "manual",
          message: errorMsg.replace(/ no sistema/gi, ""),
        });
        setOpenAccordionItems((prev) => Array.from(new Set([...prev, "responsavel"])));
      } else if (errorMsg.toLowerCase().includes("cpf")) {
        form.setError("cpf_responsavel", {
          type: "manual",
          message: errorMsg.replace(/ no sistema/gi, ""),
        });
        setOpenAccordionItems((prev) => Array.from(new Set([...prev, "responsavel"])));
      }

      toast.error("Erro ao enviar solicitação", {
        description: errorMsg.replace(/ no sistema/gi, "") || "Verifique os dados e tente novamente",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCadastro = () => {
    const currentValues = form.getValues();

    form.reset({
      nome_responsavel: currentValues.nome_responsavel,
      parentesco_responsavel: currentValues.parentesco_responsavel,
      cpf_responsavel: currentValues.cpf_responsavel,
      telefone_responsavel: currentValues.telefone_responsavel,
      email_responsavel: currentValues.email_responsavel,

      cep: currentValues.cep,
      logradouro: currentValues.logradouro,
      numero: currentValues.numero,
      bairro: currentValues.bairro,
      cidade: currentValues.cidade,
      estado: currentValues.estado,
      referencia: currentValues.referencia,
      complemento: currentValues.complemento,

      nome: "",
      data_nascimento: "",
      genero: "",
      escola_id: "",
      turma: "",
      sala: "",
      nome_professor: "",
      periodo: "",
      modalidade: "",
      ano_letivo: getDefaultAnoLetivo(),
      data_inicio_transporte: "",
      data_fim_transporte: "",
      horario_entrada: "",
      horario_saida: "",
      observacoes: "",

      valor_cobranca: "",
      dia_vencimento: "",
      dados_complementares: buildInitialDadosComplementares(formConfigRef.current),

      ativo: true,
    });

    setSuccess(false);
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFillMock = () => {
    const currentValues = form.getValues();

    let escolaId = currentValues.escola_id;
    if ((!escolaId || escolaId === "none") && escolasList.length > 0) {
      escolaId = escolasList[Math.floor(Math.random() * escolasList.length)].id;
    }

    const mockData = mockGenerator.passenger({
      escola_id: escolaId,
      veiculo_id: undefined,
    });

    form.reset({
      nome: mockData.nome,
      data_nascimento: mockData.data_nascimento,
      genero: mockData.genero,
      escola_id: escolaId,
      periodo: mockData.periodo,
      modalidade: mockData.modalidade,
      ano_letivo: new Date().getFullYear().toString(),
      turma: mockData.turma,
      sala: mockData.sala || "",
      nome_professor: mockData.nome_professor,
      nome_responsavel: mockData.responsavel_principal.nome,
      telefone_responsavel: mockData.responsavel_principal.telefone,
      cpf_responsavel: mockData.responsavel_principal.cpf,
      parentesco_responsavel: mockData.responsavel_principal.parentesco,
      email_responsavel: mockData.responsavel_principal.email,
      cep: mockData.responsavel_principal.cep,
      logradouro: mockData.responsavel_principal.logradouro,
      numero: mockData.responsavel_principal.numero,
      bairro: mockData.responsavel_principal.bairro,
      cidade: mockData.responsavel_principal.cidade,
      estado: mockData.responsavel_principal.estado,
      referencia: mockData.responsavel_principal.referencia,
      complemento: mockData.responsavel_principal.complemento,
      observacoes: mockData.observacoes,
      valor_cobranca: "",
      dia_vencimento: "",
      data_inicio_transporte: "",
      data_fim_transporte: "",
      horario_entrada: "07:30",
      horario_saida: "12:00",
      dados_complementares: resolvePerguntasPersonalizadas(
        formConfigRef.current.perguntas_personalizadas
      )
        .filter((p) => p.ativo)
        .map((p, idx) => ({
          id: p.id,
          pergunta: p.pergunta,
          tipo: p.tipo,
          resposta_booleana:
            p.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO
              ? idx % 2 === 0
                ? false
                : true
              : null,
          resposta_texto:
            p.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO
              ? idx % 2 === 0
                ? ""
                : "Dipirona (alergia leve)"
              : p.id === "saude_tipo_sanguineo"
                ? "O+"
                : "Avó Maria - (11) 98888-7777",
        })),
      ativo: true,
    });

    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  };

  return {
    form,
    loading,
    motoristaApelido,
    motoristaDisplayName,
    motoristaLogoUrl,
    formConfig,
    submitting,
    success,
    openAccordionItems,
    setOpenAccordionItems,
    escolasList,
    handleSubmit,
    onFormError,
    handleNewCadastro,
    handleFillMock,
  };
}
