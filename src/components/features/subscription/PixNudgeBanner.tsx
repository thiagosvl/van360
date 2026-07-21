import { KeyRound } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";

interface PixNudgeBannerProps {
  hasPix: boolean;
}

export const PixNudgeBanner = ({ hasPix }: PixNudgeBannerProps) => {
  const { openEditarPixDialog } = useLayout();

  if (hasPix) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
          <KeyRound className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-blue-900">Facilite o pagamento para os pais</p>
          <p className="text-[11px] text-blue-700">
            Cadastre sua chave Pix. Ela será enviada automaticamente junto com os lembretes de cobrança no WhatsApp dos responsáveis.
          </p>
        </div>
      </div>
      <button
        onClick={openEditarPixDialog}
        className="h-11 px-4 md:px-5 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700/90 transition-all shadow-sm shadow-blue-200/50 shrink-0 active:scale-95 w-full sm:w-auto flex justify-center items-center"
      >
        Configurar Chave Pix
      </button>
    </div>
  );
};
