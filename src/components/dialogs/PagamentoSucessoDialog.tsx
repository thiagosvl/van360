import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PagamentoSucessoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onIrParaInicio?: () => void;
}

export function PagamentoSucessoDialog({
  isOpen,
  onClose,
  onIrParaInicio,
}: PagamentoSucessoDialogProps) {
  const navigate = useNavigate();

  const handleIrParaInicio = () => {
    if (onIrParaInicio) {
      onIrParaInicio();
    } else {
      navigate(ROUTES.PRIVATE.MOTORISTA.HOME);
    }
    onClose();
  };

  const handleIrParaFinanceiro = () => {
    navigate(ROUTES.PRIVATE.MOTORISTA.BILLING);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-md max-h-[95vh] overflow-y-auto gap-0 bg-emerald-600 rounded-3xl border-0 shadow-2xl p-0"
        hideCloseButton
      >
        <div className="bg-emerald-600 p-6 text-center relative">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Pagamento confirmado!
          </DialogTitle>
        </div>

        <div className="p-6 pt-4 bg-white flex-1 overflow-y-auto">

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleIrParaFinanceiro}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              Ver financeiro
            </Button>
            <Button
              onClick={handleIrParaInicio}
              variant="ghost"
              className="w-full h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
            >
              Ir para tela inicial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

