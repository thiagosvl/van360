import { useRef } from "react";
import { X } from "lucide-react";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { HelpSheet } from "@/components/features/HelpSheet";
import { InitialLoading } from "@/components/auth/InitialLoading";

import { ROUTES } from "@/constants/routes";
import { LayoutProvider } from "@/contexts/LayoutProvider";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { SUBSCRIPTION_STATUS_DETAILS } from "@/components/ui/SubscriptionStatusBadge";
import { SubscriptionStatus } from "@/types/enums";
import { formatShortName } from "@/utils/formatters";
import { useSEO } from "@/hooks/useSEO";
import { Outlet, useNavigate } from "react-router-dom";

const SWIPE_CLOSE_THRESHOLD = 100;

function AppLayoutContent({ role }: { role: "motorista" }) {
  useAnalyticsInjector({ clarity: true, force: true });
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayout();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { subscription } = useSubscriptionStatus(user?.id);
  const userInitial = profile?.nome?.charAt(0)?.toUpperCase();
  const displayName = profile?.apelido || formatShortName(profile?.nome);

  const statusLabel = subscription?.status
    ? SUBSCRIPTION_STATUS_DETAILS[subscription.status as SubscriptionStatus]?.label || "Motorista Parceiro"
    : "Carregando...";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fixo para mobile e desktop */}
      <AppNavbar role={role} />

      {/* Sidebar fixa apenas para Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-full w-72 flex-col border-r border-[#0b1a2e] bg-[#0b1a2e] shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex h-20 items-center justify-start px-6 border-b border-white/5 bg-transparent gap-4">
          <div className="h-12 w-12 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            {userInitial}
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[15px] font-bold text-white leading-tight truncate mb-1">
              {displayName}
            </span>
            <div className="flex items-center">
              <span className="text-[12px] text-slate-400 font-medium">{statusLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <AppSidebar role={role} />
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="pt-[calc(5.5rem+var(--safe-area-top))] sm:pt-[calc(6rem+var(--safe-area-top))] pb-[calc(6rem+var(--safe-area-bottom))] md:pb-12 px-4 sm:px-6 lg:px-10 md:ml-72 flex-1 transition-all duration-300">
        <Outlet />
      </main>

      {/* Navegação Mobile Inferior (Fixa no rodapé) */}
      <BottomNavbar />


      {/* Menu Lateral Mobile (Gatilhado pelo botão "Mais") */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          ref={sheetRef}
          side="right"
          className="w-[85%] sm:w-80 px-0 border-l border-[#0b1a2e] bg-[#0b1a2e]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="px-6 pb-6 pt-[max(2.5rem,env(safe-area-inset-top)+1rem)] flex items-center gap-4 relative">
            <SheetTitle className="sr-only">Menu de Opções</SheetTitle>
            <div className="h-14 w-14 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0 pr-6">
              <span className="text-[17px] font-bold text-white leading-tight truncate mb-1">
                {displayName}
              </span>
              <div className="flex items-center">
                <span className="text-[13px] text-slate-400 font-medium">{statusLabel}</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-[max(1rem,env(safe-area-inset-top)+0.5rem)] right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom)+1.5rem)] h-[calc(100dvh-140px)] overflow-y-auto scrollbar-hide">
            <AppSidebar
              role={role}
              onLinkClick={() => setIsMobileMenuOpen(false)}
              excludeBottomNavItems
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Central de Ajuda (Gatilhado pelo botão no Header) */}
      <HelpSheet />
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
    <LayoutProvider>
      <AppLayoutContent role="motorista" />
    </LayoutProvider>
  );
}
