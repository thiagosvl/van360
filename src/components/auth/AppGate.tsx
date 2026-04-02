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

  // 🔹 Para não impactar o motorista, verificamos se o tipo já existe na sessão (metadados).
  // Só bloqueamos com profileLoading se não soubermos quem é o usuário ou se ele for admin (que exige validação DB).
  const isDriverInSession = (session?.user as any)?.tipo === UserType.MOTORISTA;
  const isLoading = sessionLoading || (!!session && profileLoading && !isDriverInSession);

  if (isLoading) {
    return <InitialLoading />;
  }

  // 🔹 Se não está logado e a rota é pública → libera
  if (!session && isPublic) {
    return <>{children}</>;
  }

  // 🔹 Se não está logado e a rota é protegida → manda pro login
  if (!session && !isPublic) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  // 🔹 Se já está logado e tentar acessar login/cadastro → manda pro dashboard correto
  // Usamos o 'tipo' vindo do perfil (banco de dados)
  const authPaths: string[] = [ROUTES.PUBLIC.LOGIN, ROUTES.PUBLIC.REGISTER, ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.SPLASH];

  const isShowingWelcome = sessionStorage.getItem("van360_showing_welcome") === "true";
  
  if (session && authPaths.includes(location.pathname) && !isShowingWelcome) {
    const userRole = profile?.tipo || UserType.MOTORISTA;
    
    const targetPath = userRole === UserType.ADMIN 
      ? ROUTES.PRIVATE.ADMIN.DASHBOARD 
      : ROUTES.PRIVATE.MOTORISTA.HOME;
      
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
};

