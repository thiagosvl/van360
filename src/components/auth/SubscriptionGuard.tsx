import React from "react";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { SubscriptionStatus } from "@/types/enums";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

/**
 * Guard para proteger rotas que exigem assinatura ativa.
 * Redireciona para a página de assinatura se o status for EXPIRED.
 */
export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { session } = useSession();
  const { subscription, isLoading } = useSubscriptionStatus(session?.user?.id);
  const location = useLocation();

  // Só redireciona quando temos certeza do status — nunca bloqueia enquanto carrega.
  // As páginas protegidas possuem seus próprios skeletons para o estado de loading.
  if (!isLoading && subscription?.status === SubscriptionStatus.EXPIRED && location.pathname !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION) {
    return <Navigate to={ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION} replace />;
  }

  return <>{children}</>;
};
