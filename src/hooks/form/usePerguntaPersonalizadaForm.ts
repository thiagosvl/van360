import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PerguntaPersonalizadaConfig,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";

const perguntaPersonalizadaSchema = z.object({
  pergunta: z
    .string()
    .trim()
    .min(3, "A pergunta deve ter no mínimo 3 caracteres.")
    .max(200, "A pergunta deve ter no máximo 200 caracteres."),
  tipo: z.nativeEnum(TipoPerguntaPersonalizadaEnum),
  placeholder_detalhe: z
    .string()
    .trim()
    .max(150, "A orientação deve ter no máximo 150 caracteres.")
    .optional(),
  obrigatorio: z.boolean(),
});

export type PerguntaPersonalizadaFormValues = z.infer<typeof perguntaPersonalizadaSchema>;

interface UsePerguntaPersonalizadaFormParams {
  isOpen: boolean;
  editingPergunta?: PerguntaPersonalizadaConfig | null;
  onSave: (pergunta: PerguntaPersonalizadaConfig) => Promise<void> | void;
  onClose: () => void;
}

export function usePerguntaPersonalizadaForm({
  isOpen,
  editingPergunta,
  onSave,
  onClose,
}: UsePerguntaPersonalizadaFormParams) {
  const form = useForm<PerguntaPersonalizadaFormValues>({
    resolver: zodResolver(perguntaPersonalizadaSchema),
    defaultValues: {
      pergunta: "",
      tipo: TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO,
      placeholder_detalhe: "",
      obrigatorio: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingPergunta) {
      form.reset({
        pergunta: editingPergunta.pergunta,
        tipo: editingPergunta.tipo,
        placeholder_detalhe: editingPergunta.placeholder_detalhe || "",
        obrigatorio: editingPergunta.obrigatorio,
      });
    } else {
      form.reset({
        pergunta: "",
        tipo: TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO,
        placeholder_detalhe: "",
        obrigatorio: true,
      });
    }
  }, [isOpen, editingPergunta, form]);

  const selectedTipo = form.watch("tipo");

  const handleSubmit = form.handleSubmit(async (values) => {
    const id =
      editingPergunta?.id ||
      `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const novaPergunta: PerguntaPersonalizadaConfig = {
      id,
      pergunta: values.pergunta.trim(),
      tipo: values.tipo,
      placeholder_detalhe: values.placeholder_detalhe?.trim() || null,
      obrigatorio:
        values.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO
          ? true
          : values.obrigatorio,
      ativo: editingPergunta ? editingPergunta.ativo : true,
      is_padrao: Boolean(editingPergunta?.is_padrao),
    };

    await onSave(novaPergunta);
    onClose();
  });

  return {
    form,
    selectedTipo,
    isEditing: Boolean(editingPergunta),
    isSubmitting: form.formState.isSubmitting,
    handleSubmit,
  };
}
