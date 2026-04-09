import { BaseDialog } from "@/components/ui/BaseDialog";
import { FileText } from "lucide-react";
import React from "react";
import { TermsOfUseContent } from "@/components/legal/TermsOfUseContent";

interface TermosUsoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermosUsoDialog({ open, onOpenChange }: TermosUsoDialogProps) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Termos de Uso"
        subtitle="Última atualização: 01/04/2026"
        icon={<FileText className="w-5 h-5" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <TermsOfUseContent />
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
