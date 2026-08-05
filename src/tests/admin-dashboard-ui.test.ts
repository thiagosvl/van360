import { describe, it, expect } from "vitest";
import { CANAL_AQUISICAO_CONFIG, CanalAquisicaoLabels } from "@/utils/acquisition-channel.utils";
import { DISPOSITIVO_CADASTRO_CONFIG, DispositivoCadastroLabels } from "@/utils/dispositivo-cadastro.utils";
import { CanalAquisicao, DispositivoCadastro, SubscriptionStatus } from "@/types/enums";
import { getSubscriptionStatusDetails } from "@/components/ui/SubscriptionStatusBadge";

function formatAdminCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\s/g, " ");
}

function formatAdminDateBR(isoStr: string): string {
  const d = new Date(isoStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function calculateDistributionPercentage(
  data: Record<string, number>
): Array<{ key: string; label: string; quantidade: number; porcentagem: number; color: string }> {
  const total = Object.values(data).reduce((acc, v) => acc + v, 0);

  return Object.entries(data)
    .map(([key, count]) => {
      const cfg = CANAL_AQUISICAO_CONFIG[key as keyof typeof CANAL_AQUISICAO_CONFIG] ||
        DISPOSITIVO_CADASTRO_CONFIG[key as keyof typeof DISPOSITIVO_CADASTRO_CONFIG] ||
        { label: key, color: "#64748B" };

      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        key,
        label: cfg.label,
        quantidade: count,
        porcentagem: pct,
        color: cfg.color,
      };
    })
    .filter((item) => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade);
}

function calculateReferralMetrics(indicacoes: {
  total: number;
  concluidas: number;
  pendentes: number;
  diasBonusConcedidos: number;
}): { taxaConversao: number; mesesGratisEquivalente: number } {
  const taxaConversao = indicacoes.total > 0
    ? Math.round((indicacoes.concluidas / indicacoes.total) * 100)
    : 0;

  const mesesGratisEquivalente = Math.round(indicacoes.diasBonusConcedidos / 30);

  return { taxaConversao, mesesGratisEquivalente };
}

function calculateFixedCostsSummary(costs: Array<{ val: number; period: "mensal" | "anual" }>): {
  totalFixosMensal: number;
  totalFixosAnual: number;
} {
  const totalFixosMensal = costs.reduce(
    (acc, item) => acc + (item.period === "anual" ? item.val / 12 : item.val),
    0
  );

  const totalFixosAnual = costs.reduce(
    (acc, item) => acc + (item.period === "anual" ? item.val : item.val * 12),
    0
  );

  return { totalFixosMensal, totalFixosAnual };
}

function calculateSaaSFinancials(params: {
  numDriversMonthly: number;
  numDriversYearly: number;
  priceMonthly: number;
  priceYearly: number;
  churnRatePct: number;
  cac: number;
  totalFixedCosts: number;
  taxRatePct: number;
}): {
  grossRevenue: number;
  netMarginPct: number;
  breakEvenDrivers: number;
  ltv: number;
  ltvToCacRatio: number;
} {
  const {
    numDriversMonthly,
    numDriversYearly,
    priceMonthly,
    priceYearly,
    churnRatePct,
    cac,
    totalFixedCosts,
    taxRatePct,
  } = params;

  const monthlyPriceFromYearly = priceYearly / 12;
  const grossRevenue = (numDriversMonthly * priceMonthly) + (numDriversYearly * monthlyPriceFromYearly);
  const totalDrivers = numDriversMonthly + numDriversYearly;

  const taxes = grossRevenue * (taxRatePct / 100);
  const totalCosts = totalFixedCosts + taxes;
  const netProfit = grossRevenue - totalCosts;
  const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  const ticketMedio = totalDrivers > 0 ? grossRevenue / totalDrivers : 0;
  const liqMedio = ticketMedio * (1 - (taxRatePct / 100));
  const breakEvenDrivers = liqMedio > 0 ? Math.ceil(totalFixedCosts / liqMedio) : 0;

  const churnFraction = churnRatePct / 100;
  const ltv = churnFraction > 0 ? liqMedio / churnFraction : 0;
  const ltvToCacRatio = cac > 0 ? ltv / cac : 0;

  return {
    grossRevenue,
    netMarginPct,
    breakEvenDrivers,
    ltv,
    ltvToCacRatio,
  };
}

describe("Suíte de Testes do Painel Administrativo Global SaaS (admin-dashboard-ui)", () => {
  describe("1. Formatadores de Moeda e Data do Dashboard (Admin Formatters)", () => {
    it("Deve formatar valores numéricos em BRL corretamente", () => {
      expect(formatAdminCurrency(1250.5)).toContain("R$ 1.250,50");
      expect(formatAdminCurrency(0)).toContain("R$ 0,00");
    });

    it("Deve formatar datas ISO para o padrão brasileiro curto DD/MM/YY", () => {
      expect(formatAdminDateBR("2026-08-05T10:00:00Z")).toBe("05/08/26");
    });
  });

  describe("2. Mapeamento de Canais de Aquisição e Dispositivos de Cadastro", () => {
    it("Deve conter rótulos e cores para todos os canais de aquisição", () => {
      expect(CANAL_AQUISICAO_CONFIG[CanalAquisicao.PLAY_STORE].label).toBe("Play Store (Android)");
      expect(CANAL_AQUISICAO_CONFIG[CanalAquisicao.PLAY_STORE].color).toBe("#34A853");
      expect(CANAL_AQUISICAO_CONFIG.NAO_INFORMADO.label).toBe("Não informado");

      expect(CanalAquisicaoLabels[CanalAquisicao.INDICACAO]).toBe("Indicação");
    });

    it("Deve conter rótulos e cores para todos os dispositivos de cadastro", () => {
      expect(DISPOSITIVO_CADASTRO_CONFIG[DispositivoCadastro.APP_ANDROID].label).toBe("App Nativo (Android)");
      expect(DISPOSITIVO_CADASTRO_CONFIG[DispositivoCadastro.WEB_DESKTOP].color).toBe("#4285F4");
      expect(DISPOSITIVO_CADASTRO_CONFIG.NAO_INFORMADO.label).toBe("Não Informado");

      expect(DispositivoCadastroLabels[DispositivoCadastro.WEB_DESKTOP]).toBe("Web Desktop");
    });

    it("Deve calcular porcentagens e ordenar dados para os gráficos de pizza", () => {
      const rawChannels = {
        [CanalAquisicao.PLAY_STORE]: 50,
        [CanalAquisicao.INDICACAO]: 30,
        [CanalAquisicao.INSTAGRAM]: 20,
      };

      const result = calculateDistributionPercentage(rawChannels);

      expect(result).toHaveLength(3);
      expect(result[0].key).toBe(CanalAquisicao.PLAY_STORE);
      expect(result[0].porcentagem).toBe(50);
      expect(result[1].key).toBe(CanalAquisicao.INDICACAO);
      expect(result[1].porcentagem).toBe(30);
      expect(result[2].porcentagem).toBe(20);
    });

    it("Deve retornar lista vazia quando não houver cadastros", () => {
      const emptyResult = calculateDistributionPercentage({});
      expect(emptyResult).toHaveLength(0);
    });
  });

  describe("3. Métricas de Indicação e Assinaturas SaaS", () => {
    it("Deve calcular a taxa de conversão e equivalente de meses grátis de indicações", () => {
      const metrics = calculateReferralMetrics({
        total: 10,
        concluidas: 4,
        pendentes: 6,
        diasBonusConcedidos: 120,
      });

      expect(metrics.taxaConversao).toBe(40);
      expect(metrics.mesesGratisEquivalente).toBe(4);
    });

    it("Deve retornar taxa de conversão 0 quando não houver indicações registradas", () => {
      const zeroMetrics = calculateReferralMetrics({
        total: 0,
        concluidas: 0,
        pendentes: 0,
        diasBonusConcedidos: 0,
      });

      expect(zeroMetrics.taxaConversao).toBe(0);
      expect(zeroMetrics.mesesGratisEquivalente).toBe(0);
    });

    it("Deve retornar detalhes estruturados para badges de status de assinatura", () => {
      const activeStatus = getSubscriptionStatusDetails(SubscriptionStatus.ACTIVE);
      expect(activeStatus?.label).toBe("Ativa");
      expect(activeStatus?.color).toBeDefined();

      const trialStatus = getSubscriptionStatusDetails(SubscriptionStatus.TRIAL);
      expect(trialStatus?.label).toBe("Trial");
    });
  });

  describe("4. Utilitários da Calculadora Financeira SaaS (Admin Calculator)", () => {
    it("Deve somar custos fixos mensais e anuais corretamente", () => {
      const costs = [
        { val: 100, period: "mensal" as const },
        { val: 1200, period: "anual" as const },
      ];

      const summary = calculateFixedCostsSummary(costs);
      expect(summary.totalFixosMensal).toBe(200);
      expect(summary.totalFixosAnual).toBe(2400);
    });

    it("Deve calcular métricas financeiras completas (Receita, Margem, Ponto de Equilíbrio, LTV e LTV/CAC)", () => {
      const financials = calculateSaaSFinancials({
        numDriversMonthly: 10,
        numDriversYearly: 2,
        priceMonthly: 50.0,
        priceYearly: 480.0,
        churnRatePct: 5.0,
        cac: 100.0,
        totalFixedCosts: 200.0,
        taxRatePct: 6.0,
      });

      expect(financials.grossRevenue).toBe(580.0);
      expect(financials.netMarginPct).toBeGreaterThan(0);
      expect(financials.breakEvenDrivers).toBeGreaterThan(0);
      expect(financials.ltv).toBeGreaterThan(0);
      expect(financials.ltvToCacRatio).toBeGreaterThan(0);
    });
  });
});
