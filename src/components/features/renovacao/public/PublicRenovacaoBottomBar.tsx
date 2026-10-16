import { CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicRenovacaoBottomBarProps {
  isPendente: boolean;
  isConfirmadoComContratoPendente: boolean;
  isResponding: boolean;
  temContratoDigital: boolean;
  anoDestino: number;
  activeContractToken: string | null;
  onConfirmar: () => void;
  onRecusar: () => void;
  onAssinarContrato: (token: string) => void;
}

export function PublicRenovacaoBottomBar({
  isPendente,
  isConfirmadoComContratoPendente,
  isResponding,
  temContratoDigital,
  anoDestino,
  activeContractToken,
  onConfirmar,
  onRecusar,
  onAssinarContrato,
}: PublicRenovacaoBottomBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-border backdrop-blur-md z-40 shadow-lg">
      <div className="max-w-lg mx-auto">
        {isPendente ? (
          <div className="space-y-2">
            <Button
              onClick={onConfirmar}
              disabled={isResponding}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-[18px] text-sm sm:text-base shadow-xs gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isResponding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span>
                {temContratoDigital
                  ? "Confirmar e Assinar Contrato"
                  : `Confirmar Renovação para ${anoDestino}`}
              </span>
            </Button>

            <button
              type="button"
              onClick={onRecusar}
              disabled={isResponding}
              className="w-full text-center py-1 text-xs font-normal text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              Não vou renovar para {anoDestino}
            </button>
          </div>
        ) : isConfirmadoComContratoPendente && activeContractToken ? (
          <Button
            onClick={() => onAssinarContrato(activeContractToken)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-[18px] text-sm sm:text-base shadow-xs gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <FileSignature className="w-5 h-5" />
            <span>Assinar Contrato</span>
          </Button>
        ) : null}
      </div>
    </footer>
  );
}
