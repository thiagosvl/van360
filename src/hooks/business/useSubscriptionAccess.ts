import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { SubscriptionUtils } from "@/utils/subscription.utils";

export function useSubscriptionAccess(userId?: string) {
  const { user } = useSession();
  const effectiveUserId = userId || user?.id;
  const { subscription, isLoading, isError, refetch } = useSubscriptionStatus(effectiveUserId);

  return {
    subscription,
    isLoading,
    isError,
    refetch,
    isBlocked: SubscriptionUtils.isBlocked(subscription),
    isActive: SubscriptionUtils.isActive(subscription),
    isPastDue: SubscriptionUtils.isPastDue(subscription),
    isTrial: SubscriptionUtils.isTrial(subscription),
    isTrialExpired: SubscriptionUtils.isTrialExpired(subscription),
    isExpired: SubscriptionUtils.isExpired(subscription),
    isCanceled: SubscriptionUtils.isCanceled(subscription),
    trialDaysLeft: SubscriptionUtils.calculateTrialDaysLeft(subscription?.trial_ends_at),
  };
}
