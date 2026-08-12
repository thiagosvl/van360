import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
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
        title="Excluir parcela"
        icon={<Trash2 className="w-5 h-5 opacity-80" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <div className="space-y-6">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Esta ação é irreversível. Tem certeza que deseja excluir esta parcela?
          </p>

          <Banner
            variant="info"
            title="Nao precisa excluir!"
            description={
              <>
                Se você deseja corrigir apenas o <strong>valor</strong> ou a <strong>data</strong> de vencimento, não é necessário excluir. Basta usar o botão <strong>Editar</strong> abaixo.
              </>
            }
          />
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
