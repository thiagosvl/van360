import { useState, useEffect, useRef } from "react";
import {
  SaaSPlan,
  SubscriptionInvoice,
} from "@/types/subscription";
import {
  SubscriptionInvoiceStatus,
  SubscriptionIdentifer,
  CheckoutPaymentMethod,
  SubscriptionStatus
} from "@/types/enums";
import {
  useSubscriptionStatus,
  useSubscriptionPlans,
  useSubscriptionBilling,
  useSubscriptionCheckout,
} from "@/hooks/api/useSubscription";
import type { PaymentMethod } from "@/types/subscription";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { usePaymentProvider } from "@/hooks/business/usePaymentProvider";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import { subscriptionApi } from "@/services/api/subscription.api";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errorHandler";
import { toast } from "sonner";

import { CreditCardData } from "@/components/dialogs/CreditCardForm";

interface UseSaaSCheckoutViewModelProps {
  plans: SaaSPlan[];
  initialPlanId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  forcedPeriod?: SubscriptionIdentifer;
}

const determineCardBrand = (number: string) => {
  if (/^4/.test(number)) return "visa";
  if (/^5[1-5]/.test(number) || /^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d\d|7(?:[01]\d|20))/.test(number)) return "mastercard";
  if (/^3[47]/.test(number)) return "amex";
  if (/^6(?:011|5)/.test(number)) return "elo";
  return "mastercard";
};

