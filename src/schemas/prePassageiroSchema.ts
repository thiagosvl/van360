import { z } from "zod";
import { cepSchema, cpfSchema, dateSchema, phoneSchema, timeSchema } from "@/schemas/common";
import { convertDateBrToISO, parseCurrencyToNumber } from "@/utils/formatters";
import { parseLocalDate } from "@/utils/dateUtils";
import {
  CamposFormularioExternoConfig,
  resolveCamposFormularioExterno,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";

export const respostaComplementarFormItemSchema = z.object({
  id: z.string().optional(),
  pergunta: z.string().optional(),
  tipo: z.nativeEnum(TipoPerguntaPersonalizadaEnum).optional(),
  resposta_booleana: z.boolean().nullable().optional(),
  resposta_texto: z.string().nullable().optional(),
});

export function buildPrePassageiroSchema(
  customConfig?: Partial<CamposFormularioExternoConfig>
) {
  const config = resolveCamposFormularioExterno(customConfig);
  const perguntasAtivas = (config.perguntas_personalizadas || []).filter((p) => p.ativo);

  return z
    .object({
      nome: z.string({ required_error: "Campo obrigatório" }).trim().min(2, "Campo obrigatório"),
      nome_responsavel: z.string({ required_error: "Campo obrigatório" }).trim().min(2, "Campo obrigatório"),
      cpf_responsavel: cpfSchema,
      telefone_responsavel: phoneSchema,
      email_responsavel: config.email_responsavel
        ? z
            .string({ required_error: "Campo obrigatório" })
            .trim()
            .min(1, "Campo obrigatório")
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

      logradouro: z.string({ required_error: "Campo obrigatório" }).trim().min(1, "Campo obrigatório"),
      numero: z.string({ required_error: "Campo obrigatório" }).trim().min(1, "Campo obrigatório"),
      bairro: z.string({ required_error: "Campo obrigatório" }).trim().min(1, "Campo obrigatório"),
      cidade: z.string({ required_error: "Campo obrigatório" }).trim().min(1, "Campo obrigatório"),
      estado: z.string({ required_error: "Campo obrigatório" }).min(2, "Selecione o estado"),
      cep: cepSchema,
      referencia: z.string().optional().nullable().or(z.literal("")),
      complemento: z.string().optional().nullable().or(z.literal("")),
      observacoes: z.string().optional().nullable().or(z.literal("")),
      dados_complementares: z
        .array(respostaComplementarFormItemSchema)
        .optional()
        .default([])
        .superRefine((respostas, ctx) => {
          const lista = respostas || [];
          perguntasAtivas.forEach((pergunta, pIdx) => {
            const item =
              lista.find((r) => r?.id === pergunta.id) || lista[pIdx] || null;

            if (pergunta.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO) {
              if (!item || typeof item.resposta_booleana !== "boolean") {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Campo obrigatório",
                  path: [pIdx, "resposta_booleana"],
                });
              } else if (
                item.resposta_booleana === true &&
                (!item.resposta_texto || item.resposta_texto.trim().length < 2)
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Informe os detalhes",
                  path: [pIdx, "resposta_texto"],
                });
              }
            } else if (pergunta.tipo === TipoPerguntaPersonalizadaEnum.TEXTO_LIVRE) {
              if (
                pergunta.obrigatorio &&
                (!item || !item.resposta_texto || item.resposta_texto.trim().length < 2)
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Campo obrigatório",
                  path: [pIdx, "resposta_texto"],
                });
              }
            }
          });
        }),

      escola_id: z.string().optional().nullable().or(z.literal("")),
      turma: config.turma
        ? z.string({ required_error: "Campo obrigatório" }).trim().min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      sala: z.string().optional().nullable().or(z.literal("")),
      nome_professor: z.string().optional().nullable().or(z.literal("")),
      periodo: config.periodo
        ? z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      modalidade: config.modalidade
        ? z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      ano_letivo: z
        .string({ required_error: "Selecione o ano letivo" })
        .min(1, "Selecione o ano letivo"),
      data_nascimento: config.data_nascimento
        ? dateSchema(true)
        : dateSchema(false, false).optional().nullable().or(z.literal("")),
      genero: config.genero
        ? z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório")
        : z.string().optional().nullable().or(z.literal("")),
      parentesco_responsavel: config.parentesco_responsavel
        ? z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório")
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
    .superRefine((data, ctx) => {
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
        } catch {}
      }

      if (data.horario_entrada && data.horario_saida && data.horario_saida <= data.horario_entrada) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Horário de saída deve ser maior que o horário de entrada",
          path: ["horario_saida"],
        });
      }
    });
}

export const prePassageiroSchema = buildPrePassageiroSchema();

export type PrePassageiroFormData = z.infer<typeof prePassageiroSchema>;
