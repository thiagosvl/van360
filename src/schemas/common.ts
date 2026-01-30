import { isValidCEPFormat, isValidCPF } from "@/utils/validators";
import { z } from "zod";

export const cpfSchema = z.string().refine((val) => isValidCPF(val), {
  message: "CPF inválido",
});

export const phoneSchema = z
  .string()
  .min(15, "Telefone inválido")
  .max(15, "Telefone inválido")
  .transform((val) => val.replace(/\D/g, ""));

export const placaSchema = z
  .string()
  .regex(/^[a-zA-Z]{3}[0-9][A-Za-z0-9][0-9]{2}$/, "Placa inválida (Padrão Mercosul ou Antigo)")
  .transform((val) => val.toUpperCase());

export const emailSchema = z.string().email("E-mail inválido");

export const cepSchema = z.string().refine((val) => isValidCEPFormat(val), {
  message: "Formato inválido (00000-000)",
});

import { isValidDateBr } from "@/utils/validators";

export function dateSchema(required: boolean = false, allowFuture: boolean = false) {
  if (required) {
    return z.string().min(1, "Campo obrigatório").refine((val) => isValidDateBr(val, allowFuture), {
      message: "Data inválida ou inexistente",
    });
  }
  return z.string().optional().refine((val) => {
    if (!val) return true;
    return isValidDateBr(val, allowFuture);
  }, "Data inválida ou inexistente");
}
