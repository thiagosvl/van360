import { z } from "zod";
import { cepSchema, cpfSchema, dateSchema, phoneSchema, timeSchema } from "@/schemas/common";
import { convertDateBrToISO, parseCurrencyToNumber } from "@/utils/formatters";
import { parseLocalDate } from "@/utils/dateUtils";
import { moneyToNumber } from "@/utils/masks";
import { isValidCPF } from "@/utils/validators";

export const revisarSolicitacaoSchema = z
  .object({
    veiculo_id: z.string({ required_error: "Selecione o veículo" }).min(1, "Selecione o veículo"),
    escola_id: z.string({ required_error: "Selecione a escola" }).min(1, "Selecione a escola"),
    periodo: z.string().optional().nullable().or(z.literal("")),
    ano_letivo: z.string().optional().or(z.literal("")),

    isento: z.boolean().default(false),
    valor_cobranca: z.string().optional().or(z.literal("")),
    dia_vencimento: z.string().optional().or(z.literal("")),
    mes_inicio_cobranca: z.string().optional().or(z.literal("")),
    ano_inicio_cobranca: z.string().optional().or(z.literal("")),
    mes_fim_cobranca: z.string().optional().or(z.literal("")),
    ano_fim_cobranca: z.string().optional().or(z.literal("")),

    nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
    data_nascimento: dateSchema(false),
    genero: z.string().optional().nullable().or(z.literal("")),
    observacoes: z.string().optional().nullable().or(z.literal("")),

    nome_responsavel: z.string({ required_error: "Campo obrigatório" }).min(2, "Deve ter pelo menos 2 caracteres"),
    parentesco_responsavel: z.string().optional().nullable().or(z.literal("")),
    telefone_responsavel: phoneSchema,
    cpf_responsavel: z.string().optional().nullable().or(z.literal("")),
    email_responsavel: z
      .string()
      .optional()
      .nullable()
      .or(z.literal(""))
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: "E-mail inválido",
      }),
    notificacoes_rota_habilitadas: z.boolean().default(true),

    cep: z.string().optional().nullable().or(z.literal("")),
    logradouro: z.string().optional().nullable().or(z.literal("")),
    numero: z.string().optional().nullable().or(z.literal("")),
    bairro: z.string().optional().nullable().or(z.literal("")),
    cidade: z.string().optional().nullable().or(z.literal("")),
    estado: z.string().optional().nullable().or(z.literal("")),
    complemento: z.string().optional().nullable().or(z.literal("")),
    referencia: z.string().optional().nullable().or(z.literal("")),

    modalidade: z.string().optional().nullable().or(z.literal("")),
    horario_entrada: timeSchema,
    horario_saida: timeSchema,
    turma: z.string().optional().nullable().or(z.literal("")),
    sala: z.string().optional().nullable().or(z.literal("")),
    nome_professor: z.string().optional().nullable().or(z.literal("")),
    data_inicio_transporte: dateSchema(false, true),
    data_fim_transporte: dateSchema(false, true),
  })
  .superRefine((data, ctx) => {
    if (!data.ano_letivo || data.ano_letivo.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Campo obrigatório",
        path: ["ano_letivo"],
      });
    }

    if (!data.isento) {
      if (!data.valor_cobranca || data.valor_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o valor da parcela",
          path: ["valor_cobranca"],
        });
      } else {
        const num = moneyToNumber(data.valor_cobranca);
        if (num < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O valor deve ser no mínimo R$ 1,00",
            path: ["valor_cobranca"],
          });
        }
      }

      if (!data.dia_vencimento || data.dia_vencimento.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o dia do vencimento",
          path: ["dia_vencimento"],
        });
      }

      if (!data.mes_inicio_cobranca || data.mes_inicio_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o mês de início",
          path: ["mes_inicio_cobranca"],
        });
      }

      if (!data.mes_fim_cobranca || data.mes_fim_cobranca.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o mês de término",
          path: ["mes_fim_cobranca"],
        });
      } else if (data.mes_inicio_cobranca) {
        const currentYear = new Date().getFullYear().toString();
        const anoIni = parseInt(data.ano_inicio_cobranca || currentYear, 10);
        const anoFim = parseInt(data.ano_fim_cobranca || currentYear, 10);
        const totalInicio = anoIni * 12 + parseInt(data.mes_inicio_cobranca, 10);
        const totalFim = anoFim * 12 + parseInt(data.mes_fim_cobranca, 10);
        if (totalFim < totalInicio) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Término da cobrança deve ser igual ou posterior ao início",
            path: ["mes_fim_cobranca"],
          });
        }
      }
    }

    if (data.cpf_responsavel && data.cpf_responsavel.trim() !== "") {
      if (!isValidCPF(data.cpf_responsavel)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CPF inválido",
          path: ["cpf_responsavel"],
        });
      }
    }

    if (data.data_inicio_transporte && data.data_fim_transporte) {
      try {
        const start = parseLocalDate(convertDateBrToISO(data.data_inicio_transporte)!);
        const end = parseLocalDate(convertDateBrToISO(data.data_fim_transporte)!);
        if (end <= start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Término deve ser maior que o Início",
            path: ["data_fim_transporte"],
          });
        }
      } catch {
        return true;
      }
    }

    if (data.horario_entrada && data.horario_saida) {
      if (data.horario_saida <= data.horario_entrada) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de saída deve ser maior que o horário de entrada",
          path: ["horario_saida"],
        });
      }
    }
  });

export type RevisarSolicitacaoFormData = z.infer<typeof revisarSolicitacaoSchema>;
