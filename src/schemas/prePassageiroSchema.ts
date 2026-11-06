import { z } from "zod";
import { cepSchema, cpfSchema, dateSchema, phoneSchema, timeSchema } from "@/schemas/common";
import { convertDateBrToISO, parseCurrencyToNumber } from "@/utils/formatters";
import { parseLocalDate } from "@/utils/dateUtils";
import {
  CamposFormularioExternoConfig,
  DEFAULT_CAMPOS_FORMULARIO_EXTERNO,
} from "@/constants/formularioExterno";

export function buildPrePassageiroSchema(
  customConfig?: Partial<CamposFormularioExternoConfig>
) {
  const config = {
    ...DEFAULT_CAMPOS_FORMULARIO_EXTERNO,
    ...customConfig,
  };

  return z
    .object({
      nome: z.string().min(2, "Campo obrigatório"),
      nome_responsavel: z.string().min(2, "Campo obrigatório"),
      cpf_responsavel: cpfSchema,
      telefone_responsavel: phoneSchema,
      email_responsavel: config.email_responsavel
        ? z
            .string({ required_error: "E-mail é obrigatório" })
            .trim()
            .min(1, "E-mail é obrigatório")
            .email("E-mail inválido")
        : z
            .string()
            .optional()
            .nullable()
            .or(z.literal(""))
            .refine(
              (val) => !val || !val.trim() || z.string().email().safeParse(val.trim()).success,
              {
                message: "E-mail inválido",
              }
            ),

      logradouro: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
      numero: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
      bairro: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
      cidade: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
      estado: z.string({ required_error: "Campo obrigatório" }).min(2, "Selecione o estado"),
      cep: cepSchema,
      referencia: z.string().optional().nullable().or(z.literal("")),
      complemento: z.string().optional().nullable().or(z.literal("")),
      observacoes: z.string().optional().nullable().or(z.literal("")),

      escola_id: z.string().optional().nullable().or(z.literal("")),
      turma: config.turma
        ? z.string({ required_error: "Turma é obrigatória" }).min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      sala: z.string().optional().nullable().or(z.literal("")),
      nome_professor: z.string().optional().nullable().or(z.literal("")),
      periodo: config.periodo
        ? z.string().min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      modalidade: config.modalidade
        ? z.string().min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      ano_letivo: z
        .string({ required_error: "Selecione o ano letivo" })
        .min(1, "Selecione o ano letivo"),
      data_nascimento: config.data_nascimento
        ? dateSchema(true)
        : dateSchema(false, false).optional().nullable().or(z.literal("")),
      genero: config.genero
        ? z.string().min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      parentesco_responsavel: config.parentesco_responsavel
        ? z.string().min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      data_inicio_transporte: dateSchema(false, true),
      data_fim_transporte: dateSchema(false, true),
      horario_entrada: timeSchema,
      horario_saida: timeSchema,

      valor_cobranca: z
        .string()
        .optional()
        .refine((val) => !val || parseCurrencyToNumber(val) >= 1, {
          message: "O valor deve ser no mínimo R$ 1,00",
        }),
      dia_vencimento: z.string().optional(),
      ativo: z.boolean().optional(),
    })
    .refine(
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
    )
    .refine(
      (data) => {
        if (!data.horario_entrada || !data.horario_saida) return true;
        return data.horario_saida > data.horario_entrada;
      },
      {
        message: "Horário de saída deve ser maior que o horário de entrada",
        path: ["horario_saida"],
      }
    );
}

export const prePassageiroSchema = buildPrePassageiroSchema();

export type PrePassageiroFormData = z.infer<typeof prePassageiroSchema>;
