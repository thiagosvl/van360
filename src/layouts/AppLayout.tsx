import { useEffect, useRef } from "react";
import { LogOut, X } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { InitialLoading } from "@/components/auth/InitialLoading";

import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useAppOpenTracker } from "@/hooks/business/useAppOpenTracker";
import { formatFirstName, formatUserRoleLabel } from "@/utils/formatters";
import { useSEO } from "@/hooks/useSEO";
import { UserType } from "@/types/enums";
import { Outlet, useNavigate } from "react-router-dom";
import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import { ROUTES } from "@/constants/routes";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";
import { cn } from "@/lib/utils";
import { Banner } from "@/components/ui/Banner";
import { isImpersonating } from "@/utils/impersonate";
import { isMotoristaTitular } from "@/utils/userUtils";

const SWIPE_CLOSE_THRESHOLD = 100;

function AppLayoutContent({ role }: { role: UserType.MOTORISTA | "motorista" }) {
  const navigate = useNavigate();
  const { isMobileMenuOpen, setIsMobileMenuOpen, openConfirmationDialog, setIsGlobalLoading } = useLayout();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { isBlocked: isSubscriptionBlocked } = useSubscriptionAccess(user?.id);
  useAppOpenTracker(isMotoristaTitular(profile) ? user?.id : undefined);

  const displayName = profile?.apelido || formatFirstName(profile?.nome);
  const statusLabel = formatUserRoleLabel(profile?.tipo);

  const handleAccountClick = () => {
    setIsMobileMenuOpen(false);
    navigate(ROUTES.PRIVATE.MOTORISTA.ACCOUNT);
  };

  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const currentTranslate = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    currentTranslate.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (!isHorizontalSwipe.current || dx <= 0 || !sheetRef.current) return;

    currentTranslate.current = dx;
    sheetRef.current.style.transform = `translateX(${dx}px)`;
    sheetRef.current.style.transition = "none";
  };

  const handleTouchEnd = () => {
    if (!sheetRef.current) return;

    if (currentTranslate.current > SWIPE_CLOSE_THRESHOLD) {
      const el = sheetRef.current;
      el.style.transition = "transform 0.1s ease-out";
      el.style.transform = "translateX(100%)";
      setTimeout(() => {
        el.style.animationDuration = "0s";
        setIsMobileMenuOpen(false);
      }, 200);
    } else {
      sheetRef.current.style.transition = "transform 0.1s ease-out";
      sheetRef.current.style.transform = "";
    }

    currentTranslate.current = 0;
  };

  const handleSignOut = async () => {
    setIsGlobalLoading(true, "Encerrando sessão...");
    try {
      try {
        await apiClient.post("/auth/logout");
      } catch {
      }
      await sessionManager.signOut();
      window.location.href = ROUTES.PUBLIC.LOGIN;
    } catch {
      clearAppSession();
      window.location.href = ROUTES.PUBLIC.LOGIN;
    }
  };

  const handleConfirmSignOut = () => {
    openConfirmationDialog({
      title: "Deseja sair da conta?",
      description: "Você será desconectado deste dispositivo e precisará entrar novamente.",
      confirmText: "Sim, sair",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await handleSignOut();
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar role={role} />

      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-full w-72 flex-col border-r border-[#0b1a2e] bg-[#0b1a2e] shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <button
          type="button"
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ACCOUNT)}
          className="flex h-20 items-center justify-start px-6 border-b border-white/5 bg-transparent gap-4 text-left cursor-pointer hover:opacity-90 transition-opacity w-full"
        >
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden",
              profile?.logo_url
                ? "bg-white border border-white/10 p-[3px]"
                : "bg-white/10 border border-white/5 p-2"
            )}
          >
            <img
              src={profile?.logo_url || "/assets/logo-van360.webp"}
              alt={profile?.logo_url ? displayName : "Van360"}
              className={cn(
                "h-full w-full object-contain",
                !profile?.logo_url && "brightness-0 invert"
              )}
            />
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[15px] font-bold text-white leading-tight truncate">
              {displayName}
            </span>
            <div className="flex items-center">
              <span className="text-[12px] text-slate-400 font-medium">{statusLabel}</span>
            </div>
          </div>
        </button>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5">
          <AppSidebar role={role} isSubscriptionBlocked={isSubscriptionBlocked} />
        </div>
        <div className="p-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleConfirmSignOut}
            className="w-full flex items-center gap-3.5 rounded-2xl px-4 py-2.5 text-[14px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer group"
          >
            <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span className="truncate">Sair da conta</span>
          </button>
        </div>
      </aside>

      <main
        className={cn(
          "pt-[calc(5.5rem+var(--safe-area-top))] sm:pt-[calc(6rem+var(--safe-area-top))] px-4 sm:px-6 lg:px-10 md:ml-72 flex-1 transition-all duration-300 md:pb-12",
          isSubscriptionBlocked
            ? "pb-[calc(1.5rem+var(--safe-area-bottom))]"
            : "pb-[calc(6rem+var(--safe-area-bottom))]"
        )}
      >
        {isImpersonating() && (
          <div className="mb-4">
            <Banner
              variant="warning"
              title="Modo Visualização (Administrador)"
              description="Acesso como suporte ativo. Telemetria e estatísticas de acesso não são registradas."
            />
          </div>
        )}
        <Outlet />
      </main>

      {!isSubscriptionBlocked && <BottomNavbar />}

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          ref={sheetRef}
          side="right"
          className="w-[85%] sm:w-80 px-0 border-l border-white/10 bg-[#0b1a2e] flex flex-col h-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
            <SheetTitle className="sr-only">Menu de Opções</SheetTitle>
            <button
              type="button"
              onClick={handleAccountClick}
              className="flex items-center gap-3.5 min-w-0 text-left cursor-pointer group hover:opacity-90 transition-opacity"
            >
              <div
                className={cn(
                  "h-11 w-11 rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden",
                  profile?.logo_url
                    ? "bg-white border border-white/10 p-0.5"
                    : "bg-white/10 border border-white/5 p-2"
                )}
              >
                <img
                  src={profile?.logo_url || "/assets/logo-van360.webp"}
                  alt={profile?.logo_url ? displayName : "Van360"}
                  className={cn(
                    "h-full w-full object-contain",
                    !profile?.logo_url && "brightness-0 invert"
                  )}
                />
              </div>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[16px] font-bold text-white leading-tight truncate">
                  {displayName}
                </span>
                <div className="flex items-center">
                  <span className="text-[12px] text-slate-400 font-medium">{statusLabel}</span>
                </div>
              </div>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] overflow-y-auto scrollbar-hide">
            <AppSidebar
              role={role}
              onLinkClick={() => setIsMobileMenuOpen(false)}
              excludeBottomNavItems
              isSubscriptionBlocked={isSubscriptionBlocked}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AppLayout() {
  const { user, loading: loadingSession } = useSession();
  const { isLoading } = useProfile(user?.id);


  // Bloquear indexação de todas as páginas protegidas (área logada)
  useSEO({
    noindex: true,
  });

  if (loadingSession || isLoading) return <InitialLoading />;

  if (!user) return null;

  return (
    <PrivacyProvider>
      <AppLayoutContent role={UserType.MOTORISTA} />
    </PrivacyProvider>
  );
}
