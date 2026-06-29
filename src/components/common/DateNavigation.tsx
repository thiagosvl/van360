import { cn } from "@/lib/utils";
import { monthNamesInBR as meses } from "@/utils/dateUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigationProps {
  mes: number;
  ano: number;
  onNavigate: (mes: number, ano: number) => void;
  disabled?: boolean;
}

export function DateNavigation({ mes, ano, onNavigate, disabled }: DateNavigationProps) {
  const handlePrevious = () => {
    if (mes === 1) {
      onNavigate(12, ano - 1);
    } else {
      onNavigate(mes - 1, ano);
    }
  };

  const handleNext = () => {
    if (mes === 12) {
      onNavigate(1, ano + 1);
    } else {
      onNavigate(mes + 1, ano);
    }
  };

  return (
    <div className="flex items-center justify-between bg-[#1a3a5c] min-h-[52px] px-1.5 rounded-[1.25rem] shadow-lg border border-white/5 max-w-md mx-auto w-full md:w-auto transition-all duration-300">
      <button
        disabled={disabled}
        onClick={handlePrevious}
        className={cn(
          "w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90 duration-200 disabled:opacity-20",
          disabled && "cursor-not-allowed"
        )}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-[22px] w-[22px]" />
      </button>

      <div className="flex flex-col items-center justify-center select-none px-4">
        <span className="text-[8px] font-medium text-white/65 uppercase tracking-[0.2em] mb-1">
          Mês selecionado
        </span>
        <p className={cn(
          "font-headline font-bold text-[15px] sm:text-[16px] text-white tracking-tight whitespace-nowrap leading-none",
          disabled && "opacity-50"
        )}>
          {meses[mes - 1]}/{ano.toString().slice(-2)}
        </p>
      </div>

      <button
        disabled={disabled}
        onClick={handleNext}
        className={cn(
          "w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90 duration-200 disabled:opacity-20",
          disabled && "cursor-not-allowed"
        )}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-[22px] w-[22px]" />
      </button>
    </div>
  );
}
