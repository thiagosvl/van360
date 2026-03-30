import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { AtividadeEntidadeTipo } from "@/types/enums";
import { History } from "lucide-react";

interface HistoricoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
}

export default function HistoricoDialog({ isOpen, onClose, cobrancaId }: HistoricoDialogProps) {
  return (
    <BaseDialog open={isOpen} onOpenChange={onClose}>
      <BaseDialog.Header title="Histórico" icon={<History className="w-5 h-5" />} onClose={onClose} />
      <BaseDialog.Body className="pt-4">
        <ActivityTimeline
          entidadeTipo={AtividadeEntidadeTipo.COBRANCA}
          entidadeId={cobrancaId}
          limit={15}
        />
      </BaseDialog.Body>
    </BaseDialog>
  );
}
