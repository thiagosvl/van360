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

const prePassageiroSchema = z.object({
  nome: z.string().min(2, "Campo obrigatório"),
  nome_responsavel: z.string().min(2, "Campo obrigatório"),
  cpf_responsavel: cpfSchema,
  telefone_responsavel: phoneSchema,

  logradouro: z.string().min(1, "Campo obrigatório"),
  numero: z.string().min(1, "Campo obrigatório"),
  bairro: z.string().min(1, "Campo obrigatório"),
  cidade: z.string().min(1, "Campo obrigatório"),
  estado: z.string().min(1, "Campo obrigatório"),
  cep: cepSchema,
  referencia: z.string().optional(),
  observacoes: z.string().optional(),

  escola_id: z.string().optional(),
  turma: z.string().min(1, "Campo obrigatório"),
  periodo: z.string().min(1, "Campo obrigatório"),
  modalidade: z.string().min(1, "Campo obrigatório"),
  data_nascimento: dateSchema(true),
  genero: z.string().min(1, "Campo obrigatório"),
  parentesco_responsavel: z.string().min(1, "Campo obrigatório"),
  data_inicio_transporte: dateSchema(false, true),
  data_fim_transporte: dateSchema(false, true),


  valor_cobranca: z
    .string()
    .optional()
    .refine((val) => !val || parseCurrencyToNumber(val) >= 1, {
      message: "O valor deve ser no mínimo R$ 1,00",
    }),
  dia_vencimento: z.string().optional(),
  ativo: z.boolean().optional(),
}).refine(
  (data) => {
    if (!data.data_inicio_transporte || !data.data_fim_transporte) return true;
    try {
      const start = parseLocalDate(convertDateBrToISO(data.data_inicio_transporte)!);
      const end = parseLocalDate(convertDateBrToISO(data.data_fim_transporte)!);
      return end > start;
    } catch {
      return true;
    }
  },
  {
    message: "Término deve ser maior que o Início",
    path: ["data_fim_transporte"],
  }
);

export type PrePassageiroFormData = z.infer<typeof prePassageiroSchema>;

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
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      observacoes: "",
      valor_cobranca: "",
      dia_vencimento: "",
      escola_id: "",
      turma: "",
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

      // Conversão de Data (DD/MM/YYYY -> YYYY-MM-DD)
      if (payload.data_nascimento) {
        payload.data_nascimento = convertDateBrToISO(payload.data_nascimento);
      }
      if (payload.data_inicio_transporte) {
        payload.data_inicio_transporte = convertDateBrToISO(payload.data_inicio_transporte);
      }
      if (payload.data_fim_transporte) {
        payload.data_fim_transporte = convertDateBrToISO(payload.data_fim_transporte);
      }

      await prePassageiroApi.createPrePassageiro({
        ...payload,
        escola_id: payload.escola_id === "none" ? null : payload.escola_id,
        usuario_id: motoristaId,
      });

      setSuccess(true);
    } catch (error: any) {
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

      nome: "",
      escola_id: "",
      turma: "",
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
      ...mockData,
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
