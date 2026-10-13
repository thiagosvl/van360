import { BaseDialog } from "@/components/ui/BaseDialog";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { safeCloseDialog } from "@/hooks";
import { useState } from "react";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
  allowClose?: boolean;
  isAdmin?: boolean;
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
  variant = "default",
  isLoading = false,
  allowClose = false,
  isAdmin,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const showLoading = isLoading || internalLoading;

  const isCurrentAdmin =
    isAdmin ?? (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"));

  const handleClose = () => {
    if (showLoading) return;
    onCancel?.();
    safeCloseDialog(() => onOpenChange(false));
  };

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

  const actionVariant = variant === "destructive" ? "destructive" : "primary";

  if (isCurrentAdmin) {
    return (
      <AdminBaseDialog open={open} onOpenChange={onOpenChange} lockClose={!allowClose} maxWidth="sm">
        <AdminBaseDialog.Header
          title={title}
          hideCloseButton={!allowClose}
          onClose={allowClose ? handleClose : undefined}
        />
        <AdminBaseDialog.Body>
          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
            {description}
          </div>
        </AdminBaseDialog.Body>
        <AdminBaseDialog.Footer>
          <AdminBaseDialog.Action
            label={cancelText}
            variant="secondary"
            disabled={showLoading}
            onClick={handleClose}
          />
          <AdminBaseDialog.Action
            label={showLoading ? "Processando..." : confirmText}
            variant={actionVariant}
            isLoading={showLoading}
            onClick={handleConfirm}
            disabled={showLoading}
          />
        </AdminBaseDialog.Footer>
      </AdminBaseDialog>
    );
  }

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={!allowClose} maxWidth="sm">
      <BaseDialog.Header
        title={title}
        hideCloseButton={!allowClose}
        onClose={allowClose ? handleClose : undefined}
      />
      <BaseDialog.Body>
        <div className="text-xs sm:text-sm text-[#737373] leading-relaxed pt-1">
          {description}
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label={cancelText}
          variant="secondary"
          disabled={showLoading}
          onClick={handleClose}
        />
        <BaseDialog.Action
          label={showLoading ? "Processando..." : confirmText}
          variant={actionVariant}
          isLoading={showLoading}
          onClick={handleConfirm}
          disabled={showLoading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
