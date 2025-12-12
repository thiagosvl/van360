import { cpfSchema, emailSchema, phoneSchema } from "@/schemas/common";
import { z } from "zod";

export const registerSchema = z.object({
  plano_id: z.string().min(1, "Selecione um plano para continuar"),
  sub_plano_id: z.string().optional(),
  quantidade_personalizada: z.number().optional(),
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  cpfcnpj: cpfSchema,
  email: emailSchema.min(1, "Campo obrigatório"),
  telefone: phoneSchema,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
