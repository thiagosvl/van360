import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { moneyToNumber } from "@/utils/masks";
import { useState } from "react";
import { apiClient } from "@/services/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/notifications/toast";
import { mockGenerator } from "@/utils/mocks/generator";
import { phoneMask } from "@/utils/masks";
import { Passageiro } from "@/types/passageiro";

export const quickStartPassageiroSchema = z.object({
  nome: z.string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório")
    .min(2, "Deve ter pelo menos 2 caracteres"),
  nome_responsavel: z.string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório")
    .min(2, "Deve ter pelo menos 2 caracteres"),
  telefone_responsavel: z.string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório")
    .refine((val) => {
      const nums = val.replace(/\D/g, "");
      return nums.length >= 10 && nums.length <= 11;
    }, "Telefone inválido"),
  valor_cobranca: z
    .string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório")
    .refine((val) => {
      const num = moneyToNumber(val);
      return num >= 1;
    }, "O valor deve ser no mínimo R$ 1,00"),
  dia_vencimento: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  escola_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  veiculo_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  mes_inicio_cobranca: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  mes_fim_cobranca: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
}).refine((data) => {
  if (!data.mes_inicio_cobranca || !data.mes_fim_cobranca) return true;
  return parseInt(data.mes_fim_cobranca, 10) >= parseInt(data.mes_inicio_cobranca, 10);
}, {
  message: "Término da cobrança deve ser igual ou posterior ao início",
  path: ["mes_fim_cobranca"],
});

export type QuickStartPassageiroFormData = z.infer<typeof quickStartPassageiroSchema>;

interface UsePassageiroQuickStartFormProps {
  onSuccess?: (passageiro?: Passageiro) => void;
  usuarioId?: string;
}

export function usePassageiroQuickStartForm({ onSuccess, usuarioId }: UsePassageiroQuickStartFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuickStartPassageiroFormData>({
    resolver: zodResolver(quickStartPassageiroSchema),
    defaultValues: {
      nome: "",
      nome_responsavel: "",
      telefone_responsavel: "",
      valor_cobranca: "",
      dia_vencimento: "",
      escola_id: "",
      veiculo_id: "",
      mes_inicio_cobranca: (new Date().getMonth() + 1).toString(),
      mes_fim_cobranca: "12",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: QuickStartPassageiroFormData) => {
    try {
      setIsSubmitting(true);

      const currentYear = new Date().getFullYear();
      const payload = {
        nome: data.nome,
        nome_responsavel: data.nome_responsavel,
        telefone_responsavel: String(data.telefone_responsavel || "").replace(/\D/g, ""),
        valor_cobranca: moneyToNumber(String(data.valor_cobranca)),
        dia_vencimento: parseInt(String(data.dia_vencimento)),
        escola_id: data.escola_id,
        veiculo_id: data.veiculo_id,
        data_inicio_cobranca: `${currentYear}-${String(data.mes_inicio_cobranca).padStart(2, '0')}-01`,
        data_fim_cobranca: `${currentYear}-${String(data.mes_fim_cobranca).padStart(2, '0')}-01`,
        ativo: true,
        usuario_id: usuarioId, // se fornecido pelo contexto externo/store de profile
      };

      const response = await apiClient.post("/passageiros", payload);

      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast.success("Passageiro cadastrado com sucesso!");

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error: any) {
      toast.error("Erro ao salvar passageiro", {
        description: error.response?.data?.error || "Verifique os dados e tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const handleFillMock = (escolas?: any[], veiculos?: any[]) => {
    if (import.meta.env.DEV) {
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
      form.setValue("nome_responsavel", mockPassenger.nome_responsavel || "Responsável Teste");
      form.setValue("telefone_responsavel", phoneMask(mockPassenger.telefone_responsavel));
      form.setValue("valor_cobranca", mockPassenger.valor_cobranca);
      form.setValue("dia_vencimento", mockPassenger.dia_vencimento);
      form.setValue("escola_id", mockPassenger.escola_id || "");
      form.setValue("veiculo_id", mockPassenger.veiculo_id || "");
      form.setValue("mes_inicio_cobranca", "2");
      form.setValue("mes_fim_cobranca", "12");
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
