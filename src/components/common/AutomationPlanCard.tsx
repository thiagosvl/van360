import { LimitHealthBar } from "@/components/common/LimitHealthBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FEATURE_RELATORIOS,
  FEATURE_UPGRADE_AUTOMACAO,
  PLANO_ESSENCIAL,
  PLANO_PROFISSIONAL,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";

interface AutomationPlanCardProps {
  usage: number;
  limit: number;
  isProfessional: boolean;
  activePassengersCount: number;
  className?: string;
  showTitle?: boolean;
}

export const AutomationPlanCard = ({
  usage,
  limit,
  isProfessional,
  activePassengersCount,
  className,
}: AutomationPlanCardProps) => {
  const { openPlanUpgradeDialog } = useLayout();

  if (isProfessional) {
    return (
      <Card
        className={cn(
          "border-none shadow-sm rounded-2xl overflow-hidden relative p-0 max-w-full",
          className
        )}
      >
        <CardContent className="p-0 h-full">
          <LimitHealthBar
            current={usage}
            max={limit}
            label={"Passageiros no Automático"}
            description={
              usage >= limit
                ? "Limite atingido."
                : `${limit - usage} ${
                    limit - usage === 1 ? "vaga restante" : "vagas restantes"
                  }.`
            }
            className="h-full mb-0 border-0 shadow-none bg-white w-full"
            onIncreaseLimit={() =>
              openPlanUpgradeDialog({
                feature: FEATURE_UPGRADE_AUTOMACAO,
                defaultTab: PLANO_PROFISSIONAL,
                targetPassengerCount: activePassengersCount,
              })
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white shadow-lg",
        className
      )}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold">Automatize sua rotina</p>
          </div>
          <p className="text-xs text-white/80">
            Deixe a cobrança com a gente! Recebimento automático e baixa
            instantânea.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4 px-5 rounded-full border-white/30 bg-white/20 text-white hover:bg-white/30 font-semibold"
            onClick={() =>
              openPlanUpgradeDialog({
                feature: FEATURE_RELATORIOS,
                defaultTab: PLANO_ESSENCIAL,
              })
            }
          >
            Quero Automação Total →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
