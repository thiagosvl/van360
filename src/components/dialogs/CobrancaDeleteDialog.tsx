import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Ban, Pencil } from "lucide-react";
import { useState } from "react";

export interface CobrancaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onEdit?: () => void;
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
    if (onEdit) {
      onOpenChange(false);
      onEdit();
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Cancelar parcela"
        icon={<Ban className="w-5 h-5 opacity-80" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <div className="space-y-6">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Tem certeza que deseja cancelar esta parcela? Ela ficará marcada como cancelada na carteirinha e não será cobrada.
          </p>

          {onEdit && (
            <Banner
              variant="info"
              title="Não precisa cancelar!"
              description={
                <>
                  Se você deseja corrigir apenas o <strong>valor</strong> ou a <strong>data</strong> de vencimento, não é necessário cancelar. Basta usar o botão <strong>Editar</strong> abaixo.
                </>
              }
            />
          )}
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        {onEdit ? (
          <BaseDialog.Action
            label="Editar"
            variant="outline"
            icon={<Pencil className="w-4 h-4" />}
            disabled={showLoading}
            onClick={handleEdit}
          />
        ) : (
          <BaseDialog.Action
            label="Voltar"
            variant="secondary"
            disabled={showLoading}
            onClick={() => onOpenChange(false)}
          />
        )}
        <BaseDialog.Action
          label={showLoading ? "Cancelando..." : "Cancelar Parcela"}
          variant="primary"
          isLoading={showLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
