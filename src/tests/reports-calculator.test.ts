import { describe, it, expect } from "vitest";
import {
  calculateTotalReceitas,
  calculateTotalDespesas,
  calculateLucroLiquido,
  calculatePorcentagemInadimplencia,
  calculateTaxaRecebimento,
  calculateFinancialReport,
  CobrancaCalcItem,
  GastoCalcItem,
} from "@/utils/domain/reportsCalculator";

describe("Suíte de Testes de Relatórios Financeiros (reports-calculator)", () => {
  describe("1. Cálculo de Total de Receitas (calculateTotalReceitas)", () => {
    it("Deve calcular corretamente total de receitas previstas, realizadas e pendentes", () => {
      const cobrancas: CobrancaCalcItem[] = [
        { valor: 500, status: "PAGO" },
        { valor: 300, status: "PAGO" },
        { valor: 200, status: "PENDENTE" },
      ];

      const res = calculateTotalReceitas(cobrancas);

      expect(res.prevista).toBe(1000);
      expect(res.realizada).toBe(800);
      expect(res.pendente).toBe(200);
    });

    it("Deve lidar com valores em formato de string e nulos/indefinidos", () => {
      const cobrancas: CobrancaCalcItem[] = [
        { valor: "450.50", status: "PAGO" },
        { valor: null, status: "PAGO" },
        { valor: "150.00", status: "PENDENTE" },
      ];

      const res = calculateTotalReceitas(cobrancas);

      expect(res.prevista).toBe(600.5);
      expect(res.realizada).toBe(450.5);
      expect(res.pendente).toBe(150);
    });

    it("Deve retornar zero quando a lista de cobranças estiver vazia", () => {
      const res = calculateTotalReceitas([]);
      expect(res.prevista).toBe(0);
      expect(res.realizada).toBe(0);
      expect(res.pendente).toBe(0);
    });
  });

  describe("2. Cálculo de Total de Despesas (calculateTotalDespesas)", () => {
    it("Deve somar todos os gastos da lista corretamente", () => {
      const gastos: GastoCalcItem[] = [
        { valor: 250 },
        { valor: 120.5 },
        { valor: 80 },
      ];

      const total = calculateTotalDespesas(gastos);
      expect(total).toBe(450.5);
    });

    it("Deve converter strings numéricas de gastos adequadamente", () => {
      const gastos: GastoCalcItem[] = [
        { valor: "100" },
        { valor: "50.25" },
        { valor: 0 },
      ];

      const total = calculateTotalDespesas(gastos);
      expect(total).toBe(150.25);
    });

    it("Deve retornar 0 para lista de gastos vazia", () => {
      expect(calculateTotalDespesas([])).toBe(0);
    });
  });

  describe("3. Cálculo de Lucro Líquido (calculateLucroLiquido)", () => {
    it("Deve calcular lucro líquido subtraindo despesas da receita", () => {
      expect(calculateLucroLiquido(1000, 400)).toBe(600);
      expect(calculateLucroLiquido(800, 450.5)).toBe(349.5);
    });

    it("Deve retornar valor negativo em caso de prejuízo (despesas > receita)", () => {
      expect(calculateLucroLiquido(500, 750)).toBe(-250);
    });
  });

  describe("4. Porcentagem de Inadimplência e Taxa de Recebimento", () => {
    it("Deve calcular a porcentagem de inadimplência corretamente", () => {
      // 200 pendentes de 1000 previstos = 20%
      expect(calculatePorcentagemInadimplencia(200, 1000)).toBe(20);
      // 300 pendentes de 1500 previstos = 20%
      expect(calculatePorcentagemInadimplencia(300, 1500)).toBe(20);
    });

    it("Deve retornar 0 para inadimplência se a receita prevista for zero", () => {
      expect(calculatePorcentagemInadimplencia(200, 0)).toBe(0);
    });

    it("Deve calcular a taxa de recebimento corretamente", () => {
      // 800 realizados de 1000 previstos = 80%
      expect(calculateTaxaRecebimento(800, 1000)).toBe(80);
    });

    it("Deve retornar 0 para taxa de recebimento se a receita prevista for zero", () => {
      expect(calculateTaxaRecebimento(500, 0)).toBe(0);
    });
  });

  describe("5. Cálculo Consolidado de Relatório Financeiro (calculateFinancialReport)", () => {
    it("Deve consolidar todos os indicadores financeiros do período", () => {
      const cobrancas: CobrancaCalcItem[] = [
        { valor: 1000, status: "PAGO" },
        { valor: 500, status: "PAGO" },
        { valor: 500, status: "PENDENTE" },
      ]; // Prevista = 2000, Realizada = 1500, Pendente = 500

      const gastos: GastoCalcItem[] = [
        { valor: 400 },
        { valor: 100 },
      ]; // Despesas = 500

      const report = calculateFinancialReport(cobrancas, gastos);

      expect(report.totalReceitasPrevistas).toBe(2000);
      expect(report.totalReceitasRecebidas).toBe(1500);
      expect(report.totalReceitasPendentes).toBe(500);
      expect(report.totalDespesas).toBe(500);
      expect(report.lucroAtual).toBe(1000); // 1500 - 500
      expect(report.lucroEstimado).toBe(1500); // 2000 - 500
      expect(report.taxaRecebimento).toBe(75); // (1500 / 2000) * 100
      expect(report.porcentagemInadimplencia).toBe(25); // (500 / 2000) * 100
    });
  });
});
