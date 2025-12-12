import { CobrancaForm } from "@/components/forms/cobranca/CobrancaForm";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import {
    PlusCircle,
    User,
    X
} from "lucide-react";

interface CobrancaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  passageiroNome: string;
  passageiroResponsavelNome: string;
  valorCobranca: number;
  diaVencimento: number;
  onCobrancaAdded: () => void;
}

export default function CobrancaDialog({
  isOpen,
  onClose,
  passageiroId,
  passageiroNome,
  passageiroResponsavelNome,
  valorCobranca,
  diaVencimento,
  onCobrancaAdded,
}: CobrancaDialogProps) {
  
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Registrar Cobrança
          </DialogTitle>
          <DialogDescription className="text-blue-100/80 text-sm mt-1">
             Preencha os dados da cobrança.
          </DialogDescription>
        </div>

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{passageiroNome}</p>
              <p className="text-xs text-gray-500">{passageiroResponsavelNome}</p>
            </div>
          </div>

          <CobrancaForm
            mode="create"
            passageiroId={passageiroId}
            diaVencimento={diaVencimento}
            valor={valorCobranca}
            onSuccess={() => {
                onCobrancaAdded();
                onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
