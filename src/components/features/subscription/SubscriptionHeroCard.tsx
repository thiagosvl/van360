import { Button } from "@/components/ui/button";
import { TrendingUp, Lock, AlertOctagon, CheckCircle2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocalDate, parseLocalDate } from "@/utils/dateUtils";
import { SubscriptionIdentifer } from "@/types/enums";

interface SubscriptionHeroCardProps {
  subscription: any;
  trialDaysLeft: number | null;
  isTrial: boolean;
  isExpired: boolean;
  isTrialExpired: boolean;
  isCanceled: boolean;
  isPastDue: boolean;
  referral: any;
  onSubscribe: (planId?: string, identifier?: SubscriptionIdentifer) => void;
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

  if (isCanceled) {
    return (
      <div className="bg-white rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-200/80 relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-slate-100/70 via-slate-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-slate-400 uppercase tracking-[0.15em] text-[10px]">
              ASSINATURA CANCELADA
            </span>
          </div>
          <h3 className="font-headline font-bold text-2xl sm:text-[26px] text-slate-700 tracking-tight">
            Acesso Suspenso
          </h3>
          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
            Sua assinatura está cancelada. Você não receberá novas cobranças e o uso do aplicativo está bloqueado.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            className="bg-[#0a2540] text-white hover:bg-[#061e36] px-8 h-12 rounded-xl font-headline font-bold text-sm shadow-md active:scale-95 transition-all w-full md:w-auto"
            onClick={() => onSubscribe()}
          >
            Reativar Agora
          </Button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-white rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_4px_20px_rgba(225,29,72,0.05)] border border-rose-200/90 relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-rose-50/80 via-rose-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-rose-50 text-rose-600">
              <Lock className="w-4 h-4 text-rose-600" />
            </div>
            <span className="font-headline font-bold text-rose-600 uppercase tracking-[0.15em] text-[10px]">
              {isTrialExpired ? "PERÍODO DE TESTE EXPIRADO" : "ASSINATURA EXPIRADA"}
            </span>
          </div>
          <h3 className="font-headline font-bold text-2xl sm:text-[26px] text-[#0a2540] tracking-tight">
            Acesso Suspenso
          </h3>
          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
            {isTrialExpired
              ? "Seu período de teste de 15 dias acabou. Assine um plano para continuar usando todas as funcionalidades."
              : "Sua assinatura expirou. Renove para continuar usando todas as funcionalidades."}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            className="bg-[#0a2540] text-white hover:bg-[#061e36] px-8 h-12 rounded-xl font-headline font-bold text-sm shadow-md active:scale-95 transition-all w-full md:w-auto"
            onClick={() => onSubscribe()}
          >
            {isTrialExpired ? "Assinar Agora" : "Reativar Agora"}
          </Button>
        </div>
      </div>
    );
  }

  if (isPastDue) {
    return (
      <div className="bg-white rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_4px_20px_rgba(225,29,72,0.05)] border border-rose-200/90 relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-rose-50/80 via-rose-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-rose-50 text-rose-600">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
            </div>
            <span className="font-headline font-bold text-rose-600 uppercase tracking-[0.15em] text-[10px]">
              ASSINATURA EM ATRASO
            </span>
          </div>
          <h3 className="font-headline font-bold text-2xl sm:text-[26px] text-[#0a2540] tracking-tight">
            Regularização Pendente
          </h3>
          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
            Sua assinatura do <span className="font-bold text-slate-800">Plano {subscription?.planos?.nome}</span> venceu em{" "}
            <span className="font-bold text-slate-800">
              {subscription?.data_vencimento ? formatLocalDate(parseLocalDate(subscription.data_vencimento)) : "breve"}
            </span>. Regularize o pagamento para evitar a suspensão do seu acesso.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            className="bg-rose-600 text-white hover:bg-rose-700 px-8 h-12 rounded-xl font-headline font-bold text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all w-full md:w-auto"
            onClick={() => onSubscribe()}
          >
            Regularizar Agora
          </Button>
        </div>
      </div>
    );
  }

  if (isTrial) {
    return (
      <div
        className={cn(
          "bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-100 relative overflow-hidden transition-all hover:shadow-md",
          trialDaysLeft !== null ? "cursor-pointer" : ""
        )}
        onClick={() => trialDaysLeft !== null && onSubscribe()}
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-slate-50/80 via-slate-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>

        {/* Main Content Row */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-headline font-bold text-slate-400 uppercase tracking-[0.15em] text-[10px]">
                SUA ASSINATURA
              </span>
            </div>
            <h3 className="font-headline font-bold text-2xl sm:text-[26px] text-[#0a2540] tracking-tight">
              {trialDaysLeft !== null ? "Período de Testes" : "Acesso Ilimitado"}
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-snug">
              {trialDaysLeft !== null ? (
                <>
                  Você tem <span className="text-[#1a3a5c] font-bold">{trialDaysLeft} dias</span> de acesso gratuito restante.
                </>
              ) : (
                <>
                  Você tem <span className="text-[#1a3a5c] font-bold">acesso gratuito</span> ilimitado.
                </>
              )}
            </p>

            {/* Discount Badge for Mobile ONLY: Placed BEFORE the CTA Button */}
            {referral?.hasActiveDiscount && (
              <div className="md:hidden pt-2">
                <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-full bg-[#d1fae5] flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5 text-[#047857]" />
                  </div>
                  <span className="text-xs font-bold text-[#065f46]">
                    Desconto de {referral.discountPct}% por indicação ativo!
                  </span>
                </div>
              </div>
            )}
          </div>

          {trialDaysLeft !== null && (
            <div className="shrink-0">
              <Button
                className="bg-[#0a2540] text-white hover:bg-[#061e36] px-8 h-12 rounded-xl font-headline font-bold text-sm shadow-md active:scale-95 transition-all w-full md:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onSubscribe();
                }}
              >
                Ver Planos
              </Button>
            </div>
          )}
        </div>

        {/* Full-width Discount Bar for Desktop ONLY: Positioned cleanly at the bottom */}
        {referral?.hasActiveDiscount && (
          <div className="hidden md:block relative z-10 mt-5 pt-1">
            <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl flex items-center justify-between gap-3 text-left w-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#d1fae5] flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-[#047857]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#065f46]">
                  Desconto de {referral.discountPct}% por indicação ativo!
                </span>
              </div>
              <span className="text-xs font-medium text-[#047857]/80 pr-2">
                Benefício exclusivo aplicado ao assinar seu plano.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Subscription State
  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-100 relative overflow-hidden transition-all hover:shadow-md">
      <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-slate-50/80 via-slate-50/20 to-transparent rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-headline font-bold text-slate-400 uppercase tracking-[0.15em] text-[10px]">
            ASSINATURA ATIVA
          </span>
        </div>
        <h3 className="font-headline font-bold text-2xl sm:text-[26px] text-[#0a2540] tracking-tight">
          Plano {subscription?.planos?.nome}
        </h3>
        {subscription?.data_vencimento ? (
          <p className="text-slate-600 text-sm sm:text-base font-normal">
            Próxima renovação programada para{" "}
            <span className="font-semibold text-slate-800">
              {formatLocalDate(parseLocalDate(subscription.data_vencimento))}
            </span>.
          </p>
        ) : (
          <p className="text-slate-600 text-sm sm:text-base font-normal">
            Sua conta possui acesso vitalício e não requer renovações.
          </p>
        )}
      </div>
      {subscription?.planos?.identificador === SubscriptionIdentifer.MONTHLY && subscription?.data_vencimento && (
        <div className="relative z-10 shrink-0">
          <Button
            className="bg-[#0a2540] text-white hover:bg-[#061e36] px-8 h-12 rounded-xl font-headline font-bold text-sm shadow-md active:scale-95 transition-all w-full md:w-auto"
            onClick={() => onSubscribe(undefined, SubscriptionIdentifer.YEARLY)}
          >
            Assinar Plano Anual
          </Button>
        </div>
      )}
    </div>
  );
}
