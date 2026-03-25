import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { meses } from "@/utils/formatters";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl shadow-diff-shadow max-w-md mx-auto w-full md:w-auto">
      <button
        disabled={disabled}
        onClick={handlePrevious}
        className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:scale-90 duration-150 disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="text-center">
        <p className={cn(
          "font-headline font-bold text-lg text-primary",
          disabled && "text-gray-400 opacity-50"
        )}>
          {meses[mes - 1]} {ano}
        </p>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">
          Fluxo Financeiro Mensal
        </p>
      </div>

      <button
        disabled={disabled}
        onClick={handleNext}
        className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors active:scale-90 duration-150 disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
