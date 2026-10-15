import { CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicRenovacaoBottomBarProps {
  isPendente: boolean;
  isConfirmadoComContratoPendente: boolean;
  confirmRecusaOpen: boolean;
  isResponding: boolean;
  temContratoDigital: boolean;
  anoDestino: number;
  nomePassageiro: string;
  activeContractToken: string | null;
  onConfirmar: () => void;
  onRecusar: () => void;
  onSetConfirmRecusaOpen: (open: boolean) => void;
  onAssinarContrato: (token: string) => void;
}

export function PublicRenovacaoBottomBar({
  isPendente,
  isConfirmadoComContratoPendente,
  confirmRecusaOpen,
  isResponding,
  temContratoDigital,
  anoDestino,
  nomePassageiro,
  activeContractToken,
  onConfirmar,
  onRecusar,
  onSetConfirmRecusaOpen,
  onAssinarContrato,
}: PublicRenovacaoBottomBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-border backdrop-blur-md z-40 shadow-lg">
      <div className="max-w-lg mx-auto">
        {isPendente ? (
          !confirmRecusaOpen ? (
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
                onClick={() => onSetConfirmRecusaOpen(true)}
                className="w-full text-center py-1 text-xs font-normal text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                Não vou renovar para {anoDestino}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-foreground text-center">
                Tem certeza que não deseja renovar a vaga de {nomePassageiro}?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSetConfirmRecusaOpen(false)}
                  disabled={isResponding}
                  className="h-11 rounded-[16px] text-xs font-medium border border-border bg-white hover:bg-muted/40 cursor-pointer"
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={onRecusar}
                  disabled={isResponding}
                  className="h-11 rounded-[16px] text-xs font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
                >
                  {isResponding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirmar Saída"
                  )}
                </Button>
              </div>
            </div>
          )
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
