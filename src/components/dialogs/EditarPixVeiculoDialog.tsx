import { useState, useEffect, useRef } from "react";
import BaseDialog from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TipoChavePix, TIPOS_CHAVE_PIX_LABEL } from "@/types/pix";
import { Veiculo } from "@/types/veiculo";
import { pixKeySchema } from "@/schemas/pix";
import { aplicarMascaraPix } from "@/utils/formatters/pix";
import { formatarPlacaExibicao } from "@/utils/domain";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useUpdatePixVeiculo } from "@/hooks/api/useVeiculoMutations";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { PixKeyFields } from "@/components/features/pix/PixKeyFields";
import { Key, Trash2 } from "lucide-react";
import { z } from "zod";

interface EditarPixVeiculoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  veiculo: Veiculo | null;
  onSuccess?: () => void;
}

type PixFormData = z.infer<typeof pixKeySchema>;

export default function EditarPixVeiculoDialog({
  isOpen,
  onClose,
  veiculo,
  onSuccess,
}: EditarPixVeiculoDialogProps) {
  const { financeiro } = useMotoristaFinanceiroApi();
  const updatePixMutation = useUpdatePixVeiculo();

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

  const temChavePropria = Boolean(veiculo?.chave_pix && veiculo?.tipo_chave_pix);

  useEffect(() => {
    if (isOpen && veiculo) {
      const tipo = (veiculo.tipo_chave_pix as TipoChavePix) || undefined;
      let chave = veiculo.chave_pix || "";

      originalTipoRef.current = tipo || null;
      originalChaveRef.current = chave;

      chave = aplicarMascaraPix(chave, tipo);

      form.reset({
        tipo_chave_pix: tipo,
        chave_pix: chave,
      });
    }
  }, [isOpen, veiculo, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const chavePadraoFormatada = (() => {
    if (!financeiro?.chave_pix_repasse || !financeiro?.tipo_chave_pix) return null;
    const tipo = financeiro.tipo_chave_pix as TipoChavePix;
    const chave = aplicarMascaraPix(financeiro.chave_pix_repasse, tipo);
    return `${chave} (${TIPOS_CHAVE_PIX_LABEL[tipo] || tipo})`;
  })();

  const handleSubmit = async (data: PixFormData) => {
    if (!veiculo?.id) return;

    const chaveLimpa = data.chave_pix?.trim() || null;
    const tipoLimpo = data.tipo_chave_pix || null;

    if (!chaveLimpa) {
      await handleRemoverChavePropria();
      return;
    }

    await updatePixMutation.mutateAsync({
      id: veiculo.id,
      data: {
        chave_pix: chaveLimpa,
        tipo_chave_pix: tipoLimpo,
      },
    });

    if (onSuccess) onSuccess();
    handleClose();
  };

  const handleRemoverChavePropria = async () => {
    if (!veiculo?.id) return;
    setIsRemoving(true);
    try {
      await updatePixMutation.mutateAsync({
        id: veiculo.id,
        data: {
          chave_pix: null,
          tipo_chave_pix: null,
        },
      });
      if (onSuccess) onSuccess();
      handleClose();
    } finally {
      setIsRemoving(false);
    }
  };

  if (!veiculo) return null;

  const isSaving = updatePixMutation.isPending || isRemoving;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={`Chave Pix — ${formatarPlacaExibicao(veiculo.placa)}`}
        subtitle={`${veiculo.marca} ${veiculo.modelo}`}
        icon={<Key className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          {temChavePropria ? (
            <Banner
              variant="info"
              description="Este veículo possui uma chave Pix própria configurada. As cobranças dos alunos vinculados a ele utilizarão esta chave."
            />
          ) : (
            <Banner
              variant="info"
              description={
                chavePadraoFormatada
                  ? `Se não configurar uma chave própria para este veículo, as cobranças usarão a chave padrão da conta: ${chavePadraoFormatada}.`
                  : "Configure uma chave Pix para receber os pagamentos dos alunos vinculados a este veículo."
              }
            />
          )}

          <Form {...form}>
            <form id="editar-pix-veiculo-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
        {temChavePropria ? (
          <BaseDialog.Action
            label="Remover"
            variant="outline"
            icon={<Trash2 className="w-4 h-4 text-red-600" />}
            onClick={handleRemoverChavePropria}
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
          label={temChavePropria ? "Salvar Alterações" : "Salvar Chave Pix"}
          type="submit"
          form="editar-pix-veiculo-form"
          isLoading={isSaving}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
