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
    <div className="flex items-center justify-between bg-[#1a3a5c] h-[52px] px-1.5 rounded-[1.25rem] shadow-lg border border-white/5 max-w-md mx-auto w-full md:w-auto transition-all duration-300">
      <button
        disabled={disabled}
        onClick={handlePrevious}
        className={cn(
          "w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90 duration-200 disabled:opacity-20",
          disabled && "cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-[22px] w-[22px]" />
      </button>

      <div className="text-center select-none px-4">
        <p className={cn(
          "font-headline font-bold text-[15px] sm:text-[16px] text-white tracking-tight whitespace-nowrap",
          disabled && "opacity-50"
        )}>
          {meses[mes - 1]} {ano}
        </p>
      </div>

      <button
        disabled={disabled}
        onClick={handleNext}
        className={cn(
          "w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90 duration-200 disabled:opacity-20",
          disabled && "cursor-not-allowed"
        )}
      >
        <ChevronRight className="h-[22px] w-[22px]" />
      </button>
    </div>
  );
}
