import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TipoChavePix } from "@/types/pix";
import { ModoCobrancaEnum } from "@/types/enums";
import { pixKeyRefinement } from "@/schemas/pix";

const motoristaFinanceiroFormSchema = z
  .object({
    modo_cobranca: z.nativeEnum(ModoCobrancaEnum),
    enviar_recibo_automatico: z.boolean(),
    tipo_chave_pix: z.nativeEnum(TipoChavePix, {
      required_error: "Selecione o tipo de chave Pix.",
      invalid_type_error: "Selecione o tipo de chave Pix.",
    }),
    chave_pix: z
      .string({ required_error: "Chave Pix é obrigatória." })
      .trim()
      .min(1, "Chave Pix é obrigatória."),
  })
  .superRefine((data, ctx) => {
    pixKeyRefinement(data, ctx);
  });

export type MotoristaFinanceiroFormData = z.infer<typeof motoristaFinanceiroFormSchema>;

export function useMotoristaFinanceiroForm(defaultValues?: Partial<MotoristaFinanceiroFormData>) {
  return useForm<MotoristaFinanceiroFormData>({
    resolver: zodResolver(motoristaFinanceiroFormSchema),
    defaultValues: {
      modo_cobranca: defaultValues?.modo_cobranca ?? ModoCobrancaEnum.DESATIVADO,
      enviar_recibo_automatico: defaultValues?.enviar_recibo_automatico ?? true,
      tipo_chave_pix: defaultValues?.tipo_chave_pix ?? undefined,
      chave_pix: defaultValues?.chave_pix ?? "",
    },
  });
}
