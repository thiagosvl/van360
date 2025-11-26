import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PLANO_COMPLETO } from "@/constants";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LimiteFranquiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  franquiaContratada: number;
  cobrancasEmUso: number;
}

export default function LimiteFranquiaDialog({
  open,
  onOpenChange,
  franquiaContratada,
  cobrancasEmUso,
}: LimiteFranquiaDialogProps) {
  const navigate = useNavigate();

  const handleIrParaPlanos = () => {
    onOpenChange(false);
    navigate(`/planos?slug=${PLANO_COMPLETO}`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDialogTitle>Limite de Cobranças Automáticas Atingido</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            <p className="mb-3">
              Você atingiu o limite de <strong>{franquiaContratada}</strong> cobranças automáticas.
              Atualmente você está utilizando <strong>{cobrancasEmUso}</strong> de{" "}
              <strong>{franquiaContratada}</strong> disponíveis.
            </p>
            <p>
              Para ativar cobranças automáticas para mais passageiros, você precisa contratar um plano que permita cobrar automaticamente mais passageiros.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleIrParaPlanos}
            className="bg-primary hover:bg-primary/90"
          >
            Ir para Planos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

