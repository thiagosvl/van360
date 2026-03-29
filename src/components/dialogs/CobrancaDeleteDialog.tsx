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
        icon={<Trash2 className="w-5 h-5" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <div className="space-y-6">
          <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 flex gap-4 shadow-sm">
            <div className="bg-orange-100 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-1.5 pt-0.5">
              <p className="font-bold text-orange-900 text-sm tracking-tight">Editar pode ser melhor!</p>
              <p className="text-orange-800/80 text-[13px] leading-relaxed font-medium">
                Se você deseja apenas corrigir o <strong className="text-orange-900">valor</strong>, a{" "}
                <strong className="text-orange-900">data</strong> ou o{" "}
                <strong className="text-orange-900">status</strong>, não é necessário excluir. Basta editar!
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
          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
        />
        <BaseDialog.Action
          label={showLoading ? "Excluindo" : "Excluir"}
          icon={<Trash2 className="w-4 h-4" />}
          isLoading={showLoading}
          onClick={handleConfirm}
          className="bg-red-600 hover:bg-red-700 shadow-red-500/20"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
