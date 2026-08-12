import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { Navigate, useLocation } from "react-router-dom";
import { InitialLoading } from "./InitialLoading";
import { UserType } from "@/types/enums";

export const AppGate = ({ children }: { children: React.ReactNode }) => {
  const { session, loading: sessionLoading } = useSession();
  const { profile, isLoading: profileLoading } = useProfile(session?.user?.id);
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

  const userWithTipo = session?.user as (typeof session.user & { tipo?: UserType }) | null;
  const isDriverInSession = userWithTipo?.tipo === UserType.MOTORISTA;
  const isLoading = sessionLoading || (!!session && profileLoading && !isDriverInSession);

  if (isLoading) {
    return <InitialLoading darkMode={location.pathname.startsWith("/admin")} />;
  }

  if (!session && isPublic) {
    return <>{children}</>;
  }

  if (!session && !isPublic) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location.pathname + location.search }} replace />;
  }

  const authPaths: string[] = [ROUTES.PUBLIC.LOGIN, ROUTES.PUBLIC.REGISTER, ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.SPLASH];

  if (session && authPaths.includes(location.pathname)) {
    const userRole = profile?.tipo || UserType.MOTORISTA;
    const locationState = location.state as { from?: string } | null;

    const targetPath = locationState?.from 
      ? locationState.from 
      : userRole === UserType.ADMIN
        ? ROUTES.PRIVATE.ADMIN.DASHBOARD
        : ROUTES.PRIVATE.MOTORISTA.HOME;

    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
};

