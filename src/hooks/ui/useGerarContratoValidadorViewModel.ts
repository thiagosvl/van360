import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { cpfMask } from "@/utils/masks";
import { parseLocalDate } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { Passageiro } from "@/types/passageiro";
import { passageiroApi } from "@/services/api/passageiro.api";
import { usePassageiro } from "@/hooks/api/usePassageiro";
import { queryClient } from "@/services/queryClient";
import { toast } from "@/utils/notifications/toast";

const validadorSchema = z.object({
  data_inicio_transporte: z.string().min(1, "Data de início é obrigatória"),
  data_fim_transporte: z.string().min(1, "Data de término é obrigatória"),
  cpf_responsavel: z.string().min(14, "CPF inválido"),
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

export type ValidadorFormValues = z.infer<typeof validadorSchema>;

export interface UseGerarContratoValidadorViewModelProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string | null;
  onSuccess: (passageiroId: string) => void;
}

export function useGerarContratoValidadorViewModel({
  isOpen,
  onClose,
  passageiroId,
  onSuccess,
}: UseGerarContratoValidadorViewModelProps) {
  const { data: passageiro, isLoading: isLoadingPassageiro } = usePassageiro(passageiroId || "", { enabled: isOpen && !!passageiroId });

  const [openCalendarInicio, setOpenCalendarInicio] = useState(false);
  const [openCalendarFim, setOpenCalendarFim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ValidadorFormValues>({
    resolver: zodResolver(validadorSchema),
    defaultValues: {
      data_inicio_transporte: "",
      data_fim_transporte: "",
      cpf_responsavel: "",
    },
  });

  // Check and pre-fill data when passenger is loaded
  useEffect(() => {
    if (isOpen && passageiro && passageiroId) {
      const hasInicio = !!passageiro.data_inicio_transporte;
      const hasFim = !!passageiro.data_fim_transporte;
      const hasCpf = !!passageiro.cpf_responsavel;

      if (hasInicio && hasFim && hasCpf) {
        onClose();
        onSuccess(passageiroId);
      } else {
        form.reset({
          data_inicio_transporte: passageiro.data_inicio_transporte ? formatDateToBR(passageiro.data_inicio_transporte) : "",
          data_fim_transporte: passageiro.data_fim_transporte ? formatDateToBR(passageiro.data_fim_transporte) : "",
          cpf_responsavel: passageiro.cpf_responsavel ? cpfMask(passageiro.cpf_responsavel) : "",
        });
      }
    }
  }, [isOpen, passageiro, form, passageiroId, onSuccess, onClose]);

  const handleSubmit = async (data: ValidadorFormValues) => {
    if (!passageiroId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        data_inicio_transporte: convertDateBrToISO(data.data_inicio_transporte),
        data_fim_transporte: convertDateBrToISO(data.data_fim_transporte),
      };
      await passageiroApi.updatePassageiro(passageiroId, payload);

      onClose();
      onSuccess(passageiroId);
    } catch (error) {
      toast.error("Erro ao atualizar passageiro", {
        description: "Verifique os dados informados e tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillMock = () => {
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    
    // Formato pt-BR: DD/MM/YYYY
    const start = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const end = endOfYear.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    form.reset({
      data_inicio_transporte: start,
      data_fim_transporte: end,
      cpf_responsavel: "395.423.918-38", // Mask will handle this normally but the input expects unmasked if using normal input, wait, mask handles it
    });
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  return {
    form,
    passageiro,
    isLoadingPassageiro,
    isSubmitting,
    handleSubmit,
    openCalendarInicio,
    setOpenCalendarInicio,
    openCalendarFim,
    setOpenCalendarFim,
    handleFillMock,
    onFormError,
  };
}
