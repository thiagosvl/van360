import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { cpfMask } from "@/utils/masks";
import { parseLocalDate } from "@/utils/dateUtils";
import { useEffect, useRef, useState } from "react";
import { Passageiro } from "@/types/passageiro";
import { passageiroApi } from "@/services/api/passageiro.api";
import { usePassageiro } from "@/hooks/api/usePassageiro";
import { queryClient } from "@/services/queryClient";
import { toast } from "@/utils/notifications/toast";

const validadorSchema = z.object({
  data_inicio_transporte: z.string().min(1, "Data de início é obrigatória"),
  data_fim_transporte: z.string().min(1, "Data de término é obrigatória"),
  responsavel_principal: z.object({
    cpf: z.string().min(14, "CPF inválido"),
  }),
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
  onSuccess: (passageiroId: string, bypassed?: boolean) => void;
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
  const [isChecking, setIsChecking] = useState(false);

  const form = useForm<ValidadorFormValues>({
    resolver: zodResolver(validadorSchema),
    defaultValues: {
      data_inicio_transporte: "",
      data_fim_transporte: "",
      responsavel_principal: {
        cpf: "",
      },
    },
  });

  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
  }, [onSuccess, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsChecking(true);
    }
  }, [isOpen]);

  // Check and pre-fill data when passenger is loaded
  useEffect(() => {
    if (isOpen && isChecking && passageiro && passageiroId) {
      if (!passageiro.responsavel_principal?.nome) {
        onCloseRef.current();
        toast.error("Complete o cadastro", {
          description: "Edite este aluno e informe o nome real do responsável antes de gerar o contrato."
        });
        return;
      }

      const hasInicio = !!passageiro.data_inicio_transporte;
      const hasFim = !!passageiro.data_fim_transporte;
      const hasCpf = !!passageiro.responsavel_principal?.cpf;

      if (hasInicio && hasFim && hasCpf) {
        onCloseRef.current();
        onSuccessRef.current(passageiroId, true);
      } else {
        form.reset({
          data_inicio_transporte: passageiro.data_inicio_transporte ? formatDateToBR(passageiro.data_inicio_transporte) : "",
          data_fim_transporte: passageiro.data_fim_transporte ? formatDateToBR(passageiro.data_fim_transporte) : "",
          responsavel_principal: {
            cpf: passageiro.responsavel_principal?.cpf ? cpfMask(passageiro.responsavel_principal.cpf) : "",
          },
        });
        setIsChecking(false);
      }
    }
  }, [isOpen, isChecking, passageiro, passageiroId, form]);

  const handleSubmit = async (data: ValidadorFormValues) => {
    if (!passageiroId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        data_inicio_transporte: convertDateBrToISO(data.data_inicio_transporte),
        data_fim_transporte: convertDateBrToISO(data.data_fim_transporte),
        responsavel_principal: {
          cpf: data.responsavel_principal?.cpf,
        },
      };
      await passageiroApi.updatePassageiro(passageiroId, payload);

      onClose();
      onSuccess(passageiroId, false);
    } catch (error) {
      toast.error("Erro ao atualizar aluno", {
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
      responsavel_principal: {
        cpf: "395.423.918-38",
      },
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
    isChecking,
  };
}
