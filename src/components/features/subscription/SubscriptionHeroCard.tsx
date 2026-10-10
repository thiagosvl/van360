import { Button } from "@/components/ui/button";
import { TrendingUp, Lock, AlertOctagon, CheckCircle2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocalDate, parseLocalDate } from "@/utils/dateUtils";
import { SubscriptionIdentifer } from "@/types/enums";
import { TRIAL_DURATION_DAYS } from "@/constants";
import { Subscription, ReferralData } from "@/types/subscription";

interface SubscriptionHeroCardProps {
  subscription: Subscription | null;
  trialDaysLeft: number | null;
  isTrial: boolean;
  isExpired: boolean;
  isTrialExpired: boolean;
  isCanceled: boolean;
  isPastDue: boolean;
  referral: ReferralData | null;
  onSubscribe: (planId?: string, identifier?: SubscriptionIdentifer) => void;
}

interface ActionLabelParams {
  isCanceled: boolean;
  isExpired: boolean;
  isTrialExpired: boolean;
  isPastDue: boolean;
  isTrial: boolean;
  trialDaysLeft: number | null;
  subscription: Subscription | null;
}

export function getSubscriptionHeroActionLabel({
  isCanceled,
  isExpired,
  isTrialExpired,
  isPastDue,
  isTrial,
  trialDaysLeft,
  subscription,
}: ActionLabelParams): string | null {
  if (isCanceled) {
    return "Reativar Assinatura";
  }

  if (isExpired) {
    return isTrialExpired ? "Desbloquear Acesso" : "Reativar Agora";
  }

  if (isPastDue) {
    return "Regularizar Agora";
  }

  if (isTrial) {
    if (trialDaysLeft === null) return null;
    return trialDaysLeft === 0 ? "Garantir Acesso" : "Ver Planos";
  }

  if (
    subscription?.planos?.identificador === SubscriptionIdentifer.MONTHLY &&
    subscription?.data_vencimento
  ) {
    return "Assinar Plano Anual";
  }

  return null;
}

