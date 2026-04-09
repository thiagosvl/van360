import { SaaSPlan } from "@/types/subscription";
import { SubscriptionIdentifer } from "@/types/enums";

export const SubscriptionUtils = {
  /**
   * Formata valor para moeda brasileira
   */
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  /**
   * Retorna o preço final do plano considerando se a promoção está ativa
   */
  getFinalPrice: (plan?: SaaSPlan, isPromoActive: boolean = false) => {
    if (!plan) return 0;
    if (isPromoActive && plan.valor_promocional !== null) {
      return plan.valor_promocional;
    }
    return plan.valor;
  },

  /**
   * Calcula o valor mensal de um plano
   * Se for anual, divide por 12. Usa valor promocional se a promoção estiver ativa.
   */
  getMonthlyEquivalent: (plan?: SaaSPlan, isPromoActive: boolean = false) => {
    if (!plan) return 0;
    const price = SubscriptionUtils.getFinalPrice(plan, isPromoActive);
    if (plan.identificador === SubscriptionIdentifer.YEARLY) {
      return price / 12;
    }
    return price;
  },

  /**
   * Encontra um plano por identificador
   */
  getPlanByPeriod: (plans: SaaSPlan[], period: SubscriptionIdentifer) => {
    return plans?.find((p) => p.identificador === period);
  },

  /**
   * Calcula quanto o usuário economiza no anual em relação ao mensal equivalente
   */
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
  }
};
