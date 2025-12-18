import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FEATURE_LIMITE_PASSAGEIROS, PLANO_COMPLETO, PLANO_ESSENCIAL } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  ChevronRight,
  RefreshCw,
  ShieldAlert,
  Zap
} from "lucide-react";

interface SubscriptionSettingsProps {
  onCancelClick: () => void;
  plano?: any;
  passageirosAtivos?: number;
}

export function SubscriptionSettings({
  onCancelClick,
  plano,
  passageirosAtivos = 0,
}: SubscriptionSettingsProps) {
  const { openPlanUpgradeDialog } = useLayout();

  const isComplete =
    plano?.slug === PLANO_COMPLETO || plano?.parent?.slug === PLANO_COMPLETO;

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Configurações da Assinatura
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-full justify-between items-center h-auto py-3 px-2 hover:bg-gray-50 rounded-lg group whitespace-normal"
          onClick={() =>
            isComplete
              ? openPlanUpgradeDialog({
                  feature: "automacao",
                  defaultTab: PLANO_COMPLETO,
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
              {isComplete ? (
                <Zap className="w-5 h-5 text-amber-500" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-gray-900 leading-none">
                {isComplete ? "Aumentar Limites" : "Alterar Plano"}
              </span>
              <span className="text-xs text-gray-500 font-normal">
                {isComplete
                  ? "Aumente sua franquia de cobranças"
                  : "Faça upgrade para acessar mais recursos"}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </Button>

        <Separator className="opacity-50" />

        <Button
          variant="ghost"
          className="w-full justify-between items-center h-auto py-3 px-2 hover:bg-red-50 rounded-lg group whitespace-normal"
          onClick={onCancelClick}
        >
          <div className="flex items-start gap-3 text-left">
            <div className="mt-0.5">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-red-600 leading-none">
                Cancelar Assinatura
              </span>
              <span className="text-xs text-red-400/80 font-normal">
                A renovação automática será desativada
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-200 group-hover:text-red-400 transition-colors" />
        </Button>
      </div>
    </>
  );
}
