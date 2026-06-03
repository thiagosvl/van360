import { AlertOctagon } from "lucide-react";

interface PastDueBannerProps {
  onRegularize?: () => void;
}

export const PastDueBanner = ({ onRegularize }: PastDueBannerProps) => {
  return (
    <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0">
        <AlertOctagon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-rose-900">Mensalidade em Atraso</p>
        <p className="text-[11px] text-rose-700">
          Sua assinatura não foi renovada. Regularize agora para evitar o bloqueio do seu acesso.
        </p>
      </div>
      {onRegularize ? (
        <button
          onClick={onRegularize}
          className="px-4 py-2 bg-rose-600 text-white text-[11px] font-bold rounded-xl hover:bg-rose-600/90 transition-all shadow-sm shadow-rose-200 shrink-0 active:scale-95"
        >
          Regularizar
        </button>
      ) : (
        <div className="px-4 py-2 bg-rose-600/50 text-white text-[11px] font-bold rounded-xl shrink-0 opacity-50">
          Regularizar
        </div>
      )}
    </div>
  );
};
