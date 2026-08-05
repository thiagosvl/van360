import { describe, it, expect } from "vitest";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import {
  getSubscriptionStatusDetails,
  SUBSCRIPTION_STATUS_DETAILS,
} from "@/components/ui/SubscriptionStatusBadge";
import { SubscriptionIdentifer, SubscriptionStatus } from "@/types/enums";
import { SaaSPlan } from "@/types/subscription";

describe("Suíte de Testes de Assinatura SaaS e UI (saas-subscription-ui)", () => {
  describe("1. Cálculo de Dias Restantes de Teste/Trial (calculateTrialDaysLeft)", () => {
    const referenceDate = new Date(2026, 7, 5); // 05 de Agosto de 2026

    it("Deve calcular corretamente os dias restantes quando a data final for no futuro", () => {
      const trialEndsAt = new Date(2026, 7, 12); // +7 dias
      const daysLeft = SubscriptionUtils.calculateTrialDaysLeft(trialEndsAt, referenceDate);
      expect(daysLeft).toBe(7);
    });

    it("Deve retornar 0 se a data de encerramento do trial for hoje", () => {
      const trialEndsAt = new Date(2026, 7, 5);
      const daysLeft = SubscriptionUtils.calculateTrialDaysLeft(trialEndsAt, referenceDate);
      expect(daysLeft).toBe(0);
    });

    it("Deve retornar 0 se o período de trial já tiver expirado no passado", () => {
      const trialEndsAt = new Date(2026, 7, 1); // -4 dias
      const daysLeft = SubscriptionUtils.calculateTrialDaysLeft(trialEndsAt, referenceDate);
      expect(daysLeft).toBe(0);
    });

    it("Deve retornar 0 quando a data de expiração do trial for nula ou indefinida", () => {
      expect(SubscriptionUtils.calculateTrialDaysLeft(null, referenceDate)).toBe(0);
      expect(SubscriptionUtils.calculateTrialDaysLeft(undefined, referenceDate)).toBe(0);
    });
  });

  describe("2. Formatadores e Helpers de Planos SaaS (SubscriptionUtils)", () => {
    const mockPlanMonthly: SaaSPlan = {
      id: "plan-monthly-id",
      nome: "Plano Mensal",
      identificador: SubscriptionIdentifer.MONTHLY,
      valor: 49.9,
      valor_promocional: 39.9,
      ativo: true,
      criado_em: "2026-01-01",
    };

    const mockPlanYearly: SaaSPlan = {
      id: "plan-yearly-id",
      nome: "Plano Anual",
      identificador: SubscriptionIdentifer.YEARLY,
      valor: 399.0,
      valor_promocional: 299.0,
      ativo: true,
      criado_em: "2026-01-01",
    };

    const mockPlansList = [mockPlanMonthly, mockPlanYearly];

    it("Deve formatar moeda brasileira BRL corretamente com formatCurrency", () => {
      const formatted = SubscriptionUtils.formatCurrency(49.9).replace(/\s/g, " ");
      expect(formatted).toContain("R$ 49,90");
    });

    it("Deve obter o preço final considerando ou ignorando promoção ativa (getFinalPrice)", () => {
      expect(SubscriptionUtils.getFinalPrice(mockPlanMonthly, false)).toBe(49.9);
      expect(SubscriptionUtils.getFinalPrice(mockPlanMonthly, true)).toBe(39.9);
      expect(SubscriptionUtils.getFinalPrice(undefined)).toBe(0);
    });

    it("Deve calcular o equivalente mensal para planos anuais e mensais (getMonthlyEquivalent)", () => {
      // Plano Mensal
      expect(SubscriptionUtils.getMonthlyEquivalent(mockPlanMonthly, false)).toBe(49.9);
      // Plano Anual sem promoção: 399.00 / 12 = 33.25
      expect(SubscriptionUtils.getMonthlyEquivalent(mockPlanYearly, false)).toBe(33.25);
      // Plano Anual com promoção: 299.00 / 12 = 24.9166...
      expect(SubscriptionUtils.getMonthlyEquivalent(mockPlanYearly, true)).toBeCloseTo(24.916, 2);
    });

    it("Deve encontrar um plano pelo identificador de período (getPlanByPeriod)", () => {
      const monthly = SubscriptionUtils.getPlanByPeriod(mockPlansList, SubscriptionIdentifer.MONTHLY);
      expect(monthly?.id).toBe("plan-monthly-id");

      const yearly = SubscriptionUtils.getPlanByPeriod(mockPlansList, SubscriptionIdentifer.YEARLY);
      expect(yearly?.id).toBe("plan-yearly-id");
    });

    it("Deve calcular o valor economizado ao optar pelo plano anual (getSavingsAmount)", () => {
      // Mensal: 49.90, Anual equivalente mensal: 33.25 -> Economia mensal: 16.65
      const savings = SubscriptionUtils.getSavingsAmount(mockPlansList, false);
      expect(savings).toBeCloseTo(16.65, 2);
    });

    it("Deve localizar um plano por seu ID único (getPlanById)", () => {
      const plan = SubscriptionUtils.getPlanById(mockPlansList, "plan-yearly-id");
      expect(plan?.nome).toBe("Plano Anual");
    });
  });

  describe("3. Badges e Metadata de Status de Assinatura (SubscriptionStatusBadge)", () => {
    it("Deve retornar metadados corretos para cada status de assinatura", () => {
      const activeDetails = getSubscriptionStatusDetails(SubscriptionStatus.ACTIVE);
      expect(activeDetails?.label).toBe("Ativa");
      expect(activeDetails?.color).toContain("emerald");

      const trialDetails = getSubscriptionStatusDetails(SubscriptionStatus.TRIAL);
      expect(trialDetails?.label).toBe("Trial");
      expect(trialDetails?.color).toContain("sky");

      const vitalicioDetails = getSubscriptionStatusDetails("VITALICIO");
      expect(vitalicioDetails?.label).toBe("Vitalício");

      const pastDueDetails = getSubscriptionStatusDetails(SubscriptionStatus.PAST_DUE);
      expect(pastDueDetails?.label).toBe("Em Atraso");

      const expiredDetails = getSubscriptionStatusDetails(SubscriptionStatus.EXPIRED);
      expect(expiredDetails?.label).toBe("Expirada");

      const canceledDetails = getSubscriptionStatusDetails(SubscriptionStatus.CANCELED);
      expect(canceledDetails?.label).toBe("Cancelada");
    });

    it("Deve resolver status independentemente de letras maiúsculas ou minúsculas", () => {
      const details = getSubscriptionStatusDetails("active");
      expect(details?.label).toBe("Ativa");
    });

    it("Deve retornar null para status indefinidos ou inválidos", () => {
      expect(getSubscriptionStatusDetails(null)).toBeNull();
      expect(getSubscriptionStatusDetails(undefined)).toBeNull();
      expect(getSubscriptionStatusDetails("STATUS_INEXISTENTE")).toBeNull();
    });

    it("Deve ter definições estruturadas no mapa SUBSCRIPTION_STATUS_DETAILS", () => {
      expect(SUBSCRIPTION_STATUS_DETAILS[SubscriptionStatus.ACTIVE]).toBeDefined();
      expect(SUBSCRIPTION_STATUS_DETAILS.VITALICIO).toBeDefined();
    });
  });
});
