import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnoLetivoSelectProps {
  ano: number;
  onChangeAno: (ano: number) => void;
  anosDisponiveis?: number[];
  className?: string;
  label?: string;
}

export function AnoLetivoSelect({
  ano,
  onChangeAno,
  anosDisponiveis,
  className,
  label = "Ano Letivo",
}: AnoLetivoSelectProps) {
  const currentYear = new Date().getFullYear();
  const anos = anosDisponiveis || [currentYear - 1, currentYear, currentYear + 1];

  const minAno = Math.min(...anos);
  const maxAno = Math.max(...anos);

  const handlePrev = () => {
    if (ano > minAno) {
      onChangeAno(ano - 1);
    }
  };

  const handleNext = () => {
    if (ano < maxAno) {
      onChangeAno(ano + 1);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={handlePrev}
        disabled={ano <= minAno}
        title="Ano anterior"
        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 px-2">
        <Calendar className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-bold text-slate-800 tracking-tight">
          {label ? `${label} ` : ""}
          {ano}
        </span>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={ano >= maxAno}
        title="Próximo ano"
        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
