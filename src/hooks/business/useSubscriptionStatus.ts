import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
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

    const status = profile.assinatura.status;
    const isTrial = !!profile.assinatura.trial_termina_em; // Or check status === 'trial' if consistent
    
    // Check for expiration
    // Assuming backend sets status to 'canceled', 'expired', or 'inactive' upon expiration
    // User logic: "status === 'expired'" (Check what backend actually returns)
    // In `access-control.service.ts` we use `isValidSubscription`.
    // Valid status: 'active', 'trial'
    // Invalid: 'canceled', 'expired', 'past_due' (maybe)

    const isExpired = ['expired', 'canceled', 'inactive'].includes(status);
    
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
