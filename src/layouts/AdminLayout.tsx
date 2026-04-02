import { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-body selection:bg-[#1a3a5c]/10 selection:text-[#1a3a5c]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 border-r-0 w-72 bg-[#1a3a5c]">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onMenuToggle={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 p-6 lg:p-10 animate-in fade-in duration-700">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Optional Footer */}
        <footer className="px-6 py-6 border-t border-slate-100 bg-white/50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Van360 Ecosystem © {new Date().getFullYear()} — Plataforma de Gestão Inteligente
          </p>
        </footer>
      </div>
    </div>
  );
}
