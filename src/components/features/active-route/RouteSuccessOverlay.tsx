import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";

interface RouteSuccessOverlayProps {
  onNavigate: () => void;
}

export function RouteSuccessOverlay({ onNavigate }: RouteSuccessOverlayProps) {
  useEffect(() => {
    const duration = 0.35 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 45,
        origin: { x: 0 },
        colors: ["#2563eb", "#f59e0b", "#10b981", "#0b1a2e"],
        zIndex: 99999,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 45,
        origin: { x: 1 },
        colors: ["#2563eb", "#f59e0b", "#10b981", "#0b1a2e"],
        zIndex: 99999,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b1a2e]/95 backdrop-blur-md text-white p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center animate-ping absolute inset-0" />
        <div className="w-24 h-24 bg-emerald-500/80 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10">
          <CircleCheckBig className="w-12 h-12" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">
        Rota Finalizada com Sucesso!
      </h2>

      <p className="text-sm font-normal text-white/70 text-center max-w-xs mb-8 leading-relaxed">
        Todas as paradas foram realizadas. Excelente trabalho hoje!
      </p>

      <div className="w-full max-w-xs text-center">
        <Button
          type="button"
          onClick={onNavigate}
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-[18px] shadow-xs border-none cursor-pointer transition-all active:scale-95 flex items-center justify-center"
        >
          Voltar para Rotas
        </Button>
      </div>
    </div>
  );
}
