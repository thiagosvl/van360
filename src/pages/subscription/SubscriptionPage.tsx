import {
  useSubscriptionStatus,
  useSubscriptionPlans,
  useSubscriptionBilling,
  useSubscriptionReferral,
  useCancelSubscription
} from "@/hooks/api/useSubscription";
import { useQueryClient } from "@tanstack/react-query";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { phoneMask } from "@/utils/masks";
import {
  Gift,
  Copy,
  CheckCircle2,
  Clock,
  Trash2,
  Lock,
  TrendingUp,
  Award,
  Share2,
  CreditCard,
  CircleDot,
  ChevronDown,
  X,
  AlertOctagon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SaaSPlan,
} from "@/types/subscription";
import {
  SubscriptionStatus,
  SubscriptionInvoiceStatus,
  SubscriptionIdentifer,
  CheckoutPaymentMethod
} from "@/types/enums";
import {
  getNowBR,
  parseLocalDate,
  formatLocalDate,
  differenceInCalendarDaysBR
} from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/hooks";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/business/useSession";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";

const BONUS_DAYS_PER_REFERRAL = 30;

const SubscriptionPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const {
    subscription,
    isLoading: isLoadingStatus
  } = useSubscriptionStatus(user?.id);

  const {
    plans,
    isLoading: isLoadingPlans
  } = useSubscriptionPlans();

  const {
    invoices,
    paymentMethods,
    setDefaultPaymentMethod,
    deletePaymentMethod
  } = useSubscriptionBilling(user?.id);

  const {
    referral,
    claimReferral
  } = useSubscriptionReferral(user?.id);

  const { openSaaSCheckoutDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const [isCopied, setIsCopied] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [expandedPaymentMethodId, setExpandedPaymentMethodId] = useState<string | null>(null);

  const cancelSubscription = useCancelSubscription();

  const handleRefresh = async () => {
    if (!user?.id) return;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["subscription", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] }),
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] }),
      queryClient.invalidateQueries({ queryKey: ["payment-methods", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["subscription-invoices", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["referral-link", user.id] }),
    ]);
  };

  const isLoading = isLoadingStatus || isLoadingPlans;
  const isTrial = subscription?.status === SubscriptionStatus.TRIAL;

  const isTrialExpired = (() => {
    if (!isTrial || !subscription?.trial_ends_at) return false;
    return differenceInCalendarDaysBR(subscription.trial_ends_at, getNowBR()) < 0;
  })();

  const isCanceled = subscription?.status === SubscriptionStatus.CANCELED;
  const isExpired = subscription?.status === SubscriptionStatus.EXPIRED || isTrialExpired;
  const isPastDue = subscription?.status === SubscriptionStatus.PAST_DUE;

  const trialDaysLeft = (() => {
    if (!isTrial || !subscription?.trial_ends_at) return 0;
    return Math.max(0, differenceInCalendarDaysBR(subscription.trial_ends_at, getNowBR()));
  })();

  const handleCopyReferral = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink);
      setIsCopied(true);
      toast.success("Link de indicação copiado!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSubscribe = (plan?: SaaSPlan, forcedPeriod?: SubscriptionIdentifer) => {
    if (!plans) return;
    openSaaSCheckoutDialog({
      plans,
      initialPlanId: plan?.id,
      forcedPeriod,
      onSuccess: () => handleRefresh(),
    });
  };

  useEffect(() => {
    if (searchParams.get("open_checkout") === "true" && plans && plans.length > 0) {
      handleSubscribe();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("open_checkout");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, plans]);

  const handleCancelSubscription = () => {
    openConfirmationDialog({
      title: "Cancelar Assinatura",
      description: "Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso aos recursos e não será mais cobrado.",
      confirmText: "Sim, Cancelar",
      cancelText: "Voltar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await cancelSubscription.mutateAsync();
          toast.success("Sua assinatura foi cancelada com sucesso.");
          closeConfirmationDialog();
        } catch {
          toast.error("Erro ao cancelar assinatura. Tente novamente ou chame o suporte.");
          closeConfirmationDialog();
        }
      },
    });
  };

  const handleSetDefaultCard = async (cardId: string) => {
    try {
      await setDefaultPaymentMethod.mutateAsync(cardId);
      toast.success("Cartão definido como principal!");
    } catch {
      toast.error("Erro ao definir cartão padrão.");
    }
  };

  const handleDeleteCard = (cardId: string) => {
    openConfirmationDialog({
      title: "Remover Cartão",
      description:
        "Tem certeza que deseja remover este cartão? Ele não poderá mais ser usado para renovações automáticas.",
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deletePaymentMethod.mutateAsync(cardId);
          toast.success("Cartão removido com sucesso!");
        } catch {
          toast.error("Erro ao remover cartão.");
        }
      },
    });
  };

  const handleClaimReferral = async () => {
    const cleanedPhone = claimPhone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      toast.error("Informe um número de WhatsApp válido (com DDD).");
      return;
    }
    try {
      await claimReferral.mutateAsync(cleanedPhone);
      toast.success("Indicação vinculada com sucesso!");
      setClaimPhone("");
      setIsClaimOpen(false);
    } catch {
      toast.error("Motorista não encontrado com esse número.");
    }
  };

  const handleCopyPix = (pixCode: string) => {
    navigator.clipboard.writeText(pixCode);
    toast.success("Código Pix copiado!");
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 pt-10 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-[28px]" />
        <Skeleton className="h-72 w-full rounded-[28px]" />
        <Skeleton className="h-64 w-full rounded-[28px]" />
      </div>
    );
  }

  const completedReferrals = referral?.completed ?? 0;
  const totalBonusDays = completedReferrals * BONUS_DAYS_PER_REFERRAL;
  const conversionRate = (referral?.total ?? 0) > 0
    ? Math.round((completedReferrals / (referral?.total ?? 1)) * 100)
    : 0;

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Subscription Status Hero */}
        <section className="px-1 mb-10">
          {isCanceled ? (
            <div className="bg-slate-100 border border-slate-200 rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden transition-all">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-slate-500 uppercase tracking-[0.2em] text-[10px]">Assinatura Cancelada</span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-slate-700">Acesso Suspenso</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                  Sua assinatura está cancelada. Você não receberá novas cobranças e o uso do aplicativo está bloqueado.
                </p>
              </div>
              <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                <Button
                  className="bg-primary text-white hover:bg-primary/90 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-lg active:scale-95 transition-all w-full md:w-auto"
                  onClick={() => handleSubscribe()}
                >
                  Reativar Agora
                </Button>
              </div>
            </div>
          ) : isExpired ? (
            <div className="bg-[#ba1a1a] rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl relative overflow-hidden transition-all text-white">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-white" />
                  <span className="font-headline font-bold text-white uppercase tracking-[0.2em] text-[10px]">
                    {isTrialExpired ? "Período de Teste Expirado" : "Assinatura Expirada"}
                  </span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-white">Acesso Suspenso</h3>
                <p className="text-white/80 font-medium leading-relaxed">
                  {isTrialExpired
                    ? "Seu período de teste de 15 dias acabou. Assine um plano para continuar usando todos os recursos."
                    : "Sua assinatura expirou. Renove para continuar usando todos os recursos."}
                </p>
                {referral?.hasActiveDiscount && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 text-white font-bold text-[11px] uppercase tracking-wide animate-pulse">
                    🎁 Desconto de {referral.discountPct}% por indicação ativo! Aproveite.
                  </div>
                )}
              </div>
              <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                <Button
                  className="bg-white text-[#ba1a1a] hover:bg-white/90 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-lg active:scale-95 transition-all w-full md:w-auto"
                  onClick={() => handleSubscribe()}
                >
                  {isTrialExpired ? "Assinar Agora" : "Reativar Agora"}
                </Button>
              </div>
            </div>
          ) : isPastDue ? (
            <div className="bg-[#ba1a1a] rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl relative overflow-hidden transition-all text-white">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-white" />
                  <span className="font-headline font-bold text-white uppercase tracking-[0.2em] text-[10px]">Assinatura em Atraso</span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-white">
                  Regularização Pendente
                </h3>
                <p className="text-white/80 font-medium leading-relaxed max-w-2xl">
                  Sua assinatura do <span className="font-bold text-white">Plano {subscription?.planos?.nome}</span> venceu em <span className="font-bold text-white">{subscription?.data_vencimento ? formatLocalDate(parseLocalDate(subscription.data_vencimento)) : "breve"}</span>. Regularize o pagamento para evitar a suspensão do seu acesso.
                </p>
              </div>
              <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                <Button
                  className="bg-white text-[#ba1a1a] hover:bg-white/90 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-lg active:scale-95 transition-all w-full md:w-auto"
                  onClick={() => handleSubscribe()}
                >
                  Regularizar Agora
                </Button>
              </div>
            </div>
          ) : isTrial ? (
            <div className="bg-[#fff8f0] border border-orange-200/60 rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md group cursor-pointer" onClick={() => handleSubscribe()}>
              <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/60 rounded-full -ml-20 -mb-20 blur-3xl"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <span className="font-headline font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">Sua Assinatura</span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-primary">Período de Testes</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Você tem <span className="text-orange-500 font-black">{trialDaysLeft} dias</span> de acesso gratuito restante.</p>
                {referral?.hasActiveDiscount && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-100/50 px-3.5 py-1.5 rounded-xl border border-orange-200/50 text-orange-600 font-bold text-[11px] uppercase tracking-wide animate-pulse">
                    🎁 Desconto de {referral.discountPct}% por indicação ativo!
                  </div>
                )}
              </div>
              <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                <Button
                  className="bg-primary text-white hover:bg-primary/95 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all w-full md:w-auto"
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                >
                  Assinar um Plano
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-[#f0f6fc] border border-[#d6e4f0] rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/60 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-headline font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">Assinatura Ativa</span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-primary">
                  Plano {subscription?.planos?.nome}
                </h3>
                <p className="text-slate-500 font-medium">
                  Próxima renovação em <span className="text-primary font-bold">{subscription?.data_vencimento ? formatLocalDate(parseLocalDate(subscription.data_vencimento)) : "Em breve"}</span>
                </p>
              </div>
              {subscription?.planos?.identificador === SubscriptionIdentifer.MONTHLY && (
                <div className="mt-6 md:mt-0 relative z-10 shrink-0">
                  <Button
                    className="bg-primary text-white hover:bg-primary/95 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-md shadow-primary/5 border border-[#d6e4f0] active:scale-95 transition-all w-full md:w-auto ring-1 ring-primary/10"
                    onClick={() => handleSubscribe(undefined, SubscriptionIdentifer.YEARLY)}
                  >
                    Assinar Plano Anual
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bento Grid Layout Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column (2/3 desktop) */}
          <div className="lg:col-span-2 space-y-12">

            {/* 1. Histórico de Faturas: PRIORIDADE */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h4 className="font-headline font-bold text-xl text-primary">Histórico de Cobrança</h4>
              </div>

              <div className="space-y-3">
                {invoices && invoices.length > 0 ? (
                  invoices
                    .filter(inv => inv.status !== SubscriptionInvoiceStatus.CANCELED)
                    .sort((a, b) => parseLocalDate(b.created_at).getTime() - parseLocalDate(a.created_at).getTime())
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all"
                      >
                        <div className="flex items-center justify-between p-4 sm:px-6 sm:py-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base font-semibold text-primary">
                                Plano {((inv as any).planos?.nome) || inv.assinaturas?.planos?.nome}
                              </span>
                              <InvoiceStatusBadge status={inv.status} />
                            </div>
                            <div className="text-[11px] sm:text-xs font-medium text-slate-500">
                              <span>Vencimento:</span>{" "}
                              {formatLocalDate(parseLocalDate(inv.data_vencimento || inv.created_at))}
                              {inv.metodo_pagamento && (
                                <>
                                  <span className="mx-1.5 text-slate-300">•</span>
                                  <span className="capitalize tracking-wider">
                                    {PAYMENT_METHOD_LABELS[inv.metodo_pagamento as CheckoutPaymentMethod] || "Boleto"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-sm sm:text-base font-semibold text-primary">
                              {formatCurrency(inv.valor)}
                            </div>
                          </div>
                        </div>

                        {(inv.status === SubscriptionInvoiceStatus.FAILED || inv.status === SubscriptionInvoiceStatus.PENDING) && (
                          <div className="px-4 pb-4 sm:px-6 sm:pb-5 pt-0">
                            {inv.pix_copy_paste && inv.status === SubscriptionInvoiceStatus.PENDING ? (
                              <button
                                className="w-full flex justify-center items-center gap-2 text-[11px] font-black text-white hover:bg-primary/90 transition-colors uppercase tracking-[0.1em] bg-primary px-4 py-3 rounded-xl border border-primary-400/40"
                                onClick={() => handleCopyPix(inv.pix_copy_paste!)}
                              >
                                <Copy className="w-4 h-4" />
                                Copiar código PIX
                              </button>
                            ) : (
                              <button
                                className="w-full px-4 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary-100 active:scale-95 text-center flex justify-center items-center"
                                onClick={() => handleSubscribe()}
                              >
                                Pagar Agora
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="py-4 text-center space-y-3 bg-white rounded-[22px] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                      <Clock className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">Não há histórico de pagamentos.</p>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Métodos de Pagamento: COMPACTO - Só aparece se houver cartões */}
            {paymentMethods && paymentMethods.length > 0 && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-headline font-bold text-xl text-primary">Métodos de Pagamento</h4>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const isExpanded = expandedPaymentMethodId === method.id;

                    return (
                      <div
                        key={method.id}
                        className={cn(
                          "overflow-hidden rounded-[22px] border transition-all duration-300",
                          method.is_default
                            ? "border-slate-100 bg-white shadow-soft-xl"
                            : "border-slate-100/70 bg-surface-container-low/80"
                        )}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
                          onClick={() =>
                            setExpandedPaymentMethodId((current) => current === method.id ? null : method.id)
                          }
                          aria-expanded={isExpanded}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                            <CreditCard className="h-4 w-4 text-slate-400" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold uppercase text-primary">{method.brand}</p>
                              {method.is_default ? (
                                <span className="shrink-0 rounded-full bg-secondary-container px-2 py-1 text-[9px] font-black uppercase leading-none tracking-[0.14em] text-on-secondary-container">
                                  Principal
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
                              <span className="tracking-[0.16em] text-primary">•••• {method.last_4_digits}</span>
                              <span>Expira {method.expire_month}/{method.expire_year.toString().slice(-2)}</span>
                            </div>
                          </div>

                          <ChevronDown
                            className={cn(
                              "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </button>

                        {isExpanded && (
                          <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t border-slate-100 bg-white/80 px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <CircleDot className="h-3 w-3 shrink-0 text-slate-300" />
                              <span className="font-medium">Uso recorrente protegido para renovações automáticas.</span>
                            </div>

                            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                              {!method.is_default && (
                                <button
                                  className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-[11px] font-black uppercase tracking-[0.14em] text-primary transition-colors hover:bg-slate-200"
                                  onClick={() => handleSetDefaultCard(method.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Definir principal
                                </button>
                              )}
                              <button
                                className={cn(
                                  "flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 text-[11px] font-black uppercase tracking-[0.14em] text-rose-600 transition-colors hover:bg-rose-100",
                                  method.is_default ? "w-full bg-rose-50" : "flex-1 bg-rose-50"
                                )}
                                onClick={() => handleDeleteCard(method.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Remover
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* Lateral Column: Recompensas (1/3 desktop) */}
          <aside className="lg:col-span-1">
            <div className="bg-[#f0f6fc] border border-[#d6e4f0] rounded-[32px] p-6 lg:p-8 text-primary shadow-sm sticky top-24 overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/60 rounded-full -mr-20 -mt-20 blur-3xl"></div>

              <div className="relative z-10 space-y-6 lg:space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-[#d6e4f0] shadow-sm">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-headline font-bold text-lg tracking-tight text-primary">Indique e Ganhe</h4>
                </div>

                <div className="space-y-3">
                  <p className="font-headline font-extrabold text-2xl leading-[1.1] text-primary">
                    Ganhe 30 dias grátis <span className="text-primary font-black">por indicação</span>
                  </p>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Indique colegas motoristas e receba mensalidades gratuitas assim que eles se tornarem assinantes.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-around bg-white/50 p-5 rounded-[22px] border border-[#d6e4f0] shadow-sm">
                  <div className="text-center w-full">
                    <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Indicações</p>
                    <p className="text-2xl font-black text-primary">{completedReferrals}</p>
                  </div>

                  <div className="w-px h-10 bg-slate-200 shrink-0 mx-2"></div>

                  <div className="text-center w-full">
                    <p className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Dias Ganhos</p>
                    <p className="text-2xl font-black text-primary">{totalBonusDays}d</p>
                  </div>
                </div>

                {/* Share Link */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Seu Link de Convite</Label>
                    <div className="flex gap-2">
                      <div className="bg-white flex-1 px-4 py-3 rounded-xl text-[11px] font-medium truncate text-slate-600 border border-[#d6e4f0] shadow-sm leading-none flex items-center">
                        {referral?.referralLink || "Gerando link..."}
                      </div>
                      <button
                        onClick={handleCopyReferral}
                        className="bg-primary text-white p-3 rounded-xl active:scale-90 transition-transform shadow-md shrink-0"
                      >
                        {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (referral?.referralLink && navigator.share) {
                        navigator.share({
                          url: referral.referralLink,
                          title: "Van360 - Melhore sua gestão escolar",
                          text: "Use meu link para se cadastrar na Van360 e ganhe benefícios!"
                        }).catch(() => null);
                      } else {
                        handleCopyReferral();
                      }
                    }}
                    className="w-full h-12 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black text-[11px] font-headline uppercase tracking-widest shadow-md shadow-primary/20 flex items-center gap-2 group transition-all"
                  >
                    <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Compartilhar Link
                  </Button>
                </div>

                {isTrial && !referral?.hasIndicator && (
                  <div className="pt-6 border-t border-[#d6e4f0] text-center">
                    {!isClaimOpen ? (
                      <button
                        onClick={() => setIsClaimOpen(true)}
                        className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                        <Award className="w-4 h-4" />
                        Ganhei um convite
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                        <Input
                          value={claimPhone}
                          onChange={(e) => setClaimPhone(phoneMask(e.target.value))}
                          placeholder="WhatsApp de quem indicou"
                          className="bg-white border-[#d6e4f0] text-slate-700 placeholder:text-slate-400 h-11 rounded-xl text-xs px-4 focus:ring-amber-500/50 shadow-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 h-11 bg-primary text-white font-black text-[11px] font-headline uppercase rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20"
                            onClick={handleClaimReferral}
                            disabled={claimReferral.isPending}
                          >
                            {claimReferral.isPending ? "Processando..." : "Utilizar o Bônus"}
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-11 h-11 text-slate-400 hover:bg-slate-100 hover:text-rose-500 p-0 rounded-xl transition-colors"
                            onClick={() => setIsClaimOpen(false)}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {!isCanceled && (
          <div className="flex justify-center pt-10">
            <button
              type="button"
              onClick={handleCancelSubscription}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-400 transition-colors"
            >
              Cancelar minha assinatura
            </button>
          </div>
        )}
      </div>
    </PullToRefreshWrapper>
  );
};



export default SubscriptionPage;
