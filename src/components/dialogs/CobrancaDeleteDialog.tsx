import { BaseDialog } from "@/components/ui/BaseDialog";
import { AlertCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export interface CobrancaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onEdit: () => void;
  isLoading?: boolean;
}

export default function CobrancaDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  onEdit,
  isLoading = false,
}: CobrancaDeleteDialogProps) {
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

  const handleEdit = () => {
    onOpenChange(false);
    onEdit();
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Deseja mesmo excluir?"
        icon={<Trash2 className="w-5 h-5 opacity-80" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <div className="space-y-6 pt-2">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex gap-4 shadow-sm">
            <div className="bg-white h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm transition-all duration-500">
              <AlertCircle className="w-5 h-5 text-[#1a3a5c]" />
            </div>
            <div className="space-y-1 pt-0.5 flex-1">
              <p className="font-black text-[#1a3a5c] text-[13px] uppercase tracking-tight">Editar pode ser melhor!</p>
              <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
                Se você deseja apenas corrigir o <strong className="text-[#1a3a5c]">valor</strong> ou a{" "}
                <strong className="text-[#1a3a5c]">data</strong>, não é necessário excluir. Basta editar!
              </p>
            </div>
          </div>

          <p className="text-slate-500 text-sm text-center font-medium px-4">
            A exclusão é irreversível. O que você prefere fazer agora?
          </p>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Editar"
          variant="outline"
          icon={<Pencil className="w-4 h-4" />}
          disabled={showLoading}
          onClick={handleEdit}
        />
        <BaseDialog.Action
          label={showLoading ? "Excluindo" : "Excluir"}
          variant="primary"
          isLoading={showLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
