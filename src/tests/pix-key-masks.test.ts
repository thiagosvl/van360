import { describe, it, expect } from "vitest";
import {
  cpfMask,
  cnpjMask,
  cpfCnpjMask,
  phoneMask,
  evpMask,
} from "@/utils/masks";
import { formatarChavePix } from "@/utils/formatters/pix";
import {
  isValidCPF,
  isValidCNPJ,
  isValidPhoneFormat,
} from "@/utils/validators";
import {
  pixKeySchema,
  pixKeySchemaRequired,
} from "@/schemas/pix";
import { TipoChavePix } from "@/types/pix";
import { PixKeyType } from "@/types/enums";

describe("Suíte de Testes de Máscaras, Formatadores e Validações de Chave PIX (pix-key-masks)", () => {
  describe("1. Máscaras Individuais de Chaves PIX (utils/masks)", () => {
    it("Deve formatar CPF com 11 dígitos corretamente", () => {
      expect(cpfMask("11144477735")).toBe("111.444.777-35");
      expect(cpfMask("")).toBe("");
      expect(cpfMask(null)).toBe("");
      expect(cpfMask(undefined)).toBe("");
    });

    it("Deve truncar e formatar CPF com mais de 11 dígitos", () => {
      expect(cpfMask("11144477735999")).toBe("111.444.777-35");
    });

    it("Deve formatar CNPJ com 14 dígitos corretamente", () => {
      expect(cnpjMask("11222333000181")).toBe("11.222.333/0001-81");
      expect(cnpjMask("")).toBe("");
      expect(cnpjMask(null)).toBe("");
      expect(cnpjMask(undefined)).toBe("");
    });

    it("Deve alternar entre máscara de CPF e CNPJ pelo tamanho do texto (cpfCnpjMask)", () => {
      expect(cpfCnpjMask("11144477735")).toBe("111.444.777-35");
      expect(cpfCnpjMask("11222333000181")).toBe("11.222.333/0001-81");
      expect(cpfCnpjMask("")).toBe("");
      expect(cpfCnpjMask(null)).toBe("");
    });

    it("Deve formatar telefone celular (11 dígitos) corretamente", () => {
      expect(phoneMask("11988887777")).toBe("(11) 98888-7777");
      expect(phoneMask("")).toBe("");
      expect(phoneMask(null)).toBe("");
    });

    it("Deve formatar chave aleatória EVP de 32 caracteres com hífens", () => {
      const rawEvp = "a1b2c3d4e5f67890a1b2c3d4e5f67890";
      expect(evpMask(rawEvp)).toBe("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890");
      expect(evpMask("")).toBe("");
      expect(evpMask(null)).toBe("");
    });
  });

  describe("2. Formatador Global de Chave PIX (formatarChavePix)", () => {
    it("Deve retornar traço de preenchimento quando a chave for nula, vazia ou apenas espaços", () => {
      expect(formatarChavePix(null)).toBe("—");
      expect(formatarChavePix("")).toBe("—");
      expect(formatarChavePix("   ")).toBe("—");
    });

    it("Deve formatar chave CPF e CNPJ por tipo explícito ou detecção do tamanho", () => {
      expect(formatarChavePix("11144477735", PixKeyType.CPF)).toBe("111.444.777-35");
      expect(formatarChavePix("11222333000181", PixKeyType.CNPJ)).toBe("11.222.333/0001-81");
      expect(formatarChavePix("11144477735")).toBe("111.444.777-35");
      expect(formatarChavePix("11222333000181")).toBe("11.222.333/0001-81");
    });

    it("Deve formatar chave Telefone por tipo explícito ou por fallback", () => {
      expect(formatarChavePix("11988887777", PixKeyType.TELEFONE)).toBe("(11) 98888-7777");
      expect(formatarChavePix("11988887777", "TELEFONE")).toBe("(11) 98888-7777");
    });

    it("Deve formatar chave Aleatória / EVP por tipo explícito ou tamanho de 32 caracteres", () => {
      const evp = "a1b2c3d4e5f67890a1b2c3d4e5f67890";
      expect(formatarChavePix(evp, PixKeyType.EVP)).toBe("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890");
      expect(formatarChavePix(evp, PixKeyType.ALEATORIA)).toBe("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890");
      expect(formatarChavePix(evp)).toBe("a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890");
    });

    it("Deve manter e-mail inalterado", () => {
      expect(formatarChavePix("usuario@van360.com.br", PixKeyType.EMAIL)).toBe("usuario@van360.com.br");
      expect(formatarChavePix("usuario@van360.com.br")).toBe("usuario@van360.com.br");
    });
  });

  describe("3. Validadores e Schemas Zod de Chave PIX (validators / schemas)", () => {
    it("Deve validar CPFs e CNPJs reais e rejeitar formatos inválidos", () => {
      expect(isValidCPF("11144477735")).toBe(true);
      expect(isValidCPF("11111111111")).toBe(false);
      expect(isValidCPF("12345")).toBe(false);

      expect(isValidCNPJ("11222333000181")).toBe(true);
      expect(isValidCNPJ("00000000000000")).toBe(false);
      expect(isValidCNPJ("12345")).toBe(false);
    });

    it("Deve validar formato numérico de telefone com 11 dígitos", () => {
      expect(isValidPhoneFormat("(11) 98888-7777")).toBe(true);
      expect(isValidPhoneFormat("11988887777")).toBe(true);
      expect(isValidPhoneFormat("1198888777")).toBe(false);
      expect(isValidPhoneFormat(null)).toBe(false);
    });

    it("Deve validar formulário com pixKeySchema quando os dados forem válidos", () => {
      const validCpf = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.CPF,
        chave_pix: "11144477735",
      });
      expect(validCpf.success).toBe(true);

      const validCnpj = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.CNPJ,
        chave_pix: "11222333000181",
      });
      expect(validCnpj.success).toBe(true);

      const validEmail = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.EMAIL,
        chave_pix: "financeiro@van360.com",
      });
      expect(validEmail.success).toBe(true);

      const validTel = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.TELEFONE,
        chave_pix: "(11) 98888-7777",
      });
      expect(validTel.success).toBe(true);

      const validEvp = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.ALEATORIA,
        chave_pix: "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      });
      expect(validEvp.success).toBe(true);
    });

    it("Deve acusar erros de validação quando o conteúdo da chave não corresponder ao tipo selecionado", () => {
      const invalidCpf = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.CPF,
        chave_pix: "11111111111",
      });
      expect(invalidCpf.success).toBe(false);

      const invalidEmail = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.EMAIL,
        chave_pix: "email-invalido",
      });
      expect(invalidEmail.success).toBe(false);

      const invalidTel = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.TELEFONE,
        chave_pix: "119999",
      });
      expect(invalidTel.success).toBe(false);

      const invalidEvp = pixKeySchema.safeParse({
        tipo_chave_pix: TipoChavePix.ALEATORIA,
        chave_pix: "chave-curta",
      });
      expect(invalidEvp.success).toBe(false);
    });

    it("Deve validar a obrigatoriedade da chave com pixKeySchemaRequired", () => {
      const emptyRequired = pixKeySchemaRequired.safeParse({
        tipo_chave_pix: null,
        chave_pix: "",
      });
      expect(emptyRequired.success).toBe(false);

      const validRequired = pixKeySchemaRequired.safeParse({
        tipo_chave_pix: TipoChavePix.CPF,
        chave_pix: "11144477735",
      });
      expect(validRequired.success).toBe(true);
    });
  });
});
