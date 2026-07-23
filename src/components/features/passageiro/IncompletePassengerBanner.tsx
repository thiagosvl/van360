import { AlertCircle } from "lucide-react";

interface IncompletePassengerBannerProps {
  onEdit: () => void;
}

export const IncompletePassengerBanner = ({ onEdit }: IncompletePassengerBannerProps) => {
  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-900">Cadastro Incompleto</p>
          <p className="text-[11px] text-amber-700">
            Para que as cobranças automáticas funcionem, finalize o preenchimento do cadastro do passageiro.
          </p>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="h-11 px-4 md:px-5 bg-amber-500 text-white text-[13px] font-bold rounded-xl hover:bg-amber-600/90 transition-all shadow-sm shadow-amber-200/50 shrink-0 active:scale-95 w-full sm:w-auto flex justify-center items-center"
      >
        Completar Cadastro
      </button>
    </div>
  );
};
