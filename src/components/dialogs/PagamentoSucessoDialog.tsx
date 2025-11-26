import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Pagamento confirmado!
          </DialogTitle>
          <DialogDescription className="text-center space-y-2 pt-2">
            <>
            <p className="text-base">
              {nomePlano && (
                <>
                  Seu plano <strong>{nomePlano}</strong> foi ativado com sucesso.
                </>
              )}
              {!nomePlano && "Seu plano foi ativado com sucesso."}
            </p>
            {quantidadeAlunos !== undefined && quantidadeAlunos > 0 && (
              <p className="text-sm text-gray-600">
                {quantidadeAlunos} {quantidadeAlunos === 1 ? "passageiro agora tem" : "passageiros agora têm"} cobrança automática.
              </p>
            )}
            </>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-4">
          <Button
            onClick={handleIrParaAssinatura}
            className="w-full"
            variant="default"
          >
            Ver minha assinatura
          </Button>
          <Button
            onClick={handleIrParaInicio}
            className="w-full"
            variant="outline"
          >
            Ir para tela inicial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

