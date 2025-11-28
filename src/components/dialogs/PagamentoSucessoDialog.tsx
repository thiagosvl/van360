import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PagamentoSucessoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nomePlano?: string;
  quantidadeAlunos?: number;
  onIrParaInicio?: () => void;
  onIrParaAssinatura?: () => void;
}

export function PagamentoSucessoDialog({
  isOpen,
  onClose,
  nomePlano,
  quantidadeAlunos,
  onIrParaInicio,
  onIrParaAssinatura,
}: PagamentoSucessoDialogProps) {
  const navigate = useNavigate();

  const handleIrParaInicio = () => {
    if (onIrParaInicio) {
      onIrParaInicio();
    } else {
      navigate("/inicio");
    }
    onClose();
  };

  const handleIrParaAssinatura = () => {
    if (onIrParaAssinatura) {
      onIrParaAssinatura();
    } else {
      navigate("/assinatura");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-md max-h-[95vh] overflow-y-auto bg-emerald-600 rounded-3xl border-0 shadow-2xl p-0"
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
          <DialogDescription className="text-emerald-100 text-sm mt-1">
            {nomePlano
              ? `Seu plano ${nomePlano} foi ativado com sucesso.`
              : "Seu plano foi ativado com sucesso."}
          </DialogDescription>
        </div>

        <div className="p-6 pt-4 bg-white flex-1 overflow-y-auto">
          {quantidadeAlunos !== undefined && quantidadeAlunos > 0 && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm font-medium text-emerald-900">
                {quantidadeAlunos}{" "}
                {quantidadeAlunos === 1
                  ? "passageiro agora tem"
                  : "passageiros agora têm"}{" "}
                cobrança automática.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleIrParaAssinatura}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
            >
              Ver minha assinatura
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

