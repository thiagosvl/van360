import { FEATURE_TRIAL_CONVERSION } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { useEffect } from "react";

export function useSubscriptionStatus() {
  const { user } = useSession();
  const { profile, plano, summary } = usePermissions();
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
    
    // Safety check: Don't show upgrade if PIX key is not configured
    // This avoids "hanging" the user in the upgrade dialog without a way to pay
    const canShowUpgrade = summary?.usuario.flags.pix_key_configurada;
    
    if (isExpired) {
        if (isTrial) {
             // Trial expirado -> Abre PlanUpgradeDialog
             if (!isPlanUpgradeDialogOpen && canShowUpgrade) {
                 openPlanUpgradeDialog({
                   defaultTab: plano?.slug, 
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
