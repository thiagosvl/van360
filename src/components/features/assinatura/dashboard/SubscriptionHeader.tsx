import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FEATURE_LIMITE_FRANQUIA
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  Crown,
  XCircle
} from "lucide-react";

interface SubscriptionHeaderProps {
  plano: any;
  assinatura: any;
  onPagarClick: () => void;
  passageirosAtivos?: number;
  onRefresh?: () => void;
  flags?: any;
}

export function SubscriptionHeader({
  plano,
  assinatura,
  onPagarClick,
  passageirosAtivos = 0,
  onRefresh,
  flags,
}: SubscriptionHeaderProps) {
  const { openPlanUpgradeDialog } = useLayout();

  const {
    is_profissional: isProfissionalPlan,
    is_essencial: isEssentialPlan,
    is_ativo: isActive,
    is_pendente: isPendente,
    is_suspensa: isSuspensa,
  } = plano || {};

  const is_trial = flags?.is_trial_ativo;

  // Trial calculations
  const trialDaysLeft = flags?.dias_restantes_trial ?? 0;

  // Status Badge Configuration
  const getStatusConfig = () => {
    if (is_trial) {
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertTriangle,
        text: `Teste Grátis (${trialDaysLeft} dias ${trialDaysLeft > 1 ? "restantes" : "restante"})`,
        description: `O período de teste termina em ${new Date(assinatura.trial_end_at).toLocaleDateString(
              "pt-BR"
            )}.`,
      };
    }
    if (isPendente)
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        text: "Pendente",
        description: "Pagamento pendente. Regularize para evitar bloqueio.",
      };
    if (isSuspensa)
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        text: "Suspensa",
        description: "Assinatura suspensa. Reative seu plano agora.",
      };
    if (isActive)
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        text: "Assinatura Ativa",
        description: assinatura?.vigencia_fim
          ? `Renova em ${new Date(assinatura.vigencia_fim).toLocaleDateString(
              "pt-BR"
            )}.`
          : "Tudo certo com seu plano.",
      };

    return {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: CheckCircle,
      text: "Ativo",
      description: "",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handlePrimaryAction = () => {
    if (isPendente || isSuspensa) {
      onPagarClick();
      return;
    }
    if (is_trial) {
      onPagarClick();
      return;
    }
    if (isProfissionalPlan) {
      openPlanUpgradeDialog({
        feature: FEATURE_LIMITE_FRANQUIA,
        targetPassengerCount: passageirosAtivos,
        onClose: onRefresh,
      });
    } else {
      openPlanUpgradeDialog({
        feature: "outros",
        targetPassengerCount: passageirosAtivos,
        onClose: onRefresh,
      }); // Upgrade from Essential
    }
  };

  return (
    <Card className="border-none shadow-md bg-white overflow-visible relative mt-2">
        {/* Status Badge - Absolute Position (Sticker Style) */}
        {(isSuspensa || isPendente || is_trial) && (
          <div className="absolute -top-2 right-2 z-10">
            <Badge
              variant="outline"
              className={cn(
                "border shadow-sm font-semibold px-3 py-1 bg-white", 
                statusConfig.color
              )}
            >
              <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
              {statusConfig.text}
            </Badge>
          </div>
        )}

        <div
          className={cn(
            "absolute top-0 left-0 w-1.5 h-full rounded-l-xl",
            isPendente || isSuspensa
              ? "bg-red-500"
              : is_trial
              ? "bg-yellow-500"
              : "bg-green-500"
          )}
        />

        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Plan Info */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "p-3 rounded-2xl flex items-center justify-center shadow-sm",
                isPendente || isSuspensa
                  ? "bg-red-50 text-red-600"
                  : is_trial
                  ? "bg-yellow-50 text-yellow-600"
                  : "bg-green-50 text-green-600"
              )}
            >
                <Crown className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 leading-none">
                 Plano {plano?.nome || "Plano"}
                </h2>
              </div>
              <p className="text-sm text-gray-500 max-w-md">
                {statusConfig.description}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              size="lg"
              onClick={handlePrimaryAction}
              className={cn(
                "w-full md:w-auto font-semibold shadow-md transition-all hover:scale-[1.02]",
                isPendente || isSuspensa
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : is_trial
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : isEssentialPlan
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              {isPendente || isSuspensa
                ? "Regularizar Pagamento"
                : is_trial
                ? "Ativar Plano Agora"
                : isProfissionalPlan
                ? "Aumentar limite"
                : "Trocar de Plano"}
            </Button>
          </div>
        </CardContent>
      </Card>
  );
}
