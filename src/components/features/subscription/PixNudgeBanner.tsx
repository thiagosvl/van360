import { useState, useEffect } from "react";
import { KeyRound, X } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";

interface PixNudgeBannerProps {
  hasPix: boolean;
}

const STORAGE_KEY = "van360_dismissed_pix_banner";

export const PixNudgeBanner = ({ hasPix }: PixNudgeBannerProps) => {
  const { openEditarPixDialog } = useLayout();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== "true") {
      setIsDismissed(false);
    }
  }, []);

  if (hasPix || isDismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  return (
    <div className="relative mb-6 bg-blue-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 sm:pr-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 shadow-xs">
      {/* Botao de Fechar (X) absolutizado no canto */}
      <button
        type="button"
        onClick={handleDismiss}
        title="Fechar aviso"
        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-lg text-blue-400 hover:text-blue-700 hover:bg-blue-100/60 transition-colors z-10"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Conteudo */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 w-full pr-6 sm:pr-0">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0 border border-blue-200/50 mt-0.5 sm:mt-0">
          <KeyRound className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs font-bold text-blue-900">Facilite o pagamento para os pais</p>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Cadastre sua chave Pix. Ela será enviada automaticamente junto com os lembretes de cobrança no WhatsApp dos responsáveis.
          </p>
        </div>
      </div>

      {/* Botao de Acao (100% no mobile, largura automatica no desktop com margem de respiro para o X) */}
      <button
        type="button"
        onClick={openEditarPixDialog}
        className="h-11 px-4 md:px-5 bg-blue-600 text-white text-xs sm:text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xs shrink-0 active:scale-95 w-full sm:w-auto flex justify-center items-center"
      >
        Configurar Chave Pix
      </button>
    </div>
  );
};
