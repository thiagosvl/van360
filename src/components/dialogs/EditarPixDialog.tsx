import BaseDialog from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { Key } from "lucide-react";
import { PixConfiguracaoForm } from "@/components/features/configuracoes/PixConfiguracaoForm";
import { useState } from "react";

interface EditarPixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export default function EditarPixDialog({ isOpen, onClose, onSuccess }: EditarPixDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleSuccess = async () => {
    handleClose();
    if (onSuccess) {
      await onSuccess();
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title="Configurar Chave Pix"
        icon={<Key className="w-5 h-5 text-primary" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <PixConfiguracaoForm
          formId="editar-pix-form"
          hideActions={true}
          showAutoToggle={false}
          showTaxOptions={false}
          onSuccess={handleSuccess}
          onLoadingChange={setIsSubmitting}
        />
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Salvar"
          type="submit"
          form="editar-pix-form"
          isLoading={isSubmitting}
          className="w-full"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
