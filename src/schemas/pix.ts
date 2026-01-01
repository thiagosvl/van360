import { TipoChavePix } from "@/types/pix";
import { isValidCNPJ, isValidCPF } from "@/utils/validators";
import { z } from "zod";

export const pixKeyObject = z.object({
  tipo_chave_pix: z.nativeEnum(TipoChavePix, {
    required_error: "Selecione o tipo de chave",
  }).optional().nullable(),
  chave_pix: z.string().optional().nullable(),
});

export const pixKeyRefinement = (data: { tipo_chave_pix?: TipoChavePix | null; chave_pix?: string | null }, ctx: z.RefinementCtx) => {
    // Se não tiver chave, não valida (campos opcionais ou vazios)
    if (!data.chave_pix || data.chave_pix.length === 0) return;

    // Se tiver chave mas não tiver tipo
    if (!data.tipo_chave_pix) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selecione o tipo de chave",
            path: ["tipo_chave_pix"]
        });
        return;
    }

    if (data.tipo_chave_pix === TipoChavePix.CPF) {
        if (!isValidCPF(data.chave_pix)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CPF inválido", path: ["chave_pix"] });
        }
    } else if (data.tipo_chave_pix === TipoChavePix.CNPJ) {
        if (!isValidCNPJ(data.chave_pix)) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CNPJ inválido", path: ["chave_pix"] });
        }
    } else if (data.tipo_chave_pix === TipoChavePix.EMAIL) {
        if (!z.string().email().safeParse(data.chave_pix).success) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "E-mail inválido", path: ["chave_pix"] });
        }
    } else if (data.tipo_chave_pix === TipoChavePix.TELEFONE) {
         if (data.chave_pix.length < 14) { 
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone incompleto", path: ["chave_pix"] });
         }
    } else if (data.tipo_chave_pix === TipoChavePix.ALEATORIA) {
         if (data.chave_pix.length < 32) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Chave aleatória muito curta", path: ["chave_pix"] });
         }
    }
};

export const pixKeySchema = pixKeyObject.superRefine(pixKeyRefinement);
