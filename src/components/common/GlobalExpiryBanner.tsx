import { Button } from "@/components/ui/button";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AlertTriangle, Lock } from "lucide-react";

export function GlobalExpiryBanner() {
  const { plano, isReadOnly, isLoading } = usePermissions();
  const { openPlanUpgradeDialog } = useLayout();

  if (isLoading || !plano) return null;

  // 1. Read Only (Expired/Inactive)
  if (isReadOnly) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 shadow-md relative z-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Seu plano expirou e sua conta está em modo <strong>somente leitura</strong>. 
              Renove agora para voltar a editar seus dados.
            </p>
        </div>
        <Button 
            variant="secondary" 
            size="sm"
            className="whitespace-nowrap bg-white text-red-600 hover:bg-red-50 border-0"
            onClick={() => openPlanUpgradeDialog({ feature: "RENEWAL" })}
        >
            Renovar Plano
        </Button>
      </div>
    );
  }

  // 2. Trial Expiry Warning (<= 3 days)
  if (plano.isTrial && plano.trial_end_at) {
    const hoje = new Date();
    const fim = new Date(plano.trial_end_at);
    const diffTime = fim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3 && diffDays >= 0) {
       return (
        <div className="bg-yellow-500 text-white px-4 py-3 shadow-md relative z-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                Seu período de teste acaba em <strong>{diffDays === 0 ? "hoje" : `${diffDays} dias`}</strong>. 
                Garanta a continuidade do seu acesso.
                </p>
            </div>
            <Button 
                variant="secondary" 
                size="sm"
                className="whitespace-nowrap bg-white text-yellow-600 hover:bg-yellow-50 border-0"
                onClick={() => openPlanUpgradeDialog({ feature: "TRIAL_END" })}
            >
                Assinar Agora
            </Button>
        </div>
       );
    }
  }

  return null;
}
