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
import { Key, Trash2 } from "lucide-react";
import { z } from "zod";

interface EditarPixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

type PixFormData = z.infer<typeof pixKeySchema>;

export default function EditarPixDialog({ isOpen, onClose, onSuccess }: EditarPixDialogProps) {
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

    if (!chaveLimpa) {
      handleRemoverPix();
      return;
    }

    try {
      await updateFinanceiro({
        chave_pix_repasse: chaveLimpa,
        tipo_chave_pix: tipoLimpo,
      });

      toast.success("Chave Pix salva com sucesso.");
      await refreshProfile();
      await handleSuccess();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro ao salvar a chave Pix.";
      toast.error(errorMessage);
    }
  };

  const handleRemoverPix = () => {
    const isModoAutomatico = modoAtual === ModoCobrancaEnum.AUTOMATICA;

    openConfirmationDialog({
      title: "Remover chave Pix padrão?",
      description: isModoAutomatico
        ? "A cobrança automática via Pix exige uma chave para repasse. Ao remover esta chave, o modo de cobrança será alterado para Lembretes. Deseja continuar?"
        : "Deseja realmente remover a chave Pix padrão da conta? Os lembretes passarão a ser enviados sem chave Pix (a menos que o veículo ou aluno possuam chave própria).",
      confirmText: isModoAutomatico ? "Remover e Mudar para Lembretes" : "Remover Chave",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          setIsRemoving(true);
          const updatePayload: Record<string, unknown> = {
            chave_pix_repasse: null,
            tipo_chave_pix: null,
          };
          if (isModoAutomatico) {
            updatePayload.modo_cobranca = ModoCobrancaEnum.LEMBRETES;
          }

          await updateFinanceiro(updatePayload);
          toast.success("Chave Pix removida com sucesso.");
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

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={temChave ? "Chave Pix da Conta" : "Cadastrar Chave Pix"}
        subtitle="Recebimento e repasse padrão da conta"
        icon={<Key className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          <Banner
            variant="info"
            description={
              modoAtual === ModoCobrancaEnum.AUTOMATICA
                ? "Esta chave recebe os repasses das cobranças automáticas que não tiverem chave própria por veículo ou aluno."
                : "Esta chave é enviada nos lembretes do WhatsApp quando nem o aluno nem a van possuírem uma chave dedicada."
            }
          />

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
        {temChave ? (
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
          label={temChave ? "Salvar Alterações" : "Salvar Chave Pix"}
          type="submit"
          form="editar-pix-form"
          isLoading={isSaving}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
