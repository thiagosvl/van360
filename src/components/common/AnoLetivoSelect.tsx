import { useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNowBR } from "@/utils/dateUtils";

interface AnoLetivoSelectProps {
  ano: number;
  onChangeAno: (ano: number) => void;
  anosDisponiveis?: number[];
  className?: string;
  label?: string;
  isLoading?: boolean;
  renderLabel?: (ano: number) => React.ReactNode;
}

export function AnoLetivoSelect({
  ano,
  onChangeAno,
  anosDisponiveis,
  className,
  label = "Ano Letivo",
  isLoading = false,
  renderLabel,
}: AnoLetivoSelectProps) {
  const currentYear = getNowBR().getFullYear();

  const anos = useMemo(() => {
    const base =
      anosDisponiveis && anosDisponiveis.length > 0
        ? anosDisponiveis
        : [currentYear - 1, currentYear, currentYear + 1];
    return Array.from(new Set([...base, ano])).sort((a, b) => a - b);
  }, [anosDisponiveis, ano, currentYear]);

  const currentIndex = anos.indexOf(ano);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < anos.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      onChangeAno(anos[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onChangeAno(anos[currentIndex + 1]);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 bg-white border border-[#e5e5e5] rounded-[18px] p-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] select-none shrink-0",
        className
      )}
    >
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canGoPrev || isLoading}
        title="Ano anterior"
        className="h-8 w-8 rounded-[14px] flex items-center justify-center text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 px-1.5 sm:px-2 min-w-0">
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-primary shrink-0 animate-spin" />
        ) : (
          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
        )}
        {renderLabel ? (
          renderLabel(ano)
        ) : (
          <span className="text-xs font-bold text-[#0a0a0a] tracking-tight whitespace-nowrap">
            {label === "Ano Letivo" ? (
              <>
                Ano <span className="hidden min-[380px]:inline">Letivo </span>
              </>
            ) : label ? (
              `${label} `
            ) : null}
            {ano}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext || isLoading}
        title="Próximo ano"
        className="h-8 w-8 rounded-[14px] flex items-center justify-center text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
