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
  FileText,
  Loader2,
  Wallet
} from "lucide-react";
import { CobrancaStatus } from "@/types/enums";

import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import {
  FirstChargeStep as Step,
  useFirstChargeViewModel
} from "@/hooks/ui/useFirstChargeViewModel";

export interface FirstChargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
}

const STEP_INDEX: Record<Step, number> = {
  CONTRACT_CHECK: 0,
  REGISTER_CHECK: 1,
  PAYMENT_STATUS: 2,
  PAYMENT_METHOD: 3,
};

export default function FirstChargeDialog({
  isOpen,
  onClose,
  passageiro,
}: FirstChargeDialogProps) {
  const {
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

  const totalSteps = showContractStep ? 4 : 3;
  // Ajuste do index se não mostrar contrato
  const stepIndex = showContractStep ? STEP_INDEX[step] : (STEP_INDEX[step] - 1);

  const primaryButtonText = () => {
    if (step === "CONTRACT_CHECK") return wantsContract ? "Gerar e Enviar" : "Próximo";
    if (step === "REGISTER_CHECK") return wantsMonthlyCharge ? "Próximo" : "Finalizar";
    if (step === "PAYMENT_METHOD") return "Confirmar";
    if (step === "PAYMENT_STATUS" && paymentStatus === CobrancaStatus.PENDENTE) return "Registrar";
    return "Próximo";
  };

  const isPrimaryDisabled =
    isLoading ||
    (step === "PAYMENT_STATUS" && !paymentStatus) ||
    (step === "PAYMENT_METHOD" && !paymentMethod);

  const isFirstStep = (showContractStep && step === "CONTRACT_CHECK") || (!showContractStep && step === "REGISTER_CHECK");


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
            <div className="flex flex-col min-w-0 flex-1">
              <DialogTitle className="text-sm sm:text-lg font-headline font-black text-[#1a3a5c] uppercase tracking-tight truncate">
                {showContractStep ? "Contrato e Mensalidade" : "Registrar Mensalidade"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                  ETAPA {stepIndex + 1} DE {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
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
          {step === "CONTRACT_CHECK" && (
            <div className="space-y-5">
              <div className="flex items-start gap-4 py-2">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm mt-1">
                  <FileText className="w-6 h-6 text-[#1a3a5c] opacity-80" />
                </div>
                <div className="space-y-1 flex-1">
                  <h2 className="text-lg sm:text-xl font-headline font-black text-[#1a3a5c] uppercase leading-tight">
                    Gerar contrato?
                  </h2>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed pr-2">
                    Gostaria de gerar o contrato para <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong> e já envia-lo automaticamente para o responsável?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setWantsContract(true)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                    wantsContract
                      ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-200"
                      : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    wantsContract
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                      : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                  )}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                      "text-[13px] font-black uppercase tracking-tight",
                      wantsContract ? "text-emerald-900" : "text-[#1a3a5c]"
                    )}>
                      Sim, gerar e enviar
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                      O responsável receberá por WhatsApp
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    wantsContract ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                  )}>
                    {wantsContract && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWantsContract(false)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                    !wantsContract
                      ? "border-slate-400 bg-slate-50 shadow-md ring-1 ring-slate-200"
                      : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    !wantsContract
                      ? "bg-slate-400 text-white shadow-lg shadow-slate-200"
                      : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                  )}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                      "text-[13px] font-black uppercase tracking-tight",
                      !wantsContract ? "text-slate-900" : "text-[#1a3a5c]"
                    )}>
                      Não, obrigado
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                      Você poderá gerar manualmente depois
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    !wantsContract ? "border-slate-400 bg-slate-400" : "border-slate-300"
                  )}>
                    {!wantsContract && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "REGISTER_CHECK" && (
            <div className="space-y-5">
              <div className="flex items-start gap-4 py-2">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm mt-1">
                  <Wallet className="w-6 h-6 text-[#1a3a5c] opacity-80" />
                </div>
                <div className="space-y-1 flex-1">
                  <h2 className="text-lg sm:text-xl font-headline font-black text-[#1a3a5c] uppercase leading-tight">
                    Registrar primeira mensalidade?
                  </h2>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed pr-2">
                    Gostaria de registrar a mensalidade de <strong className="text-[#1a3a5c]">{currentMonthNameCapitalized}</strong> para <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong>?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setWantsMonthlyCharge(true)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                    wantsMonthlyCharge
                      ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-200"
                      : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    wantsMonthlyCharge
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                      : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                  )}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                      "text-[13px] font-black uppercase tracking-tight",
                      wantsMonthlyCharge ? "text-emerald-900" : "text-[#1a3a5c]"
                    )}>
                      Sim, registrar
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Já estará visível na carteirinha</span>
                    </div>
                  </div>
                  <div className={cn(
                    "border-2 flex items-center justify-center shrink-0 transition-all w-5 h-5 rounded-full",
                    wantsMonthlyCharge ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                  )}>
                    {wantsMonthlyCharge && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWantsMonthlyCharge(false)}
                  className={cn(
                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                    !wantsMonthlyCharge
                      ? "border-slate-400 bg-slate-50 shadow-md ring-1 ring-slate-200"
                      : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    !wantsMonthlyCharge
                      ? "bg-slate-400 text-white shadow-lg shadow-slate-200"
                      : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100"
                  )}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                      "text-[13px] font-black uppercase tracking-tight",
                      !wantsMonthlyCharge ? "text-slate-900" : "text-[#1a3a5c]"
                    )}>
                      Não, obrigado
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
                      Você poderá gerar manualmente depois
                    </p>
                  </div>
                  <div className={cn(
                    "border-2 flex items-center justify-center shrink-0 transition-all w-5 h-5 rounded-full",
                    !wantsMonthlyCharge ? "border-slate-400 bg-slate-400" : "border-slate-300"
                  )}>
                    {!wantsMonthlyCharge && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "PAYMENT_STATUS" && (
            <div className="space-y-5">
              <div className="flex items-start gap-4 py-2">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm mt-1">
                  <Wallet className="w-6 h-6 text-[#1a3a5c] opacity-80" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-headline font-black text-[#1a3a5c] text-lg uppercase leading-tight">O responsável já pagou?</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {firstNamePassageiro}{" "}
                    <span className="text-slate-300">({firstNameResponsavel})</span>
                  </p>
                </div>
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
              <div className="flex items-start gap-4 py-2">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm mt-1">
                  <Wallet className="w-6 h-6 text-[#1a3a5c] opacity-80" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-headline font-black text-[#1a3a5c] text-lg uppercase leading-tight">Forma de pagamento</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Como o pagamento foi realizado?
                  </p>
                </div>
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
                        className="py-2.5 rounded-lg cursor-pointer focus:bg-slate-50 text-slate-600 focus:text-[#1a3a5c] text-[12px] font-bold uppercase"
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
          {!isFirstStep && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider border border-slate-100 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isPrimaryDisabled}
            className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-lg shadow-[#1a3a5c]/20 hover:shadow-xl hover:shadow-[#1a3a5c]/30 transition-all active:scale-95 border-b-2 border-black/20"
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
