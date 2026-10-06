import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ContractMultaTipo } from "@/types/enums";

const multaJurosFormSchema = z
  .object({
    cobrar_multa_atraso: z.boolean(),
    multa_atraso_tipo: z.nativeEnum(ContractMultaTipo),
    multa_atraso_valor: z.union([z.number(), z.nan()]).nullable().optional(),
    cobrar_juros_atraso: z.boolean(),
    juros_atraso_tipo: z.nativeEnum(ContractMultaTipo),
    juros_atraso_valor: z.union([z.number(), z.nan()]).nullable().optional(),
    dias_carencia_atraso: z.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    if (data.cobrar_multa_atraso) {
      if (data.multa_atraso_valor === null || data.multa_atraso_valor === undefined || isNaN(data.multa_atraso_valor) || data.multa_atraso_valor <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o valor ou taxa da multa por atraso.",
          path: ["multa_atraso_valor"],
        });
      }
    }
    if (data.cobrar_juros_atraso) {
      if (data.juros_atraso_valor === null || data.juros_atraso_valor === undefined || isNaN(data.juros_atraso_valor) || data.juros_atraso_valor <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o valor ou taxa dos juros de mora.",
          path: ["juros_atraso_valor"],
        });
      }
    }
  });

export type MultaJurosFormData = z.infer<typeof multaJurosFormSchema>;

export function useMultaJurosForm(defaultValues?: Partial<MultaJurosFormData>) {
  return useForm<MultaJurosFormData>({
    resolver: zodResolver(multaJurosFormSchema),
    defaultValues: {
      cobrar_multa_atraso: defaultValues?.cobrar_multa_atraso ?? false,
      multa_atraso_tipo: defaultValues?.multa_atraso_tipo ?? ContractMultaTipo.PERCENTUAL,
      multa_atraso_valor: defaultValues?.multa_atraso_valor ?? null,
      cobrar_juros_atraso: defaultValues?.cobrar_juros_atraso ?? false,
      juros_atraso_tipo: defaultValues?.juros_atraso_tipo ?? ContractMultaTipo.PERCENTUAL,
      juros_atraso_valor: defaultValues?.juros_atraso_valor ?? null,
      dias_carencia_atraso: defaultValues?.dias_carencia_atraso ?? 0,
    },
  });
}
