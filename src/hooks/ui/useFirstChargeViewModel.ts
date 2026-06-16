import { CreateCobrancaDTO } from "@/types/dtos/cobranca.dto";
import { useCreateCobranca } from "@/hooks/api/useCobrancaMutations";
import { getMessage } from "@/constants/messages";
import { CobrancaOrigem, CobrancaStatus, CobrancaTipoPagamento } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { calculateSafeDueDate, toLocalDateString, getNowBR, toISODateTimeBR } from "@/utils/dateUtils";
import { moneyToNumber } from "@/utils/masks";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/business/useProfile";
import { useCreateContrato } from "@/hooks/api/useContratos";
import { useLayout } from "@/contexts/LayoutContext";

interface FirstChargeViewModelProps {
  passageiro: Passageiro;
  onClose: () => void;
}

export type FirstChargeStep = "CONTRACT_CHECK" | "REGISTER_CHECK" | "PAYMENT_STATUS" | "PAYMENT_METHOD";

export function useFirstChargeViewModel({ passageiro, onClose }: FirstChargeViewModelProps) {
  const { profile } = useProfile();
  const showContractStep = !!profile?.config_contrato?.usar_contratos;

  const [step, setStep] = useState<FirstChargeStep>(showContractStep ? "CONTRACT_CHECK" : "REGISTER_CHECK");
  const [paymentStatus, setPaymentStatus] = useState<CobrancaStatus | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [wantsContract, setWantsContract] = useState<boolean>(showContractStep);
  const [wantsMonthlyCharge, setWantsMonthlyCharge] = useState<boolean>(true);
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);

  const [customValue] = useState<string>(
    passageiro.valor_cobranca ? String(passageiro.valor_cobranca) : "",
  );

  const createCobranca = useCreateCobranca();
  const createContrato = useCreateContrato();
  const { openGerarContratoValidadorDialog } = useLayout();

  const handleBack = useCallback(() => {
    if (step === "REGISTER_CHECK") {
      if (showContractStep) {
        setStep("CONTRACT_CHECK");
        setWantsMonthlyCharge(true);
      }
    } else if (step === "PAYMENT_STATUS") {
      setStep("REGISTER_CHECK");
      setPaymentStatus(null);
      setPaymentMethod("");
    } else if (step === "PAYMENT_METHOD") {
      setStep("PAYMENT_STATUS");
      setPaymentMethod("");
    }
  }, [step, showContractStep, setWantsMonthlyCharge, setPaymentStatus, setPaymentMethod]);

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
  }, [passageiro, customValue, paymentMethod, createCobranca, onClose]);

  const finalizeFlow = useCallback(async (status?: CobrancaStatus) => {
    setIsGeneratingContract(true);
    try {
      if (status) {
        await submitCobranca(status);
      }

      if (wantsContract) {
        openGerarContratoValidadorDialog({
          passageiroId: passageiro.id!,
          onSuccess: async (id) => {
            await createContrato.mutateAsync({ passageiroId: id });
          }
        });
      }
      onClose();
    } catch (error) {
      console.error("Falha ao finalizar fluxo:", error);
    } finally {
      setIsGeneratingContract(false);
    }
  }, [passageiro.id, wantsContract, submitCobranca, openGerarContratoValidadorDialog, createContrato, onClose]);

  const handleNext = useCallback(async () => {
    if (step === "CONTRACT_CHECK") {
      setStep("REGISTER_CHECK");
      return;
    }

    if (step === "REGISTER_CHECK") {
      if (wantsMonthlyCharge) {
        setStep("PAYMENT_STATUS");
      } else {
        await finalizeFlow();
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
    showContractStep,
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    setPaymentMethod,
    wantsContract,
    setWantsContract,
    wantsMonthlyCharge,
    setWantsMonthlyCharge,
    handleBack,
    handleNext,
    isLoading: createCobranca.isPending || isGeneratingContract,
  };
}
