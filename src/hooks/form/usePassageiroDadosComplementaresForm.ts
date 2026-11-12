import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  normalizeRespostasComplementares,
  PerguntaPersonalizadaConfig,
  resolvePerguntasPersonalizadas,
  RespostaComplementarItem,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";
import { useConfiguracoes } from "@/hooks/api/useConfiguracoes";
import { useUpdatePassageiro } from "@/hooks/api/usePassageiroMutations";
import { Passageiro } from "@/types/passageiro";
import { toast } from "@/utils/notifications/toast";

const itemFormSchema = z
  .object({
    id: z.string(),
    pergunta: z.string(),
    tipo: z.nativeEnum(TipoPerguntaPersonalizadaEnum),
    placeholder_detalhe: z.string().nullable().optional(),
    resposta_booleana: z.boolean().nullable().optional(),
    resposta_texto: z.string().nullable().optional(),
  })
  .superRefine((item, ctx) => {
    if (
      item.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO &&
      item.resposta_booleana === true &&
      (!item.resposta_texto || item.resposta_texto.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resposta_texto"],
        message: "Informe o detalhe para a resposta 'Sim'.",
      });
    }
  });

const passageiroDadosComplementaresSchema = z.object({
  itens: z.array(itemFormSchema),
});

export type PassageiroDadosComplementaresFormValues = z.infer<
  typeof passageiroDadosComplementaresSchema
>;

interface UsePassageiroDadosComplementaresFormParams {
  isOpen: boolean;
  passageiro: Passageiro | Partial<Passageiro> | null;
  onSuccess?: (updatedPassageiro?: Passageiro, hasChanges?: boolean) => void;
  onClose: () => void;
}

export function usePassageiroDadosComplementaresForm({
  isOpen,
  passageiro,
  onSuccess,
  onClose,
}: UsePassageiroDadosComplementaresFormParams) {
  const { configuracoes, isLoading: isLoadingConfig } = useConfiguracoes();
  const updatePassageiro = useUpdatePassageiro();

  const perguntasCatalogo = useMemo<PerguntaPersonalizadaConfig[]>(() => {
    const configuradas = resolvePerguntasPersonalizadas(
      configuracoes?.campos_formulario_externo?.perguntas_personalizadas
    );
    const salvas = normalizeRespostasComplementares(passageiro?.dados_complementares);
    const idsSalvos = new Set(salvas.map((s) => s.id));

    const ativasOuRespondidas = configuradas.filter(
      (p) => p.ativo || idsSalvos.has(p.id)
    );

    const baseList =
      ativasOuRespondidas.length > 0 ? ativasOuRespondidas : configuradas;
    const baseIds = new Set(baseList.map((p) => p.id));

    const extrasSalvas: PerguntaPersonalizadaConfig[] = salvas
      .filter((s) => !baseIds.has(s.id))
      .map((s) => ({
        id: s.id,
        pergunta: s.pergunta,
        tipo: s.tipo,
        placeholder_detalhe: null,
        obrigatorio: false,
        ativo: true,
        is_padrao: false,
      }));

    return [...baseList, ...extrasSalvas];
  }, [
    configuracoes?.campos_formulario_externo?.perguntas_personalizadas,
    passageiro?.dados_complementares,
  ]);

  const form = useForm<PassageiroDadosComplementaresFormValues>({
    resolver: zodResolver(passageiroDadosComplementaresSchema),
    defaultValues: {
      itens: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "itens",
    keyName: "fieldKey",
  });

  useEffect(() => {
    if (!isOpen || !passageiro) return;

    const salvas = normalizeRespostasComplementares(passageiro.dados_complementares);
    const mapaSalvas = new Map<string, RespostaComplementarItem>(
      salvas.map((item) => [item.id, item])
    );

    const itensIniciais = perguntasCatalogo.map((p) => {
      const existente = mapaSalvas.get(p.id);
      return {
        id: p.id,
        pergunta: existente?.pergunta || p.pergunta,
        tipo: p.tipo,
        placeholder_detalhe: p.placeholder_detalhe || null,
        resposta_booleana:
          existente?.resposta_booleana !== undefined
            ? existente.resposta_booleana
            : null,
        resposta_texto: existente?.resposta_texto || "",
      };
    });

    form.reset({ itens: itensIniciais });
  }, [isOpen, passageiro, perguntasCatalogo, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!passageiro?.id) return;

    const payloadNormalizado = normalizeRespostasComplementares(values.itens);
    const anteriores = normalizeRespostasComplementares(passageiro.dados_complementares);
    const hasChanges =
      JSON.stringify(payloadNormalizado) !== JSON.stringify(anteriores);

    try {
      const updated = await updatePassageiro.mutateAsync({
        id: passageiro.id,
        data: {
          ...(passageiro.ano_letivo ? { ano_letivo: passageiro.ano_letivo } : {}),
          dados_complementares: payloadNormalizado,
        },
        showToast: false,
      });

      toast.success("Informações complementares atualizadas com sucesso!");
      onSuccess?.(updated as Passageiro | undefined, hasChanges);
      onClose();
    } catch {
      toast.error("Não foi possível atualizar as informações complementares.");
    }
  });

  return {
    form,
    fields,
    isLoadingConfig,
    isSaving: updatePassageiro.isPending,
    handleSubmit,
  };
}
