import {
    FEATURE_COBRANCA_AUTOMATICA,
    FEATURE_LIMITE_FRANQUIA,
    FEATURE_LIMITE_PASSAGEIROS,
    PLANO_ESSENCIAL,
    PLANO_PROFISSIONAL
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useMemo } from "react";

export const useUpsellContent = (plano?: any) => {
  const { openPlanUpgradeDialog } = useLayout();

  const content = useMemo(() => {
    // Source of truth: plano object already has these flags calculated by extractPlanoData
    const isFree = plano?.isFreePlan;
    const isEssencial = plano?.isEssentialPlan;
    const isProfissional = plano?.isProfissionalPlan;

    if (isFree) {
      return {
        title: "Cresça sem limites 🚀",
        description:
          "Cadastre quantos passageiros quiser e tenha controle total das suas finanças.",
        buttonText: "Quero mais recursos →",
        action: () =>
          openPlanUpgradeDialog({
            feature: FEATURE_LIMITE_PASSAGEIROS,
            defaultTab: PLANO_ESSENCIAL,
          }),
        check: true,
        variant: "free_to_essential",
      };
    }

    if (isEssencial) {
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

    if (isProfissional) {
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

    // Default fallback (e.g. for unknown plans or admin)
    return {
      title: "Eleve seu negócio 🚀",
      description: "Acesse recursos exclusivos e profissionalize sua gestão.",
      buttonText: "Conhecer planos",
      action: () => openPlanUpgradeDialog({ defaultTab: PLANO_ESSENCIAL }),
      check: false, // Don't verify/show by default if unknown
      variant: "default",
    };
  }, [plano, openPlanUpgradeDialog]);

  return content;
};
