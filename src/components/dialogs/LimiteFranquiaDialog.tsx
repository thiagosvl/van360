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
import { Rocket } from "lucide-react";
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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-full">
              <Rocket className="h-6 w-6 text-indigo-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Sua automação está no máximo!
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-base leading-relaxed">
            Você já preencheu todas as{" "}
            <strong className="text-gray-900">
              {franquiaContratada} vagas
            </strong>{" "}
            do seu plano atual.
            <br />
            <br />
            Não deixe ninguém de fora: faça o upgrade para o Plano Completo e
            tenha{" "}
            <strong className="text-gray-900">automação ilimitada</strong> para
            todos os seus passageiros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-4">
          <AlertDialogAction
            onClick={handleIrParaPlanos}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-12 font-bold shadow-md shadow-indigo-200"
          >
            Quero Automação Ilimitada
          </AlertDialogAction>
          <AlertDialogCancel className="w-full border-none shadow-none bg-transparent hover:bg-gray-100 mt-0">
            Gerenciar vagas atuais
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

