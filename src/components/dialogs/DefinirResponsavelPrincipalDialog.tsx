import { useState, useCallback } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { UserCheck, CheckCircle2 } from "lucide-react";
import { formatFirstName } from "@/utils/formatters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface DefinirResponsavelPrincipalDialogProps {
  open: boolean;
  onClose: () => void;
  responsavelNome: string;
  passageiroNome: string;
  onConfirm: () => Promise<void> | void;
}

export function DefinirResponsavelPrincipalDialog({
  open,
  onClose,
  responsavelNome,
  passageiroNome,
  onConfirm,
}: DefinirResponsavelPrincipalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = useCallback(() => {
    safeCloseDialog(onClose);
  }, [onClose]);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={(val) => !val && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title="Tornar Responsável Principal"
        icon={<UserCheck className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <p className="text-slate-600 text-sm leading-relaxed text-left">
            Tem certeza que deseja definir <strong>{formatFirstName(responsavelNome)}</strong> como o responsável principal de <strong>{formatFirstName(passageiroNome)}</strong>?
          </p>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-3 text-left shadow-sm">
            <p className="text-xs font-bold text-amber-950">O que muda no aplicativo?</p>
            <div className="flex gap-2.5 items-start">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">Contratos, Cobranças e Recibos</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Passarão a ser gerados automaticamente com o nome e dados deste responsável.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">Endereço Principal do Aluno</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Por padrão, será utilizado o endereço deste responsável para rotas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={isLoading}
          onClick={onClose}
        />
        <BaseDialog.Action
          label={isLoading ? "Processando" : "Sim, definir"}
          isLoading={isLoading}
          disabled={isLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
