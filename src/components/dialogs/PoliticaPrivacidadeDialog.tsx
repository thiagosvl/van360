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
    <BaseDialog open={open} onOpenChange={onOpenChange} maxWidth="2xl">
      <BaseDialog.Header
        title="Política de Privacidade"
        subtitle="Como tratamos seus dados em conformidade com a LGPD"
        icon={<ShieldCheck className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <PrivacyPolicyContent />
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar"
          onClick={handleClose}
          variant="outline"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
