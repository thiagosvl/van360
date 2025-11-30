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
            <AlertDialogTitle>Sua van digital está cheia!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            <p className="mb-3">
              Seu plano permite automatizar <strong>{franquiaContratada}</strong> passageiros.
              Você usou <strong>{cobrancasEmUso}</strong> de{" "}
              <strong>{franquiaContratada}</strong> vagas no automático.
            </p>
            <p>
              Para colocar mais gente no automático, faça um upgrade.
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

