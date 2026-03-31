import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { Navigate, useLocation } from "react-router-dom";
import { InitialLoading } from "./InitialLoading";

export const AppGate = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();
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

  // Enquanto ainda carrega sessão no primeiro boot, mostra a Splash Screen
  // Agora sem timer forçado: se carregar em 10ms, some em 10ms.
  if (loading) {
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

  // 🔹 Se já está logado e tentar acessar login/cadastro → manda pro início
  const authPaths: string[] = [ROUTES.PUBLIC.LOGIN, ROUTES.PUBLIC.REGISTER, ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.SPLASH];

  /* 
     [TEMPORÁRIO] isShowingWelcome evita redirect precoce enquanto a Splash mobile está ativa.
     O padrão anterior era apenas: if (session && authPaths.includes(location.pathname))
  */
  const isShowingWelcome = sessionStorage.getItem("van360_showing_welcome") === "true";
  if (session && authPaths.includes(location.pathname) && !isShowingWelcome) {
    return <Navigate to={ROUTES.PRIVATE.MOTORISTA.HOME} replace />;
  }

  return <>{children}</>;
};

