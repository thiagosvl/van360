import { BaseDialog } from "@/components/ui/BaseDialog";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { AlertCircle, CheckCircle2, ChevronLeft, Clock, FileText, Wallet } from "lucide-react";
import { CobrancaStatus } from "@/types/enums";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import {
  FirstChargeStep as Step,
  useFirstChargeViewModel,
} from "@/hooks/ui/useFirstChargeViewModel";
import { formatShortName } from "@/utils/formatters";
import { getNowBR } from "@/utils/dateUtils";

export interface FirstChargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro;
  isFirstPassageiro?: boolean;
  onSuccess?: (passageiro?: Passageiro) => void;
}

const STEP_INDEX: Record<Step, number> = {
  CONTRACT_CHECK: 0,
  PAYMENT_STATUS: 1,
  PAYMENT_METHOD: 2,
};

export default function FirstChargeDialog({ isOpen, onClose, passageiro, isFirstPassageiro, onSuccess }: FirstChargeDialogProps) {
  const {
    step,
    showContractStep,
    showPaymentStep,
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    setPaymentMethod,
    wantsContract,
    setWantsContract,
    notificarResponsavel,
    setNotificarResponsavel,
    handleBack,
    handleNext,
    isLoading,
  } = useFirstChargeViewModel({ passageiro, onClose, isOpen, isFirstPassageiro, onSuccess });

  if (!isOpen || (!showContractStep && !showPaymentStep)) {
    return null;
  }

  const currentMonthName = getNowBR().toLocaleString("pt-BR", { month: "long" });
  const currentMonthNameCapitalized = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const firstNamePassageiro = formatShortName(passageiro.nome);

  const showSteps = showContractStep && showPaymentStep;
  const totalSteps = step === "PAYMENT_METHOD" ? 3 : 2;
  const stepIndex = STEP_INDEX[step];

  const primaryButtonText = () => {
    if (step === "CONTRACT_CHECK") {
      if (!showPaymentStep) {
        if (!wantsContract) return "Concluir";
        return notificarResponsavel ? "Gerar e Enviar" : "Gerar Contrato";
      }
      return "Próximo";
    }
    if (step === "PAYMENT_STATUS") {
      return paymentStatus === CobrancaStatus.PAGO ? "Próximo" : "Confirmar";
    }
    if (step === "PAYMENT_METHOD") return "Confirmar";
    return "Próximo";
  };

  const isPrimaryDisabled =
    isLoading ||
    (step === "PAYMENT_STATUS" && !paymentStatus) ||
    (step === "PAYMENT_METHOD" && !paymentMethod);

  const isFirstStep = (showContractStep && step === "CONTRACT_CHECK") ||
    (!showContractStep && step === "PAYMENT_STATUS");

  const dialogTitle = showContractStep && showPaymentStep
    ? "Contrato e Parcela"
    : (showContractStep ? "Emissão de Contrato" : "Parcela do Mês");

  const dialogIcon = showContractStep && !showPaymentStep
    ? <FileText className="w-5 h-5 text-[#0a0a0a]" />
    : <Wallet className="w-5 h-5 text-[#0a0a0a]" />;

  return (
    <BaseDialog open={isOpen} onOpenChange={() => { }} lockClose>
      <BaseDialog.Header
        title={dialogTitle}
        icon={dialogIcon}
        showSteps={showSteps}
        currentStep={stepIndex + 1}
        totalSteps={totalSteps}
        hideCloseButton
      />
      <BaseDialog.Body>
        {step === "CONTRACT_CHECK" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-[#0a0a0a]">
                Gerar contrato?
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Gostaria de gerar o contrato digital para{" "}
                <strong className="text-[#0a0a0a] font-medium">{firstNamePassageiro}</strong>?
              </p>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  value: true,
                  label: "Sim, gerar o contrato",
                  sublabel: "O documento ficará disponível no app",
                  icon: <CheckCircle2 className="w-5 h-5" />,
                },
                {
                  value: false,
                  label: "Não gerar o contrato",
                  sublabel: "Você poderá gerar depois pela carteirinha",
                  icon: <AlertCircle className="w-5 h-5" />,
                },
              ].map(({ value, label, sublabel, icon }) => {
                const isActive = wantsContract === value;
                return (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setWantsContract(value)}
                    className={cn(
                      "w-full p-3.5 sm:p-4 rounded-[18px] border transition-all flex items-center gap-3.5 sm:gap-4 active:scale-[0.99] cursor-pointer group text-left",
                      isActive
                        ? "border-primary bg-white shadow-xs ring-1 ring-primary/20"
                        : "border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-[#737373]/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? "bg-primary text-white shadow-xs"
                          : "bg-white text-[#737373] border border-[#e5e5e5]"
                      )}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[#0a0a0a]">{label}</p>
                      <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">{sublabel}</p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                        isActive ? "border-primary bg-primary" : "border-[#e5e5e5] bg-white"
                      )}
                    >
                      {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {wantsContract && (
              <div className="pt-1">
                <div
                  className="flex items-center justify-between rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5 sm:p-4 transition-all hover:bg-white cursor-pointer shadow-xs select-none gap-4"
                  onClick={() => !isLoading && setNotificarResponsavel((prev) => !prev)}
                >
                  <div className="space-y-0.5 pr-2 flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-[#0a0a0a] block">
                      Enviar para os pais no WhatsApp
                    </span>
                    <p className="text-xs text-[#737373] leading-relaxed">
                      {notificarResponsavel
                        ? "O responsável receberá o link de assinatura automaticamente no WhatsApp."
                        : "O contrato será gerado, mas você terá que enviar o link manualmente para o responsável."}
                    </p>
                  </div>
                  <Switch
                    checked={notificarResponsavel}
                    onCheckedChange={setNotificarResponsavel}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-primary shrink-0"
                    aria-label="Enviar para os pais no WhatsApp"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === "PAYMENT_STATUS" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-[#0a0a0a]">
                A parcela de {currentMonthNameCapitalized} já foi paga?
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Defina o status inicial da parcela deste mês para {firstNamePassageiro}.
              </p>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  value: CobrancaStatus.PAGO,
                  label: "Sim, já recebi",
                  sublabel: "Registrar como paga agora",
                  icon: <CheckCircle2 className="w-5 h-5" />,
                },
                {
                  value: CobrancaStatus.PENDENTE,
                  label: "Não, ainda vou receber",
                  sublabel: "Manter como pendente",
                  icon: <Clock className="w-5 h-5" />,
                },
              ].map(({ value, label, sublabel, icon }) => {
                const isActive = paymentStatus === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentStatus(value)}
                    className={cn(
                      "w-full p-3.5 sm:p-4 rounded-[18px] border transition-all flex items-center gap-3.5 sm:gap-4 active:scale-[0.99] cursor-pointer group text-left",
                      isActive
                        ? "border-primary bg-white shadow-xs ring-1 ring-primary/20"
                        : "border-[#e5e5e5] bg-[#fafafa] hover:bg-white hover:border-[#737373]/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? "bg-primary text-white shadow-xs"
                          : "bg-white text-[#737373] border border-[#e5e5e5]"
                      )}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[#0a0a0a]">{label}</p>
                      <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">{sublabel}</p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                        isActive ? "border-primary bg-primary" : "border-[#e5e5e5] bg-white"
                      )}
                    >
                      {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "PAYMENT_METHOD" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#0a0a0a] block">
              Forma de pagamento <span className="text-[#e7000b]">*</span>
            </label>
            <NativeSelect
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              icon={<Wallet className="w-4 h-4 text-[#737373]" />}
            >
              <option value="" disabled hidden>Selecionar</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </NativeSelect>
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
