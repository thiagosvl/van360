import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DialogExcessoFranquiaProps {
  isOpen: boolean;
  onClose: () => void;
  onVerPlanos: () => void;
  onContinuarSemAtivar: () => void;
  limiteAtual: number;
  limiteApos: number;
  contexto: "reativacao" | "cadastro";
}

export function DialogExcessoFranquia({
  isOpen,
  onClose,
  onVerPlanos,
  onContinuarSemAtivar,
  limiteAtual,
  limiteApos,
  contexto,
}: DialogExcessoFranquiaProps) {
  const navigate = useNavigate();

  const handleVerPlanos = () => {
    onVerPlanos();
    navigate("/planos");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Sua van digital está cheia!
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Gerencie o limite de passageiros do seu plano.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {contexto === "reativacao" ? (
              <>
                Reativar este passageiro com Cobrança Automática excederá suas vagas no automático.
              </>
            ) : (
              <>
                Seu plano permite automatizar {limiteAtual} passageiros.
              </>
            )}
          </p>

          <div className="bg-gray-50 p-3 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vagas totais:</span>
              <span className="text-sm font-medium">{limiteAtual}/{limiteAtual}</span>
            </div>
            {contexto === "reativacao" && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vagas necessárias:</span>
                <span className="text-sm font-medium text-red-600">
                  {limiteApos}/{limiteAtual}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Para colocar mais gente no automático, faça um upgrade.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="default"
            onClick={handleVerPlanos}
            className="w-full sm:w-auto"
          >
            Ver Planos
          </Button>
          <Button
            variant="outline"
            onClick={onContinuarSemAtivar}
            className="w-full sm:w-auto"
          >
            {contexto === "reativacao"
              ? "Reativar Sem Cobranças"
              : "Continuar Sem Ativar"}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

