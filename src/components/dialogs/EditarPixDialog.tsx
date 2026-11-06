import { useState, useEffect, useRef } from "react";
import BaseDialog from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TipoChavePix } from "@/types/pix";
import { ModoCobrancaEnum } from "@/types/enums";
import { pixKeySchema } from "@/schemas/pix";
import { aplicarMascaraPix } from "@/utils/formatters/pix";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useLayout } from "@/contexts/LayoutContext";
import { PixKeyFields } from "@/components/features/pix/PixKeyFields";
import { toast } from "sonner";
import { Key, Sparkles, Trash2 } from "lucide-react";
import { z } from "zod";

interface EditarPixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  isActivatingAutomatica?: boolean;
  aplicarATodos?: boolean;
}

type PixFormData = z.infer<typeof pixKeySchema>;

export default function EditarPixDialog({
  isOpen,
  onClose,
  onSuccess,
  isActivatingAutomatica = false,
  aplicarATodos,
}: EditarPixDialogProps) {
  const { user } = useSession();
  const { refreshProfile } = useProfile(user?.id);
  const { financeiro, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const [isRemoving, setIsRemoving] = useState(false);
  const originalTipoRef = useRef<TipoChavePix | null>(null);
  const originalChaveRef = useRef<string>("");

  const form = useForm<PixFormData>({
    resolver: zodResolver(pixKeySchema),
    defaultValues: {
      tipo_chave_pix: undefined,
      chave_pix: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const temChave = Boolean(financeiro?.chave_pix_repasse && financeiro?.tipo_chave_pix);
  const modoAtual = (financeiro?.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO;
  const exigeChaveObrigatoria =
    isActivatingAutomatica || modoAtual === ModoCobrancaEnum.AUTOMATICA;
  const podeRemoverChave = temChave && !exigeChaveObrigatoria;

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
      });
    }
  }, [isOpen, financeiro, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleSuccess = async () => {
    handleClose();
    if (onSuccess) {
      await onSuccess();
    }
  };

  const handleSubmit = async (data: PixFormData) => {
    const chaveLimpa = data.chave_pix?.trim() || null;
    const tipoLimpo = data.tipo_chave_pix || null;

    if (!chaveLimpa || !tipoLimpo) {
      if (exigeChaveObrigatoria) {
        if (!tipoLimpo) {
          form.setError("tipo_chave_pix", {
            type: "manual",
            message: "Selecione o tipo de chave Pix.",
          });
        }
        if (!chaveLimpa) {
          form.setError("chave_pix", {
            type: "manual",
            message: "A chave Pix geral é obrigatória na Cobrança Automática.",
          });
        }
        return;
      }

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
          ? "Chave Pix salva e Cobrança Automática ativada!"
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

  const isSaving = isUpdating || isRemoving;

  const dialogTitle = isActivatingAutomatica
    ? "Ativar Cobrança Automática"
    : temChave
      ? "Chave Pix Geral"
      : "Cadastrar Chave Pix Geral";

  const dialogSubtitle = isActivatingAutomatica
    ? "Informe sua chave Pix principal para receber os repasses"
    : "Vale para todas as vans e alunos sem chave própria";

  const bannerDescription = isActivatingAutomatica
    ? "A chave Pix geral é obrigatória para receber o dinheiro das parcelas pagas. Se você usa contas separadas por van ou por aluno, poderá configurar logo após ativar."
    : modoAtual === ModoCobrancaEnum.AUTOMATICA
      ? "Esta chave recebe os repasses de todas as vans e alunos que não tiverem chave própria configurada."
      : "Esta chave é enviada nos lembretes do WhatsApp para todas as vans e alunos que não tiverem chave própria.";

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={dialogTitle}
        subtitle={dialogSubtitle}
        icon={
          isActivatingAutomatica ? (
            <Sparkles className="w-5 h-5 text-[#0a0a0a]" />
          ) : (
            <Key className="w-5 h-5 text-[#0a0a0a]" />
          )
        }
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          <Banner variant="info" description={bannerDescription} />

          <Form {...form}>
            <form id="editar-pix-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <PixKeyFields
                form={form}
                isBusy={isSaving}
                originalTipoRef={originalTipoRef}
                originalChaveRef={originalChaveRef}
              />
            </form>
          </Form>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        {podeRemoverChave ? (
          <BaseDialog.Action
            label="Remover"
            variant="outline"
            icon={<Trash2 className="w-4 h-4 text-red-600" />}
            onClick={handleRemoverPix}
            disabled={isSaving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          />
        ) : (
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          />
        )}
        <BaseDialog.Action
          label={isActivatingAutomatica ? "Salvar e Ativar" : "Salvar"}
          type="submit"
          form="editar-pix-form"
          isLoading={isSaving}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
