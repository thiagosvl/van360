import { SaaSPlan, Subscription } from "@/types/subscription";
import { SubscriptionIdentifer, SubscriptionStatus } from "@/types/enums";
import { getNowBR, differenceInCalendarDaysBR } from "@/utils/dateUtils";

export const SubscriptionUtils = {
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  getFinalPrice: (plan?: SaaSPlan, isPromoActive: boolean = false) => {
    if (!plan) return 0;
    if (isPromoActive && plan.valor_promocional !== null) {
      return plan.valor_promocional;
    }
    return plan.valor;
  },

  getMonthlyEquivalent: (plan?: SaaSPlan, isPromoActive: boolean = false) => {
    if (!plan) return 0;
    const price = SubscriptionUtils.getFinalPrice(plan, isPromoActive);
    if (plan.identificador === SubscriptionIdentifer.YEARLY) {
      return price / 12;
    }
    return price;
  },

  getPlanByPeriod: (plans: SaaSPlan[], period: SubscriptionIdentifer) => {
    return plans?.find((p) => p.identificador === period);
  },

  getSavingsAmount: (plans: SaaSPlan[], isPromoActive: boolean = false) => {
    const monthly = SubscriptionUtils.getPlanByPeriod(plans, SubscriptionIdentifer.MONTHLY);
    const yearly = SubscriptionUtils.getPlanByPeriod(plans, SubscriptionIdentifer.YEARLY);

    if (!monthly || !yearly) return 0;

    const monthlyPrice = SubscriptionUtils.getFinalPrice(monthly, isPromoActive);
    const yearlyTotal = SubscriptionUtils.getFinalPrice(yearly, isPromoActive);
    const yearlyMonthlyEquivalent = yearlyTotal / 12;

    return monthlyPrice - yearlyMonthlyEquivalent;
  },

  getPlanById: (plans: SaaSPlan[], planId: string) => {
    return plans.find((p) => p.id === planId);
  },

  calculateTrialDaysLeft: (trialEndsAt?: string | Date | null, referenceDate?: Date): number | null => {
    if (!trialEndsAt) return null;
    const ref = referenceDate || getNowBR();
    return Math.max(0, differenceInCalendarDaysBR(trialEndsAt, ref));
  },

  isTrial: (subscription?: Subscription | null): boolean => {
    return subscription?.status === SubscriptionStatus.TRIAL;
  },

  isTrialExpired: (subscription?: Subscription | null, referenceDate?: Date): boolean => {
    if (!subscription) return false;
    if (
      subscription.status === SubscriptionStatus.EXPIRED &&
      !!subscription.trial_ends_at &&
      !subscription.data_vencimento
    ) {
      return true;
    }
    if (subscription.status !== SubscriptionStatus.TRIAL || !subscription.trial_ends_at) {
      return false;
    }
    const ref = referenceDate || getNowBR();
    return new Date(subscription.trial_ends_at) < ref;
  },

  isExpired: (subscription?: Subscription | null, referenceDate?: Date): boolean => {
    if (!subscription) return false;
    return (
      subscription.status === SubscriptionStatus.EXPIRED ||
      SubscriptionUtils.isTrialExpired(subscription, referenceDate)
    );
  },

  isCanceled: (subscription?: Subscription | null): boolean => {
    return subscription?.status === SubscriptionStatus.CANCELED;
  },

  isPastDue: (subscription?: Subscription | null): boolean => {
    return subscription?.status === SubscriptionStatus.PAST_DUE;
  },

  isActive: (subscription?: Subscription | null): boolean => {
    return subscription?.status === SubscriptionStatus.ACTIVE;
  },

  isBlocked: (subscription?: Subscription | null, referenceDate?: Date): boolean => {
    if (!subscription) return false;
    return (
      SubscriptionUtils.isExpired(subscription, referenceDate) ||
      SubscriptionUtils.isCanceled(subscription) ||
      SubscriptionUtils.isTrialExpired(subscription, referenceDate)
    );
  },
};

