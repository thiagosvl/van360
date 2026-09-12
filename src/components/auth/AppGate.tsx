import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { InitialLoading } from "./InitialLoading";
import { UserType } from "@/types/enums";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";

export const AppGate = ({ children }: { children: React.ReactNode }) => {
  const { session, loading: sessionLoading } = useSession();
  const { profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const userRole = profile?.tipo || (session?.user as { tipo?: UserType } | undefined)?.tipo || UserType.MOTORISTA;
  const isDriver = userRole === UserType.MOTORISTA;

  const { subscription, isLoading: subscriptionLoading, isBlocked: isSubscriptionBlocked } = useSubscriptionAccess(
    session?.user?.id && isDriver ? session.user.id : undefined
  );

  const {
    isAuthenticated: isResponsavelAuth,
    isLoading: responsavelLoading,
    passageiros,
    passageiroSelecionado
  } = useResponsavelAuth();
  const location = useLocation();

  const publicPaths: string[] = [
    ROUTES.PUBLIC.ROOT,
    ROUTES.PUBLIC.LOGIN,
    ROUTES.PUBLIC.REGISTER,
    ROUTES.PUBLIC.SPLASH,
  ];

  const isPublic =
    publicPaths.includes(location.pathname) ||
    location.pathname.startsWith("/cadastro-passageiro");

  const hasAuthTokensInUrl = 
    window.location.hash.includes("access_token") || 
    window.location.search.includes("code=") ||
    window.location.search.includes("token_hash=") ||
    window.location.search.includes("token=");

  const authPaths: string[] = [ROUTES.PUBLIC.LOGIN, ROUTES.PUBLIC.REGISTER, ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.SPLASH];
  const isAtAuthPath = authPaths.includes(location.pathname);

  const isWaitingSubscription = !!session && isDriver && isAtAuthPath && subscriptionLoading;
  const isLoading =
    sessionLoading ||
    responsavelLoading ||
    (!!session && profileLoading && !isDriver) ||
    (!session && hasAuthTokensInUrl) ||
    isWaitingSubscription;

  if (isLoading) {
    return <InitialLoading darkMode={location.pathname.startsWith("/admin")} />;
  }

  if (isResponsavelAuth && isAtAuthPath) {
    const targetResponsavelPath = passageiroSelecionado
      ? ROUTES.PRIVATE.RESPONSAVEL.HOME
      : passageiros.length === 1
        ? ROUTES.PRIVATE.RESPONSAVEL.HOME
        : ROUTES.PRIVATE.RESPONSAVEL.SELECT;

    return <Navigate to={targetResponsavelPath} replace />;
  }

  if (session && isAtAuthPath) {
    const locationState = location.state as { from?: string } | null;

    const defaultMotoristaPath = isSubscriptionBlocked
      ? ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION
      : ROUTES.PRIVATE.MOTORISTA.HOME;

    const targetPath = locationState?.from 
      ? locationState.from 
      : userRole === UserType.ADMIN
        ? ROUTES.PRIVATE.ADMIN.DASHBOARD
        : defaultMotoristaPath;

    return <Navigate to={targetPath} replace />;
  }

  if (!session && !isResponsavelAuth && isPublic) {
    return <>{children}</>;
  }

  if (!session && !isResponsavelAuth && !isPublic) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location.pathname + location.search }} replace />;
  }

  return <>{children}</>;
};

