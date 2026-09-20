import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { moneyToNumber } from "@/utils/masks";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/services/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/notifications/toast";
import { mockGenerator } from "@/utils/mocks/generator";
import { phoneMask } from "@/utils/masks";
import { isDevEnv } from "@/utils/detectPlatform";
import { useBuscarResponsavel } from "@/hooks/api/useBuscarResponsavel";
import { getErrorMessage } from "@/utils/errorHandler";
import { getDefaultAnoLetivo } from "@/utils/domain";
import type { Passageiro } from "@/types/passageiro";

export const quickStartPassageiroBaseSchema = z.object({
  ano_letivo: z.string().optional(),
  nome: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório").min(2, "Deve ter pelo menos 2 caracteres"),
  escola_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  veiculo_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  responsavel_principal: z.object({
    nome: z.string().optional(),
    telefone: z.string().optional(),
  }).optional(),
  isento: z.boolean().optional().default(false),
  valor_cobranca: z.string().optional(),
  dia_vencimento: z.string().optional(),
  mes_inicio_cobranca: z.string().optional(),
  mes_fim_cobranca: z.string().optional(),
  ano_inicio_cobranca: z.string().optional(),
  ano_fim_cobranca: z.string().optional(),
});

export const getQuickStartPassageiroSchema = (isOnboarding?: boolean) => {
  return z.object({
    ano_letivo: z.string().optional().or(z.literal("")),
    nome: z.string({ required_error: "Campo obrigatório" })
      .min(1, "Campo obrigatório")
      .min(2, "Deve ter pelo menos 2 caracteres"),
    escola_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
    veiculo_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
    
    responsavel_principal: z.object({
      nome: isOnboarding 
        ? z.string().optional() 
        : z.string({ required_error: "Campo obrigatório" })
            .min(1, "Campo obrigatório")
            .min(2, "Deve ter pelo menos 2 caracteres"),
            
      telefone: isOnboarding
        ? z.string().optional()
        : z.string({ required_error: "Campo obrigatório" })
            .min(1, "Campo obrigatório")
            .refine((val) => {
              const nums = (val || "").replace(/\D/g, "");
              return nums.length >= 10 && nums.length <= 11;
            }, "Telefone inválido"),
    }),
          
    isento: z.boolean().optional().default(false),
    valor_cobranca: z.string().optional(),
    dia_vencimento: z.string().optional(),
    mes_inicio_cobranca: z.string().optional(),
    mes_fim_cobranca: z.string().optional(),
    ano_inicio_cobranca: z.string().optional(),
    ano_fim_cobranca: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (!data.ano_letivo || data.ano_letivo.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Campo obrigatório", path: ["ano_letivo"] });
    }

    if (isOnboarding || data.isento) return;

    if (!data.valor_cobranca || data.valor_cobranca.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Campo obrigatório", path: ["valor_cobranca"] });
    }
    if (!data.dia_vencimento || data.dia_vencimento.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Campo obrigatório", path: ["dia_vencimento"] });
    }

    const anoInicio = data.ano_inicio_cobranca || new Date().getFullYear().toString();
    const anoFim = data.ano_fim_cobranca || anoInicio;

    if (!data.mes_inicio_cobranca || data.mes_inicio_cobranca.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Campo obrigatório", path: ["mes_inicio_cobranca"] });
    }
    if (!data.mes_fim_cobranca || data.mes_fim_cobranca.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Campo obrigatório", path: ["mes_fim_cobranca"] });
    } else if (data.mes_inicio_cobranca) {
      const totalInicio = parseInt(anoInicio, 10) * 12 + parseInt(data.mes_inicio_cobranca, 10);
      const totalFim = parseInt(anoFim, 10) * 12 + parseInt(data.mes_fim_cobranca, 10);
      if (totalFim < totalInicio) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Término da cobrança deve ser igual ou posterior ao início", path: ["mes_fim_cobranca"] });
      }
    }
  });
};

export type QuickStartPassageiroFormData = z.infer<typeof quickStartPassageiroBaseSchema>;

interface UsePassageiroQuickStartFormProps {
  onSuccess?: (passageiro?: Passageiro, keepOpen?: boolean) => void;
  usuarioId?: string;
  isOnboarding?: boolean;
}

