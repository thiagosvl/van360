import {
  FEATURE_COBRANCA_AUTOMATICA,
  FEATURE_LIMITE_FRANQUIA,
  PLANO_ESSENCIAL,
  PLANO_PROFISSIONAL
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useMemo } from "react";

export const useUpsellContent = (plano?: any) => {
  const { openPlanUpgradeDialog } = useLayout();

  const content = useMemo(() => {

    if (plano?.is_essencial) {
      return {
        title: "Automatize sua rotina ⚡",
        description:
          "Deixe a cobrança com a gente! Recebimento automático e baixa instantânea.",
        buttonText: "Quero automação total →",
        action: () =>
          openPlanUpgradeDialog({
            feature: FEATURE_COBRANCA_AUTOMATICA,
            defaultTab: PLANO_PROFISSIONAL,
          }),
        check: true,
        variant: "essential_to_professional",
      };
    }

    if (plano?.is_profissional) {
      return {
        title: "Máxima eficiência 🎯",
        description:
          "Precisa de mais automação? Aumente seu limite de passageiros automáticos.",
        buttonText: "Aumentar limites",
        action: () =>
          openPlanUpgradeDialog({
            feature: FEATURE_LIMITE_FRANQUIA,
          }),
        check: true,
        variant: "professional_limits",
      };
    }

    return {
      title: "Eleve seu negócio 🚀",
      description: "Acesse recursos exclusivos e profissionalize sua gestão.",
      buttonText: "Conhecer planos",
      action: () => openPlanUpgradeDialog({ defaultTab: PLANO_ESSENCIAL }),
      check: false,
      variant: "default",
    };
  }, [plano, openPlanUpgradeDialog]);

  return content;
};
