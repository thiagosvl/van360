import { Button } from "@/components/ui/button";
import { FEATURE_LIMITE_PASSAGEIROS, FEATURE_UPGRADE_AUTOMACAO, PLANO_ESSENCIAL, PLANO_PROFISSIONAL } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  ChevronRight,
  RefreshCw,
  Zap
} from "lucide-react";

interface SubscriptionSettingsProps {
  plano?: any;
  passageirosAtivos?: number;
}

export function SubscriptionSettings({
  plano,
  passageirosAtivos = 0,
}: SubscriptionSettingsProps) {
  const { openPlanUpgradeDialog } = useLayout();

  const isProfissional = plano?.is_profissional;

  return (
    <>
      <div className="flex items-center gap-2 mb-3 pt-4">
        <h3 className="text-sm font-semibold text-gray-400">
          Configurações da Assinatura
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-full justify-between items-center h-auto py-3 px-2 hover:bg-gray-50 rounded-lg group whitespace-normal"
          onClick={() =>
            isProfissional
              ? openPlanUpgradeDialog({
                  feature: FEATURE_UPGRADE_AUTOMACAO,
                  defaultTab: PLANO_PROFISSIONAL,
                  targetPassengerCount: passageirosAtivos,
                })
              : openPlanUpgradeDialog({
                        feature: FEATURE_LIMITE_PASSAGEIROS,
                        defaultTab: PLANO_ESSENCIAL,
                        targetPassengerCount: passageirosAtivos,
                        onSuccess: () => {},
                      })
          }
        >
          <div className="flex items-start gap-3 text-left">
            <div className="mt-0.5">
              {isProfissional ? (
                <Zap className="w-5 h-5 text-amber-500" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-900 leading-none">
                {isProfissional ? "Aumentar Limite" : "Contratar Plano Profissional"}
              </span>
              <span className="text-xs text-gray-500 font-normal">
                {isProfissional
                  ? "Aumente sua franquia de cobranças"
                  : "Faça upgrade para acessar mais recursos"}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </Button>
      </div>
    </>
  );
}
