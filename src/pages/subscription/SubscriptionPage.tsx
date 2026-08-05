import {
  useSubscriptionStatus,
  useSubscriptionPlans,
  useSubscriptionBilling,
  useSubscriptionReferral,
  useCancelSubscription
} from "@/hooks/api/useSubscription";
import { useQueryClient } from "@tanstack/react-query";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { formatCurrency } from "@/utils/formatters/currency";
import { ReferAndEarnCard } from "@/components/features/subscription/ReferAndEarnCard";
import { SubscriptionHeroCard } from "@/components/features/subscription/SubscriptionHeroCard";
import {
  Copy,
  CopyCheck,
  Clock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Trash2,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
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
import { useLayout } from "@/hooks";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/business/useSession";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { ROUTES } from "@/constants/routes";

export default function SubscriptionPage() {
  const { can } = usePermissions();

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

  const { referral } = useSubscriptionReferral(user?.id);
  const {
    setPageTitle,
  } = useLayout();


  const { openSaaSCheckoutDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const [expandedPaymentMethodId, setExpandedPaymentMethodId] = useState<string | null>(null);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

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
    if (!isTrial || !subscription?.trial_ends_at) return null;
    return Math.max(0, differenceInCalendarDaysBR(subscription.trial_ends_at, getNowBR()));
  })();

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSubscribe = (plan?: SaaSPlan | string, forcedPeriod?: SubscriptionIdentifer) => {
    if (!plans) return;
    const initialPlanId = typeof plan === "string" ? plan : plan?.id;
    openSaaSCheckoutDialog({
      plans,
      initialPlanId,
      forcedPeriod,
      onSuccess: () => handleRefresh(),
    });
  };

  // Sync Page Title
  useEffect(() => {
    setPageTitle("Minha Assinatura");
  }, [setPageTitle]);

  useEffect(() => {
    if (searchParams.get("open_checkout") === "true" && plans && plans.length > 0) {
      handleSubscribe();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("open_checkout");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, plans]);

  if (!can("assinatura.gerenciar")) {
    return <AccessRestrictedState moduleName="Assinatura" />;
  }

  const handleCancelSubscription = () => {
    openConfirmationDialog({
      title: "Cancelar Assinatura",
      description: "Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso as funcionalidades e não será mais cobrado.",
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

  const handleCopyPix = (pixCode: string, invId: string) => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPixId(invId);
    setTimeout(() => setCopiedPixId(null), 2000);
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

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="min-h-screen bg-surface max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Subscription Status Hero */}
        <section className="px-1 mb-10">
          <SubscriptionHeroCard
            subscription={subscription}
            trialDaysLeft={trialDaysLeft}
            isTrial={isTrial}
            isExpired={isExpired}
            isTrialExpired={isTrialExpired}
            isCanceled={isCanceled}
            isPastDue={isPastDue}
            referral={referral}
            onSubscribe={handleSubscribe}
          />
        </section>

        {/* Bento Grid Layout Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column (2/3 desktop) */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. Histórico de Faturas: PRIORIDADE */}
            <section>
              <h2 className="text-[17px] font-bold text-slate-800 mb-4 px-1">
                Histórico de Cobrança
              </h2>

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
                              <span>
                                {inv.status === SubscriptionInvoiceStatus.PAID
                                  ? "Válido até:"
                                  : inv.status === SubscriptionInvoiceStatus.PENDING
                                    ? "Vence em:"
                                    : "Venceu em:"}
                              </span>{" "}
                              {formatLocalDate(parseLocalDate(inv.data_vencimento))}
                              {inv.metodo_pagamento && (
                                <>
                                  <span className="mx-1.5 text-slate-300">•</span>
                                  <span className="capitalize">
                                    {PAYMENT_METHOD_LABELS[inv.metodo_pagamento as CheckoutPaymentMethod] || "Boleto"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 text-right">
                            <div className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                              {formatCurrency(inv.valor_total || inv.valor)}
                            </div>
                            {inv.parcelas && inv.parcelas > 1 && (
                              <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                                {inv.parcelas}x de {formatCurrency(inv.valor_parcela || Math.round(((inv.valor_total || inv.valor) / inv.parcelas) * 100) / 100)}
                              </span>
                            )}
                          </div>
                        </div>

                        {(inv.status === SubscriptionInvoiceStatus.FAILED || inv.status === SubscriptionInvoiceStatus.PENDING) && (
                          <div className="px-4 pb-4 sm:px-6 sm:pb-5 pt-0">
                            {inv.pix_copy_paste && inv.status === SubscriptionInvoiceStatus.PENDING ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  className="w-full sm:flex-1 flex justify-center items-center gap-2 text-[13px] font-bold text-white hover:bg-primary/90 transition-colors bg-primary px-4 py-3 rounded-xl border border-primary-400/40 transition-all duration-300"
                                  onClick={() => handleCopyPix(inv.pix_copy_paste!, inv.id)}
                                >
                                  {copiedPixId === inv.id ? (
                                    <>
                                      <CopyCheck className="w-4 h-4 animate-in zoom-in duration-200" />
                                      Copiado!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      Copiar código PIX
                                    </>
                                  )}
                                </button>
                                <button
                                  className="w-full sm:flex-1 flex justify-center items-center gap-2 text-[13px] font-bold text-primary hover:bg-primary/10 transition-colors bg-primary/5 px-4 py-3 rounded-xl border border-primary/10"
                                  onClick={() => handleSubscribe()}
                                >
                                  Alterar forma de pagamento
                                </button>
                              </div>
                            ) : (
                              <button
                                className="w-full px-4 py-3 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary-100 active:scale-95 text-center flex justify-center items-center"
                                onClick={() => handleSubscribe()}
                              >
                                Alterar forma de pagamento
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
                    <p className="text-xs font-base text-slate-400">Não há histórico de pagamentos.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Texto de Suporte ao Usuário */}
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium text-center max-w-md mx-auto mt-6 mb-2 leading-relaxed">
              Precisa de ajuda com sua assinatura?
              <br /> Entre em contato com o suporte através do menu 'Conta'.
            </p>

            {/* 2. Métodos de Pagamento: COMPACTO - Só aparece se houver cartões */}
            {paymentMethods && paymentMethods.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-[17px] font-bold text-slate-800 mb-4 px-1">
                  Métodos de Pagamento
                </h2>

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
                                  "flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold   text-rose-600 transition-colors hover:bg-rose-100",
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
            <h2 className="text-[17px] font-bold text-slate-800 mb-4 px-1">
              Indique e Ganhe
            </h2>
            <div className="sticky top-24">
              <ReferAndEarnCard />
            </div>
          </aside>
        </div>

        {!isCanceled && !isTrial && (
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
}
