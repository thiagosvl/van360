import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  useSEO({
    title: "Van360 — Você dirige. A gente organiza.",
    description: "Organize passageiros, mensalidades, contratos e recibos da sua van escolar. Tudo digital, tudo pelo celular.",
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a5c] to-[#0f2640] flex flex-col items-center justify-between px-6 py-12">
      {/* Top spacer */}
      <div />

      {/* Center: Logo + Headline */}
      <div className="flex flex-col items-center text-center">
        <img
          src="/assets/logo-van360.png"
          alt="Van360"
          className="w-[120px] h-[120px] object-contain drop-shadow-2xl mb-6 brightness-0 invert"
        />
        <p className="text-white/70 text-base font-medium max-w-[260px]">
          Você dirige. A gente organiza.
        </p>
      </div>

      {/* Bottom: Buttons */}
      <div className="w-full max-w-[320px] space-y-3 mb-8">
        <button
          onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
          className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base py-4 rounded-xl shadow-[0_4px_16px_rgba(245,158,11,.35)] transition-all active:scale-[0.98]"
        >
          Criar minha conta
        </button>
        <button
          onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
          className="w-full bg-transparent border-2 border-white/30 hover:border-white/50 text-white font-bold text-base py-4 rounded-xl transition-all active:scale-[0.98]"
        >
          Já tenho conta
        </button>
      </div>
    </div>
  );
}
