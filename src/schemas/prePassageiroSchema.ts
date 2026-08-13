import { z } from "zod";
import { cepSchema, cpfSchema, dateSchema, phoneSchema } from "@/schemas/common";
import { convertDateBrToISO, parseCurrencyToNumber } from "@/utils/formatters";
import { parseLocalDate } from "@/utils/dateUtils";

export const prePassageiroSchema = z.object({
  nome: z.string().min(2, "Campo obrigatório"),
  nome_responsavel: z.string().min(2, "Campo obrigatório"),
  cpf_responsavel: cpfSchema,
  telefone_responsavel: phoneSchema,
  email_responsavel: z
    .string({ required_error: "E-mail é obrigatório" })
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),

  logradouro: z.string().min(1, "Campo obrigatório"),
  numero: z.string().min(1, "Campo obrigatório"),
  bairro: z.string().min(1, "Campo obrigatório"),
  cidade: z.string().min(1, "Campo obrigatório"),
  estado: z.string().min(1, "Campo obrigatório"),
  cep: cepSchema,
  referencia: z.string().optional(),
  complemento: z.string().optional(),
  observacoes: z.string().optional(),

  escola_id: z.string().optional(),
  turma: z.string().min(1, "Campo obrigatório"),
  nome_professor: z.string().optional().nullable().or(z.literal("")),
  periodo: z.string().min(1, "Campo obrigatório"),
  modalidade: z.string().min(1, "Campo obrigatório"),
  data_nascimento: dateSchema(true),
  genero: z.string().min(1, "Campo obrigatório"),
  parentesco_responsavel: z.string().min(1, "Campo obrigatório"),
  data_inicio_transporte: dateSchema(false, true),
  data_fim_transporte: dateSchema(false, true),

  valor_cobranca: z
    .string()
    .optional()
    .refine((val) => !val || parseCurrencyToNumber(val) >= 1, {
      message: "O valor deve ser no mínimo R$ 1,00",
    }),
  dia_vencimento: z.string().optional(),
  ativo: z.boolean().optional(),
}).refine(
  (data) => {
    if (!data.data_inicio_transporte || !data.data_fim_transporte) return true;
    try {
      const start = parseLocalDate(convertDateBrToISO(data.data_inicio_transporte)!);
      const end = parseLocalDate(convertDateBrToISO(data.data_fim_transporte)!);
      return end > start;
    } catch {
      return true;
    }
  },
  {
    message: "Término deve ser maior que o Início",
    path: ["data_fim_transporte"],
  }
);

export type PrePassageiroFormData = z.infer<typeof prePassageiroSchema>;
