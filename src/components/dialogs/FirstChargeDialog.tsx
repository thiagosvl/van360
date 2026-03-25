import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Wallet
} from "lucide-react";
import { CobrancaStatus } from "@/types/enums";

export interface FirstChargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
}

import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import {
  FirstChargeStep as Step,
  useFirstChargeViewModel
} from "@/hooks/ui/useFirstChargeViewModel";

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
  const {
    step,
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    setPaymentMethod,
    handleBack,
    handleNext,
    isLoading
  } = useFirstChargeViewModel({
    passageiro,
    onClose
  });

  const currentMonthName = new Date().toLocaleString("pt-BR", { month: "long" });
  const currentMonthNameCapitalized =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const firstNamePassageiro = passageiro.nome?.split(" ")[0];
  const firstNameResponsavel = passageiro.nome_responsavel?.split(" ")[0];

  const stepIndex = STEP_INDEX[step];

  const primaryButtonText = () => {
    if (step === "PAYMENT_METHOD") return "Confirmar";
    if (step === "PAYMENT_STATUS" && paymentStatus === CobrancaStatus.PENDENTE) return "Registrar";
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
        className="w-[calc(100%-1.25rem)] sm:w-full max-w-md p-0 overflow-hidden bg-white rounded-[2rem] border border-slate-200/50 shadow-diff-shadow flex flex-col max-h-[92vh]"
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between bg-white border-b border-slate-100/60 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50/50 text-[#1a3a5c] border border-slate-100 shadow-sm">
              <Wallet className="w-5 h-5 opacity-80" />
            </div>
            <div className="flex flex-col min-w-0">
              <DialogTitle className="text-base sm:text-lg font-headline font-black text-[#1a3a5c] uppercase tracking-tight truncate">
                Mensalidade de {currentMonthNameCapitalized}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                  ETAPA {stepIndex + 1} DE 3
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        stepIndex === i
                          ? "bg-[#1a3a5c] w-4"
                          : stepIndex > i ? "bg-emerald-500 w-2" : "bg-slate-100 w-2"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pt-4 flex-1 overflow-y-auto">
          {step === "REGISTER_CHECK" && (
            <div className="space-y-5">
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-2 border border-slate-100 shadow-sm">
                  <Wallet className="w-10 h-10 text-[#1a3a5c] opacity-80" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-headline font-black text-[#1a3a5c] uppercase">
                    Registrar mensalidade?
                  </h2>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed px-4">
                    Cria o registro de{" "}
                    <strong className="text-[#1a3a5c]">{currentMonthNameCapitalized}</strong>{" "}
                    no histórico financeiro de{" "}
                    <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong>.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 px-5 py-4 flex items-center justify-between shadow-diff-shadow">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Valor</span>
                <div className="flex flex-col items-end">
                  <span className="font-headline font-black text-[#1a3a5c] text-xl">
                    {(passageiro.valor_cobranca || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Valor Mensal</span>
                </div>
              </div>
            </div>
          )}

          {step === "PAYMENT_STATUS" && (
            <div className="space-y-5">
              <div className="space-y-1 pb-2">
                <h3 className="font-headline font-black text-[#1a3a5c] text-lg uppercase">O responsável já pagou?</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {firstNamePassageiro}{" "}
                  <span className="text-slate-300">({firstNameResponsavel})</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentStatus(CobrancaStatus.PAGO)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                    paymentStatus === CobrancaStatus.PAGO
                      ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-200"
                      : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                      paymentStatus === CobrancaStatus.PAGO
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                    )}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                      "text-[13px] font-black uppercase tracking-tight",
                      paymentStatus === CobrancaStatus.PAGO ? "text-emerald-900" : "text-[#1a3a5c]"
                    )}>
                      Sim, já recebi
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                      Marcar como pago agora
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      paymentStatus === CobrancaStatus.PAGO
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300"
                    )}
                  >
                    {paymentStatus === CobrancaStatus.PAGO && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatus(CobrancaStatus.PENDENTE)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                    paymentStatus === CobrancaStatus.PENDENTE
                      ? "border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-200"
                      : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                      paymentStatus === CobrancaStatus.PENDENTE
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                        : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                    )}
                  >
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                      "text-[13px] font-black uppercase tracking-tight",
                      paymentStatus === CobrancaStatus.PENDENTE ? "text-amber-900" : "text-[#1a3a5c]"
                    )}>
                      Não, ainda vai pagar
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                      Registrar como pendente
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      paymentStatus === CobrancaStatus.PENDENTE
                        ? "border-amber-500 bg-amber-500"
                        : "border-slate-300"
                    )}
                  >
                    {paymentStatus === CobrancaStatus.PENDENTE && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "PAYMENT_METHOD" && (
            <div className="space-y-5">
              <div className="space-y-1 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#1a3a5c] opacity-80" />
                  <h3 className="font-headline font-black text-[#1a3a5c] text-lg uppercase">Forma de pagamento</h3>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-7">
                  Como o pagamento foi realizado?
                </p>
              </div>

              <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-1 shadow-sm">
                <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-lg bg-white border-0 px-3 text-[12px] font-bold uppercase tracking-tight shadow-none hover:bg-white focus:ring-0 focus:ring-offset-0 transition-all outline-none",
                      !paymentMethod && "text-slate-400",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-[#1a3a5c]/60">
                        <Wallet className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <SelectValue placeholder="Selecione a forma..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] rounded-xl border-slate-100 shadow-diff-shadow p-1.5">
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem
                        key={method.value}
                        value={method.value}
                        className="py-2.5 px-3 rounded-lg cursor-pointer focus:bg-slate-50 text-slate-600 focus:text-[#1a3a5c] text-[12px] font-bold uppercase"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 flex items-center justify-center opacity-70 group-focus:opacity-100 scale-90">
                            {method.icon}
                          </div>
                          <span className="tracking-tight">{method.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50/40 flex gap-4 border-t border-slate-100/60 shrink-0">
          {step === "REGISTER_CHECK" ? (
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
              disabled={isLoading}
            >
              Agora não
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" /> Voltar
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isPrimaryDisabled}
            className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-lg shadow-[#1a3a5c]/20 hover:shadow-xl hover:shadow-[#1a3a5c]/30 transition-all active:scale-95 border-b-2 border-black/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>{primaryButtonText()}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
