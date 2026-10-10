import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, subtitle, children }: LegalLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#0a0a0a]">
      {/* Header Fixo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e5e5] shadow-xs h-14 md:h-16">
        <div className="max-w-[800px] mx-auto px-4 flex items-center h-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] hover:bg-[#e5e5e5] transition-colors group flex items-center gap-1.5 text-xs font-medium text-[#0a0a0a] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#737373] transition-transform group-hover:-translate-x-0.5" />
            <span>Voltar</span>
          </button>
          <div className="flex-1 flex justify-center mr-16 sm:mr-20">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-7 sm:h-8 w-auto select-none cursor-pointer"
              onClick={() => navigate(ROUTES.PUBLIC.ROOT)}
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-8 md:pt-28 md:pb-10 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0a0a0a] tracking-tight mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#737373] text-xs sm:text-sm font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="py-8 md:py-12 px-4 sm:px-6">
        <article className="max-w-[800px] mx-auto p-6 sm:p-10 md:p-12 bg-white rounded-[24px] shadow-xs border border-[#e5e5e5]">
          {children}
        </article>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-[#e5e5e5] bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <p className="text-[#737373] text-xs font-normal">
            © {new Date().getFullYear()} Van360. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
