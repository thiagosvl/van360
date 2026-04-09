import { SaaSPlan } from "@/types/subscription";
import { useSaaSCheckoutViewModel } from "@/hooks/ui/useSaaSCheckoutViewModel";
import { SubscriptionIdentifer, CheckoutPaymentMethod } from "@/types/enums";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { cn } from "@/lib/utils";
import CreditCardForm, { CreditCardData } from "@/components/dialogs/CreditCardForm";
import { useState } from "react";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import { PixPaymentView } from "@/components/features/subscription/PixPaymentView";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Smartphone, CreditCard as CreditCardIcon, ShieldCheck,
  ChevronLeft, ArrowRight, Check, Calendar, RefreshCw, Copy, Star, AlertCircle, Plus
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
    selectedPeriod,
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
    isPromotionActive,
  } = useSaaSCheckoutViewModel({ plans, initialPlanId, isOpen, onClose, onSuccess, forcedPeriod });

  const [cardData, setCardData] = useState<CreditCardData | null>(null);

  const annualPlan = plans.find(p => p.identificador === SubscriptionIdentifer.YEARLY);
  const monthlyPlan = plans.find(p => p.identificador === SubscriptionIdentifer.MONTHLY);

  const isAnual = selectedPeriod === SubscriptionIdentifer.YEARLY;
  const selectedPlan = isAnual ? annualPlan : monthlyPlan;

  const annualPrice = annualPlan ? SubscriptionUtils.getFinalPrice(annualPlan, isPromotionActive) : 0;
  const monthlyPrice = monthlyPlan ? SubscriptionUtils.getFinalPrice(monthlyPlan, isPromotionActive) : 0;

  const totalPrice = selectedPlan ? SubscriptionUtils.getFinalPrice(selectedPlan, isPromotionActive) : 0;
  const formattedPrice = SubscriptionUtils.formatCurrency(totalPrice);

  const discountPercent = monthlyPrice > 0 ? Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100) : 0;
  const totalDiscount = (monthlyPrice * 12) - annualPrice;
  const freeMonths = monthlyPrice > 0 ? Math.round(totalDiscount / monthlyPrice) : 0;

  const handleCopyPix = () => {
    if (activeInvoice?.pix_copy_paste) {
      navigator.clipboard.writeText(activeInvoice.pix_copy_paste);
      toast.success("Código Pix copiado!");
    }
  };

  const isCardStep3 = step === 3 && paymentMethod === CheckoutPaymentMethod.CREDIT_CARD;
  const isLocked = isGenerating || isCardStep3;

  const stepTitles = [
    "Assinatura Van360",
    "Forma de Pagamento",
    paymentMethod === CheckoutPaymentMethod.PIX ? "Aguardando PIX" : "Confirmando Pagamento",
  ];
  const stepSubtitles = [
    "Escolha o melhor plano para você",
    paymentMethod === CheckoutPaymentMethod.PIX ? "Pague com PIX e ative instantaneamente" : "Preencha os dados do cartão",
    paymentMethod === CheckoutPaymentMethod.PIX ? "Escaneie o QR Code no app do banco" : "Seu banco está confirmando o pagamento",
  ];

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(val) => !val && onClose()}
      className="max-w-xl"
      lockClose={isLocked}
    >
      <BaseDialog.Header
        title={stepTitles[step - 1]}
        subtitle={stepSubtitles[step - 1]}
        showSteps
        currentStep={step}
        totalSteps={3}
        onClose={onClose}
        hideCloseButton={isLocked}
        leftAction={step > 1 ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={prevStep}
            className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 text-[#1a3a5c]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        ) : null}
      />

      <BaseDialog.Body animate animationKey={`${step}-${paymentMethod}`} className="p-0">

        {/* ── STEP 1: Seleção de Plano ── */}
        {step === 1 && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {forcedPeriod && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[11px] font-medium text-amber-700">
                  Você está alterando para o plano anual. Esta ação é definitiva para este checkout.
                </p>
              </div>
            )}

            {/* Card Anual */}
            {annualPlan && (
              <div
                onClick={() => !forcedPeriod && setSelectedPeriod(SubscriptionIdentifer.YEARLY)}
                className={cn(
                  "relative rounded-xl p-4 sm:p-6 border-2 transition-all duration-300 select-none",
                  !forcedPeriod && "cursor-pointer",
                  isAnual
                    ? "bg-white border-[#1a3a5c] shadow-lg ring-4 ring-primary/5"
                    : "bg-[#f8f9fa] border-transparent hover:border-slate-200"
                )}
              >
                {/* Floating Badge baseada no modelo Meta */}
                <div
                  className={cn(
                    "absolute -top-[13px] left-1/2 -translate-x-1/2 px-4 sm:px-5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-sans font-black uppercase shadow-sm z-10 border whitespace-nowrap transition-all",
                    isAnual
                      ? "bg-[#d1fae5] text-[#065f46] border-[#6ee7b7]"
                      : "bg-slate-200 text-slate-500 border-slate-300"
                  )}
                >
                  {totalDiscount > 0 ? `ECONOMIZE ${SubscriptionUtils.formatCurrency(totalDiscount)}` : `${discountPercent}% OFF`}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-sm",
                      isAnual ? "bg-[#d9e2ec] text-[#1a3a5c]" : "bg-slate-200 text-slate-400"
                    )}>
                      <Star className={cn("w-5 h-5 sm:w-6 sm:h-6", isAnual && "fill-[#1a3a5c]")} />
                    </div>
                    <div className="min-w-0 pr-1">
                      <h3 className={cn("font-headline font-bold text-base sm:text-lg leading-tight truncate", isAnual ? "text-[#1a3a5c]" : "text-slate-600")}>
                        Anual
                      </h3>
                      <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                        O melhor custo-benefício
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-xl sm:text-3xl font-headline font-black tracking-tighter", isAnual ? "text-[#1a3a5c]" : "text-slate-400")}>
                      {SubscriptionUtils.formatCurrency(annualPrice)}
                      <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-0.5">/ano</span>
                    </p>
                    {isAnual && (
                      <p className="text-[10px] sm:text-[13px] font-bold text-[#f59e0b] mt-0.5">
                        <span className="hidden sm:inline">Equivalente a </span>{SubscriptionUtils.formatCurrency(annualPrice / 12)}/mês
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
                  {(annualPlan.vantagens || []).slice(0, 3).map((v, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      <div className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors shrink-0", isAnual ? "bg-[#1a3a5c]" : "bg-slate-300")}>
                        <Check className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 text-white stroke-[4px]" />
                      </div>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Card Mensal */}
            {monthlyPlan && (!forcedPeriod || !isAnual) && (
              <div
                onClick={() => !forcedPeriod && setSelectedPeriod(SubscriptionIdentifer.MONTHLY)}
                className={cn(
                  "rounded-xl p-4 sm:p-6 border-2 transition-all duration-300 select-none",
                  !forcedPeriod && "cursor-pointer",
                  !isAnual
                    ? "bg-white border-[#1a3a5c] shadow-lg ring-4 ring-primary/5"
                    : "bg-[#f8f9fa] border-transparent hover:border-slate-200"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-sm",
                      !isAnual ? "bg-[#d9e2ec] text-[#1a3a5c]" : "bg-slate-200 text-slate-400"
                    )}>
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <h3 className={cn("font-headline font-bold text-base sm:text-lg leading-tight truncate", !isAnual ? "text-[#1a3a5c]" : "text-slate-600")}>
                        Mensal
                      </h3>
                      <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                        Flexibilidade total
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-xl sm:text-3xl font-headline font-black tracking-tighter", !isAnual ? "text-[#1a3a5c]" : "text-slate-400")}>
                      {SubscriptionUtils.formatCurrency(monthlyPrice)}
                      <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-0.5">/mês</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Forma de Pagamento ── */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            {/* Tabs PIX / Cartão */}
            <div className="flex p-1 bg-[#f2f4f6] rounded-full">
              <button
                onClick={() => setPaymentMethod(CheckoutPaymentMethod.PIX)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200",
                  paymentMethod === CheckoutPaymentMethod.PIX
                    ? "bg-white shadow-sm text-[#002444]"
                    : "text-[#545f73] hover:text-[#002444]"
                )}
              >
                <Smartphone className="w-4 h-4" />
                Pix
              </button>
              <button
                onClick={() => setPaymentMethod(CheckoutPaymentMethod.CREDIT_CARD)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200",
                  paymentMethod === CheckoutPaymentMethod.CREDIT_CARD
                    ? "bg-white shadow-sm text-[#002444]"
                    : "text-[#545f73] hover:text-[#002444]"
                )}
              >
                <CreditCardIcon className="w-4 h-4" />
                Cartão
              </button>
            </div>

            {/* Conteúdo PIX */}
            {paymentMethod === CheckoutPaymentMethod.PIX && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-white p-4 rounded-xl space-y-3 border border-[#f2f4f6]">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#87a4cc] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#43474e] leading-relaxed">
                      O QR Code será gerado na próxima etapa e terá validade de 24 horas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo Cartão */}
            {paymentMethod === CheckoutPaymentMethod.CREDIT_CARD && (
              <div className="animate-in fade-in duration-300 space-y-4">
                {cardError && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-red-700 leading-relaxed">{cardError}</p>
                  </div>
                )}

                {/* Cartões salvos */}
                {savedCards.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-[#545f73] uppercase tracking-tight">Seus cartões</p>
                    {savedCards.map(card => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setSelectedSavedCardId(card.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                          selectedSavedCardId === card.id
                            ? "border-[#002444] bg-white shadow-sm"
                            : "border-transparent bg-[#f2f4f6] hover:border-slate-200"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          selectedSavedCardId === card.id ? "bg-[#002444]" : "bg-slate-300"
                        )}>
                          <CreditCardIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#002444] uppercase">{card.brand} •••• {card.last_4_digits}</p>
                          <p className="text-[10px] text-[#545f73]">Validade {card.expire_month}/{card.expire_year}</p>
                        </div>
                        {card.is_default && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-[#002444] bg-[#d9e2ec] px-2 py-0.5 rounded-full shrink-0">
                            Principal
                          </span>
                        )}
                        {selectedSavedCardId === card.id && (
                          <Check className="w-4 h-4 text-[#002444] shrink-0" />
                        )}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setSelectedSavedCardId("new")}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                        selectedSavedCardId === "new"
                          ? "border-[#002444] bg-white shadow-sm"
                          : "border-dashed border-slate-300 hover:border-slate-400"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        selectedSavedCardId === "new" ? "bg-[#002444]" : "bg-slate-200"
                      )}>
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-[#545f73]">Usar outro cartão</p>
                      {selectedSavedCardId === "new" && (
                        <Check className="w-4 h-4 text-[#002444] shrink-0 ml-auto" />
                      )}
                    </button>
                  </div>
                )}

                {/* Formulário de novo cartão */}
                {(savedCards.length === 0 || selectedSavedCardId === "new") && (
                  <CreditCardForm onChange={setCardData} />
                )}

                {cardError && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-red-700 leading-relaxed">{cardError}</p>
                  </div>
                )}

                <div className="p-4 bg-[#f2f4f6] rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-[#545f73] uppercase tracking-tight">Resumo da Compra</span>
                    <span className="text-[10px] bg-[#d5e0f8] text-[#586377] px-2 py-0.5 rounded-full font-bold uppercase">
                      {isAnual ? "Anual" : "Mensal"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#002444]">{formattedPrice}</span>
                    <span className="text-xs text-[#43474e]">/{isAnual ? "ano" : "mês"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="p-6 space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCw className="w-10 h-10 text-[#002444] animate-spin" />
                <p className="text-sm font-bold text-[#002444]">
                  {paymentMethod === CheckoutPaymentMethod.CREDIT_CARD ? "Processando pagamento..." : "Gerando QR Code..."}
                </p>
                <p className="text-xs text-[#43474e]">Aguarde um momento</p>
              </div>
            ) : isCardStep3 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-[#002444]/5 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-[#002444] animate-spin" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-[#002444]">Confirmando pagamento...</p>
                  <p className="text-xs text-[#43474e] leading-relaxed max-w-[240px]">
                    Seu pagamento foi enviado. Aguardando a confirmação da operadora do cartão para ativar a assinatura.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Não feche esta tela</span>
                </div>
              </div>
            ) : activeInvoice?.pix_copy_paste ? (
              <PixPaymentView
                qrcode={activeInvoice.pix_copy_paste}
                valor={totalPrice}
                onCopy={handleCopyPix}
              />
            ) : null}
          </div>
        )}

      </BaseDialog.Body>

      <BaseDialog.Footer className="flex-col gap-3 bg-[#f2f4f6]/50">
        {/* Resumo de preço nos steps 1 e 2 */}
        {selectedPlan && (
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#43474e]" />
              <span className="text-[10px] text-[#43474e]">Pagamento 100% seguro</span>
            </div>
            {step === 1 ? (
              <div className="flex items-baseline gap-1">
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-[#002444]">{formattedPrice}</span>
                <span className="text-[10px] text-[#43474e] ml-1">/{isAnual ? "ano" : "mês"}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 w-full">
          {step === 1 && (
            <BaseDialog.Action
              label="Continuar"
              onClick={nextStep}
              icon={<ArrowRight className="w-4 h-4" />}
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
                label={paymentMethod === CheckoutPaymentMethod.PIX ? "Gerar Pagamento" : "Confirmar"}
                onClick={() => handleGenerateCheckout(cardData)}
                isLoading={isGenerating}
                disabled={
                  paymentMethod === CheckoutPaymentMethod.CREDIT_CARD && (
                    !selectedSavedCardId ||
                    (selectedSavedCardId === "new" && !cardData)
                  )
                }
                icon={paymentMethod === CheckoutPaymentMethod.CREDIT_CARD ? <ShieldCheck className="w-4 h-4" /> : undefined}
              />
            </>
          )}

          {step === 3 && !isCardStep3 && activeInvoice?.pix_copy_paste && (
            <BaseDialog.Action
              label="Copiar Código"
              onClick={handleCopyPix}
              icon={<Copy className="w-4 h-4" />}
              className="bg-[#002444] hover:bg-[#002444]/95 h-12 text-sm"
            />
          )}
        </div>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
