import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

// Tela de Carregamento Inicial Premium (Splash Screen simulada)
const InitialLoading = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Círculos de pulsação ao fundo */}
      <div className="absolute inset-0 scale-125 bg-primary/5 rounded-full animate-pulse" />
      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping duration-[3000ms]" />

      <img
        src="/assets/logo-van360.png"
        alt="Van360"
        className="w-32 h-32 relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-700 object-contain"
      />
    </div>

    <div className="mt-12 flex flex-col items-center gap-4">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
      </div>
      <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
        Carregando sua jornada
      </p>
    </div>
  </div>
);

export const AppGate = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();
  const location = useLocation();
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(() => {
    // Se não for o primeiro carregamento desta aba (ex: após login/logout), não precisamos forçar o splash
    return sessionStorage.getItem("van360_boot_complete") === "true";
  });

  useEffect(() => {
    if (minLoadingTimePassed) return;

    // Garante que o splash screen apareça por pelo menos 1.2 segundos para uma experiência suave
    const timer = setTimeout(() => {
      setMinLoadingTimePassed(true);
      sessionStorage.setItem("van360_boot_complete", "true");
    }, 1200);
    return () => clearTimeout(timer);
  }, [minLoadingTimePassed]);

  const publicPaths: string[] = [
    ROUTES.PUBLIC.ROOT,
    ROUTES.PUBLIC.LOGIN,
    ROUTES.PUBLIC.REGISTER,
    ROUTES.PUBLIC.NEW_PASSWORD,
    ROUTES.PUBLIC.SPLASH,
  ];

  const isPublic =
    publicPaths.includes(location.pathname) ||
    location.pathname.startsWith("/cadastro-passageiro");

  // Enquanto ainda carrega sessão ou o splash screen, mostra tela premium
  if (loading || !minLoadingTimePassed) {
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
  // Exceção: tela de boas-vindas pós-cadastro no app nativo (flag temporário)
  const showingWelcome = sessionStorage.getItem("van360_showing_welcome") === "true";
  const authPaths: string[] = [ROUTES.PUBLIC.LOGIN, ROUTES.PUBLIC.REGISTER, ROUTES.PUBLIC.ROOT, ROUTES.PUBLIC.SPLASH];
  if (session && authPaths.includes(location.pathname) && !showingWelcome) {
    return <Navigate to={ROUTES.PRIVATE.MOTORISTA.HOME} replace />;
  }

  // Caso normal → renderiza conteúdo
  return <>{children}</>;
};

