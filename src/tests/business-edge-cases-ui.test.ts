import { describe, it, expect } from "vitest";
import { moneyToNumber, phoneMask, cpfCnpjMask } from "@/utils/masks";
import { calcularIdadePassageiro } from "@/utils/dateUtils";
import { calculatePorcentagemInadimplencia } from "@/utils/domain/reportsCalculator";

describe("Suíte de Testes de Borda e Casos Limite (UI & Business Rules)", () => {
  describe("1. Utilitário moneyToNumber - Resiliência com Entradas Malformadas", () => {
    it("Deve retornar 0 para entrada 'R$ --'", () => {
      expect(moneyToNumber("R$ --")).toBe(0);
    });

    it("Deve retornar 0 para entrada 'NaN'", () => {
      expect(moneyToNumber("NaN")).toBe(0);
    });

    it("Deve retornar 0 para entrada 'R$ null'", () => {
      expect(moneyToNumber("R$ null")).toBe(0);
    });

    it("Deve converter corretamente valores com múltiplos pontos '1.2.3.4,50'", () => {
      expect(moneyToNumber("1.2.3.4,50")).toBe(1234.5);
    });
  });

  describe("2. Utilitário calcularIdadePassageiro - Resiliência de Datas Inválidas e Futuras", () => {
    it("Deve retornar null para data inválida '31/02/2024'", () => {
      expect(calcularIdadePassageiro("31/02/2024")).toBeNull();
    });

    it("Deve retornar null para datas de nascimento no futuro", () => {
      expect(calcularIdadePassageiro("2050-01-01")).toBeNull();
      expect(calcularIdadePassageiro("31/12/2099")).toBeNull();
    });
  });

  describe("3. Utilitário calculatePorcentagemInadimplencia - Pagamentos Adiantados", () => {
    it("Deve retornar 0 quando o valor pendente for menor ou igual a zero (pagamentos superam a receita)", () => {
      expect(calculatePorcentagemInadimplencia(-50, 1000)).toBe(0);
      expect(calculatePorcentagemInadimplencia(0, 1000)).toBe(0);
    });
  });

  describe("4. Máscaras phoneMask e cpfCnpjMask - Resiliência a Caracteres Especiais e Letras", () => {
    it("Deve formatar corretamente phoneMask ignorando letras e caracteres especiais", () => {
      expect(phoneMask("abc (11) 98765-4321 xyz#$!")).toBe("(11) 98765-4321");
      expect(phoneMask("Telefone: 11987654321")).toBe("(11) 98765-4321");
      expect(phoneMask("apenas texto sem numeros")).toBe("");
    });

    it("Deve formatar corretamente cpfCnpjMask ignorando letras e caracteres especiais", () => {
      expect(cpfCnpjMask("CPF: 123.456.789-01 (ativo)")).toBe("123.456.789-01");
      expect(cpfCnpjMask("CNPJ: 12.345.678/0001-95 (empresa)")).toBe("12.345.678/0001-95");
      expect(cpfCnpjMask("abc123def456ghi789j01klm")).toBe("123.456.789-01");
      expect(cpfCnpjMask("texto sem digitos!@#$")).toBe("");
    });
  });
});
