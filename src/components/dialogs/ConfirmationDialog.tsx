import { BaseDialog } from "@/components/ui/BaseDialog";
import { useState } from "react";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
  allowClose?: boolean;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  allowClose = false,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const showLoading = isLoading || internalLoading;

  const handleConfirm = async () => {
    if (onConfirm) {
      const result = onConfirm();
      if (result instanceof Promise) {
        setInternalLoading(true);
        try {
          await result;
        } finally {
          setInternalLoading(false);
        }
      }
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={!allowClose}>
      <BaseDialog.Header
        title={title}
        hideCloseButton={!allowClose}
        onClose={allowClose ? () => onOpenChange(false) : undefined}
      />
      <BaseDialog.Body>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label={cancelText}
          variant="secondary"
          disabled={showLoading}
          onClick={() => {
            onCancel?.();
            onOpenChange(false);
          }}
        />
        <BaseDialog.Action
          label={showLoading ? "Processando" : confirmText}
          isLoading={showLoading}
          onClick={handleConfirm}
          disabled={showLoading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
