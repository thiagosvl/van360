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
        colors: ["#1a3a5c", "#f59e0b", "#10b981", "#3b82f6"],
        zIndex: 99999
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 45,
        origin: { x: 1 },
        colors: ["#1a3a5c", "#f59e0b", "#10b981", "#3b82f6"],
        zIndex: 99999
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md text-white p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center animate-ping absolute inset-0" />
        <div className="w-24 h-24 bg-emerald-500/70 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10">
          <CircleCheckBig className="w-12 h-12" />
        </div>
      </div>

      <h2 className="text-2xl font-black font-headline text-white text-center mb-2 tracking-tight">
        Rota Finalizada com Sucesso!
      </h2>

      <p className="text-sm font-medium text-slate-300 text-center max-w-xs mb-8 leading-relaxed">
        Todas as paradas foram realizadas. Excelente trabalho hoje!
      </p>

      <div className="w-full max-w-xs text-center">
        <Button
          type="button"
          onClick={onNavigate}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg border-none cursor-pointer transition-all active:scale-95 flex items-center justify-center"
        >
          Voltar para Rotas
        </Button>
      </div>
    </div>
  );
}
