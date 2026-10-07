import { useEffect } from "react";
import { safeCloseDialog } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { WhatsAppShowcaseEmulator } from "@/components/features/demonstracoes/WhatsAppShowcaseEmulator";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { QuemUsaRecomendaCard } from "@/components/features/subscription/QuemUsaRecomendaCard";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

export interface ShowcaseTransporteEscolarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRegister?: () => void;
}

export function ShowcaseTransporteEscolarDialog({
  isOpen,
  onClose,
  onNavigateToRegister,
}: ShowcaseTransporteEscolarDialogProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        safeCloseDialog(onClose);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRegisterClick = () => {
    safeCloseDialog(() => {
      onClose();
      if (onNavigateToRegister) {
        onNavigateToRegister();
      } else {
        navigate(ROUTES.PUBLIC.REGISTER, { state: { fromSplash: true } });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-white text-slate-800 px-4 min-[360px]:px-5 sm:px-6 overflow-y-auto animate-in fade-in duration-200 pt-[calc(var(--safe-area-top,0px)+1.25rem)] pb-8">
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
        <div className="flex items-start justify-between gap-3 mb-4 w-full">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="font-bold text-[#1a3a5c] text-[18px] sm:text-[20px] tracking-tight leading-tight flex items-center gap-2">
              <WhatsAppIcon className="w-5 h-5 text-[#25D366] shrink-0" />
              <span>Veja o que os pais recebem no WhatsApp</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => safeCloseDialog(onClose)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer -mt-0.5"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <WhatsAppShowcaseEmulator driverName="Tio da Van" layoutMode="tabs" className="w-full" />

        <QuemUsaRecomendaCard className="mt-6" />

        <div className="w-full h-[calc(var(--safe-area-bottom,0px)+6.5rem)] shrink-0 pointer-events-none" aria-hidden="true" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[calc(var(--safe-area-bottom,0px)+0.75rem)] bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <Button
            type="button"
            onClick={handleRegisterClick}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 border-none cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            <span>Criar conta grátis</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShowcaseTransporteEscolarDialog;
