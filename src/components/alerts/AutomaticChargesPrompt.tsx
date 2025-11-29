import { PremiumBanner } from "@/components/alerts/PremiumBanner";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface AutomaticChargesPromptProps {
  variant?: "compact" | "full";
}

export function AutomaticChargesPrompt({
  variant = "full",
}: AutomaticChargesPromptProps) {
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

  if (dismissed) return null;

  return (
    <PremiumBanner
      title="Cansado de cobrar um por um?"
      description="Acabe com a inadimplência e o trabalho manual. Deixe que o sistema envie as cobranças automaticamente para você."
      ctaText="Quero Cobranças Automáticas"
      variant="indigo"
      icon={Zap}
      className="mb-6"
    />
  );
}

