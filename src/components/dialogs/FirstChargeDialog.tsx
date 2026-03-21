import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMessage } from "@/constants/messages";
import { useCreateCobranca } from "@/hooks/api/useCobrancaMutations";
import { cn } from "@/lib/utils";
import { CobrancaOrigem, CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { calculateSafeDueDate, toLocalDateString } from "@/utils/dateUtils";
import { moneyToNumber } from "@/utils/masks";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface FirstChargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
}

type Step = "REGISTER_CHECK" | "PAYMENT_STATUS" | "PAYMENT_METHOD";

const STEP_INDEX: Record<Step, number> = {
  REGISTER_CHECK: 0,
  PAYMENT_STATUS: 1,
  PAYMENT_METHOD: 2,
};

export default function FirstChargeDialog({
  isOpen,
  onClose,
  passageiro,
}: FirstChargeDialogProps) {
  const [step, setStep] = useState<Step>("REGISTER_CHECK");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [customValue] = useState<string>(
    passageiro.valor_cobranca ? String(passageiro.valor_cobranca) : "",
  );

  const createCobranca = useCreateCobranca();

  const currentMonthName = new Date().toLocaleString("pt-BR", { month: "long" });
  const currentMonthNameCapitalized =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const firstNamePassageiro = passageiro.nome?.split(" ")[0];
  const firstNameResponsavel = passageiro.nome_responsavel?.split(" ")[0];

  const stepIndex = STEP_INDEX[step];
  const isLoading = createCobranca.isPending;

  const handleBack = () => {
    if (step === "PAYMENT_STATUS") {
      setStep("REGISTER_CHECK");
      setPaymentStatus(null);
    } else if (step === "PAYMENT_METHOD") {
      setStep("PAYMENT_STATUS");
    }
  };

  const handleNext = async () => {
    if (step === "REGISTER_CHECK") {
      setStep("PAYMENT_STATUS");
      return;
    }

    if (step === "PAYMENT_STATUS") {
      if (!paymentStatus) return;
      if (paymentStatus === "PAID") {
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
  };

  const submitCobranca = async (status: CobrancaStatus) => {
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

      const payload: any = {
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
        payload.tipo_pagamento = paymentMethod;
        payload.data_pagamento = new Date().toISOString();
        payload.valor_pago = valor;
        payload.pagamento_manual = true;
      }

      await createCobranca.mutateAsync(payload);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const primaryButtonText = () => {
    if (step === "PAYMENT_METHOD") return "Confirmar";
    if (step === "PAYMENT_STATUS" && paymentStatus === "PENDING") return "Registrar";
    if (step === "REGISTER_CHECK") return "Sim, registrar";
    return "Próximo";
  };

  const isPrimaryDisabled =
    isLoading ||
    (step === "PAYMENT_STATUS" && !paymentStatus) ||
    (step === "PAYMENT_METHOD" && !paymentMethod);

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="w-[calc(100%-1.5rem)] sm:w-full max-w-md p-0 overflow-hidden bg-white rounded-2xl sm:rounded-3xl border-0 shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="bg-blue-600 p-4 sm:p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold">
                Mensalidade de {currentMonthNameCapitalized}
              </DialogTitle>
              <p className="text-xs text-blue-100 italic">
                Passo {stepIndex + 1} de 3
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 sm:h-1.5 rounded-full transition-all ${stepIndex === i
                  ? "bg-white w-6 sm:w-8"
                  : "bg-white/30 w-3 sm:w-4"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4 flex-1 overflow-y-auto">
          {step === "REGISTER_CHECK" && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-2">
                  <Wallet className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Registrar mensalidade?
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Cria o registro de{" "}
                  <strong className="text-gray-800">{currentMonthNameCapitalized}</strong>{" "}
                  no histórico financeiro de{" "}
                  <strong className="text-gray-800">{firstNamePassageiro}</strong>.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Valor da mensalidade</span>
                <span className="font-bold text-gray-900 text-lg">
                  {(passageiro.valor_cobranca || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
          )}

          {step === "PAYMENT_STATUS" && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">O responsável já pagou?</h3>
                <p className="text-sm text-gray-500">
                  {firstNamePassageiro}{" "}
                  <span className="text-gray-400">({firstNameResponsavel})</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentStatus("PAID")}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${paymentStatus === "PAID"
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                    : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${paymentStatus === "PAID" ? "bg-emerald-500" : "bg-gray-100"
                      }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${paymentStatus === "PAID" ? "text-white" : "text-gray-500"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${paymentStatus === "PAID" ? "text-emerald-900" : "text-gray-800"}`}
                    >
                      Sim, já recebi
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Informar forma de pagamento
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${paymentStatus === "PAID"
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                      }`}
                  >
                    {paymentStatus === "PAID" && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatus("PENDING")}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${paymentStatus === "PENDING"
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-200"
                    : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${paymentStatus === "PENDING" ? "bg-amber-500" : "bg-gray-100"
                      }`}
                  >
                    <AlertCircle
                      className={`w-5 h-5 ${paymentStatus === "PENDING" ? "text-white" : "text-gray-500"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${paymentStatus === "PENDING" ? "text-amber-900" : "text-gray-800"}`}
                    >
                      Não, ainda vai pagar
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Registrar como pendente
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${paymentStatus === "PENDING"
                      ? "border-amber-500 bg-amber-500"
                      : "border-gray-300"
                      }`}
                  >
                    {paymentStatus === "PENDING" && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "PAYMENT_METHOD" && (
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Forma de pagamento</h3>
                </div>
                <p className="text-xs text-gray-500 ml-7">
                  Como o pagamento foi realizado?
                </p>
              </div>

              <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                <SelectTrigger
                  className={cn(
                    "h-14 rounded-2xl bg-white border border-gray-200 px-4 text-base shadow-sm hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all",
                    !paymentMethod && "text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-gray-400 shrink-0" />
                    <SelectValue placeholder="Selecione a forma de pagamento..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[280px] rounded-2xl border-gray-100 shadow-xl p-2">
                  {[
                    { value: "dinheiro", label: "Dinheiro" },
                    { value: "PIX", label: "PIX" },
                    { value: "cartao-credito", label: "Cartão de Crédito" },
                    { value: "cartao-debito", label: "Cartão de Débito" },
                    { value: "transferencia", label: "Transferência" },
                    { value: "boleto", label: "Boleto" },
                  ].map(({ value, label }) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="py-3 px-4 rounded-xl cursor-pointer focus:bg-gray-50 text-base"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 flex gap-3 border-t shrink-0">
          {step === "REGISTER_CHECK" ? (
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl font-semibold text-gray-600"
              disabled={isLoading}
            >
              Não, ignorar
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex-1 h-12 rounded-2xl font-semibold text-gray-600"
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isPrimaryDisabled}
            className="flex-1 h-12 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {primaryButtonText()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
