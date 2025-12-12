import { CobrancaForm } from "@/components/forms/cobranca/CobrancaForm";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import { PASSAGEIRO_COBRANCA_STATUS_PAGO } from "@/constants";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import {
    getStatusColor,
    getStatusText,
} from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, User, X } from "lucide-react";
import { useEffect } from "react";

interface CobrancaEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobranca: Cobranca;
  onCobrancaUpdated: () => void;
}

export default function CobrancaEditDialog({
  isOpen,
  onClose,
  cobranca,
  onCobrancaUpdated,
}: CobrancaEditDialogProps) {

  // Cleanup effect to ensure body is unlocked when dialog closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("overflow");
        document.body.removeAttribute("data-scroll-locked");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[90vw] sm:w-full max-w-md max-h-[95vh] gap-0 flex flex-col overflow-hidden bg-blue-600 rounded-3xl border-0 shadow-2xl p-0"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Pencil className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Edição de Cobrança
          </DialogTitle>
          <DialogDescription className="text-blue-100/80 text-sm mt-1">
             Atualize os dados da cobrança.
          </DialogDescription>
        </div>

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                  Referência
                </p>
                <p className="text-lg font-bold text-gray-900 capitalize leading-tight">
                  {format(new Date(cobranca.data_vencimento), "MMMM", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm",
                  getStatusColor(cobranca.status, cobranca.data_vencimento)
                )}
              >
                {cobranca.status === PASSAGEIRO_COBRANCA_STATUS_PAGO
                  ? "PAGO"
                  : getStatusText(cobranca.status, cobranca.data_vencimento)}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200/50 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {cobranca.passageiros.nome}
                </p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">
                  {cobranca.passageiros.nome_responsavel}
                </p>
              </div>
            </div>
          </div>

          <CobrancaForm
            mode="edit"
            cobranca={cobranca}
            onSuccess={() => {
                onCobrancaUpdated();
                // onClose is handled by parent usually but calling here is safe via wrapper logic if needed
                // But onCobrancaUpdated in the original code called onClose too?
                // In original: onSuccess called local_onCobrancaUpdated() then onClose().
                // Here, I call onCobrancaUpdated. The parent implementation of onCobrancaUpdated should handle closing or refetching.
                // Let's check usage in cobrancas.tsx -> handleCobrancaUpdated calls refetch() and setEditOpen(false).
                // So calling onCobrancaUpdated is enough.
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
