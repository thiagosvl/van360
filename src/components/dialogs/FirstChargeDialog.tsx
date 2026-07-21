import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { AlertCircle, CheckCircle2, ChevronLeft, FileText, Wallet } from "lucide-react";
import { CobrancaStatus } from "@/types/enums";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import {
  FirstChargeStep as Step,
  useFirstChargeViewModel,
} from "@/hooks/ui/useFirstChargeViewModel";
import { formatFirstName, formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { getNowBR } from "@/utils/dateUtils";

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

export default function FirstChargeDialog({ isOpen, onClose, passageiro }: FirstChargeDialogProps) {
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
    isLoading,
  } = useFirstChargeViewModel({ passageiro, onClose });

  const currentMonthName = getNowBR().toLocaleString("pt-BR", { month: "long" });
  const currentMonthNameCapitalized = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const firstNamePassageiro = formatShortName(passageiro.nome);
  const firstNameResponsavel = formatNomeResponsavelExibicao(passageiro.nome_responsavel);

  const totalSteps = showContractStep ? 4 : 3;
  const stepIndex = showContractStep ? STEP_INDEX[step] : STEP_INDEX[step] - 1;

  const primaryButtonText = () => {
    if (step === "CONTRACT_CHECK") return wantsContract ? "Gerar e Enviar" : "Próximo";
    if (step === "REGISTER_CHECK") return wantsMonthlyCharge ? "Próximo" : "Confirmar";
    if (step === "PAYMENT_METHOD") return "Confirmar";
    if (step === "PAYMENT_STATUS" && paymentStatus === CobrancaStatus.PENDENTE) return "Confirmar";
    return "Próximo";
  };

  const isPrimaryDisabled =
    isLoading ||
    (step === "PAYMENT_STATUS" && !paymentStatus) ||
    (step === "PAYMENT_METHOD" && !paymentMethod);

  const isFirstStep =
    (showContractStep && step === "CONTRACT_CHECK") ||
    (!showContractStep && step === "REGISTER_CHECK");

  return (
    <BaseDialog open={isOpen} onOpenChange={() => { }} lockClose>
      <BaseDialog.Header
        title={showContractStep ? "Contrato e Parcela" : "Parcela do Mês"}
        icon={<Wallet className="w-5 h-5 opacity-80" />}
        showSteps
        currentStep={stepIndex + 1}
        totalSteps={totalSteps}
        hideCloseButton
      />
      <BaseDialog.Body>
        {step === "CONTRACT_CHECK" && (
          <div className="space-y-5">
            <div className="py-2">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-700">
                  Gerar contrato?
                </h2>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                  Gostaria de gerar o contrato para{" "}
                  <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong> e já enviá-lo automaticamente para o responsável?
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  value: true,
                  label: "Sim, gerar o contrato",
                  sublabel: "O responsável receberá por WhatsApp",
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  activeColor: "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-200",
                  iconActive: "bg-emerald-500 text-white shadow-lg shadow-emerald-200",
                  textActive: "text-emerald-900",
                  radioActive: "border-emerald-500 bg-emerald-500",
                },
                {
                  value: false,
                  label: "Não gerar o contrato",
                  sublabel: "Você poderá gerar manualmente depois",
                  icon: <AlertCircle className="w-6 h-6" />,
                  activeColor: "border-slate-400 bg-slate-50 shadow-md ring-1 ring-slate-200",
                  iconActive: "bg-slate-400 text-white shadow-lg shadow-slate-200",
                  textActive: "text-slate-900",
                  radioActive: "border-slate-400 bg-slate-400",
                },
              ].map(({ value, label, sublabel, icon, activeColor, iconActive, textActive, radioActive }) => {
                const isActive = wantsContract === value;
                return (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setWantsContract(value)}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                      isActive ? activeColor : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300", isActive ? iconActive : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100")}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={cn("text-[13px] font-bold", isActive ? textActive : "text-[#1a3a5c]")}>{label}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{sublabel}</p>
                    </div>
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isActive ? radioActive : "border-slate-300")}>
                      {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "REGISTER_CHECK" && (
          <div className="space-y-5">
            <div className="py-2">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-700">
                  Deseja lançar a parcela de <strong className="text-[#1a3a5c]">{currentMonthNameCapitalized}</strong> para <strong className="text-[#1a3a5c]">{firstNamePassageiro}</strong>?
                </h2>
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
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300", wantsMonthlyCharge ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100")}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn("text-[13px] font-bold", wantsMonthlyCharge ? "text-emerald-900" : "text-[#1a3a5c]")}>Sim, gerar parcela</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">A parcela será registrada e aparecerá na carteira digital</p>
                </div>
                <div className={cn("border-2 flex items-center justify-center shrink-0 transition-all w-5 h-5 rounded-full", wantsMonthlyCharge ? "border-emerald-500 bg-emerald-500" : "border-slate-300")}>
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
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300", !wantsMonthlyCharge ? "bg-slate-400 text-white shadow-lg shadow-slate-200" : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100")}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn("text-[13px] font-bold", !wantsMonthlyCharge ? "text-slate-900" : "text-[#1a3a5c]")}>Não, deixar para depois</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Você poderá registrar as parcelas manualmente quando quiser</p>
                </div>
                <div className={cn("border-2 flex items-center justify-center shrink-0 transition-all w-5 h-5 rounded-full", !wantsMonthlyCharge ? "border-slate-400 bg-slate-400" : "border-slate-300")}>
                  {!wantsMonthlyCharge && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "PAYMENT_STATUS" && (
          <div className="space-y-5">
            <div className="py-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-700">A parcela de {currentMonthNameCapitalized} já foi paga?</h3>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  value: CobrancaStatus.PAGO,
                  label: "Sim, já recebi",
                  sublabel: "Registrar como paga agora",
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  activeColor: "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-200",
                  iconActive: "bg-emerald-500 text-white shadow-lg shadow-emerald-200",
                  textActive: "text-emerald-900",
                  radioActive: "border-emerald-500 bg-emerald-500",
                },
                {
                  value: CobrancaStatus.PENDENTE,
                  label: "Não, ainda vou receber",
                  sublabel: "Registrar como pendente",
                  icon: <AlertCircle className="w-6 h-6" />,
                  activeColor: "border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-200",
                  iconActive: "bg-amber-500 text-white shadow-lg shadow-amber-200",
                  textActive: "text-amber-900",
                  radioActive: "border-amber-500 bg-amber-500",
                },
              ].map(({ value, label, sublabel, icon, activeColor, iconActive, textActive, radioActive }) => {
                const isActive = paymentStatus === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentStatus(value)}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98] group",
                      isActive ? activeColor : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300", isActive ? iconActive : "bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-slate-100")}>{icon}</div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={cn("text-[13px] font-bold", isActive ? textActive : "text-[#1a3a5c]")}>{label}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{sublabel}</p>
                    </div>
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isActive ? radioActive : "border-slate-300")}>
                      {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "PAYMENT_METHOD" && (
          <div className="space-y-5">
            <div className="py-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-700">Forma de pagamento</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Como o pagamento foi realizado?</p>
              </div>
            </div>
            <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-1 shadow-sm">
              <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                <SelectTrigger
                  className={cn(
                    "h-11 rounded-lg bg-white border-0 px-3 text-[13px] font-medium shadow-none hover:bg-white focus:ring-0 focus:ring-offset-0 transition-all outline-none",
                    !paymentMethod && "text-slate-400"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-[#1a3a5c]/60">
                      <Wallet className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <SelectValue placeholder="Selecionar" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[280px] rounded-xl border-slate-100 shadow-diff-shadow p-1.5">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem
                      key={method.value}
                      value={method.value}
                      className="py-2.5 rounded-lg cursor-pointer focus:bg-slate-50 text-slate-600 focus:text-[#1a3a5c] text-[13px] font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 flex items-center justify-center opacity-70 scale-90">{method.icon}</div>
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </BaseDialog.Body>
      <BaseDialog.Footer>
        {!isFirstStep && (
          <BaseDialog.Action
            label="Voltar"
            variant="secondary"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={handleBack}
            disabled={isLoading}
          />
        )}
        <BaseDialog.Action
          label={primaryButtonText()}
          onClick={handleNext}
          isLoading={isLoading}
          disabled={isPrimaryDisabled}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
