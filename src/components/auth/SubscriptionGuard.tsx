import React from "react";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { SubscriptionStatus } from "@/types/enums";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { session } = useSession();
  const { subscription, isLoading } = useSubscriptionStatus(session?.user?.id);
  const location = useLocation();

  const isExpired =
    subscription?.status === SubscriptionStatus.EXPIRED ||
    subscription?.status === SubscriptionStatus.CANCELED;
  const isTrialExpired =
    subscription?.status === SubscriptionStatus.TRIAL &&
    !!subscription?.trial_ends_at &&
    new Date(subscription.trial_ends_at) < new Date();

  if (!isLoading && (isExpired || isTrialExpired) && location.pathname !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION) {
    return <Navigate to={ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION} replace />;
  }

  return <>{children}</>;
};
