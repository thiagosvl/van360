import { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.add("dark");

    const win = window as unknown as { clarity?: (action: string, ...args: unknown[]) => void };
    if (typeof win.clarity === "function") {
      win.clarity("stop");
    }

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

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
      <div className="dark flex min-h-screen bg-background text-foreground font-body selection:bg-primary/20 selection:text-primary">
        <div className="hidden lg:block shrink-0 sticky top-0 h-screen self-start z-50">
          <AdminSidebar />
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent 
            ref={sheetRef}
            side="left" 
            className="p-0 border-r-0 w-72 bg-sidebar text-sidebar-foreground [&>button]:text-sidebar-foreground [&>button]:hover:text-sidebar-foreground/80"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AdminSidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar onMenuToggle={() => setIsMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-10 animate-in fade-in duration-700">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
}

