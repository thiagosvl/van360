import {
  useSubscriptionPlans,
  useSubscriptionBilling,
  useSubscriptionReferral,
  useCancelSubscription
} from "@/hooks/api/useSubscription";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";
import { useQueryClient } from "@tanstack/react-query";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ReferAndEarnCard } from "@/components/features/subscription/ReferAndEarnCard";
import { SubscriptionHeroCard } from "@/components/features/subscription/SubscriptionHeroCard";
import { SubscriptionPlansShowcase } from "@/components/features/subscription/SubscriptionPlansShowcase";
import { WhatsAppSupportButton } from "@/components/ui/WhatsAppSupportButton";
import { copyToClipboard } from "@/utils/browser";
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Trash2,
  CreditCard,
  History,
  Smartphone,
} from "lucide-react";
import { SubscriptionInvoiceCard } from "@/components/features/subscription/SubscriptionInvoiceCard";
import { SubscriptionInvoicesDialog } from "@/components/features/subscription/SubscriptionInvoicesDialog";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SaaSPlan,
  SubscriptionInvoice,
} from "@/types/subscription";
import {
  SubscriptionInvoiceStatus,
  SubscriptionIdentifer,
  SubscriptionStatus,
  CheckoutPaymentMethod,
} from "@/types/enums";
import { useLayout } from "@/hooks";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/business/useSession";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { parseLocalDate } from "@/utils/dateUtils";
import { isNativeIos } from "@/utils/detectPlatform";
import { openBrowserLink } from "@/utils/browser";
import { getWhatsAppUrl } from "@/constants";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import {
  purchaseIosProduct,
  restoreIosPurchases,
  getActiveIosProductId,
  IAP_PRODUCTS,
  IapCapacityTier,
} from "@/services/native/iapRevenueCat.service";

