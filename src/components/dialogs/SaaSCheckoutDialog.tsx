import { SaaSPlan } from "@/types/subscription";
import { useSaaSCheckoutViewModel } from "@/hooks/ui/useSaaSCheckoutViewModel";
import { SubscriptionIdentifer, CheckoutPaymentMethod } from "@/types/enums";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { cn } from "@/lib/utils";
import CreditCardForm, { CreditCardData } from "@/components/dialogs/CreditCardForm";
import BillingAddressForm from "@/components/dialogs/BillingAddressForm";
import { useState, useEffect, useRef } from "react";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import { PixPaymentView } from "@/components/features/subscription/PixPaymentView";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import confetti from "canvas-confetti";
import { usePaymentProvider } from "@/hooks/business/usePaymentProvider";
import type { InstallmentOption } from "@/types/payment";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Smartphone, CreditCard as CreditCardIcon, ShieldCheck, Tag, Loader2,
  ChevronLeft, ArrowRight, Check, Calendar, RefreshCw, Copy, Star, AlertCircle, Plus,
  CircleCheckBig,
  Info
} from "lucide-react";

interface SaaSCheckoutDialogProps {
  plans: SaaSPlan[];
  initialPlanId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  forcedPeriod?: SubscriptionIdentifer;
}

export function SaaSCheckoutDialog({ plans = [], initialPlanId, isOpen, onClose, onSuccess, forcedPeriod }: SaaSCheckoutDialogProps) {
  const {
    step,
    nextStep,
    prevStep,
    jumpToStep,
    setSelectedPeriod,
    paymentMethod,
    setPaymentMethod,
    savedCards,
    selectedSavedCardId,
    setSelectedSavedCardId,
    isGenerating,
    activeInvoice,
    cardError,
    handleGenerateCheckout,
    plans: plansVm,
    profile,
    hasActiveDiscount,
    discountPct,
    hasActiveReferralDiscount,
    referralDiscountPct,
    isLoadingData,
    refetchInvoices,
    refetchStatus,
    annualPlan,
    monthlyPlan,
    isAnual,
    selectedPlan,
    annualPrice,
    monthlyPrice,
    annualMonthlyEquivalent,
    totalAnnualSavings,
    regularMonthlyPrice,
    hasOverride,
    totalPrice,
    formattedPrice,
    discountPercent,
    totalDiscount,
    isSuccessState,
    handleFinishSuccess,
  } = useSaaSCheckoutViewModel({ plans, initialPlanId, isOpen, onClose, onSuccess, forcedPeriod });

  const [cardData, setCardData] = useState<CreditCardData | null>(null);
  const [addressData, setAddressData] = useState<Partial<CreditCardData> | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const pixCopiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { getInstallments } = usePaymentProvider();
  const [savedCardInstallments, setSavedCardInstallments] = useState<InstallmentOption[]>([]);
  const [selectedSavedCardInstallment, setSelectedSavedCardInstallment] = useState<number>(1);
  const [loadingSavedCardInstallments, setLoadingSavedCardInstallments] = useState<boolean>(false);

  useEffect(() => {
    if (
      isOpen &&
      paymentMethod === CheckoutPaymentMethod.CREDIT_CARD &&
      selectedSavedCardId &&
      selectedSavedCardId !== "new" &&
      totalPrice > 0 &&
      getInstallments
    ) {
      const card = savedCards.find((c) => c.id === selectedSavedCardId);
      if (card) {
        setLoadingSavedCardInstallments(true);
        const totalCents = Math.round(totalPrice * 100);
        getInstallments(card.brand?.toLowerCase() || "mastercard", totalCents)
          .then((options) => {
            if (options && options.length > 0) {
              setSavedCardInstallments(options);
              setSelectedSavedCardInstallment(options[0].installment);
              setCardData((prev) => ({
                ...(prev as CreditCardData),
                installments: options[0].installment,
                installmentOption: options[0],
              }));
            } else {
              setSavedCardInstallments([]);
              setSelectedSavedCardInstallment(1);
            }
          })
          .catch(() => {
            setSavedCardInstallments([]);
            setSelectedSavedCardInstallment(1);
          })
          .finally(() => {
            setLoadingSavedCardInstallments(false);
          });
      }
    } else if (selectedSavedCardId === "new") {
      setSavedCardInstallments([]);
    }
  }, [isOpen, selectedSavedCardId, paymentMethod, totalPrice, getInstallments]);

  useEffect(() => {
    if (!isOpen || step !== 4) {
      setPixCopied(false);
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (isSuccessState) {
      const duration = 0.5 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#0b1a2e", "#f59e0b", "#10b981", "#2563eb"],
          zIndex: 99999
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#0b1a2e", "#f59e0b", "#10b981", "#2563eb"],
          zIndex: 99999
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isSuccessState]);

  const handleCopyPix = () => {
    if (activeInvoice?.pix_copy_paste) {
      navigator.clipboard.writeText(activeInvoice.pix_copy_paste);
      setPixCopied(true);
      if (pixCopiedTimeoutRef.current) clearTimeout(pixCopiedTimeoutRef.current);
      pixCopiedTimeoutRef.current = setTimeout(() => {
        setPixCopied(false);
      }, 2500);
    }
  };

  const isCardStep4 = paymentMethod === CheckoutPaymentMethod.CREDIT_CARD;
  const isCardProcessing = step === 4 && isCardStep4 && !isSuccessState;
  const isLocked = isGenerating || isCardProcessing;
  const shouldHideCloseButton = isLocked || isSuccessState;

  const hasNewCardFlow = isCardStep4 && (!savedCards.length || selectedSavedCardId === "new");
  const totalSteps = hasNewCardFlow ? 4 : 3;
  const currentStepDisplay = step === 4 ? totalSteps : step;

  const getStepTitle = (s: number) => {
    if (isSuccessState) return "Assinatura Ativada";
    if (s === 1) return "Assinatura Van360";
    if (s === 2) return "Forma de Pagamento";
    if (s === 3 && hasNewCardFlow) return "Dados do Cartão";
    return paymentMethod === CheckoutPaymentMethod.PIX ? "Aguardando Pix" : "Confirmando Pagamento";
  };

  const getStepSubtitle = (s: number) => {
    if (isSuccessState) return undefined;
    if (s === 1) return "Escolha o melhor plano para você";
    if (s === 2) {
      if (paymentMethod === CheckoutPaymentMethod.PIX) return "Pague com Pix e ative instantaneamente";
      if (hasNewCardFlow) return "Onde a fatura deve ser registrada";
      return "Selecione o cartão de crédito";
    }
    if (s === 3 && hasNewCardFlow) return "Preencha os dados do cartão";
    return paymentMethod === CheckoutPaymentMethod.PIX ? "Escaneie o QR Code no app do banco" : "Seu banco está confirmando o pagamento";
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(val) => !val && safeCloseDialog(onClose)}
      maxWidth="lg"
      lockClose={isLocked}
    >
      <BaseDialog.Header
        title={getStepTitle(step)}
        subtitle={getStepSubtitle(step)}
        showSteps={!isSuccessState}
        currentStep={currentStepDisplay}
        totalSteps={totalSteps}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={shouldHideCloseButton}
        leftAction={step > 1 && !isSuccessState ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={prevStep}
            className="h-10 w-10 rounded-[18px] bg-white border border-[#e5e5e5] text-foreground hover:bg-[#f5f5f5] shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        ) : null}
      />

      <BaseDialog.Body animate animationKey={`${step}-${paymentMethod}`} className="p-0">
        {step === 1 && isLoadingData ? (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pulse">
            <Skeleton className="h-12 w-full rounded-[18px] bg-[#f5f5f5]" />

            <div className="relative rounded-[18px] p-4 sm:p-6 border border-[#e5e5e5] bg-[#fafafa] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-[#e5e5e5]" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24 rounded-[8px] bg-[#e5e5e5]" />
                    <Skeleton className="h-4 w-40 rounded-[8px] bg-[#e5e5e5]" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 rounded-[8px] bg-[#e5e5e5]" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-24 rounded-[12px] bg-[#e5e5e5]" />
                <Skeleton className="h-8 w-24 rounded-[12px] bg-[#e5e5e5]" />
                <Skeleton className="h-8 w-24 rounded-[12px] bg-[#e5e5e5]" />
              </div>
            </div>

            <div className="rounded-[18px] p-4 sm:p-6 border border-[#e5e5e5] bg-[#fafafa]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-[#e5e5e5]" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-20 rounded-[8px] bg-[#e5e5e5]" />
                    <Skeleton className="h-4 w-32 rounded-[8px] bg-[#e5e5e5]" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-[8px] bg-[#e5e5e5]" />
              </div>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {hasActiveReferralDiscount && (
              <Banner
                variant="success"
                icon={<Tag className="w-4 h-4" />}
                title={`Você ganhou um desconto de indicação de ${referralDiscountPct}% na 1ª mensalidade!`}
                className="mb-4"
              />
            )}

            {annualPlan && (
              <div
                onClick={() => setSelectedPeriod(SubscriptionIdentifer.YEARLY)}
                className={cn(
                  "relative rounded-[18px] p-4 sm:p-6 border-2 transition-all duration-300 select-none cursor-pointer",
                  isAnual
                    ? "bg-white border-primary shadow-xs ring-2 ring-primary/10"
                    : "bg-[#f5f5f5] border-transparent hover:border-[#e5e5e5]"
                )}
              >
                {(totalDiscount > 0 || discountPercent > 0) && (
                  <div
                    className={cn(
                      "absolute -top-[13px] left-1/2 -translate-x-1/2 px-4 sm:px-5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-sans font-bold uppercase shadow-xs z-10 border whitespace-nowrap transition-all bg-[#d1fae5] text-[#065f46] border-[#6ee7b7]"
                    )}
                  >
                    {totalDiscount > 0 ? `ECONOMIZE ${SubscriptionUtils.formatCurrency(totalDiscount)}` : `${discountPercent}% OFF`}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors shadow-xs",
                      isAnual ? "bg-primary/10 text-primary" : "bg-[#e5e5e5] text-muted-foreground"
                    )}>
                      <Star className={cn("w-5 h-5 sm:w-6 sm:h-6", isAnual && "fill-primary")} />
                    </div>
                    <div className="min-w-0 pr-1">
                      <h3 className={cn("font-headline font-bold text-base sm:text-lg leading-tight truncate", isAnual ? "text-foreground" : "text-muted-foreground")}>
                        Anual
                      </h3>
                      <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                        O melhor custo-benefício
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-xl sm:text-3xl font-headline font-black tracking-tighter", isAnual ? "text-foreground" : "text-muted-foreground")}>
                      {SubscriptionUtils.formatCurrency(annualPrice)}
                      <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-0.5">/ano</span>
                    </p>
                    <p className={cn("text-[10px] sm:text-[13px] font-bold mt-0.5", isAnual ? "text-primary" : "text-muted-foreground")}>
                      <span className="hidden sm:inline">Equivalente a </span>{SubscriptionUtils.formatCurrency(annualMonthlyEquivalent)}/mês
                    </p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
                  {(annualPlan.vantagens || []).slice(0, 3).map((v, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-[12px] bg-white text-foreground border border-[#e5e5e5]">
                      <div className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors shrink-0", isAnual ? "bg-primary" : "bg-[#d4d4d4]")}>
                        <Check className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 text-white stroke-[3px]" />
                      </div>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {monthlyPlan && (
              <div
                onClick={() => setSelectedPeriod(SubscriptionIdentifer.MONTHLY)}
                className={cn(
                  "rounded-[18px] p-4 sm:p-6 border-2 transition-all duration-300 select-none cursor-pointer",
                  !isAnual
                    ? "bg-white border-primary shadow-xs ring-2 ring-primary/10"
                    : "bg-[#f5f5f5] border-transparent hover:border-[#e5e5e5]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors shadow-xs",
                      !isAnual ? "bg-primary/10 text-primary" : "bg-[#e5e5e5] text-muted-foreground"
                    )}>
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <h3 className={cn("font-headline font-bold text-base sm:text-lg leading-tight truncate", !isAnual ? "text-foreground" : "text-muted-foreground")}>
                        Mensal
                      </h3>
                      <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                        Cancele quando quiser
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-xl sm:text-3xl font-headline font-black tracking-tighter", !isAnual ? "text-foreground" : "text-muted-foreground")}>
                      {SubscriptionUtils.formatCurrency(monthlyPrice)}
                      <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-0.5">
                        {hasActiveReferralDiscount ? " no 1º mês" : "/mês"}
                      </span>
                    </p>
                    {hasActiveReferralDiscount && (
                      <p className={cn("text-[10px] sm:text-xs font-bold mt-0.5 whitespace-nowrap", !isAnual ? "text-primary" : "text-muted-foreground")}>
                        A partir do 2º mês: {SubscriptionUtils.formatCurrency(regularMonthlyPrice)}/mês
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex p-1 bg-[#f5f5f5] rounded-[20px] border border-[#e5e5e5]">
              <button
                onClick={() => setPaymentMethod(CheckoutPaymentMethod.PIX)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-200",
                  paymentMethod === CheckoutPaymentMethod.PIX
                    ? "bg-white shadow-xs text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Smartphone className="w-4 h-4" />
                Pix
              </button>
              <button
                onClick={() => setPaymentMethod(CheckoutPaymentMethod.CREDIT_CARD)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-200",
                  paymentMethod === CheckoutPaymentMethod.CREDIT_CARD
                    ? "bg-white shadow-xs text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CreditCardIcon className="w-4 h-4" />
                Cartão
              </button>
            </div>

            {paymentMethod === CheckoutPaymentMethod.PIX && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-[#f5f5f5] p-4 rounded-[18px] space-y-3 border border-[#e5e5e5]">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Gere o código Pix para pagar no app do seu banco. A ativação é feita na hora.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === CheckoutPaymentMethod.CREDIT_CARD && (
              <div className="animate-in fade-in duration-300 space-y-4">
                {!hasNewCardFlow && cardError && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-[18px]">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-destructive leading-relaxed">{cardError}</p>
                  </div>
                )}

                {savedCards.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">Seus cartões</p>
                    {savedCards.map(card => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setSelectedSavedCardId(card.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3.5 rounded-[18px] border-2 text-left transition-all",
                          selectedSavedCardId === card.id
                            ? "border-primary bg-white shadow-xs"
                            : "border-[#e5e5e5] bg-[#f5f5f5] hover:border-[#0a0a0a]/30"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0 transition-colors",
                          selectedSavedCardId === card.id ? "bg-primary text-white" : "bg-[#e5e5e5] text-muted-foreground"
                        )}>
                          <CreditCardIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground uppercase">{card.brand} •••• {card.last_4_digits}</p>
                          <p className="text-[10px] text-muted-foreground">Validade {card.expire_month}/{card.expire_year}</p>
                        </div>
                        {card.is_default && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            Principal
                          </span>
                        )}
                        {selectedSavedCardId === card.id && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setSelectedSavedCardId("new")}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-[18px] border-2 text-left transition-all",
                        selectedSavedCardId === "new"
                          ? "border-primary bg-white shadow-xs"
                          : "border-dashed border-[#e5e5e5] bg-transparent hover:border-[#0a0a0a]/40"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0 transition-colors",
                        selectedSavedCardId === "new" ? "bg-primary text-white" : "bg-[#e5e5e5] text-muted-foreground"
                      )}>
                        <Plus className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground">Usar outro cartão</p>
                      {selectedSavedCardId === "new" && (
                        <Check className="w-4 h-4 text-primary shrink-0 ml-auto" />
                      )}
                    </button>
                  </div>
                )}

                {selectedSavedCardId && selectedSavedCardId !== "new" && (
                  <div className="space-y-1.5 pt-3 mt-1 border-t border-[#e5e5e5] animate-in fade-in duration-300">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Opções de Parcelamento</span>
                      {loadingSavedCardInstallments && (
                        <span className="text-[10px] text-muted-foreground font-normal flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-primary" /> Carregando...
                        </span>
                      )}
                    </label>
                    <NativeSelect
                      disabled={loadingSavedCardInstallments}
                      value={String(selectedSavedCardInstallment)}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const opt = savedCardInstallments.find((o) => o.installment === val) || null;
                        setSelectedSavedCardInstallment(val);
                        setCardData((prev) => ({
                          ...(prev as CreditCardData),
                          installments: val,
                          installmentOption: opt,
                        }));
                      }}
                      variant="white"
                      className="h-12 w-full font-sans text-foreground text-xs sm:text-sm focus:border-primary shadow-xs"
                    >
                      <option value="">
                        {loadingSavedCardInstallments ? "Buscando opções..." : "Selecione as parcelas"}
                      </option>
                      {savedCardInstallments.map((opt) => (
                        <option key={opt.installment} value={String(opt.installment)}>
                          {opt.installment}x de R$ {opt.currency} {opt.has_interest ? "(com juros)" : "(sem juros)"}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                )}

                {(savedCards.length === 0 || selectedSavedCardId === "new") && (
                  <BillingAddressForm
                    onChange={setAddressData}
                    initialBirthDate={profile?.data_nascimento}
                    initialData={{
                      zipcode: addressData?.zipcode || profile?.cep,
                      street: addressData?.street || profile?.logradouro,
                      number_address: addressData?.number_address || profile?.numero,
                      neighborhood: addressData?.neighborhood || profile?.bairro,
                      city: addressData?.city || profile?.cidade,
                      state: addressData?.state || profile?.estado
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {hasNewCardFlow && (
          <div className={cn("p-6 space-y-4", step !== 3 && "hidden")}>
            <CreditCardForm
              onChange={setCardData}
              initialBirthDate={profile?.data_nascimento}
              cardError={cardError}
              totalPrice={totalPrice}
              userDocument={profile?.cpfcnpj}
              initialHolderDocument={profile?.cpf_responsavel}
            />

            <div className="pt-2 border-t border-[#e5e5e5] space-y-1">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Plano selecionado</span>
                <span className="font-semibold text-foreground">{isAnual ? "Anual" : "Mensal"}</span>
              </div>

              {hasActiveDiscount && (
                <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  <Tag className="w-3.5 h-3.5" />
                  Desconto de indicação de {discountPct}% aplicado!
                </p>
              )}
            </div>
            {cardError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-[18px]">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-destructive leading-relaxed">{cardError}</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="p-6 space-y-4">
            {isSuccessState ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-14 space-y-5 text-center animate-in zoom-in-95 duration-300">
                <div className="relative mb-2">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center animate-ping absolute inset-0" />
                  <div className="w-24 h-24 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 relative z-10">
                    <CircleCheckBig className="w-12 h-12" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm px-2">
                  <h4 className="text-2xl font-black text-foreground tracking-tight">Pagamento Confirmado!</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sua assinatura foi ativada com sucesso.<br className="hidden sm:inline" /> Todos os recursos do app estão liberados.
                </p>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-foreground">
                  {paymentMethod === CheckoutPaymentMethod.CREDIT_CARD ? "Processando pagamento..." : "Gerando QR Code..."}
                </p>
                <p className="text-xs text-muted-foreground">Aguarde um momento</p>
              </div>
            ) : isCardStep4 ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-in fade-in duration-300">
                <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xs">
                  <Loader2 className="w-20 h-20 text-primary/30 animate-spin absolute inset-0" />
                  <CreditCardIcon className="w-9 h-9 text-primary" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-base font-bold text-foreground">Pagamento em Processamento</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Seu pagamento foi enviado. Aguardando a confirmação da operadora do cartão para ativar a assinatura.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Não feche esta tela</span>
                </div>
              </div>
            ) : activeInvoice?.pix_copy_paste ? (
              <PixPaymentView
                qrcode={activeInvoice.pix_copy_paste}
                valor={totalPrice}
                onCopy={handleCopyPix}
                isCopied={pixCopied}
              />
            ) : null}
          </div>
        )}

      </BaseDialog.Body>

      <BaseDialog.Footer className="flex-col gap-3 bg-[#f5f5f5]/80 border-t border-[#e5e5e5]">
        {selectedPlan && !isSuccessState && (
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px]">Pagamento seguro</span>
            </div>
            <div className="flex items-center justify-end w-full sm:w-auto">
              {cardData?.installmentOption ? (
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                  <span className="text-sm sm:text-base font-black text-foreground whitespace-nowrap">
                    {cardData.installmentOption.installment}x de R$ {cardData.installmentOption.currency}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                  <span className="text-sm sm:text-base font-black text-foreground whitespace-nowrap">{formattedPrice}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground ml-0.5 sm:ml-1 whitespace-nowrap">/{isAnual ? "ano" : "mês"}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          {isSuccessState ? (
            <Button
              onClick={handleFinishSuccess}
              className="bg-primary hover:bg-primary-hover text-white h-12 flex items-center justify-center w-full text-base font-bold rounded-[18px] shadow-xs transition-all duration-200 active:scale-[0.99]"
            >
              Entendi
            </Button>
          ) : (
            <>
              {step === 1 && (
                <BaseDialog.Action
                  label="Continuar"
                  onClick={nextStep}
                  isLoading={isLoadingData}
                  disabled={isLoadingData || !selectedPlan}
                  icon={!isLoadingData ? <ArrowRight className="w-4 h-4" /> : undefined}
                />
              )}

              {step === 2 && (
                <>
                  <BaseDialog.Action
                    label="Voltar"
                    variant="outline"
                    onClick={prevStep}
                  />
                  <BaseDialog.Action
                    label={paymentMethod === CheckoutPaymentMethod.PIX ? "Gerar Pix" : (hasNewCardFlow ? "Continuar" : "Confirmar")}
                    onClick={() => {
                      if (hasNewCardFlow) {
                        jumpToStep(3);
                      } else {
                        handleGenerateCheckout(cardData);
                      }
                    }}
                    isLoading={isGenerating}
                    disabled={
                      paymentMethod === CheckoutPaymentMethod.CREDIT_CARD && (
                        !selectedSavedCardId ||
                        (selectedSavedCardId === "new" && !addressData)
                      )
                    }
                    icon={(!hasNewCardFlow && paymentMethod === CheckoutPaymentMethod.CREDIT_CARD) ? <ShieldCheck className="w-4 h-4" /> : undefined}
                  />
                </>
              )}

              {step === 3 && hasNewCardFlow && (
                <>
                  <BaseDialog.Action
                    label="Voltar"
                    variant="outline"
                    onClick={() => jumpToStep(2)}
                  />
                  <BaseDialog.Action
                    label="Confirmar"
                    onClick={() => handleGenerateCheckout({ ...cardData, ...addressData } as CreditCardData)}
                    isLoading={isGenerating}
                    disabled={!cardData}
                    icon={<ShieldCheck className="w-4 h-4" />}
                  />
                </>
              )}

              {step === 4 && !isCardStep4 && activeInvoice?.pix_copy_paste && (
                <Button
                  onClick={handleCopyPix}
                  className={cn(
                    "text-white h-11 sm:h-12 flex items-center justify-center gap-2 w-full text-sm font-semibold rounded-[18px] shadow-xs transition-all duration-300 active:scale-[0.99]",
                    pixCopied
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-primary hover:bg-primary-hover"
                  )}
                >
                  {pixCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white animate-in zoom-in-50 duration-200" />
                      Código Pix Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Código Pix
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
