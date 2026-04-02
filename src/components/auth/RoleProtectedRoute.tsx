import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { UserType } from "@/types/enums";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { InitialLoading } from "./InitialLoading";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserType[];
}

/**
 * Componente para proteção de rotas baseado no papel (role) do usuário.
 * Busca o papel real da tabela 'usuarios' no banco de dados.
 */
export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { session, loading: sessionLoading } = useSession();
  const { profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const location = useLocation();

  // 🔹 Enquanto carrega sessão OU perfil (se houver sessão), mostra Loading
  const isLoading = sessionLoading || (!!session && profileLoading);

  if (isLoading) {
    return <InitialLoading />;
  }

  // Se não houver sessão, AppGate já deve cuidar disso, mas por segurança:
  if (!session) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location }} replace />;
  }

  // Verifica se o tipo do usuário (vindo do banco) está entre os permitidos. 
  const userType = profile?.tipo || UserType.MOTORISTA;
  const hasPermission = allowedRoles.includes(userType);

  if (!hasPermission) {
    // Redirecionamento inteligente baseado no papel real do usuário para evitar loops
    const fallbackPath = userType === UserType.ADMIN 
      ? ROUTES.PRIVATE.ADMIN.DASHBOARD 
      : ROUTES.PRIVATE.MOTORISTA.HOME;

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
