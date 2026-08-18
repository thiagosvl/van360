import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { get, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { useEscolasWithFilters } from "@/hooks";
import { useSEO } from "@/hooks/useSEO";
import { cepSchema, cpfSchema, dateSchema, phoneSchema } from "@/schemas/common";
import { apiClient } from "@/services/api/client";
import { prePassageiroApi } from "@/services/api/pre-passageiro.api";
import {
  convertDateBrToISO,
  formatShortName,
  parseCurrencyToNumber
} from "@/utils/formatters";
import { parseLocalDate } from "@/utils/dateUtils";
import { moneyToNumber } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { getMessage } from "@/constants/messages";

import { prePassageiroSchema, PrePassageiroFormData } from "@/schemas/prePassageiroSchema";

export { prePassageiroSchema, type PrePassageiroFormData };


export function usePassageiroExternalForm() {
  useSEO({
    noindex: true,
  });

  const { motoristaId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [motoristaApelido, setMotoristaApelido] = useState<string | null>(null);
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

  const form = useForm<PrePassageiroFormData>({
    resolver: zodResolver(prePassageiroSchema),
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
      nome_professor: "",
      periodo: "",
      modalidade: "",
      data_nascimento: "",
      genero: "",
      data_inicio_transporte: "",
      data_fim_transporte: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const validateMotorista = async () => {
      if (!motoristaId) {
        navigate(ROUTES.PUBLIC.ROOT);
        return;
      }

      const { data } = await apiClient.get<any>(`/public/motoristas/${motoristaId}/validate`)
        .catch(() => ({ data: null }));

      if (!data) {
        toast.error(getMessage("sistema.erro.linkInvalido"), {
          description: getMessage("sistema.erro.linkInvalidoDescricao"),
        });
        navigate(ROUTES.PUBLIC.ROOT);
        return;
      }

      setMotoristaApelido((data as any).apelido || formatShortName((data as any).nome, true));

      setLoading(false);
    };

    validateMotorista();
  }, [motoristaId, navigate]);

  const onFormError = (errors: any) => {
    console.group("❌ [PassageiroExternalForm] ERROS DE VALIDAÇÃO");
    console.error("Erros brutos:", errors);
    console.table(
      Object.entries(errors).map(([field, err]: [string, any]) => ({
        campo: field,
        tipo: err?.type,
        mensagem: err?.message,
        erroFilho: err?.root?.message || JSON.stringify(err),
      }))
    );
    console.log("Valores atuais de form.getValues():", form.getValues());
    console.groupEnd();

    toast.error("validacao.formularioComErros");
    setOpenAccordionItems([
      "passageiro",
      "responsavel",
      "cobranca",
      "endereco",
      "observacoes",
    ]);
  };

  const handleSubmit = async (data: PrePassageiroFormData) => {
    console.group("🚀 [PassageiroExternalForm] SUBMIT INICIADO");
    console.log("Dados válidos recebidos pelo Zod/RHF:", data);
    console.groupEnd();

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
          ? parseInt(String(data.dia_vencimento))
          : null,
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

      console.log("📤 [PassageiroExternalForm] Payload enviado para API:", payload);

      await prePassageiroApi.createPrePassageiro({
        ...payload,
        escola_id: payload.escola_id === "none" ? null : payload.escola_id,
        usuario_id: motoristaId,
      });

      console.log("✅ [PassageiroExternalForm] Cadastro realizado com sucesso!");
      setSuccess(true);
    } catch (error: any) {
      console.group("❌ [PassageiroExternalForm] ERRO NA API");
      console.error("Objeto do erro:", error);
      console.error("Resposta da API:", error.response?.data);
      console.groupEnd();

      if (error.response?.data?.details) {
        const issues = error.response.data.details;
        issues.forEach((issue: any) => {
          const field = issue.path.join('.');
          form.setError(field as any, { type: 'manual', message: issue.message });
        });
        toast.error("validacao.formularioComErros");

        setOpenAccordionItems([
          "passageiro",
          "responsavel",
          "cobranca",
          "endereco",
          "observacoes",
        ]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error("sistema.erro.enviarDados", {
          description: error.response?.data?.error || error.message || "Tente novamente mais tarde.",
        });
      }
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

      cep: currentValues.cep,
      logradouro: currentValues.logradouro,
      numero: currentValues.numero,
      bairro: currentValues.bairro,
      cidade: currentValues.cidade,
      estado: currentValues.estado,
      referencia: currentValues.referencia,
      complemento: currentValues.complemento,

      nome: "",
      escola_id: "",
      turma: "",
      nome_professor: "",
      periodo: "",
      observacoes: "",

      valor_cobranca: "",
      dia_vencimento: "",

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
      turma: mockData.turma,
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
      data_inicio_transporte: mockData.data_inicio_transporte,
      data_fim_transporte: mockData.data_fim_transporte,
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
