import React from "react";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { usePermissions } from "@/hooks/business/usePermissions";
import { SubscriptionStatus } from "@/types/enums";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { session } = useSession();
  const { can } = usePermissions();
  const { subscription, isLoading } = useSubscriptionStatus(session?.user?.id);
  const location = useLocation();

  const isExpired =
    subscription?.status === SubscriptionStatus.EXPIRED ||
    subscription?.status === SubscriptionStatus.CANCELED;
  const isTrialExpired =
    subscription?.status === SubscriptionStatus.TRIAL &&
    !!subscription?.trial_ends_at &&
    new Date(subscription.trial_ends_at) < new Date();

  if (!isLoading && (isExpired || isTrialExpired)) {
    if (can("assinatura.gerenciar")) {
      if (location.pathname !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION) {
        return <Navigate to={ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION} replace />;
      }
    } else {
      return (
        <AccessRestrictedState
          moduleName="Acesso Temporariamente Suspenso"
          description="O acesso está temporariamente suspenso devido à assinatura ainda não ter sido renovada. Entre em contato com o dono da frota para a regularização."
        />
      );
    }
  }

  return <>{children}</>;
};
