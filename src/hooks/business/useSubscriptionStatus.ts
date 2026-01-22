import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { AssinaturaStatus } from "@/types/enums";
import { useEffect } from "react";

export function useSubscriptionStatus() {
  const { user } = useSession();
  const { profile, plano } = useProfile(user?.id);
  const { 
    openTrialExpiredDialog, 
    openSubscriptionExpiredDialog,
    isTrialExpiredDialogOpen,
    isSubscriptionExpiredDialogOpen
  } = useLayout();

  useEffect(() => {
    if (!profile || !profile.assinatura) return;

    const status = profile.assinatura.status as AssinaturaStatus;
    const isTrial = status === AssinaturaStatus.TRIAL || !!profile.assinatura.trial_termina_em;

    const isExpired = [
        AssinaturaStatus.CANCELADA, 
        AssinaturaStatus.SUSPENSA
    ].includes(status);
    
    if (isExpired) {
        if (isTrial) {
             if (!isTrialExpiredDialogOpen) {
                 openTrialExpiredDialog();
             }
        } else {
             if (!isSubscriptionExpiredDialogOpen) {
                 openSubscriptionExpiredDialog();
             }
        }
    }

  }, [profile, isTrialExpiredDialogOpen, isSubscriptionExpiredDialogOpen, openTrialExpiredDialog, openSubscriptionExpiredDialog]);
}
