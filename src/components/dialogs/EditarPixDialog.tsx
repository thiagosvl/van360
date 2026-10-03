import BaseDialog from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { Key } from "lucide-react";
import { PixConfiguracaoForm } from "@/components/features/configuracoes/PixConfiguracaoForm";

interface EditarPixDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditarPixDialog({ isOpen, onClose }: EditarPixDialogProps) {
  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <BaseDialog.Header
        title="Configurar Chave Pix e Recebimento"
        icon={<Key className="w-5 h-5" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <PixConfiguracaoForm
          onSuccess={handleClose}
          onCancel={handleClose}
          showCancelButton={true}
        />
      </BaseDialog.Body>
    </BaseDialog>
  );
}
