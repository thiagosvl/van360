import React from "react";
import { useSession } from "@/hooks/business/useSession";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { InitialLoading } from "@/components/auth/InitialLoading";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { session, loading: sessionLoading } = useSession();
  const { can } = usePermissions();
  const { subscription, isLoading, isBlocked } = useSubscriptionAccess(session?.user?.id);
  const location = useLocation();

  const isChecking = sessionLoading || isLoading || !subscription;

  if (isChecking) {
    return <InitialLoading />;
  }

  if (isBlocked) {
    if (can("assinatura.gerenciar")) {
      if (
        location.pathname !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION &&
        location.pathname !== ROUTES.PRIVATE.MOTORISTA.ACCOUNT
      ) {
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

