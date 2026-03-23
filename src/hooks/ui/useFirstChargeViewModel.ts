import { CreateCobrancaDTO } from "@/types/dtos/cobranca.dto";
import { useCreateCobranca } from "@/hooks/api/useCobrancaMutations";
import { getMessage } from "@/constants/messages";
import { CobrancaOrigem, CobrancaStatus, CobrancaTipoPagamento } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { calculateSafeDueDate, toLocalDateString } from "@/utils/dateUtils";
import { moneyToNumber } from "@/utils/masks";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface FirstChargeViewModelProps {
  passageiro: Passageiro;
  onClose: () => void;
}

export type FirstChargeStep = "REGISTER_CHECK" | "PAYMENT_STATUS" | "PAYMENT_METHOD";

export function useFirstChargeViewModel({ passageiro, onClose }: FirstChargeViewModelProps) {
  const [step, setStep] = useState<FirstChargeStep>("REGISTER_CHECK");
  const [paymentStatus, setPaymentStatus] = useState<CobrancaStatus | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [customValue] = useState<string>(
    passageiro.valor_cobranca ? String(passageiro.valor_cobranca) : "",
  );

  const createCobranca = useCreateCobranca();

  const handleBack = useCallback(() => {
    if (step === "PAYMENT_STATUS") {
      setStep("REGISTER_CHECK");
      setPaymentStatus(null);
    } else if (step === "PAYMENT_METHOD") {
      setStep("PAYMENT_STATUS");
    }
  }, [step]);

  const submitCobranca = useCallback(async (status: CobrancaStatus) => {
    const today = new Date();
    const vencimentoDate = calculateSafeDueDate(
      passageiro.dia_vencimento || today.getDate(),
      today.getMonth(),
      today.getFullYear(),
    );
    const vencimento = toLocalDateString(vencimentoDate);

    try {
      let valor = passageiro.valor_cobranca || 0;
      if (customValue) {
        valor = moneyToNumber(customValue);
      }

      const payload: CreateCobrancaDTO = {
        passageiro_id: passageiro.id,
        usuario_id: passageiro.usuario_id,
        valor,
        data_vencimento: vencimento,
        status,
        mes: today.getMonth() + 1,
        ano: today.getFullYear(),
        origem: CobrancaOrigem.MANUAL,
      };

      if (status === CobrancaStatus.PAGO) {
        payload.tipo_pagamento = paymentMethod as CobrancaTipoPagamento;
        payload.data_pagamento = new Date().toISOString();
        payload.valor_pago = valor;
        payload.pagamento_manual = true;
      }

      await createCobranca.mutateAsync(payload);
      onClose();
    } catch (err) {
      console.error(err);
    }
  }, [passageiro, customValue, paymentMethod, createCobranca, onClose]);

  const handleNext = useCallback(async () => {
    if (step === "REGISTER_CHECK") {
      setStep("PAYMENT_STATUS");
      return;
    }

    if (step === "PAYMENT_STATUS") {
      if (!paymentStatus) return;
      if (paymentStatus === CobrancaStatus.PAGO) {
        setStep("PAYMENT_METHOD");
      } else {
        await submitCobranca(CobrancaStatus.PENDENTE);
      }
      return;
    }

    if (step === "PAYMENT_METHOD") {
      if (!paymentMethod) {
        toast.error(getMessage("cobranca.erro.selecioneFormaPagamento"));
        return;
      }
      await submitCobranca(CobrancaStatus.PAGO);
    }
  }, [step, paymentStatus, paymentMethod, submitCobranca]);

  return {
    step,
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    setPaymentMethod,
    handleBack,
    handleNext,
    isLoading: createCobranca.isPending,
  };
}
