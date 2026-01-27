import { FEATURE_TRIAL_CONVERSION } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useEffect } from "react";

export function useSubscriptionStatus() {
  const { user } = useSession();
  const { profile, plano } = useProfile(user?.id);
  const { 
    openPlanUpgradeDialog,
    openSubscriptionExpiredDialog,
    isPlanUpgradeDialogOpen,
    isSubscriptionExpiredDialogOpen
  } = useLayout();

  useEffect(() => {
    if (!profile || !profile.assinatura) return;

    const isTrial = plano?.is_trial_ativo;
    const isExpired = plano?.is_suspensa || plano?.is_cancelada;
    
    if (isExpired) {
        if (isTrial) {
             // Trial expirado -> Abre PlanUpgradeDialog na aba do plano escolhido pelo usuário
             if (!isPlanUpgradeDialogOpen) {
                 openPlanUpgradeDialog({
                   defaultTab: plano?.slug, // Respeita a escolha inicial (ancoração de preço)
                   feature: FEATURE_TRIAL_CONVERSION,
                 });
             }
        } else {
             if (!isSubscriptionExpiredDialogOpen) {
                 openSubscriptionExpiredDialog();
             }
        }
    }

  }, [profile, plano?.slug, isPlanUpgradeDialogOpen, isSubscriptionExpiredDialogOpen, openPlanUpgradeDialog, openSubscriptionExpiredDialog]);
}
