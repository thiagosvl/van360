import { useRef } from "react";
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
import { useSEO } from "@/hooks/useSEO";
import { Outlet, useNavigate } from "react-router-dom";

const SWIPE_CLOSE_THRESHOLD = 100;

function AppLayoutContent({ role }: { role: "motorista" }) {
  const navigate = useNavigate();
  useAnalyticsInjector({ clarity: true, force: true });
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayout();

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
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-full w-72 flex-col border-r border-gray-100 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex h-20 items-center justify-center border-b border-gray-50 bg-slate-50/20">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-12 w-auto cursor-pointer"
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.HOME)}
          />
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
          className="w-[85%] sm:w-80 px-0 border-l border-gray-100 bg-white"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="px-6 pb-4 pt-6 border-b border-gray-50 bg-slate-50/50">
            <SheetTitle className="text-left">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Menu</span>
            </SheetTitle>
          </div>
          <div className="p-4 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
            <AppSidebar
              role={role}
              onLinkClick={() => setIsMobileMenuOpen(false)}
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
