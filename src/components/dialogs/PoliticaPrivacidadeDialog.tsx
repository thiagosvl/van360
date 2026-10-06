import { BaseDialog } from "@/components/ui/BaseDialog";
import { ShieldCheck } from "lucide-react";
import React from "react";
import { PrivacyPolicyContent } from "@/components/legal/PrivacyPolicyContent";
import { safeCloseDialog } from "@/hooks";

interface PoliticaPrivacidadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PoliticaPrivacidadeDialog({ open, onOpenChange }: PoliticaPrivacidadeDialogProps) {
  const handleClose = () => safeCloseDialog(() => onOpenChange(false));

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Política de Privacidade"
        icon={<ShieldCheck className="text-emerald-600 w-5 h-5" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <PrivacyPolicyContent />
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar"
          onClick={handleClose}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
