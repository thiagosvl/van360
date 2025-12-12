import { z } from "zod";

export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 1; i <= 9; i++) sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned.substring(10, 11));
}

export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length++;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

export function isValidCpfCnpj(value: string): boolean {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 11) return isValidCPF(cleaned);
  if (cleaned.length === 14) return isValidCNPJ(cleaned);
  return false;
}

/**
 * Valida se um CEP tem o formato válido (00000-000)
 */
export function isValidCEPFormat(cep: string | undefined | null): boolean {
  if (!cep) return false;
  return /^\d{5}-\d{3}$/.test(cep.trim());
}

/**
 * Valida se um telefone tem o formato válido (11 dígitos após remover caracteres não numéricos)
 */
export function isValidPhoneFormat(phone: string | undefined | null): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 11;
}

/**
 * Schema Zod para validação de CEP (formato opcional ou obrigatório)
 * @param required - Se true, o campo é obrigatório. Se false, é opcional mas valida formato se preenchido
 */
// Deprecated schemas - Use @/schemas/common instead
export function cepSchema(required: boolean = false) {
  if (required) {
    return z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidCEPFormat(val), {
        message: "Formato inválido (00000-000)",
      });
  }
  return z
    .string()
    .optional()
    .refine((val) => !val || isValidCEPFormat(val), {
      message: "Formato inválido (00000-000)",
    });
}

/**
 * Schema Zod para validação de telefone (formato opcional ou obrigatório)
 * @param required - Se true, o campo é obrigatório. Se false, é opcional mas valida formato se preenchido
 */
export function phoneSchema(required: boolean = true) {
  if (required) {
    return z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidPhoneFormat(val), {
        message: "Telefone inválido",
      });
  }
  return z
    .string()
    .optional()
    .refine((val) => !val || isValidPhoneFormat(val), {
      message: "Telefone inválido",
    });
}

/**
 * Schema Zod para validação de CPF (formato opcional ou obrigatório)
 * @param required - Se true, o campo é obrigatório. Se false, é opcional mas valida formato se preenchido
 */
export function cpfSchema(required: boolean = true) {
  if (required) {
    return z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidCPF(val), {
        message: "CPF inválido",
      });
  }
  return z
    .string()
    .optional()
    .refine((val) => !val || isValidCPF(val), {
      message: "CPF inválido",
    });
}

/**
 * Valida se um campo de endereço está preenchido (não vazio após trim)
 */
function isFieldFilled(value: string | undefined | null): boolean {
  return !!(value && value.trim().length > 0);
}

/**
 * Resultado da validação de endereço
 */
export interface EnderecoValidationResult {
  cepRequired: boolean;
  logradouroRequired: boolean;
  numeroRequired: boolean;
  errors: {
    cep?: string;
    logradouro?: string;
    numero?: string;
  };
}

/**
 * Valida campos de endereço com regras condicionais:
 * 
 * Regras:
 * - Se CEP válido (00000-000) → CEP válido (já validado), logradouro obrigatório, número obrigatório
 * - Se logradouro preenchido → CEP obrigatório, número obrigatório
 * - Se apenas número preenchido → nenhum obrigatório
 * 
 * @param cep - CEP com máscara (00000-000)
 * @param logradouro - Logradouro
 * @param numero - Número
 * @returns Resultado da validação com flags de obrigatoriedade e erros
 */
export function validateEnderecoFields(
  cep: string | undefined | null,
  logradouro: string | undefined | null,
  numero: string | undefined | null
): EnderecoValidationResult {
  const hasValidCEP = isValidCEPFormat(cep);
  const hasLogradouro = isFieldFilled(logradouro);
  const hasNumero = isFieldFilled(numero);

  // Se apenas número está preenchido, nenhum campo é obrigatório
  if (hasNumero && !hasValidCEP && !hasLogradouro) {
    return {
      cepRequired: false,
      logradouroRequired: false,
      numeroRequired: false,
      errors: {},
    };
  }

  const errors: EnderecoValidationResult["errors"] = {};
  let cepRequired = false;
  let logradouroRequired = false;
  let numeroRequired = false;

  // Se CEP válido → logradouro e número obrigatórios
  if (hasValidCEP) {
    logradouroRequired = true;
    numeroRequired = true;
    if (!hasLogradouro) {
      errors.logradouro = "Campo obrigatório";
    }
    if (!hasNumero) {
      errors.numero = "Campo obrigatório";
    }
  }

  // Se logradouro preenchido → CEP e número obrigatórios
  if (hasLogradouro) {
    cepRequired = true;
    numeroRequired = true;
    if (!hasValidCEP) {
      errors.cep = "Campo obrigatório";
    }
    if (!hasNumero) {
      errors.numero = "Campo obrigatório";
    }
  }

  return {
    cepRequired,
    logradouroRequired,
    numeroRequired,
    errors,
  };
}