export function useSaaSCheckoutViewModel({
  plans: plansFromProps,
  initialPlanId,
  isOpen,
  onClose,
  onSuccess,
  forcedPeriod
}: UseSaaSCheckoutViewModelProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { subscription, refetch: refetchStatus } = useSubscriptionStatus(user?.id);
  const { isPromotionActive, plans: plansFromApi } = useSubscriptionPlans();
  const { invoices, refetchInvoices, paymentMethods } = useSubscriptionBilling(user?.id);
  const { createCheckout } = useSubscriptionCheckout();

  const plans = plansFromProps || plansFromApi;
  const { isReady: isProviderReady, generatePaymentToken } = usePaymentProvider();

  const [step, setStep] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionIdentifer>(forcedPeriod || SubscriptionIdentifer.YEARLY);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(CheckoutPaymentMethod.PIX);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | "new" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<SubscriptionInvoice | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const savedCards: PaymentMethod[] = paymentMethods ?? [];
  const defaultCard = savedCards.find(c => c.is_default) ?? savedCards[0] ?? null;

  useEffect(() => {
    if (isOpen && plans && plans.length > 0) {
      if (forcedPeriod) {
        setSelectedPeriod(forcedPeriod);
      } else if (initialPlanId) {
        const targetPlan = plans.find(p => p.id === initialPlanId);
        if (targetPlan) {
          setSelectedPeriod(targetPlan.identificador);
        }
      } else {
        setSelectedPeriod(SubscriptionIdentifer.YEARLY);
      }
    }
  }, [isOpen, plans, initialPlanId, forcedPeriod]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      if (!initialPlanId) setSelectedPeriod(SubscriptionIdentifer.YEARLY);
      setPaymentMethod(CheckoutPaymentMethod.PIX);
      setSelectedSavedCardId(null);
      setIsGenerating(false);
      setActiveInvoice(null);
      setCardError(null);
    }
  }, [isOpen, initialPlanId]);

  // Pré-seleciona o cartão padrão ao entrar na aba cartão
  useEffect(() => {
    if (paymentMethod === CheckoutPaymentMethod.CREDIT_CARD && selectedSavedCardId === null) {
      setSelectedSavedCardId(defaultCard ? defaultCard.id : "new");
    }
    if (paymentMethod !== CheckoutPaymentMethod.CREDIT_CARD) {
      setSelectedSavedCardId(null);
    }
  }, [paymentMethod, defaultCard?.id]);

  const isHandlingConfirmation = useRef(false);

  const handlePaymentConfirmed = (source: 'REALTIME/CACHE' | 'POLLING') => {
    if (isHandlingConfirmation.current) return;
    isHandlingConfirmation.current = true;

    if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);

    toast.success("Pagamento confirmado com sucesso!");
    onSuccess?.();
    onClose();
  };

  // LOGICA CENTRALIZADA DE DETECÇÃO DE SUCESSO
  // Vigia tanto a mudança na fatura ativa quanto o status global da assinatura
  useEffect(() => {
    if (!activeInvoice || isHandlingConfirmation.current) return;

    const currentInvoice = invoices?.find(inv => inv.id === activeInvoice?.id);
    const isPaid = currentInvoice?.status === SubscriptionInvoiceStatus.PAID;
    const isSubscriptionActive = subscription?.status === SubscriptionStatus.ACTIVE;

    if (isPaid || isSubscriptionActive) {
      handlePaymentConfirmed("REALTIME/CACHE");
    }
  }, [invoices, subscription?.status, activeInvoice]);

  // Polling de fallback a cada 45s — cobre PIX e Cartão, caso o Realtime falhe
  useEffect(() => {
    if (!isOpen || step !== 3 || isHandlingConfirmation.current) return;

    fallbackIntervalRef.current = setInterval(() => {
      if (isHandlingConfirmation.current) return;
      refetchInvoices();
    }, 45000);

    return () => {
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    };
  }, [isOpen, step, activeInvoice?.id]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerateCheckout = async (cardData: CreditCardData | null) => {
    if (!user) return;

    setIsGenerating(true);
    setCardError(null);
    try {
      if (!plans || plans.length === 0) throw new Error("Planos não carregados. Tente novamente em instantes.");

      const plan = SubscriptionUtils.getPlanByPeriod(plans, selectedPeriod);
      if (!plan) throw new Error("Estamos com instabilidade ao carregar o plano selecionado. Tente novamente.");

      let paymentToken = "";
      let cardInfo: Partial<Parameters<typeof subscriptionApi.createCheckout>[0]> = {};

      if (paymentMethod === CheckoutPaymentMethod.CREDIT_CARD) {
        const usingSavedCard = selectedSavedCardId && selectedSavedCardId !== "new";

        if (usingSavedCard) {
          cardInfo = { savedCardId: selectedSavedCardId as string };
        } else {
          if (!cardData) throw new Error("Dados do cartão não informados.");
          if (!isProviderReady) throw new Error("Sistema de pagamento não inicializado. Aguarde e tente novamente.");

          const cardNumber = cardData.number?.replace(/\s/g, "");
          const cardBrand = determineCardBrand(cardNumber);
          const [expiryMonth, rawExpiryYear] = cardData.expiry?.split("/") || [];
          const expiryYear = rawExpiryYear?.length === 2 ? `20${rawExpiryYear}` : rawExpiryYear;

          const [birthDay, birthMonth, birthYear] = (cardData.birth || "").split("/");
          const birthForApi = birthYear && birthMonth && birthDay
            ? `${birthYear}-${birthMonth}-${birthDay}`
            : undefined;

          if (!birthForApi) throw new Error("Data de nascimento inválida. Use o formato DD/MM/AAAA.");

          paymentToken = await generatePaymentToken({
            brand: cardBrand,
            number: cardNumber,
            cvv: cardData.cvv,
            expireMonth: expiryMonth?.trim(),
            expireYear: expiryYear?.trim(),
            reuse: true,
            holderName: cardData.name,
            holderDocument: profile?.cpfcnpj?.replace(/\D/g, ""),
          });

          cardInfo = {
            cardBrand,
            cardLast4: cardNumber?.slice(-4),
            expireMonth: expiryMonth?.trim(),
            expireYear: expiryYear?.trim(),
            saveCard: true,
            birth: birthForApi,
            street: cardData.street,
            number: cardData.number_address,
            neighborhood: cardData.neighborhood,
            zipcode: cardData.zipcode,
            city: cardData.city,
            state: cardData.state
          };
        }
      }

      const result = await createCheckout.mutateAsync({
        planId: plan.id,
        paymentMethod: paymentMethod,
        paymentToken: paymentToken || undefined,
        ...cardInfo
      });

      // SINCRIA COM DADOS REAIS: Usamos o retorno da API para mostrar o QR Code imediatamente.
      // A atualização do cache de faturas (listagem) ocorrerá via Realtime (useSubscription.ts).
      if (result) {
        setActiveInvoice(result as unknown as SubscriptionInvoice);
        setStep(3);
      }
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Erro ao configurar assinatura");
      if (paymentMethod === CheckoutPaymentMethod.CREDIT_CARD) {
        setCardError(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
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
    subscription,
    plans,
    isPromotionActive,
    isProviderReady,
  };
}
