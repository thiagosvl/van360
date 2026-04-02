import { cpfSchema, emailSchema, phoneSchema } from "@/schemas/common";
import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  cpfcnpj: cpfSchema,
  email: emailSchema.min(1, "Campo obrigatório"),
  telefone: phoneSchema,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  termos_aceitos: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos para continuar." }),
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