export function SubscriptionHeroCard({
  subscription,
  trialDaysLeft,
  isTrial,
  isExpired,
  isTrialExpired,
  isCanceled,
  isPastDue,
  referral,
  onSubscribe,
}: SubscriptionHeroCardProps) {
  const actionLabel = getSubscriptionHeroActionLabel({
    isCanceled,
    isExpired,
    isTrialExpired,
    isPastDue,
    isTrial,
    trialDaysLeft,
    subscription,
  });

  if (isCanceled) {
    return (
      <div className="bg-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#e5e5e5] relative overflow-hidden transition-all hover:shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-slate-100/70 via-slate-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] text-xs font-medium w-fit">
            <span>Assinatura cancelada</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight">
            Acesso Suspenso
          </h3>
          <p className="text-[#737373] text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
            Sua assinatura está cancelada. Você não receberá novas cobranças e o uso do aplicativo está bloqueado.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            className="bg-primary hover:bg-primary-hover text-white px-6 h-10 sm:h-11 rounded-[18px] font-medium text-sm shadow-xs active:scale-[0.98] transition-all w-full md:w-auto"
            onClick={() => onSubscribe()}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#e7000b]/20 relative overflow-hidden transition-all hover:shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-rose-50/80 via-rose-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] bg-[#e7000b]/[0.08] border border-[#e7000b]/20 text-[#e7000b] text-xs font-medium w-fit">
            <Lock className="w-3.5 h-3.5" />
            <span>{isTrialExpired ? "Período de teste expirado" : "Assinatura expirada"}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight">
            Acesso Suspenso
          </h3>
          <p className="text-[#737373] text-sm sm:text-base font-normal leading-relaxed">
            {isTrialExpired
              ? `Seu período de teste de ${TRIAL_DURATION_DAYS} dias acabou. Assine um plano para continuar usando todas as funcionalidades.`
              : "Sua assinatura expirou. Renove para continuar usando todas as funcionalidades."}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            className="bg-primary hover:bg-primary-hover text-white px-6 h-10 sm:h-11 rounded-[18px] font-medium text-sm shadow-xs active:scale-[0.98] transition-all w-full md:w-auto"
            onClick={() => onSubscribe()}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (isPastDue) {
    return (
      <div className="bg-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#e7000b]/20 relative overflow-hidden transition-all hover:shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-rose-50/80 via-rose-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] bg-[#e7000b]/[0.08] border border-[#e7000b]/20 text-[#e7000b] text-xs font-medium w-fit">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Assinatura em atraso</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight">
            Regularização Pendente
          </h3>
          <p className="text-[#737373] text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
            Sua assinatura do <span className="font-medium text-[#0a0a0a]">Plano {subscription?.planos?.nome}</span> venceu em{" "}
            <span className="font-medium text-[#0a0a0a]">
              {subscription?.data_vencimento ? formatLocalDate(parseLocalDate(subscription.data_vencimento)) : "breve"}
            </span>. Regularize o pagamento para evitar a suspensão do seu acesso.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            className="bg-[#e7000b] hover:bg-[#e7000b]/90 text-white px-6 h-10 sm:h-11 rounded-[18px] font-medium text-sm shadow-xs active:scale-[0.98] transition-all w-full md:w-auto"
            onClick={() => onSubscribe()}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (isTrial) {
    return (
      <div
        className={cn(
          "bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#e5e5e5] relative overflow-hidden transition-all hover:shadow-sm",
          trialDaysLeft !== null ? "cursor-pointer" : ""
        )}
        onClick={() => trialDaysLeft !== null && onSubscribe()}
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-slate-50/80 via-slate-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] bg-primary/10 border border-primary/20 text-primary text-xs font-medium w-fit">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sua assinatura</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight">
              {trialDaysLeft === 0
                ? "Último dia de Testes"
                : trialDaysLeft !== null
                  ? "Período de Testes"
                  : "Acesso Ilimitado"}
            </h3>
            <p className="text-[#737373] text-sm sm:text-base font-normal leading-relaxed">
              {trialDaysLeft === 0 ? (
                <>
                  Aproveite: <span className="text-[#0a0a0a] font-medium">hoje é o seu último dia</span> de acesso gratuito!
                </>
              ) : trialDaysLeft === 1 ? (
                <>
                  Você tem <span className="text-[#0a0a0a] font-medium">1 dia</span> de acesso gratuito restante.
                </>
              ) : trialDaysLeft !== null ? (
                <>
                  Você tem <span className="text-[#0a0a0a] font-medium">{trialDaysLeft} dias</span> de acesso gratuito restantes.
                </>
              ) : (
                <>
                  Você tem <span className="text-[#0a0a0a] font-medium">acesso gratuito</span> ilimitado.
                </>
              )}
            </p>

            {referral?.hasActiveDiscount && (
              <div className="md:hidden pt-2">
                <div className="p-3 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-[18px] flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-800">
                    Você ganhou um bônus de indicação de {referral.discountPct}% na 1ª mensalidade!
                  </span>
                </div>
              </div>
            )}
          </div>

          {actionLabel && (
            <div className="shrink-0">
              <Button
                className="bg-primary hover:bg-primary-hover text-white px-6 h-10 sm:h-11 rounded-[18px] font-medium text-sm shadow-xs active:scale-[0.98] transition-all w-full md:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onSubscribe();
                }}
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>

        {referral?.hasActiveDiscount && (
          <div className="hidden md:block relative z-10 mt-5 pt-1">
            <div className="p-3.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-[18px] flex items-center justify-between gap-3 text-left w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-emerald-700" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-emerald-800">
                  Você ganhou um bônus de indicação de {referral.discountPct}% na 1ª mensalidade!
                </span>
              </div>
              <span className="text-xs font-normal text-emerald-700/80 pr-2">
                O desconto será aplicado automaticamente após você realizar a assinatura do app.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#e5e5e5] relative overflow-hidden transition-all hover:shadow-sm">
      <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-slate-50/80 via-slate-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-700 text-xs font-medium w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Assinatura ativa</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight">
          Plano {subscription?.planos?.nome}
        </h3>
        {subscription?.data_vencimento ? (
          <p className="text-xs sm:text-sm text-[#737373] font-normal leading-relaxed">
            Próxima renovação programada para{" "}
            <span className="text-[#0a0a0a]">
              {formatLocalDate(parseLocalDate(subscription.data_vencimento))}
            </span>.
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-[#737373] font-normal leading-relaxed">
            Você possui <span className="text-[#0a0a0a]">acesso vitalício</span> ao Van360. Parabéns!
          </p>
        )}
      </div>
      {actionLabel && (
        <div className="relative z-10 shrink-0">
          <Button
            variant="outline"
            className="border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] px-5 h-10 rounded-[18px] font-medium text-sm shadow-xs transition-all active:scale-[0.98] w-full md:w-auto cursor-pointer"
            onClick={() => onSubscribe(undefined, SubscriptionIdentifer.YEARLY)}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
