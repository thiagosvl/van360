import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cepSchema } from "@/schemas/common";
import { validateEnderecoFields } from "@/utils/validators";
import { cepMask } from "@/utils/masks";
import { Escola } from "@/types/escola";

export const escolaSchema = z
  .object({
    nome: z
      .string({ required_error: "Nome da escola é obrigatório" })
      .min(1, "Nome da escola é obrigatório"),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: cepSchema.or(z.literal("")).optional(),
    referencia: z.string().optional(),
    complemento: z.string().optional(),
    ativo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const validation = validateEnderecoFields(
      data.cep || "",
      data.logradouro,
      data.numero,
    );

    if (validation.errors.cep) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.cep,
        path: ["cep"],
      });
    }
    if (validation.errors.logradouro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.logradouro,
        path: ["logradouro"],
      });
    }
    if (validation.errors.numero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.numero,
        path: ["numero"],
      });
    }
  });

export type EscolaFormData = z.infer<typeof escolaSchema>;

interface UseEscolaFormProps {
  editingEscola?: Partial<Escola> | null;
}

export function useEscolaForm(props?: UseEscolaFormProps) {
  const editingEscola = props?.editingEscola;

  const form = useForm<EscolaFormData>({
    resolver: zodResolver(escolaSchema),
    defaultValues: {
      nome: editingEscola?.nome || "",
      logradouro: editingEscola?.logradouro || "",
      numero: editingEscola?.numero || "",
      bairro: editingEscola?.bairro || "",
      cidade: editingEscola?.cidade || "",
      estado: editingEscola?.estado || "",
      cep: editingEscola?.cep ? cepMask(editingEscola.cep) : "",
      referencia: editingEscola?.referencia || "",
      complemento: editingEscola?.complemento || "",
      ativo: editingEscola?.ativo ?? true,
    },
  });

  return { form };
}
