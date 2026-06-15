import { useState, useRef } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getNowBR } from "@/utils/dateUtils";
import { LayoutProvider } from "@/contexts/LayoutProvider";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const currentTranslate = useRef(0);
  const SWIPE_CLOSE_THRESHOLD = 100;

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

    if (!isHorizontalSwipe.current || dx >= 0 || !sheetRef.current) return;

    currentTranslate.current = dx;
    sheetRef.current.style.transform = `translateX(${dx}px)`;
    sheetRef.current.style.transition = "none";
  };

  const handleTouchEnd = () => {
    if (!sheetRef.current) return;

    if (Math.abs(currentTranslate.current) > SWIPE_CLOSE_THRESHOLD) {
      const el = sheetRef.current;
      el.style.transition = "transform 0.1s ease-out";
      el.style.transform = "translateX(-100%)";
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
    <LayoutProvider>
      <div className="flex min-h-screen bg-[#f8fafc] font-body selection:bg-[#1a3a5c]/10 selection:text-[#1a3a5c]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar (Drawer) */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent 
            ref={sheetRef}
            side="left" 
            className="p-0 border-r-0 w-72 bg-[#1a3a5c] [&>button]:text-white [&>button]:hover:text-white/80"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AdminSidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar onMenuToggle={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-10 animate-in fade-in duration-700">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>

          {/* Optional Footer */}
          <footer className="px-6 pt-6 pb-[calc(1.5rem+var(--safe-area-bottom))] border-t border-slate-100 bg-white/50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Van360 © {getNowBR().getFullYear()} — Você dirige. A gente organiza.
            </p>
          </footer>
        </div>
      </div>
    </LayoutProvider>
  );
}

