import { AlertTriangle } from "lucide-react";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe?: () => void;
}

export const TrialBanner = ({ daysLeft, onSubscribe }: TrialBannerProps) => {
  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-amber-900">Período de Teste Gratuito</p>
        <p className="text-[11px] text-amber-700">
          {daysLeft > 0 ? (
            <>Você tem <span className="font-bold">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span> restante{daysLeft === 1 ? '' : 's'}.</>
          ) : (
            <>Hoje é o seu <span className="font-bold">último dia</span> de teste gratuito!</>
          )}
          {" "}Assine agora para manter seu acesso completo!
        </p>
      </div>
      {onSubscribe ? (
        <button
          onClick={onSubscribe}
          className="px-4 py-2 bg-amber-600 text-white text-[11px] font-bold rounded-xl hover:bg-amber-600/90 transition-all shadow-sm shadow-amber-200 shrink-0 active:scale-95"
        >
          Assinar
        </button>
      ) : (
        <div className="px-4 py-2 bg-amber-600/50 text-white text-[11px] font-bold rounded-xl shrink-0 opacity-50">
          Assinar
        </div>
      )}
    </div>
  );
};
