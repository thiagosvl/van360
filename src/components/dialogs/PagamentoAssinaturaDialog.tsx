import PagamentoPixContent from "@/components/features/pagamento/PagamentoPixContent";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle
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
  quantidadePassageiros?: number;
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
  quantidadePassageiros,
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
        className="w-full max-w-md p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogTitle className="sr-only">
          ASSINATURA
        </DialogTitle>
        <DialogDescription className="sr-only">
          Selecione a forma de pagamento e finalize sua assinatura.
        </DialogDescription>
        
        {/* Botão fechar flutuante */}
        <DialogClose className="absolute right-4 top-4 z-50 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 backdrop-blur-sm rounded-full p-1 border border-gray-100/50">
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        <div className="flex-1 overflow-hidden flex flex-col">
          <PagamentoPixContent
            cobrancaId={cobrancaId}
            onPaymentSuccess={onPaymentSuccess}
            usuarioId={usuarioId}
            onPrecisaSelecaoManual={onPrecisaSelecaoManual}
            onClose={(success) => onClose(success)}
            nomePlano={nomePlano}
            quantidadePassageiros={quantidadePassageiros}
            onIrParaInicio={onIrParaInicio}
            onIrParaAssinatura={onIrParaAssinatura}
            onPaymentVerified={onPaymentVerified}
            context={context}
            initialData={initialData}
            valor={valor}
          />

        </div>
      </DialogContent>
    </Dialog>
  );
}
