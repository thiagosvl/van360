import { describe, it, expect } from "vitest";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { isValidCpfCnpj } from "@/utils/validators";

describe("Suíte de Testes de Validações, Máscaras e Utilitários (van360 Frontend)", () => {
  describe("1. Máscaras de Entrada (Masks)", () => {
    it("Deve formatar telefone celular (11 dígitos) corretamente com DDD e hífen", () => {
      expect(phoneMask("11999998888")).toBe("(11) 99999-8888");
      expect(phoneMask("11988887777")).toBe("(11) 98888-7777");
    });

    it("Deve formatar CPF e CNPJ dinamicamente pelo tamanho do texto", () => {
      expect(cpfCnpjMask("12345678901")).toBe("123.456.789-01");
      expect(cpfCnpjMask("12345678000195")).toBe("12.345.678/0001-95");
    });
  });

  describe("2. Validadores de Documentos (isValidCpfCnpj)", () => {
    it("Deve validar CPFs conhecidos ou rejeitar tamanhos e sequências inválidas", () => {
      expect(isValidCpfCnpj("111.111.111-11")).toBe(false); // CPF com digitos repetidos
      expect(isValidCpfCnpj("123.456")).toBe(false);
    });
  });
});
