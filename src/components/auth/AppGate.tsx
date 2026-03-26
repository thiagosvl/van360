import { ROUTES } from "@/constants/routes";
import { useSession } from "@/hooks/business/useSession";
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Onboarding } from "../features/onboarding/Onboarding";

interface OnboardingContextType {
  showOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType>({ showOnboarding: false });

export const useOnboarding = () => useContext(OnboardingContext);

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);

  useEffect(() => {
    // Garante que o splash screen apareça por pelo menos 1.2 segundos para uma experiência suave
    const timer = setTimeout(() => {
      setMinLoadingTimePassed(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isExternalForm = location.pathname.startsWith("/cadastro-passageiro");
    const storageKey = "van360_onboarding_done";
    const hasCompleted = localStorage.getItem(storageKey) === "true";

    // 🛠️ MODO PREVIEW: Permite ver o Onboarding via URL (?onboarding=true)
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("onboarding")) {
      setShowOnboarding(true);
      setCheckingOnboarding(false);
      return;
    }

    // REGRAS DE EXIBIÇÃO:
    // 1. Só mostra se estiver logado (session existe)
    // 2. Só mostra se ainda não completou no dispositivo
    // 3. Não mostra em formulários externos de passageiro
    const shouldShow = !!session && !hasCompleted && !isExternalForm;

    setShowOnboarding(shouldShow);
    setCheckingOnboarding(false);
  }, [location.pathname, session]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("van360_onboarding_done", "true");
    // Log para auditoria em dev/prod
    console.log(`[Onboarding] Completed on device`);

    // Pequeno delay para garantir que o storage foi persistido e dar feedback visual suave
    setTimeout(() => {
      setShowOnboarding(false);
    }, 100);
  };

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

  // Enquanto ainda carrega sessão ou verifica onboarding, mostra tela premium
  // Adicionado minLoadingTimePassed para evitar flicker e garantir experiência visual
  if (loading || checkingOnboarding || !minLoadingTimePassed) {
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

  // Caso normal → renderiza conteúdo com o Onboarding como overlay se necessário
  return (
    <OnboardingContext.Provider value={{ showOnboarding }}>
      {children}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </OnboardingContext.Provider>
  );
};
