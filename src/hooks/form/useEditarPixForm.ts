import { useState, useEffect, useRef, useMemo } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TipoChavePix } from "@/types/pix";
import { ModoCobrancaEnum } from "@/types/enums";
import { pixKeyObject, pixKeyRefinement } from "@/schemas/pix";
import { aplicarMascaraPix } from "@/utils/formatters/pix";
import { formatCurrency } from "@/utils/formatters/currency";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "@/utils/notifications/toast";

const DEFAULT_TAXA_COBRANCA_AUTOMATICA = 2.5;

const createEditarPixSchema = (options: {
  isActivatingAutomatica: boolean;
  exigeCamposPix: boolean;
  exigeChaveObrigatoria: boolean;
}) =>
  pixKeyObject
    .extend({
      ciente_taxa: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (options.exigeCamposPix) {
        const chaveLimpa = data.chave_pix?.trim() || "";
        const tipoLimpo = data.tipo_chave_pix || null;

        if (!tipoLimpo) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Selecione o tipo de chave Pix.",
            path: ["tipo_chave_pix"],
          });
        }

        if (!chaveLimpa) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: options.exigeChaveObrigatoria
              ? "A chave Pix geral é obrigatória na Cobrança Automática."
              : "Informe a chave Pix.",
            path: ["chave_pix"],
          });
        } else {
          pixKeyRefinement(data, ctx);
        }
      }

      if (options.isActivatingAutomatica && !data.ciente_taxa) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Confirme que está ciente da taxa para ativar a cobrança automática.",
          path: ["ciente_taxa"],
        });
      }
    });

export type EditarPixFormData = z.infer<ReturnType<typeof createEditarPixSchema>>;

export interface UseEditarPixFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  isActivatingAutomatica?: boolean;
  aplicarATodos?: boolean;
}

export function useEditarPixForm({
  isOpen,
  onClose,
  onSuccess,
  isActivatingAutomatica = false,
  aplicarATodos,
}: UseEditarPixFormProps) {
  const { user } = useSession();
  const { refreshProfile } = useProfile(user?.id);
  const { financeiro, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const [isRemoving, setIsRemoving] = useState(false);
  const originalTipoRef = useRef<TipoChavePix | null>(null);
  const originalChaveRef = useRef<string>("");
  const cienteTaxaRef = useRef<HTMLDivElement | null>(null);

  const temChave = Boolean(financeiro?.chave_pix_repasse && financeiro?.tipo_chave_pix);
  const modoAtual =
    (financeiro?.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO;
  const exigeChaveObrigatoria =
    isActivatingAutomatica || modoAtual === ModoCobrancaEnum.AUTOMATICA;
  const deveExibirCamposPix = !isActivatingAutomatica || !temChave;
  const podeRemoverChave = temChave && !exigeChaveObrigatoria;

  const taxaEfetiva = financeiro?.taxa_efetiva ?? DEFAULT_TAXA_COBRANCA_AUTOMATICA;
  const taxaFormatada = formatCurrency(taxaEfetiva);

  const schema = useMemo(
    () =>
      createEditarPixSchema({
        isActivatingAutomatica,
        exigeCamposPix: deveExibirCamposPix,
        exigeChaveObrigatoria,
      }),
    [isActivatingAutomatica, deveExibirCamposPix, exigeChaveObrigatoria]
  );

  const form = useForm<EditarPixFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_chave_pix: undefined,
      chave_pix: "",
      ciente_taxa: false,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      const tipo = (financeiro?.tipo_chave_pix as TipoChavePix) || undefined;
      let chave = financeiro?.chave_pix_repasse || "";

      originalTipoRef.current = tipo || null;
      originalChaveRef.current = chave;

      chave = aplicarMascaraPix(chave, tipo);

      form.reset({
        tipo_chave_pix: tipo,
        chave_pix: chave,
        ciente_taxa: false,
      });
    }
  }, [isOpen, financeiro?.tipo_chave_pix, financeiro?.chave_pix_repasse, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleSuccess = async () => {
    handleClose();
    if (onSuccess) {
      await onSuccess();
    }
  };

  const handleRemoverPix = () => {
    if (exigeChaveObrigatoria) return;

    openConfirmationDialog({
      title: "Remover chave Pix geral?",
      description:
        "Deseja remover a chave Pix geral da conta? Os lembretes serão enviados sem chave Pix (exceto se o veículo ou aluno tiver chave própria).",
      confirmText: "Remover Chave",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          setIsRemoving(true);
          await updateFinanceiro({
            chave_pix_repasse: null,
            tipo_chave_pix: null,
          });
          toast.success("Chave Pix geral removida.");
          await refreshProfile();
          await handleSuccess();
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Ocorreu um erro ao remover a chave Pix.";
          toast.error(errorMessage);
        } finally {
          setIsRemoving(false);
          closeConfirmationDialog();
        }
      },
    });
  };

  const onFormError = (errors: FieldErrors<EditarPixFormData>) => {
    toast.error("validacao.formularioComErros");

    if (errors.ciente_taxa && !errors.tipo_chave_pix && !errors.chave_pix) {
      setTimeout(() => {
        cienteTaxaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 50);
    }
  };

  const handleSubmit = async (data: EditarPixFormData) => {
    if (isActivatingAutomatica && !deveExibirCamposPix) {
      try {
        await updateFinanceiro({
          modo_cobranca: ModoCobrancaEnum.AUTOMATICA,
          aplicar_a_todos: aplicarATodos,
        });

        toast.success(
          aplicarATodos
            ? "Cobrança & Baixa Automática ativada para todos os alunos!"
            : "Cobrança & Baixa Automática ativada!"
        );
        await refreshProfile();
        await handleSuccess();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Não foi possível ativar a Cobrança & Baixa Automática.";
        toast.error(errorMessage);
      }
      return;
    }

    const chaveLimpa = data.chave_pix?.trim() || null;
    const tipoLimpo = data.tipo_chave_pix || null;

    if (!chaveLimpa || !tipoLimpo) {
      handleRemoverPix();
      return;
    }

    try {
      await updateFinanceiro({
        chave_pix_repasse: chaveLimpa,
        tipo_chave_pix: tipoLimpo,
        ...(isActivatingAutomatica
          ? {
              modo_cobranca: ModoCobrancaEnum.AUTOMATICA,
              aplicar_a_todos: aplicarATodos,
            }
          : {}),
      });

      toast.success(
        isActivatingAutomatica
          ? aplicarATodos
            ? "Chave Pix salva e Cobrança Automática ativada para todos os alunos!"
            : "Chave Pix salva e Cobrança Automática ativada!"
          : "Chave Pix geral salva com sucesso."
      );
      await refreshProfile();
      await handleSuccess();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro ao salvar a chave Pix.";
      toast.error(errorMessage);
    }
  };

  const isSaving = isUpdating || isRemoving;

  return {
    form,
    temChave,
    modoAtual,
    deveExibirCamposPix,
    podeRemoverChave,
    taxaEfetiva,
    taxaFormatada,
    isSaving,
    originalTipoRef,
    originalChaveRef,
    cienteTaxaRef,
    handleClose,
    handleSubmit,
    onFormError,
    handleRemoverPix,
  };
}
