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
    <div className="min-h-screen bg-slate-50 font-['Inter',sans-serif]">
      {/* Header Fixo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm h-14 md:h-16">
        <div className="max-w-[800px] mx-auto px-4 flex items-center h-full">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors group flex items-center gap-1 text-slate-500 hover:text-[#1a3a5c]"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium pr-1">Voltar</span>
          </button>
          <div className="flex-1 flex justify-center mr-10 sm:mr-14">
            <img
              src="/assets/logo-van360.png"
              alt="Van360"
              className="h-6 sm:h-7 w-auto select-none"
              onClick={() => navigate(ROUTES.PUBLIC.ROOT)}
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-8 md:pt-32 md:pb-12 bg-white border-b border-slate-100">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-black text-[#1a3a5c] tracking-tight mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-400 text-sm font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="py-12 md:py-16">
        <article className="max-w-[800px] mx-auto px-6 bg-white py-10 md:py-14 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,.04)] border border-slate-100">
          {children}
        </article>
      </main>

      {/* Simple Footer */}
      <footer className="py-10 text-center border-t border-slate-200 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Van360. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
