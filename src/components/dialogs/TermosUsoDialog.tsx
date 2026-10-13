import { BaseDialog } from "@/components/ui/BaseDialog";
import { FileText } from "lucide-react";
import React from "react";
import { TermsOfUseContent } from "@/components/legal/TermsOfUseContent";
import { safeCloseDialog } from "@/hooks";

interface TermosUsoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermosUsoDialog({ open, onOpenChange }: TermosUsoDialogProps) {
  const handleClose = () => safeCloseDialog(() => onOpenChange(false));

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} maxWidth="2xl">
      <BaseDialog.Header
        title="Termos de Uso"
        subtitle="Condições e diretrizes para uso da plataforma Van360"
        icon={<FileText className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <TermsOfUseContent />
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
