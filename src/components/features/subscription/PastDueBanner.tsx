import { AlertOctagon } from "lucide-react";

interface PastDueBannerProps {
  onRegularize?: () => void;
}

export const PastDueBanner = ({ onRegularize }: PastDueBannerProps) => {
  return (
    <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0">
          <AlertOctagon className="h-5 w-5" />
        </div>
        <div className="flex-1">
        <p className="text-xs font-bold text-rose-900">Assinatura em Atraso</p>
        <p className="text-[11px] text-rose-700">
          Sua assinatura não foi renovada. Regularize agora para evitar o bloqueio do seu acesso.
        </p>
      </div>
      </div>
      {onRegularize ? (
        <button
          onClick={onRegularize}
          className="h-10 px-5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600/90 transition-all shadow-md shadow-rose-200/50 shrink-0 active:scale-95 w-full sm:w-auto text-center flex justify-center items-center"
        >
          Regularizar
        </button>
      ) : (
        <div className="h-10 px-5 bg-rose-600/50 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shrink-0 opacity-50 w-full sm:w-auto text-center flex justify-center items-center cursor-not-allowed">
          Regularizar
        </div>
      )}
    </div>
  );
};
