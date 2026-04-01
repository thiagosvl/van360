import { ROUTES } from "@/constants/routes";
import { PartyPopper } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function NativeWelcomeScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const continuedRef = useRef(false);

  const handleContinue = () => {
    if (continuedRef.current) return;
    continuedRef.current = true;
    // Limpar flag — AppGate volta a redirecionar normalmente
    sessionStorage.removeItem("van360_showing_welcome");
    navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
  };

  // Auto-redirect after 4 seconds with progress animation
  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / duration) * 100, 100));

      if (elapsed >= duration) {
        clearInterval(timer);
        handleContinue();
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a5c] to-[#0f2640] flex flex-col items-center justify-center px-6 text-center pt-[max(1.5rem,var(--safe-area-top))] pb-[max(1.5rem,var(--safe-area-bottom))]">
      <div className="flex flex-col items-center max-w-[320px]">
        <div className="w-20 h-20 rounded-full bg-[#f59e0b]/20 flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-[#f59e0b]" />
        </div>

        <h1 className="text-2xl font-black text-white mb-3">
          Bem-vindo ao Van360!
        </h1>

        <p className="text-white/70 text-base mb-8 leading-relaxed">
          Seu período de teste de 15 dias começou.
          <br />
          Vamos configurar sua van?
        </p>

        <button
          onClick={handleContinue}
          className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base py-4 rounded-xl shadow-[0_4px_16px_rgba(245,158,11,.35)] transition-all active:scale-[0.98] mb-4"
        >
          Começar →
        </button>

        {/* Progress bar sutil */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#f59e0b]/50 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
