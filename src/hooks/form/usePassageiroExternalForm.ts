import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  parseCurrencyToNumber
} from "@/utils/formatters";
import { moneyToNumber } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";

const prePassageiroSchema = z.object({
  nome: z.string().min(2, "Campo obrigatório"),
  nome_responsavel: z.string().min(2, "Campo obrigatório"),
  email_responsavel: z
    .string()
    .min(1, "Campo obrigatório")
    .email("E-mail inválido"),
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
  periodo: z.string().optional(),
  modalidade: z.string().min(1, "Campo obrigatório"),
  data_nascimento: dateSchema(true),
  genero: z.string().min(1, "Campo obrigatório"),
  parentesco_responsavel: z.string().min(1, "Campo obrigatório"),
  data_inicio_transporte: dateSchema(true),


  valor_cobranca: z
    .string()
    .optional()
    .refine((val) => !val || parseCurrencyToNumber(val) >= 1, {
      message: "O valor deve ser no mínimo R$ 1,00",
    }),
  dia_vencimento: z.string().optional(),
  enviar_cobranca_automatica: z.boolean().optional(),
  ativo: z.boolean().optional(),
});

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
    }
  ) as { data: import("@/types/escola").Escola[] };

  const form = useForm<PrePassageiroFormData>({
    resolver: zodResolver(prePassageiroSchema),
    defaultValues: {
      nome: "",
      nome_responsavel: "",
      parentesco_responsavel: "",
      email_responsavel: "",
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
      periodo: "",
      modalidade: "",
      data_nascimento: "",
      genero: "",
      data_inicio_transporte: "",
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
        toast.error("sistema.erro.linkInvalido", {
          description: "sistema.erro.linkInvalidoDescricao",
        });
        navigate(ROUTES.PUBLIC.ROOT);
        return;
      }

      setMotoristaApelido((data as any).apelido);

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
        toast.error("Motorista não identificado na URL");
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
      
      await prePassageiroApi.createPrePassageiro({
        ...payload,
        escola_id: payload.escola_id === "none" ? null : payload.escola_id,
        usuario_id: motoristaId,
      });

      setSuccess(true);
    } catch (error: any) {
      toast.error("sistema.erro.enviarDados", {
        description: error.message || "Tente novamente mais tarde.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCadastro = () => {
    const currentValues = form.getValues();

    form.reset({
      nome_responsavel: currentValues.nome_responsavel,
      email_responsavel: currentValues.email_responsavel,
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
      periodo: "",
      observacoes: "",

      valor_cobranca: "",
      dia_vencimento: "",

      ativo: true,
      enviar_cobranca_automatica: false,
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

    toast.info("Dados mantidos!", {
      description:
        "Para agilizar, mantivemos os dados do responsável e endereço. Preencha apenas os dados do novo passageiro.",
      duration: 5000,
    });
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
