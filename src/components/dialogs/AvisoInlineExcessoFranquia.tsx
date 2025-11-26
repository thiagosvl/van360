import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AvisoInlineExcessoFranquiaProps {
  limiteAtual: number;
  onVerPlanos?: () => void;
}

export function AvisoInlineExcessoFranquia({
  limiteAtual,
  onVerPlanos,
}: AvisoInlineExcessoFranquiaProps) {
  const navigate = useNavigate();

  const handleVerPlanos = () => {
    if (onVerPlanos) {
      onVerPlanos();
    }
    navigate("/planos");
  };

  return (
    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Limite atingido: você já está cobrando automaticamente {limiteAtual} {limiteAtual === 1 ? 'passageiro' : 'passageiros'}
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Para ativar, faça upgrade do seu plano.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={handleVerPlanos}
            className="mt-2 h-auto p-0 text-yellow-800 underline"
          >
            Ver Planos
          </Button>
        </div>
      </div>
    </div>
  );
}