export default function SubscriptionPage() {
  const { can } = usePermissions();

  const { user } = useSession();
  const queryClient = useQueryClient();

  const {
    subscription,
    isLoading: isLoadingStatus,
    isTrial,
    isTrialExpired,
    isCanceled,
    isExpired,
    isPastDue,
    isActive,
    trialDaysLeft,
  } = useSubscriptionAccess(user?.id);

  const isSalesMode = isTrial || isExpired || isCanceled || !subscription;

  const {
    plans,
    isPromotionActive,
    pricing,
    isLoading: isLoadingPlans
  } = useSubscriptionPlans();

  const {
    invoices,
    totalInvoices,
    paymentMethods,
    setDefaultPaymentMethod,
    deletePaymentMethod
  } = useSubscriptionBilling(user?.id);

  const { referral } = useSubscriptionReferral(user?.id);
  const { data: usuarioResumo } = useUsuarioResumo(user?.id);
  const activeStudentsCount = usuarioResumo?.contadores?.passageiros?.ativos ?? 0;

  const {
    setPageTitle,
  } = useLayout();

  const { openSaaSCheckoutDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const [expandedPaymentMethodId, setExpandedPaymentMethodId] = useState<string | null>(null);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showUpgradeShowcase, setShowUpgradeShowcase] = useState(false);
  const [isUpgradingIos, setIsUpgradingIos] = useState(false);
  const [upgradeForcedPeriod, setUpgradeForcedPeriod] = useState<SubscriptionIdentifer | undefined>();

  const cancelSubscription = useCancelSubscription();

  const handleRefresh = async () => {
    if (!user?.id) return;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["subscription", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] }),
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] }),
      queryClient.invalidateQueries({ queryKey: ["payment-methods", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["subscription-invoices", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["subscription-invoices-paginated", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["referral-link", user.id] }),
    ]);
  };

  const isLoading = isLoadingStatus || isLoadingPlans;

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSubscribe = async (plan?: SaaSPlan | string, forcedPeriod?: SubscriptionIdentifer) => {
    if (isNativeIos()) {
      const isMonthlyAppleActive =
        subscription?.status === SubscriptionStatus.ACTIVE &&
        subscription?.planos?.identificador === SubscriptionIdentifer.MONTHLY &&
        subscription?.metodo_pagamento === CheckoutPaymentMethod.APPLE_IAP;

      if (isMonthlyAppleActive && (forcedPeriod === SubscriptionIdentifer.YEARLY || !forcedPeriod)) {
        if (activeStudentsCount > 250) {
          openBrowserLink(
            getWhatsAppUrl(
              "Olá! Sou assinante do Van360 e gostaria de fazer upgrade para o plano anual corporativo (acima de 250 alunos)."
            )
          );
          return;
        }

        setIsUpgradingIos(true);
        try {
          const currentProductId = await getActiveIosProductId();
          const isCurrentTier250 =
            currentProductId === IAP_PRODUCTS.MENSAL_250 ||
            currentProductId === IAP_PRODUCTS.ANUAL_250 ||
            activeStudentsCount > 110;

          const productId = isCurrentTier250 ? IAP_PRODUCTS.ANUAL_250 : IAP_PRODUCTS.ANUAL_110;
          const result = await purchaseIosProduct(productId);
          if (result.success) {
            toast.success("Assinatura Anual confirmada com sucesso pela App Store!");
            setShowUpgradeShowcase(false);
            await handleRefresh();
          } else if (!result.userCancelled) {
            toast.error(result.errorMessage || "Não foi possível concluir a troca de plano.");
          }
        } catch {
          toast.error("Erro inesperado ao conectar com a App Store.");
        } finally {
          setIsUpgradingIos(false);
        }
        return;
      }

      setUpgradeForcedPeriod(forcedPeriod);
      setShowUpgradeShowcase(true);
      setTimeout(() => {
        const showcaseEl = document.getElementById("subscription-plans-showcase");
        if (showcaseEl) {
          showcaseEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
      return;
    }
    if (!plans) return;
    const initialPlanId = typeof plan === "string" ? plan : plan?.id;
    openSaaSCheckoutDialog({
      plans,
      initialPlanId,
      forcedPeriod,
    });
  };

  const handleRetryPayment = (invoice?: SubscriptionInvoice) => {
    const planId = invoice?.plano_id || invoice?.planos?.id || invoice?.assinaturas?.planos?.id;
    handleSubscribe(planId);
  };

  useEffect(() => {
    setPageTitle("Assinatura do App");
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

  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

  const handleRestoreIosPurchases = async () => {
    setIsRestoringPurchases(true);
    try {
      const res = await restoreIosPurchases();
      if (res.hasActiveSubscription) {
        toast.success("Assinatura restaurada com sucesso!");
        await handleRefresh();
      } else {
        toast.info("Nenhuma assinatura ativa encontrada para este Apple ID.");
      }
    } catch {
      toast.error("Erro ao conectar com a App Store.");
    } finally {
      setIsRestoringPurchases(false);
    }
  };

  const handleCancelSubscription = () => {
    if (subscription?.metodo_pagamento === CheckoutPaymentMethod.APPLE_IAP) {
      openConfirmationDialog({
        title: "Assinatura Gerenciada pela Apple",
        description:
          "Sua assinatura foi contratada pela App Store. Para gerenciar ou cancelar a renovação automática, acesse os Ajustes do seu iPhone em seu ID Apple.",
        confirmText: "Gerenciar na Apple",
        cancelText: "Voltar",
        variant: "default",
        onConfirm: () => {
          void openBrowserLink("https://apps.apple.com/account/subscriptions");
          closeConfirmationDialog();
        },
      });
      return;
    }

    openConfirmationDialog({
      title: "Cancelar Assinatura",
      description: "Tem certeza que deseja cancelar sua assinatura? Você não receberá novas cobranças e seu acesso será suspenso. Seus dados continuarão salvos e você poderá reativar a qualquer momento.",
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

  const handleCopyPix = async (pixCode: string, invId: string) => {
    await copyToClipboard(pixCode);
    setCopiedPixId(invId);
    setTimeout(() => setCopiedPixId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 pt-10 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64 rounded-[18px]" />
        <Skeleton className="h-40 w-full rounded-[24px]" />
        <Skeleton className="h-72 w-full rounded-[24px]" />
        <Skeleton className="h-64 w-full rounded-[24px]" />
      </div>
    );
  }


  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="min-h-screen bg-transparent max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 pt-1 sm:pt-2">
        {!isSalesMode && (
          <section className="mb-6">
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
              isLoadingUpgrade={isUpgradingIos}
            />
          </section>
        )}

        {!isSalesMode && showUpgradeShowcase && (
          <section className="max-w-lg mx-auto space-y-4 sm:space-y-6 w-full mb-6">
            <SubscriptionPlansShowcase
              plans={plans || []}
              pricing={pricing}
              isPromotionActive={isPromotionActive}
              subscription={subscription}
              referral={referral}
              trialDaysLeft={trialDaysLeft}
              isTrial={isTrial}
              isExpired={isExpired}
              isCanceled={isCanceled}
              onSelectPlan={handleSubscribe}
              activeStudentsCount={activeStudentsCount}
              initialPeriod={upgradeForcedPeriod}
            />
          </section>
        )}

        {isSalesMode ? (
          <div className="max-w-lg mx-auto space-y-4 sm:space-y-6 w-full">
            <SubscriptionPlansShowcase
              plans={plans || []}
              pricing={pricing}
              isPromotionActive={isPromotionActive}
              subscription={subscription}
              referral={referral}
              trialDaysLeft={trialDaysLeft}
              isTrial={isTrial}
              isExpired={isExpired}
              isCanceled={isCanceled}
              onSelectPlan={handleSubscribe}
              activeStudentsCount={activeStudentsCount}
              initialPeriod={upgradeForcedPeriod}
              pendingInvoicesSlot={(() => {
                if (isNativeIos()) return null;
                const pendingInvoices = (invoices || [])
                  .filter((inv) => inv.status === SubscriptionInvoiceStatus.PENDING)
                  .sort((a, b) => parseLocalDate(b.created_at).getTime() - parseLocalDate(a.created_at).getTime());

                if (pendingInvoices.length === 0) return null;

                return (
                  <section className="w-full space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                        </span>
                        {pendingInvoices.length === 1 ? "Fatura Pendente" : "Faturas Pendentes"}
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {pendingInvoices.map((inv) => (
                        <SubscriptionInvoiceCard
                          key={inv.id}
                          invoice={inv}
                          copiedPixId={copiedPixId}
                          onCopyPix={handleCopyPix}
                          onRetryPayment={handleRetryPayment}
                        />
                      ))}
                    </div>
                  </section>
                );
              })()}
            />

            {(() => {
              const nonPendingInvoices = (invoices || [])
                .filter((inv) => inv.status !== SubscriptionInvoiceStatus.CANCELED && inv.status !== SubscriptionInvoiceStatus.PENDING)
                .sort((a, b) => parseLocalDate(b.created_at).getTime() - parseLocalDate(a.created_at).getTime());
              const displayedInvoices = nonPendingInvoices.slice(0, 3);
              const totalCount = nonPendingInvoices.length;
              const hasMore = totalCount > 3;

              if (displayedInvoices.length === 0) return null;

              return (
                <section className="pt-6 border-t border-[#e5e5e5] w-full">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight">
                      Últimas Faturas
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {displayedInvoices.map((inv) => (
                      <SubscriptionInvoiceCard
                        key={inv.id}
                        invoice={inv}
                        copiedPixId={copiedPixId}
                        onCopyPix={handleCopyPix}
                        onRetryPayment={handleRetryPayment}
                        isExpired={isExpired}
                      />
                    ))}

                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => setIsHistoryDialogOpen(true)}
                        className="w-full py-3 px-4 bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] text-xs sm:text-sm font-semibold text-primary flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] group mt-2"
                      >
                        <History className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>Ver histórico completo ({totalCount})</span>
                      </button>
                    )}
                  </div>
                </section>
              );
            })()}

            {!isExpired && !isCanceled && (
              <div className="pt-2">
                <WhatsAppSupportButton
                  subtitle={
                    isTrial
                      ? "Tire dúvidas sobre o período de teste ou planos"
                      : "Tire dúvidas sobre os planos ou reativação"
                  }
                  message={
                    isTrial
                      ? "Olá! Estou no período de teste do Van360 e gostaria de tirar uma dúvida."
                      : "Olá! Estou na tela de assinatura do Van360 e gostaria de tirar uma dúvida."
                  }
                />
              </div>
            )}
          </div>
        ) : (
          /* Layout do Modo Gestão (Para clientes já assinantes ativos) */
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <section>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight">
                      Últimas Faturas
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const sortedInvoices = (invoices || [])
                        .filter((inv) => inv.status !== SubscriptionInvoiceStatus.CANCELED)
                        .sort((a, b) => parseLocalDate(b.created_at).getTime() - parseLocalDate(a.created_at).getTime());
                      const displayedInvoices = sortedInvoices.slice(0, 3);
                      const totalCount = totalInvoices || sortedInvoices.length;
                      const hasMore = totalCount > 3;

                      if (displayedInvoices.length === 0) {
                        if (subscription?.metodo_pagamento === CheckoutPaymentMethod.APPLE_IAP) {
                          return (
                            <div className="py-6 text-center space-y-3 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs">
                              <div className="w-10 h-10 bg-[#f5f5f5] rounded-[14px] flex items-center justify-center mx-auto border border-[#e5e5e5]">
                                <Smartphone className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div className="space-y-1 max-w-sm mx-auto px-4">
                                <p className="text-xs font-semibold text-foreground">Gerenciado pela Apple</p>
                                <p className="text-[11px] text-muted-foreground">
                                  Os recibos e comprovantes fiscais das suas assinaturas são enviados diretamente para o email do seu ID Apple.
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="py-6 text-center space-y-3 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs">
                            <div className="w-10 h-10 bg-[#f5f5f5] rounded-[14px] flex items-center justify-center mx-auto border border-[#e5e5e5]">
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">Não há histórico de pagamentos.</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {displayedInvoices.map((inv) => (
                            <SubscriptionInvoiceCard
                              key={inv.id}
                              invoice={inv}
                              copiedPixId={copiedPixId}
                              onCopyPix={handleCopyPix}
                              onRetryPayment={handleRetryPayment}
                              isExpired={isExpired}
                            />
                          ))}

                          {hasMore && (
                            <button
                              type="button"
                              onClick={() => setIsHistoryDialogOpen(true)}
                              className="w-full py-3 px-4 bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] text-xs sm:text-sm font-semibold text-primary flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] group mt-2"
                            >
                              <History className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span>Ver histórico completo ({totalCount})</span>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </section>

                {subscription?.metodo_pagamento === CheckoutPaymentMethod.APPLE_IAP ? (
                  <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight mb-4 px-1">
                      Método de Pagamento
                    </h2>
                    <div className="overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#e5e5e5] bg-[#f5f5f5]">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">Apple ID (In-App Purchase)</p>
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wider text-primary">
                            Ativo
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Cobranças gerenciadas diretamente na sua conta da App Store.
                        </p>
                      </div>
                    </div>
                  </section>
                ) : (
                  paymentMethods && paymentMethods.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight mb-4 px-1">
                        Métodos de Pagamento
                      </h2>

                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const isExpanded = expandedPaymentMethodId === method.id;

                        return (
                          <div
                            key={method.id}
                            className={cn(
                              "overflow-hidden rounded-[20px] border transition-all duration-300",
                              method.is_default
                                ? "border-[#e5e5e5] bg-white shadow-xs"
                                : "border-[#e5e5e5]/80 bg-[#f5f5f5]"
                            )}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5 cursor-pointer"
                              onClick={() =>
                                setExpandedPaymentMethodId((current) => current === method.id ? null : method.id)
                              }
                              aria-expanded={isExpanded}
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#e5e5e5] bg-[#f5f5f5]">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-semibold uppercase text-foreground">{method.brand}</p>
                                  {method.is_default ? (
                                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-wider text-primary">
                                      Principal
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  <span className="tracking-widest text-foreground font-medium">•••• {method.last_4_digits}</span>
                                  <span>Expira {method.expire_month}/{method.expire_year.toString().slice(-2)}</span>
                                </div>
                              </div>

                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                  isExpanded && "rotate-180"
                                )}
                              />
                            </button>

                            {isExpanded && (
                              <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t border-[#e5e5e5] bg-white px-4 py-3.5 sm:px-5">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CircleDot className="h-3 w-3 shrink-0 text-muted-foreground" />
                                  <span>Uso recorrente protegido para renovações automáticas.</span>
                                </div>

                                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                  {!method.is_default && (
                                    <button
                                      className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-[18px] bg-[#f5f5f5] px-4 text-xs font-semibold text-foreground transition-colors hover:bg-[#e5e5e5] cursor-pointer"
                                      onClick={() => handleSetDefaultCard(method.id)}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      Definir principal
                                    </button>
                                  )}
                                  <button
                                    className={cn(
                                      "flex min-h-10 items-center justify-center gap-2 rounded-[18px] px-4 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 cursor-pointer",
                                      method.is_default ? "w-full bg-destructive/5" : "flex-1 bg-destructive/5"
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

              <aside className="xl:col-span-1">
                <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight mb-4 px-1">
                  Indique e Ganhe
                </h2>
                <div className="xl:sticky xl:top-24">
                  <ReferAndEarnCard layout="vertical" />
                </div>
              </aside>
            </div>

            <div className="max-w-xl mx-auto w-full pt-4 px-1 sm:px-0">
              <WhatsAppSupportButton
                subtitle="Tire suas dúvidas sobre o app"
                message="Olá! Sou assinante do Van360 e gostaria de falar com o suporte."
              />
            </div>
          </>
        )}

        <div className="flex flex-col items-center gap-3 pt-10">
          {isNativeIos() && (
            <button
              type="button"
              disabled={isRestoringPurchases}
              onClick={handleRestoreIosPurchases}
              className="text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] underline underline-offset-4 decoration-[#e5e5e5] hover:decoration-[#737373] transition-colors cursor-pointer"
            >
              {isRestoringPurchases ? "Restaurando compras..." : "Restaurar compras da App Store"}
            </button>
          )}

          {isActive && !!subscription?.data_vencimento && (
            <button
              type="button"
              onClick={handleCancelSubscription}
              className="text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] underline underline-offset-4 decoration-[#e5e5e5] hover:decoration-[#737373] transition-colors cursor-pointer"
            >
              Cancelar assinatura
            </button>
          )}
        </div>

        <SubscriptionInvoicesDialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          userId={user?.id}
          copiedPixId={copiedPixId}
          onCopyPix={handleCopyPix}
          onRetryPayment={handleRetryPayment}
          isExpired={isExpired}
        />
      </div>
    </PullToRefreshWrapper>
  );
}
