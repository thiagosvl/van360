import BaseAlert from "@/components/alerts/BaseAlert";
import { Button } from "@/components/ui/button";
import { PLANO_COMPLETO } from "@/constants";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AutomaticChargesPromptProps {
  variant?: "compact" | "full";
}

export function AutomaticChargesPrompt({
  variant = "full",
}: AutomaticChargesPromptProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const storageKey = "automaticChargesPromptDismissed:cobrancas";

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(storageKey);
      setDismissed(v === "1");
    } catch (e) {
      setDismissed(false);
    }
  }, []);

  const handleClose = () => {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch (e) {
      /* ignore */
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  const config = {
    title: "Ative Cobranças Automáticas",
    description:
      "Economize tempo e não tenha dor de cabeça cobrando os pais. Nós enviaremos a cobrança na data combinada automaticamente.",
    highlight: "Economize tempo e evite dor de cabeça",
    icon: Zap,
    ctaText: "Quero Cobranças Automáticas",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  };

  const IconComponent = config.icon;

  const handleNavigate = () => {
    navigate(`/planos?slug=${PLANO_COMPLETO}`);
  };

  const actions = (
    <Button
      size={variant === "compact" ? "sm" : "default"}
      className={cn(
        "text-white whitespace-nowrap",
        variant === "compact" ? "w-full" : "flex-shrink-0",
        config.buttonColor
      )}
      onClick={handleNavigate}
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
      actions={actions}
      actionsClassName={variant === "compact" ? "w-full" : undefined}
      layout={variant === "compact" ? "vertical" : "horizontal"}
      onClose={handleClose}
      closeLabel="Fechar chamada de cobranças automáticas"
    />
  );
}

