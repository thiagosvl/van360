import { cpfCnpjSchema, emailSchema, phoneSchema } from "@/schemas/common";
import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string()
    .min(2, "Deve ter pelo menos 2 caracteres")
    .refine((val) => val.trim().split(/\s+/).length >= 2, "Digite seu nome e sobrenome"),
  razao_social: z.string().optional(),
  cpfcnpj: cpfCnpjSchema,
  email: emailSchema.min(1, "Campo obrigatório"),
  telefone: phoneSchema,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  termos_aceitos: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos para continuar." }),
  }),
  data_nascimento: z.string()
    .min(10, "Data inválida")
    .refine((val) => {
      const regex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!regex.test(val)) return false;

      const [dia, mes, ano] = val.split("/").map(Number);
      const data = new Date(ano, mes - 1, dia);

      if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
      ) {
        return false;
      }

      const hoje = new Date();
      if (data > hoje) return false;

      const idade = hoje.getFullYear() - data.getFullYear();
      const mesDiff = hoje.getMonth() - data.getMonth();
      const diaDiff = hoje.getDate() - data.getDate();
      
      let idadeReal = idade;
      if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
        idadeReal--;
      }

      return idadeReal >= 18 && idadeReal <= 100;
    }, "Você deve ser maior de 18 anos"),
}).superRefine((data, ctx) => {
  const isCnpj = data.cpfcnpj.replace(/\D/g, "").length > 11;
  if (isCnpj && (!data.razao_social || data.razao_social.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Razão social é obrigatória para CNPJ",
      path: ["razao_social"],
    });
  }
});

export type RegisterFormData = z.infer<typeof registerSchema>;
