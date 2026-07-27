import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { monthNamesInBR as MESES } from "@/utils/dateUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigationProps {
  mes: number;
  ano: number;
  onNavigate: (mes: number, ano: number) => void;
  disabled?: boolean;
  showYear?: boolean;
}

export function DateNavigation({ mes, ano, onNavigate, disabled, showYear = true }: DateNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const centerActiveTab = () => {
      const container = scrollContainerRef.current;
      const activeTab = activeTabRef.current;

      if (!container || !activeTab) return;

      const containerRect = container.getBoundingClientRect();
      const activeTabRect = activeTab.getBoundingClientRect();

      const containerWidth = container.clientWidth;
      const activeTabWidth = activeTab.offsetWidth;

      // Posição visual desejada da borda esquerda da aba ativa para centralizá-la no container
      const desiredLeft = (containerWidth - activeTabWidth) / 2;
      // Posição visual atual da borda esquerda da aba ativa em relação ao container
      const currentLeft = activeTabRect.left - containerRect.left;

      const diff = currentLeft - desiredLeft;

      container.scrollTo({
        left: container.scrollLeft + diff,
        behavior: "smooth",
      });
    };

    centerActiveTab();
    const timeoutId = setTimeout(centerActiveTab, 50);

    window.addEventListener("resize", centerActiveTab);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", centerActiveTab);
    };
  }, [mes, ano]);

  return (
    <div className="w-full flex items-center gap-2 max-w-full overflow-hidden py-1 select-none">
      {/* Seletor de Ano em Pílula */}
      {showYear && (
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-sm shrink-0 h-8">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onNavigate(mes, ano - 1)}
            className={cn(
              "p-0.5 text-slate-500 hover:text-[#1a3a5c] transition-colors rounded-full hover:bg-slate-100",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title="Ano anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-[#1a3a5c] px-0.5 select-none tracking-tight">
            {ano}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onNavigate(mes, ano + 1)}
            className={cn(
              "p-0.5 text-slate-500 hover:text-[#1a3a5c] transition-colors rounded-full hover:bg-slate-100",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title="Próximo ano"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Listagem dos Meses */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-auto pb-0.5 w-full scroll-smooth"
      >
        {MESES.map((nomeMes, index) => {
          const monthNum = index + 1;
          const isSelected = mes === monthNum;

          return (
            <button
              key={monthNum}
              ref={isSelected ? activeTabRef : null}
              type="button"
              disabled={disabled}
              onClick={() => onNavigate(monthNum, ano)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all shadow-sm whitespace-nowrap shrink-0 h-8 flex items-center justify-center",
                isSelected
                  ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {nomeMes}
            </button>
          );
        })}
      </div>
    </div>
  );
}
