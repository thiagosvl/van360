import { Button } from "@/components/ui/button";
import { meses } from "@/utils/formatters";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigationProps {
  mes: number;
  ano: number;
  onNavigate: (mes: number, ano: number) => void;
}

export function DateNavigation({ mes, ano, onNavigate }: DateNavigationProps) {
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
    <div className="flex items-center justify-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto w-full md:w-auto">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-50"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2 min-w-[140px] justify-center">
        <CalendarDays className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          {meses[mes - 1]} {ano}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-50"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
