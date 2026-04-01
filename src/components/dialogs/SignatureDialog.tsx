import React from "react";
import { BaseDialog } from "../ui/BaseDialog";
import { SignaturePad, SignaturePadRef } from "../common/SignaturePad";
import { Loader2, Trash2, PenTool, ShieldCheck, AlertCircle } from "lucide-react";
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
        subtitle="Contrato"
        icon={<PenTool className="h-5 w-5" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="space-y-6">

        <div className="text-center space-y-2 mb-2">
          <h3 className="font-black text-[#1a3a5c] text-lg uppercase tracking-tight">Assinatura Digital</h3>
          <p className="text-[11px] text-slate-500 italic px-6 font-medium leading-relaxed">
            Sua assinatura aparecerá no final do contrato em PDF de forma automatizada.
          </p>
        </div>
        <div className="bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100/50">
          <SignaturePad
            ref={sigCanvas}
            className="w-full"
          />
        </div>
        <div className="bg-amber-50 rounded-3xl p-4 border border-amber-100 flex gap-3 mx-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
            <strong>Atenção:</strong> Esta assinatura tem validade jurídica. Certifique-se de que ela esteja legível e represente sua assinatura oficial.
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
