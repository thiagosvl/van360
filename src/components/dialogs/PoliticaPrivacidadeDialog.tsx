import { BaseDialog } from "@/components/ui/BaseDialog";
import { ShieldCheck } from "lucide-react";
import React from "react";
import { PrivacyPolicyContent } from "@/components/legal/PrivacyPolicyContent";

interface PoliticaPrivacidadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PoliticaPrivacidadeDialog({ open, onOpenChange }: PoliticaPrivacidadeDialogProps) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Política de Privacidade"
        subtitle="Última atualização: 01/04/2026 · Em conformidade com a LGPD"
        icon={<ShieldCheck className="text-emerald-600 w-5 h-5" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <PrivacyPolicyContent />
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar"
          onClick={() => onOpenChange(false)}
          variant="primary"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
