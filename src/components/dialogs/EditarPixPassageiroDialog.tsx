import { useState, useEffect, useRef } from "react";
import BaseDialog from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TipoChavePix } from "@/types/pix";
import { Passageiro } from "@/types/passageiro";
import { pixKeySchema } from "@/schemas/pix";
import { aplicarMascaraPix } from "@/utils/formatters/pix";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useUpdatePixPassageiro } from "@/hooks/api/usePassageiroMutations";
import { usePixPassageiroResolver } from "@/hooks/ui/usePixPassageiroResolver";
import { PixKeyFields } from "@/components/features/pix/PixKeyFields";
import { Key, Trash2 } from "lucide-react";
import { z } from "zod";
import { formatFirstName } from "@/utils/formatters";

interface EditarPixPassageiroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro | null;
  onSuccess?: () => void;
}

type PixFormData = z.infer<typeof pixKeySchema>;

export default function EditarPixPassageiroDialog({
  isOpen,
  onClose,
  passageiro,
  onSuccess,
}: EditarPixPassageiroDialogProps) {
  const updatePixMutation = useUpdatePixPassageiro();
  const { getPixInfo } = usePixPassageiroResolver();

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

  const temChavePropria = Boolean(passageiro?.chave_pix && passageiro?.tipo_chave_pix);
  const pixInfoHerdado = getPixInfo(
    passageiro ? { ...passageiro, chave_pix: null, tipo_chave_pix: null } : null,
    passageiro?.veiculo || null
  );

  useEffect(() => {
    if (isOpen && passageiro) {
      const tipo = (passageiro.tipo_chave_pix as TipoChavePix) || undefined;
      let chave = passageiro.chave_pix || "";

      originalTipoRef.current = tipo || null;
      originalChaveRef.current = chave;

      chave = aplicarMascaraPix(chave, tipo);

      form.reset({
        tipo_chave_pix: tipo,
        chave_pix: chave,
      });
    }
  }, [isOpen, passageiro, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleSubmit = async (data: PixFormData) => {
    if (!passageiro?.id) return;

    const chaveLimpa = data.chave_pix?.trim() || null;
    const tipoLimpo = data.tipo_chave_pix || null;

    if (!chaveLimpa) {
      await handleRemoverChavePropria();
      return;
    }

    await updatePixMutation.mutateAsync({
      id: passageiro.id,
      data: {
        chave_pix: chaveLimpa,
        tipo_chave_pix: tipoLimpo,
      },
    });

    if (onSuccess) onSuccess();
    handleClose();
  };

  const handleRemoverChavePropria = async () => {
    if (!passageiro?.id) return;
    setIsRemoving(true);
    try {
      await updatePixMutation.mutateAsync({
        id: passageiro.id,
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

  if (!passageiro) return null;

  const isSaving = updatePixMutation.isPending || isRemoving;

  const renderBannerDescricao = () => {
    if (temChavePropria) {
      return "Este aluno possui uma chave Pix individualizada. As cobranças dele serão direcionadas a esta chave.";
    }

    if (pixInfoHerdado.origem === "veiculo") {
      return `Atualmente as cobranças deste aluno utilizam o Pix do veículo (${pixInfoHerdado.chaveFormatada}). Só configure uma chave aqui se você precisar que os pagamentos deste aluno específico caiam em outra conta.`;
    }

    if (pixInfoHerdado.origem === "conta") {
      return `Atualmente as cobranças deste aluno utilizam o Pix padrão da sua conta (${pixInfoHerdado.chaveFormatada}). Só configure uma chave aqui se você precisar que os pagamentos deste aluno específico caiam em outra conta.`;
    }

    return "Nenhuma chave Pix configurada na conta ou no veículo. Configure uma chave abaixo para este aluno ou configure na sua conta/veículo.";
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title={`Chave Pix — ${formatFirstName(passageiro.nome)}`}
        subtitle="Configuração opcional e individual para este aluno"
        icon={<Key className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          <Banner variant="info" description={renderBannerDescricao()} />

          <Form {...form}>
            <form id="editar-pix-passageiro-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            label="Excluir"
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
          label={temChavePropria ? "Salvar Alterações" : "Salvar"}
          type="submit"
          form="editar-pix-passageiro-form"
          isLoading={isSaving}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
