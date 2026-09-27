import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { apiClient } from "@/services/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/notifications/toast";
import { mockGenerator } from "@/utils/mocks/generator";
import { isDevEnv } from "@/utils/detectPlatform";
import { getErrorMessage } from "@/utils/errorHandler";
import { getDefaultAnoLetivo } from "@/utils/domain";
import type { Passageiro } from "@/types/passageiro";

export const quickStartPassageiroBaseSchema = z.object({
  ano_letivo: z.string().optional().or(z.literal("")),
  nome: z.string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório")
    .min(2, "Deve ter pelo menos 2 caracteres"),
  escola_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  veiculo_id: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
}).superRefine((data, ctx) => {
  if (!data.ano_letivo || data.ano_letivo.trim() === "") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Campo obrigatório", path: ["ano_letivo"] });
  }
});

export const getQuickStartPassageiroSchema = (_isOnboarding?: boolean) => {
  return quickStartPassageiroBaseSchema;
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
    resolver: zodResolver(quickStartPassageiroBaseSchema),
    defaultValues: {
      ano_letivo: getDefaultAnoLetivo(),
      nome: "",
      escola_id: "",
      veiculo_id: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: QuickStartPassageiroFormData, keepOpen?: boolean) => {
    try {
      setIsSubmitting(true);
      const currentYear = new Date().getFullYear();
      const anoLetivoNum = parseInt(data.ano_letivo || currentYear.toString(), 10);

      const payload = {
        nome: data.nome,
        escola_id: data.escola_id,
        veiculo_id: data.veiculo_id,
        ano_letivo: anoLetivoNum,
        ativo: true,
        usuario_id: usuarioId,
      };

      const response = await apiClient.post<Passageiro>("/passageiros", payload);

      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos", "kpis"] });

      if (keepOpen) {
        toast.success("Aluno cadastrado com sucesso!");
        form.reset({
          nome: "",
          escola_id: data.escola_id,
          veiculo_id: data.veiculo_id,
          ano_letivo: data.ano_letivo || getDefaultAnoLetivo(),
        });
        setTimeout(() => {
          form.setFocus("nome");
        }, 50);
      } else if (!isOnboarding) {
        toast.success("Aluno cadastrado com sucesso!");
      }

      if (onSuccess) {
        onSuccess(response.data, keepOpen);
      }
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      toast.error("Erro ao salvar aluno", {
        description: msg || "Verifique os dados e tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const handleFillMock = (escolas?: { id: string }[], veiculos?: { id: string }[]) => {
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

      form.setValue("nome", mockPassenger.nome, { shouldValidate: true });
      if (mockPassenger.escola_id) {
        form.setValue("escola_id", mockPassenger.escola_id, { shouldValidate: true });
      }
      if (mockPassenger.veiculo_id) {
        form.setValue("veiculo_id", mockPassenger.veiculo_id, { shouldValidate: true });
      }
      form.setValue("ano_letivo", getDefaultAnoLetivo(), { shouldValidate: true });
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
