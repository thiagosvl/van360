import {
  useSubscriptionStatus,
  useSubscriptionPlans,
  useSubscriptionBilling,
  useSubscriptionReferral
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
} from "lucide-react";
import { useState } from "react";
import {
  SaaSPlan,
} from "@/types/subscription";
import {
  SubscriptionStatus,
  SubscriptionInvoiceStatus,
  SubscriptionIdentifer
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

  const { openSaaSCheckoutDialog, openConfirmationDialog } = useLayout();
  const [isCopied, setIsCopied] = useState(false);
  const [claimPhone, setClaimPhone] = useState("");
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [expandedPaymentMethodId, setExpandedPaymentMethodId] = useState<string | null>(null);

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
  const isExpired = subscription?.status === SubscriptionStatus.EXPIRED;
  const isTrial = subscription?.status === SubscriptionStatus.TRIAL;

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

  const handleSubscribe = (plan?: SaaSPlan, forcedPeriod?: SubscriptionIdentifer) => {
    if (!plans) return;
    openSaaSCheckoutDialog({
      plans,
      initialPlanId: plan?.id,
      forcedPeriod,
      onSuccess: () => handleRefresh(),
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
      <div className="min-h-screen bg-surface px-4 pt-10 pb-32 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header Editorial */}
        <header className="px-2 mb-8">
          <h1 className="font-headline font-black text-primary text-4xl lg:text-[2.75rem] leading-tight tracking-tighter">
            Minha Assinatura
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            Gerencie seu plano e detalhes de faturamento.
          </p>
        </header>

        {/* Subscription Status Hero */}
        <section className="px-1 mb-10">
          {isExpired ? (
            <div className="bg-[#ba1a1a] rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl relative overflow-hidden transition-all text-white">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-white" />
                  <span className="font-headline font-bold text-white uppercase tracking-[0.2em] text-[10px]">Status: Expirado</span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-white">Acesso Suspenso</h3>
                <p className="text-white/80 font-medium leading-relaxed">Sua assinatura expirou em seu último ciclo. Reative para continuar usando todos os recursos.</p>
              </div>
              <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                <Button
                  className="bg-white text-[#ba1a1a] hover:bg-white/90 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-lg active:scale-95 transition-all w-full md:w-auto"
                  onClick={() => handleSubscribe()}
                >
                  Reativar Agora
                </Button>
              </div>
            </div>
          ) : isTrial ? (
            <div className="bg-primary rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl relative overflow-hidden text-white group cursor-pointer" onClick={() => handleSubscribe()}>
              <div className="absolute left-0 bottom-0 w-64 h-64 bg-accent/20 rounded-full -ml-20 -mb-20 blur-3xl opacity-50"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="font-headline font-bold text-white uppercase tracking-[0.2em] text-[10px]">Período de Experiência</span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-white">Modo Degustação</h3>
                <p className="text-white/80 font-medium leading-relaxed">Você tem <span className="text-accent font-bold">{trialDaysLeft} dias</span> de acesso gratuito restante.</p>
              </div>
              <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                <Button
                  className="bg-accent text-primary hover:bg-accent/90 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-lg active:scale-95 transition-all w-full md:w-auto"
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                >
                  Assinar um Plano
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-[#10b981] rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl relative overflow-hidden text-white transition-all transform hover:shadow-2xl">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="font-headline font-bold text-white uppercase tracking-[0.2em] text-[10px]">Status: Ativo</span>
                </div>
                <h3 className="font-headline font-extrabold text-3xl text-white">
                  {subscription?.planos?.nome || "Plano Transportador Pro"}
                </h3>
                <p className="text-white/80 font-medium">
                  Próxima renovação em <span className="text-white font-bold">{subscription?.data_vencimento ? formatLocalDate(parseLocalDate(subscription.data_vencimento)) : "Em breve"}</span>
                </p>
              </div>
              <div className="mt-8 md:mt-0 relative z-10 shrink-0">
                {subscription?.planos?.identificador === SubscriptionIdentifer.MONTHLY && (
                  <Button
                    className="bg-white text-primary hover:bg-white/95 px-6 sm:px-10 h-14 rounded-2xl font-headline font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest shadow-lg active:scale-95 transition-all w-full md:w-auto"
                    onClick={() => handleSubscribe(undefined, SubscriptionIdentifer.YEARLY)}
                  >
                    Assinar Plano Anual
                  </Button>
                )}
              </div>
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

              <div className="bg-surface-container-low/50 rounded-2xl overflow-hidden border border-slate-100/50">
                <div className="hidden sm:grid grid-cols-4 px-6 py-4 bg-surface-container-high/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <div>Data</div>
                  <div>Plano</div>
                  <div>Valor</div>
                  <div className="text-right">Status</div>
                </div>

                <div className="divide-y divide-slate-100/30">
                  {invoices && invoices.length > 0 ? (
                    invoices
                      .filter(inv => inv.status !== SubscriptionInvoiceStatus.CANCELED)
                      .sort((a, b) => parseLocalDate(b.created_at).getTime() - parseLocalDate(a.created_at).getTime())
                      .map((inv) => (
                        <div
                          key={inv.id}
                          className="grid grid-cols-1 sm:grid-cols-4 px-4 sm:px-6 py-4 hover:bg-white transition-colors cursor-default items-center gap-3 sm:gap-0"
                        >
                          <div className="text-sm font-semibold text-primary">{formatLocalDate(parseLocalDate(inv.created_at))}</div>
                          <div className="text-sm text-slate-500 font-medium">
                            <span className="sm:hidden text-[10px] text-slate-300 block mb-0.5 uppercase tracking-wider font-bold">Plano</span>
                            {inv.assinaturas?.planos?.nome || "Pro Mensal"}
                          </div>
                          <div className="text-sm font-black text-primary">
                            <span className="sm:hidden text-[10px] text-slate-300 block mb-0.5 uppercase tracking-wider font-bold">Valor</span>
                            {formatCurrency(inv.valor)}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <InvoiceStatusBadge status={inv.status} />
                            {inv.pix_copy_paste && inv.status === SubscriptionInvoiceStatus.PENDING && (
                              <button
                                className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-[0.1em]"
                                onClick={() => handleCopyPix(inv.pix_copy_paste!)}
                              >
                                <Copy className="w-3 h-3" />
                                Copiar PIX
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="py-16 text-center space-y-3 bg-white/30">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <Clock className="w-6 h-6 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400">Nenhum pagamento identificado.</p>
                    </div>
                  )}
                </div>
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
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-[32px] p-6 lg:p-8 text-white shadow-2xl sticky top-24 overflow-hidden border border-white/5">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-40"></div>

              <div className="relative z-10 space-y-6 lg:space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <Gift className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-headline font-bold text-lg tracking-tight">Indique e Ganhe</h4>
                </div>

                <div className="space-y-3">
                  <p className="font-headline font-extrabold text-2xl leading-[1.1]">
                    Ganhe 30 dias grátis <span className="text-accent font-black">por indicação</span>
                  </p>
                  <p className="text-white/60 text-xs font-medium leading-relaxed">
                    Indique colegas motoristas e receba mensalidades gratuitas assim que eles se tornarem assinantes.
                  </p>
                </div>

                {/* Stats Progress - Circular minimal */}
                <div className="flex items-center justify-between bg-black/20 p-5 rounded-[22px] border border-white/5 shadow-inner">
                  <div className="text-center">
                    <p className="text-[9px] uppercase font-black text-white/40 mb-1 tracking-widest">Bônus</p>
                    <p className="text-2xl font-black text-accent">{totalBonusDays}d</p>
                  </div>

                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-white/5" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                      <circle
                        className="text-accent"
                        cx="32" cy="32"
                        fill="transparent" r="28"
                        stroke="currentColor"
                        strokeDasharray="175.9"
                        strokeDashoffset={175.9 - (175.9 * conversionRate) / 100}
                        strokeWidth="5"
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <span className="absolute text-[11px] font-black text-white">{conversionRate}%</span>
                  </div>

                  <div className="text-center">
                    <p className="text-[9px] uppercase font-black text-white/40 mb-1 tracking-widest">Indicações</p>
                    <p className="text-2xl font-black">{completedReferrals}</p>
                  </div>
                </div>

                {/* Share Link */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Seu Link de Convite</Label>
                    <div className="flex gap-2">
                      <div className="bg-white/10 flex-1 px-4 py-3 rounded-xl text-[11px] font-medium truncate text-white/80 border border-white/5 leading-none flex items-center">
                        {referral?.referralLink || "Gerando link..."}
                      </div>
                      <button
                        onClick={handleCopyReferral}
                        className="bg-accent text-primary p-3 rounded-xl active:scale-90 transition-transform shadow-lg shrink-0"
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
                    className="w-full h-12 bg-accent text-primary hover:bg-accent/90 rounded-2xl font-black text-[11px] font-headline uppercase tracking-widest shadow-xl flex items-center gap-2 group transition-all"
                  >
                    <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Compartilhar Link
                  </Button>
                </div>

                <div className="pt-6 border-t border-white/10 text-center">
                  {!isClaimOpen ? (
                    <button
                      onClick={() => setIsClaimOpen(true)}
                      className="text-[10px] font-black text-white/40 hover:text-accent uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
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
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl text-xs px-4 focus:ring-accent/50"
                      />
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 h-11 bg-white text-primary font-black text-[11px] font-headline uppercase rounded-xl hover:bg-slate-50 shadow-lg"
                          onClick={handleClaimReferral}
                          disabled={claimReferral.isPending}
                        >
                          {claimReferral.isPending ? "Processando..." : "Conseguir Bônus"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-11 h-11 text-white/40 hover:bg-white/5 hover:text-rose-400 p-0 rounded-xl transition-colors"
                          onClick={() => setIsClaimOpen(false)}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PullToRefreshWrapper>
  );
};

const InvoiceStatusBadge = ({ status }: { status: SubscriptionInvoiceStatus }) => {
  const config = {
    [SubscriptionInvoiceStatus.PAID]: {
      label: "Pago",
      className: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
    },
    [SubscriptionInvoiceStatus.PENDING]: {
      label: "Pendente",
      className: "bg-amber-50 text-amber-600 border-amber-100/50",
    },
    [SubscriptionInvoiceStatus.CANCELED]: {
      label: "Vencido",
      className: "bg-slate-50 text-slate-400 border-slate-100/50",
    },
  }[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-500",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
      config.className
    )}>
      {config.label}
    </span>
  );
};

export default SubscriptionPage;
