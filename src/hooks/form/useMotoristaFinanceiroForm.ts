import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TipoChavePix } from "@/types/pix";
import { pixKeyRefinement } from "@/schemas/pix";

const motoristaFinanceiroFormSchema = z
  .object({
    cobranca_automatica_ativa: z.boolean(),
    enviar_recibo_automatico: z.boolean(),
    tipo_chave_pix: z.nativeEnum(TipoChavePix).optional().nullable(),
    chave_pix: z.string().optional().nullable(),
    repassar_taxa_pais_padrao: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.cobranca_automatica_ativa) {
      if (!data.chave_pix || data.chave_pix.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Chave Pix é obrigatória para ativar o recebimento automático.",
          path: ["chave_pix"],
        });
        return;
      }
      if (!data.tipo_chave_pix) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione o tipo de chave Pix.",
          path: ["tipo_chave_pix"],
        });
        return;
      }
    }
    pixKeyRefinement(data, ctx);
  });

export type MotoristaFinanceiroFormData = z.infer<typeof motoristaFinanceiroFormSchema>;

export function useMotoristaFinanceiroForm(defaultValues?: Partial<MotoristaFinanceiroFormData>) {
  return useForm<MotoristaFinanceiroFormData>({
    resolver: zodResolver(motoristaFinanceiroFormSchema),
    defaultValues: {
      cobranca_automatica_ativa: defaultValues?.cobranca_automatica_ativa ?? false,
      enviar_recibo_automatico: defaultValues?.enviar_recibo_automatico ?? true,
      tipo_chave_pix: defaultValues?.tipo_chave_pix ?? null,
      chave_pix: defaultValues?.chave_pix ?? "",
      repassar_taxa_pais_padrao: defaultValues?.repassar_taxa_pais_padrao ?? false,
    },
  });
}
