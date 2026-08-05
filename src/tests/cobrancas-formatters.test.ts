import { describe, it, expect } from "vitest";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { parseCurrencyToNumber, formatCurrency } from "@/utils/formatters/currency";
import {
  obterDescricaoFormatadaGasto,
  obterMesesProjetados,
  obterTextoPeriodo,
  obterDetalhesEdicaoParcelas,
  obterDetalhesExclusaoParcelas,
} from "@/utils/domain/gasto/parcelamentoUtils";
import { getStatusText, getStatusColor } from "@/utils/formatters/status";
import { checkCobrancaEmAtraso, formatPaymentType } from "@/utils/formatters/cobranca";
import { CobrancaStatus, CobrancaTipoPagamento } from "@/types/enums";
import { addDays, toPersistenceString } from "@/utils/dateUtils";

describe("Suíte de Testes de Cobranças, Máscaras Financeiras e Parcelas", () => {
  describe("Utilitários Financeiros de Moeda (moneyMask & moneyToNumber)", () => {
    it("Deve formatar números e strings para máscara BRL com moneyMask", () => {
      const res1 = moneyMask(150.5).replace(/\s/g, " ");
      expect(res1).toContain("R$ 150,50");

      const res2 = moneyMask("15050").replace(/\s/g, " ");
      expect(res2).toContain("R$ 150,50");

      const res3 = moneyMask("100").replace(/\s/g, " ");
      expect(res3).toContain("R$ 1,00");
    });

    it("Deve converter strings monetárias e formatos variados para número com moneyToNumber e parseCurrencyToNumber", () => {
      expect(moneyToNumber("R$ 1.500,50")).toBe(1500.5);
      expect(moneyToNumber("1500,50")).toBe(1500.5);
      expect(moneyToNumber("1.500")).toBe(1500);
      expect(moneyToNumber("R$ 0,00")).toBe(0);
      expect(moneyToNumber(null)).toBe(0);
      expect(moneyToNumber(undefined)).toBe(0);
      expect(parseCurrencyToNumber(250.75)).toBe(250.75);
    });

    it("Deve formatar número para Moeda BRL com formatCurrency", () => {
      const formatted = formatCurrency(1250).replace(/\s/g, " ");
      expect(formatted).toContain("R$ 1.250,00");
      expect(formatCurrency(undefined).replace(/\s/g, " ")).toContain("R$ 0,00");
    });
  });

  describe("Formatação de Parcelas (parcelamentoUtils.ts)", () => {
    it("Deve anexar dinamicamente o sufixo de parcelas na descrição com obterDescricaoFormatadaGasto", () => {
      const descParcelada = obterDescricaoFormatadaGasto({
        descricao: "Combustível",
        numero_parcela: 2,
        total_parcelas: 5,
      });
      expect(descParcelada).toBe("Combustível 2/5");

      const descUnica = obterDescricaoFormatadaGasto({
        descricao: "Manutenção Preventiva",
        numero_parcela: 1,
        total_parcelas: 1,
      });
      expect(descUnica).toBe("Manutenção Preventiva");

      expect(obterDescricaoFormatadaGasto(null)).toBe("Sem descrição");
    });

    it("Deve projetar lista de meses de parcelamento com obterMesesProjetados", () => {
      const meses = obterMesesProjetados("2026-07-10", 3);
      expect(meses).toEqual(["Jul/26", "Ago/26", "Set/26"]);
      expect(obterMesesProjetados(undefined, 3)).toEqual([]);
      expect(obterMesesProjetados("2026-07-10", 1)).toEqual([]);
    });

    it("Deve gerar o texto legível do período de parcelas com obterTextoPeriodo", () => {
      expect(obterTextoPeriodo("2026-07-10", 2)).toBe("Jul/26 e Ago/26");
      expect(obterTextoPeriodo("2026-07-10", 4)).toBe("de Jul/26 até Out/26");
      expect(obterTextoPeriodo(undefined, 2)).toBe("");
    });

    it("Deve gerar os detalhes de edição e exclusão de parcelas", () => {
      const edicaoIntermediaria = obterDetalhesEdicaoParcelas(2, 4);
      expect(edicaoIntermediaria.eUltimaParcela).toBe(false);
      expect(edicaoIntermediaria.unica.titulo).toContain("2/4");
      expect(edicaoIntermediaria.futuras?.titulo).toContain("2 a 4");

      const exclusaoUltima = obterDetalhesExclusaoParcelas(5, 5);
      expect(exclusaoUltima.eUltimaParcela).toBe(true);
      expect(exclusaoUltima.futuras).toBeNull();
    });
  });

  describe("Status de Cobrança e Formatação de Pagamento", () => {
    it("Deve identificar status da cobrança com getStatusText", () => {
      expect(getStatusText(CobrancaStatus.PAGO)).toBe("Pago");

      const dataOntem = toPersistenceString(addDays(new Date(), -1));
      expect(getStatusText(CobrancaStatus.PENDENTE, dataOntem)).toBe("Em atraso");

      const dataHoje = toPersistenceString(new Date());
      expect(getStatusText(CobrancaStatus.PENDENTE, dataHoje)).toBe("Vence hoje");

      const dataAmanha = toPersistenceString(addDays(new Date(), 2));
      expect(getStatusText(CobrancaStatus.PENDENTE, dataAmanha)).toBe("Pendente");
    });

    it("Deve retornar a classe de cor adequada para cada status com getStatusColor", () => {
      const colorPago = getStatusColor(CobrancaStatus.PAGO);
      expect(colorPago).toContain("emerald");

      const dataOntem = toPersistenceString(addDays(new Date(), -1));
      const colorAtraso = getStatusColor(CobrancaStatus.PENDENTE, dataOntem);
      expect(colorAtraso).toContain("red");

      const dataHoje = toPersistenceString(new Date());
      const colorHoje = getStatusColor(CobrancaStatus.PENDENTE, dataHoje);
      expect(colorHoje).toContain("orange");
    });

    it("Deve checar se a cobrança está em atraso com checkCobrancaEmAtraso", () => {
      const dataPassada = toPersistenceString(addDays(new Date(), -2));
      const dataFutura = toPersistenceString(addDays(new Date(), 2));

      expect(checkCobrancaEmAtraso(dataPassada)).toBe(true);
      expect(checkCobrancaEmAtraso(dataFutura)).toBe(false);
    });

    it("Deve formatar o tipo de pagamento com formatPaymentType", () => {
      expect(formatPaymentType(CobrancaTipoPagamento.PIX)).toBe("PIX");
      expect(formatPaymentType(CobrancaTipoPagamento.DINHEIRO)).toBe("Dinheiro");
      expect(formatPaymentType(CobrancaTipoPagamento.BOLETO)).toBe("Boleto");
      expect(formatPaymentType("OUTRO_TIPO")).toBe("OUTRO_TIPO");
      expect(formatPaymentType(undefined)).toBe("");
    });
  });
});
