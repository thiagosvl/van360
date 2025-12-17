import PagamentoPixContent from "@/components/features/pagamento/PagamentoPixContent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PagamentoAssinaturaDialogProps {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  cobrancaId: string;
  valor: number;
  onPaymentSuccess?: (success?: boolean) => void;
  usuarioId?: string;
  onPrecisaSelecaoManual?: (data: {
    tipo: "upgrade" | "downgrade";
    franquia: number;
    cobrancaId: string;
  }) => void;
  nomePlano?: string;
  quantidadeAlunos?: number;
  onIrParaInicio?: () => void;
  onIrParaAssinatura?: () => void;
  onPaymentVerified?: () => void; // Novo callback
  context?: "register" | "upgrade";
  initialData?: {
    qrCodePayload: string;
    location: string;
    inter_txid: string;
    cobrancaId: string;
  };
}

export default function PagamentoAssinaturaDialog({
  isOpen,
  onClose,
  cobrancaId,
  valor,
  onPaymentSuccess,
  usuarioId,
  onPrecisaSelecaoManual,
  nomePlano,
  quantidadeAlunos,
  onIrParaInicio,
  onIrParaAssinatura,
  onPaymentVerified,
  context,
  initialData,
}: PagamentoAssinaturaDialogProps) {
  // We need to handle close logic here to ensure cleanup if needed,
  // but PagamentoPixContent handles its own cleanup on unmount/prop change.
  // However, the Dialog's onOpenChange triggers onClose, which should be sufficient.

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent
        className="sm:max-w-md max-h-[95vh] overflow-y-auto bg-white p-0 gap-0 rounded-3xl"
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        {/* Header Minimalista */}
        <DialogHeader className="p-3 flex flex-row items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="w-8" /> {/* Spacer */}
          <DialogTitle className="text-base font-semibold text-gray-900 uppercase tracking-wide">
            ASSINATURA
          </DialogTitle>
          <DialogDescription className="sr-only">
            Selecione a forma de pagamento e finalize sua assinatura.
          </DialogDescription>
          <DialogClose className="text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="p-4 pt-3">
          <PagamentoPixContent
            cobrancaId={cobrancaId}
            onPaymentSuccess={onPaymentSuccess}
            usuarioId={usuarioId}
            onPrecisaSelecaoManual={onPrecisaSelecaoManual}
            onClose={(success) => onClose(success)}
            nomePlano={nomePlano}
            quantidadeAlunos={quantidadeAlunos}
            onIrParaInicio={onIrParaInicio}
            onIrParaAssinatura={onIrParaAssinatura}
            onPaymentVerified={onPaymentVerified}
            context={context}
            initialData={initialData}
          />

        </div>
      </DialogContent>
    </Dialog>
  );
}
