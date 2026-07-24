import { CreateCobrancaDTO } from "@/types/dtos/cobranca.dto";
import { useCreateCobranca } from "@/hooks/api/useCobrancaMutations";
import { getMessage } from "@/constants/messages";
import { CobrancaOrigem, CobrancaStatus, CobrancaTipoPagamento } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { calculateSafeDueDate, toLocalDateString, getNowBR, toISODateTimeBR } from "@/utils/dateUtils";
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
  const [wantsMonthlyCharge, setWantsMonthlyCharge] = useState<boolean>(true);
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);

  const [customValue] = useState<string>(
    passageiro.valor_cobranca ? String(passageiro.valor_cobranca) : "",
  );

  const createCobranca = useCreateCobranca();

  const handleBack = useCallback(() => {
    if (step === "PAYMENT_STATUS") {
      setStep("REGISTER_CHECK");
      setPaymentStatus(null);
      setPaymentMethod("");
    } else if (step === "PAYMENT_METHOD") {
      setStep("PAYMENT_STATUS");
      setPaymentMethod("");
    }
  }, [step, setPaymentStatus, setPaymentMethod]);

  const submitCobranca = useCallback(async (status: CobrancaStatus) => {
    const today = getNowBR();
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
        payload.data_pagamento = toISODateTimeBR(getNowBR());
        payload.valor_pago = valor;
        payload.pagamento_manual = true;
      }

      await createCobranca.mutateAsync(payload);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [passageiro, customValue, paymentMethod, createCobranca]);

  const finalizeFlow = useCallback(async (status?: CobrancaStatus) => {
    setIsGeneratingContract(true);
    try {
      if (status) {
        await submitCobranca(status);
      }
      onClose();
    } catch (error) {
      console.error("Falha ao finalizar fluxo:", error);
    } finally {
      setIsGeneratingContract(false);
    }
  }, [submitCobranca, onClose]);

  const handleNext = useCallback(async () => {
    if (step === "REGISTER_CHECK") {
      if (wantsMonthlyCharge) {
        setStep("PAYMENT_STATUS");
      } else {
        onClose();
      }
      return;
    }

    if (step === "PAYMENT_STATUS") {
      if (!paymentStatus) return;
      if (paymentStatus === CobrancaStatus.PAGO) {
        setStep("PAYMENT_METHOD");
      } else {
        await finalizeFlow(CobrancaStatus.PENDENTE);
      }
      return;
    }

    if (step === "PAYMENT_METHOD") {
      if (!paymentMethod) {
        toast.error(getMessage("cobranca.erro.selecioneFormaPagamento"));
        return;
      }
      await finalizeFlow(CobrancaStatus.PAGO);
    }
  }, [step, wantsMonthlyCharge, paymentStatus, paymentMethod, finalizeFlow]);

  return {
    step,
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    setPaymentMethod,
    wantsMonthlyCharge,
    setWantsMonthlyCharge,
    handleBack,
    handleNext,
    isLoading: createCobranca.isPending || isGeneratingContract,
  };
}
