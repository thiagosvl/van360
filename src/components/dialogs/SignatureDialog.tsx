import React from "react";
import { BaseDialog } from "../ui/BaseDialog";
import { SignaturePad, SignaturePadRef } from "../common/SignaturePad";
import { Loader2, Trash2, PenTool, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssinar: () => void;
  isSigning: boolean;
  sigCanvas: React.RefObject<SignaturePadRef>;
  contrato: any;
}

export function SignatureDialog({
  isOpen,
  onClose,
  onAssinar,
  isSigning,
  sigCanvas,
}: SignatureDialogProps) {
  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      description="Espaço para desenho da assinatura digital do contratante"
    >
      <BaseDialog.Header
        title="Assinatura"
        subtitle="Assinatura Digital"
        icon={<PenTool className="h-5 w-5" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="space-y-6">
        <div className="bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100/50">
          <SignaturePad
            ref={sigCanvas}
            className="w-full"
          />
        </div>

        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/60 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-[10px] text-emerald-800 leading-relaxed font-medium italic">
            Esta assinatura será aplicada permanentemente ao contrato em PDF. Certifique-se de que o desenho esteja claro.
          </p>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={isSigning}
        />
        <BaseDialog.Action
          label="Confirmar"
          onClick={onAssinar}
          isLoading={isSigning}
          icon={<ShieldCheck className="h-4 w-4" />}
          className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default SignatureDialog;
