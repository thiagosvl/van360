import BaseAlert from "@/components/alerts/BaseAlert";
import { Button } from "@/components/ui/button";
import { PLANO_COMPLETO, PLANO_ESSENCIAL } from "@/constants";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap } from "lucide-react";
import { ElementType, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PlanUpgradePromptProps {
  currentPlan: string;
  variant?: "compact" | "full";
  storageKey?: string;
}

export function PlanUpgradePrompt({
  currentPlan,
  variant = "full",
  storageKey = "planPromptDismissed",
}: PlanUpgradePromptProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const key = `${storageKey}:${String(currentPlan || "").toLowerCase()}`;
      const v = sessionStorage.getItem(key);
      setDismissed(v === "1");
    } catch (e) {
      setDismissed(false);
    }
  }, [storageKey]);

  const handleClose = () => {
    try {
      const key = `${storageKey}:${String(currentPlan || "").toLowerCase()}`;
      sessionStorage.setItem(key, "1");
    } catch (e) {
      /* ignore */
    }
    setDismissed(true);
  };

  const slug = String(currentPlan || "").toLowerCase();

  const planMessages: Record<
    string,
    {
      title: string;
      description: string;
      highlight: string;
      icon: ElementType;
      ctaText: string;
      buttonColor: string;
      targetPath: string;
    }
  > = {
    gratuito: {
      title: "Desbloqueie Funcionalidades Premium",
      description:
        "Passageiros ilimitados, cobranças automáticas, relatórios, controle de gastos e muito mais!",
      highlight: "Economize tempo e tenha mais organização",
      icon: Zap,
      ctaText: "Conhecer Planos",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      targetPath: "/planos",
    },
    essencial: {
      title: "Ative Cobranças Automáticas",
      description:
        "Economize tempo e não tenha dor de cabeça cobrando os pais. Nós enviaremos a cobrança na data combinada automaticamente.",
      highlight: "Economize tempo e evite dor de cabeça",
      icon: Zap,
      ctaText: "Quero Cobranças Automáticas",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      targetPath: `/planos?slug=${PLANO_COMPLETO}`,
    },
  };

  const config = planMessages[slug];
  if (!config || dismissed) return null;

  const IconComponent = config.icon;

  const action = (
    <Button
      size={variant === "compact" ? "sm" : "default"}
      className={cn(
        "text-white whitespace-nowrap",
        variant === "compact" ? "w-full" : "flex-shrink-0",
        config.buttonColor
      )}
      onClick={() => navigate(config.targetPath)}
    >
      {config.ctaText}
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );

  return (
    <BaseAlert
      variant="neutral"
      className="bg-white border border-blue-100 shadow-sm mb-6"
      icon={IconComponent}
      title={config.title}
      description={config.description}
      highlight={
        <span className="text-sm">
          💡 {config.highlight}
        </span>
      }
      actions={action}
      actionsClassName={variant === "compact" ? "w-full" : undefined}
      layout={variant === "compact" ? "vertical" : "horizontal"}
      onClose={handleClose}
      closeLabel="Fechar sugestão de plano"
    />
  );
}