export function usePassageiroQuickStartForm({ onSuccess, usuarioId, isOnboarding }: UsePassageiroQuickStartFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickStartPassageiroFormData>({
    resolver: zodResolver(getQuickStartPassageiroSchema(isOnboarding)),
    defaultValues: {
      ano_letivo: getDefaultAnoLetivo(),
      nome: "",
      responsavel_principal: {
        nome: "",
        telefone: "",
      },
      isento: false,
      valor_cobranca: "",
      dia_vencimento: "",
      escola_id: "",
      veiculo_id: "",
      mes_inicio_cobranca: (new Date().getMonth() + 1).toString(),
      mes_fim_cobranca: "12",
      ano_inicio_cobranca: new Date().getFullYear().toString(),
      ano_fim_cobranca: new Date().getFullYear().toString(),
    },
    mode: "onChange",
  });

  const { mutateAsync: lookupResponsavel } = useBuscarResponsavel();
  const searchedTermsSet = useRef<Set<string>>(new Set());

  const telefoneValue = form.watch("responsavel_principal.telefone");

  useEffect(() => {
    const purePhone = telefoneValue ? String(telefoneValue).replace(/\D/g, "") : "";
    if (purePhone.length === 11 && !searchedTermsSet.current.has(purePhone)) {
      searchedTermsSet.current.add(purePhone);
      lookupResponsavel({ term: purePhone })
        .then((resp) => {
          if (resp && resp.nome && !form.getValues("responsavel_principal.nome")) {
            form.setValue("responsavel_principal.nome", resp.nome, { shouldValidate: true });
            toast.info("Nome do responsável preenchido automaticamente!", {
              id: "quick-lookup-responsavel"
            });
          }
        })
        .catch(() => {});
    }
  }, [telefoneValue, lookupResponsavel, form]);

  const handleSubmit = async (data: QuickStartPassageiroFormData, keepOpen?: boolean) => {
    try {
      setIsSubmitting(true);
      const currentYear = new Date().getFullYear();
      const anoInicio = data.ano_inicio_cobranca || currentYear.toString();
      const anoFim = data.ano_fim_cobranca || anoInicio;

      const isIsento = !!data.isento;

      const respPrincipalPayload = (data.responsavel_principal?.nome && data.responsavel_principal?.telefone)
        ? {
            nome: data.responsavel_principal.nome,
            telefone: String(data.responsavel_principal.telefone).replace(/\D/g, ""),
          }
        : null;

      const payload = {
        nome: data.nome,
        responsavel_principal: respPrincipalPayload,
        isento: isIsento,
        valor_cobranca: isIsento ? 0 : (data.valor_cobranca ? moneyToNumber(String(data.valor_cobranca)) : 0),
        dia_vencimento: isIsento ? null : (data.dia_vencimento ? parseInt(String(data.dia_vencimento)) : null),
        escola_id: data.escola_id,
        veiculo_id: data.veiculo_id,
        data_inicio_cobranca: (!isIsento && data.mes_inicio_cobranca) ? `${anoInicio}-${String(data.mes_inicio_cobranca).padStart(2, '0')}-01` : null,
        data_fim_cobranca: (!isIsento && data.mes_fim_cobranca) ? `${anoFim}-${String(data.mes_fim_cobranca).padStart(2, '0')}-01` : null,
        ano_letivo: parseInt(data.ano_letivo || anoInicio, 10),
        ativo: true,
        usuario_id: usuarioId,
      };

      const response = await apiClient.post("/passageiros", payload);

      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast.success("Aluno cadastrado com sucesso!");

      if (onSuccess) {
        onSuccess(response.data, keepOpen);
      }
    } catch (error: any) {
      const msg = getErrorMessage(error);
      const status = error?.response?.status;
      if (msg && (msg.toLowerCase().includes("telefone") || msg.toLowerCase().includes("responsável") || status === 409)) {
        form.setError("responsavel_principal.telefone", {
          type: "manual",
          message: msg.toLowerCase().includes("outro responsável")
            ? "Este telefone já está cadastrado para outro responsável"
            : msg.replace(/ no sistema/gi, ""),
        });
      }
      toast.error("Erro ao salvar aluno", {
        description: msg ? msg.replace(/ no sistema/gi, "") : "Verifique os dados e tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const handleFillMock = (escolas?: any[], veiculos?: any[]) => {
    if (isDevEnv()) {
      let escolaId = "";
      if (escolas && escolas.length > 0) {
        escolaId = escolas[0].id;
      }
      let veiculoId = "";
      if (veiculos && veiculos.length > 0) {
        veiculoId = veiculos[0].id;
      }

      const mockPassenger = mockGenerator.passenger({
        escola_id: escolaId,
        veiculo_id: veiculoId,
      });

      form.setValue("nome", mockPassenger.nome);
      form.setValue("escola_id", mockPassenger.escola_id || "");
      form.setValue("veiculo_id", mockPassenger.veiculo_id || "");
      
      if (!isOnboarding && mockPassenger.responsavel_principal) {
        form.setValue("ano_letivo", new Date().getFullYear().toString());
        form.setValue("responsavel_principal.nome", mockPassenger.responsavel_principal.nome);
        form.setValue("responsavel_principal.telefone", phoneMask(mockPassenger.responsavel_principal.telefone));
        form.setValue("isento", false);
        form.setValue("valor_cobranca", mockPassenger.valor_cobranca);
        form.setValue("dia_vencimento", mockPassenger.dia_vencimento);
        form.setValue("mes_inicio_cobranca", "2");
        form.setValue("mes_fim_cobranca", "12");
        form.setValue("ano_inicio_cobranca", new Date().getFullYear().toString());
        form.setValue("ano_fim_cobranca", new Date().getFullYear().toString());
      }
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit,
    onFormError,
    handleFillMock,
  };
}
