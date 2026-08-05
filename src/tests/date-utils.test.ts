import { describe, it, expect } from "vitest";
import {
  parseLocalDate,
  getNowBR,
  getStartOfDayBR,
  getEndOfDayBR,
  toPersistenceString,
  formatDateTime,
  formatSafeBrazilianDate,
  getMonthNameBR,
  calcularIdadePassageiro,
  isAniversarianteDoMes,
  calculateSafeDueDate,
  differenceInCalendarDaysBR,
  addDays,
  addMonths,
} from "@/utils/dateUtils";

describe("Suíte de Testes de Utilitários de Data (dateUtils.ts)", () => {
  describe("Cálculo de Idade do Passageiro", () => {
    it("Deve calcular a idade do passageiro corretamente para quem já fez aniversário no ano", () => {
      const hoje = getNowBR();
      const anoAtual = hoje.getFullYear();
      const dataNascimento = `${anoAtual - 10}-01-15`;
      expect(calcularIdadePassageiro(dataNascimento)).toBe(10);
    });

    it("Deve calcular a idade do passageiro quando o aniversário ainda vai acontecer no ano", () => {
      const hoje = getNowBR();
      const anoAtual = hoje.getFullYear();
      const dataNascimento = `${anoAtual - 15}-12-28`;
      const idadeEsperada = hoje.getMonth() === 11 && hoje.getDate() >= 28 ? 15 : 14;
      expect(calcularIdadePassageiro(dataNascimento)).toBe(idadeEsperada);
    });

    it("Deve retornar null para data de nascimento ausente ou inválida", () => {
      expect(calcularIdadePassageiro(undefined)).toBeNull();
      expect(calcularIdadePassageiro(null)).toBeNull();
      expect(calcularIdadePassageiro("")).toBeNull();
    });
  });

  describe("Formatação de Datas em Padrão Brasileiro (PT-BR)", () => {
    it("Deve formatar data no padrão DD/MM/YYYY com formatSafeBrazilianDate", () => {
      expect(formatSafeBrazilianDate("2026-05-20")).toBe("20/05/2026");
      expect(formatSafeBrazilianDate(new Date(2026, 7, 5))).toBe("05/08/2026");
    });

    it("Deve formatar data e hora com formatDateTime", () => {
      const dataHoraFormatted = formatDateTime("2026-05-20T14:30:00-03:00");
      expect(dataHoraFormatted).toContain("20/05/2026");
      expect(dataHoraFormatted).toContain("14:30");
    });

    it("Deve retornar traço '-' quando a data for nula ou indefinida", () => {
      expect(formatSafeBrazilianDate(null)).toBe("-");
      expect(formatDateTime(undefined)).toBe("-");
    });

    it("Deve converter para string de persistência YYYY-MM-DD", () => {
      expect(toPersistenceString("2026-10-08T12:00:00-03:00")).toBe("2026-10-08");
    });
  });

  describe("Cálculo de Aniversariante do Mês", () => {
    it("Deve identificar se a data pertence ao mês de referência fornecido", () => {
      expect(isAniversarianteDoMes("2015-05-15", 5)).toBe(true);
      expect(isAniversarianteDoMes("2015-05-15", 6)).toBe(false);
      expect(isAniversarianteDoMes("2018-12-01", 12)).toBe(true);
    });

    it("Deve retornar false se a data de nascimento for inválida", () => {
      expect(isAniversarianteDoMes(null, 5)).toBe(false);
      expect(isAniversarianteDoMes(undefined, 8)).toBe(false);
    });

    it("Deve retornar o nome legível do mês em português com getMonthNameBR", () => {
      expect(getMonthNameBR(1)).toBe("Janeiro");
      expect(getMonthNameBR(5)).toBe("Maio");
      expect(getMonthNameBR(12)).toBe("Dezembro");
      expect(getMonthNameBR(13)).toBe("");
    });
  });

  describe("Operações de Manipulação de Data e Vencimentos", () => {
    it("Deve ajustar vencimento mantendo limite do mês com calculateSafeDueDate", () => {
      const vencimentoFev = calculateSafeDueDate(31, 1, 2026);
      expect(vencimentoFev.getDate()).toBe(28);
    });

    it("Deve calcular a diferença em dias corridos entre duas datas com differenceInCalendarDaysBR", () => {
      const diff = differenceInCalendarDaysBR("2026-08-10", "2026-08-05");
      expect(diff).toBe(5);
    });

    it("Deve adicionar dias e meses a datas com addDays e addMonths", () => {
      const dataBase = "2026-01-10";
      const novaDataDias = addDays(dataBase, 5);
      expect(novaDataDias.getDate()).toBe(15);

      const novaDataMeses = addMonths(dataBase, 2);
      expect(novaDataMeses.getMonth()).toBe(2);
    });
  });
});
