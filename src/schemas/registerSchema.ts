import { isValidCPF } from "@/utils/validators";
import { z } from "zod";

export const registerSchema = z.object({
  plano_id: z.string().min(1, "Selecione um plano para continuar"),
  sub_plano_id: z.string().optional(),
  quantidade_personalizada: z.number().optional(),
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  cpfcnpj: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => isValidCPF(val), "CPF inválido"),
  email: z.string().min(1, "Campo obrigatório").email("E-mail inválido"),
  telefone: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => val.replace(/\D/g, "").length === 11, "Telefone inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
