import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Onboarding } from "../features/onboarding/Onboarding";

// Tela de Carregamento Inicial Premium (Splash Screen simulada)
const InitialLoading = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
    <div className="relative">
      {/* Círculos de pulsação ao fundo */}
      <div className="absolute inset-0 scale-150 bg-primary/10 rounded-full animate-pulse" />
      <div className="absolute inset-0 scale-125 bg-primary/20 rounded-full animate-ping duration-[3000ms]" />
      
      <img 
        src="/assets/logo-van360.png" 
        alt="Van360" 
        className="w-32 h-32 relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-700"
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const isExternalForm = location.pathname.startsWith("/cadastro-passageiro");
    const hasCompleted = localStorage.getItem("onboarding_completed") === "true";
    
    // 🛠️ MODO PREVIEW: Permite ver o Onboarding via URL (?onboarding=true)
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("onboarding")) {
      setShowOnboarding(true);
      setCheckingOnboarding(false);
      return;
    }

    // REGRAS DE EXIBIÇÃO:
    // 1. Só mostra se estiver logado (session existe)
    // 2. Só mostra se ainda não completou
    // 3. Não mostra em formulários externos de passageiro
    const shouldShow = !!session && !hasCompleted && !isExternalForm;

    setShowOnboarding(shouldShow);
    setCheckingOnboarding(false);
  }, [location.pathname, session]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const publicPaths: string[] = [
    ROUTES.PUBLIC.ROOT,
    ROUTES.PUBLIC.LOGIN,
    ROUTES.PUBLIC.REGISTER,
    ROUTES.PUBLIC.NEW_PASSWORD,
  ];

  const isPublic =
    publicPaths.includes(location.pathname) ||
    location.pathname.startsWith("/cadastro-passageiro");

  // Enquanto ainda carrega sessão ou verifica onboarding, mostra tela premium
  if (loading || checkingOnboarding) {
    return <InitialLoading />;
  }

  // Se precisa mostrar onboarding no mobile pela primeira vez
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
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
  const authPaths: string[] = [ROUTES.PUBLIC.LOGIN, ROUTES.PUBLIC.REGISTER, ROUTES.PUBLIC.ROOT];
  if (session && authPaths.includes(location.pathname)) {
    return <Navigate to={ROUTES.PRIVATE.MOTORISTA.HOME} replace />;
  }

  // Caso normal → renderiza conteúdo
  return <>{children}</>;
};
