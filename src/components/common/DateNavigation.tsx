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

      const desiredLeft = (containerWidth - activeTabWidth) / 2;
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
      {showYear && (
        <div className="flex items-center gap-0.5 bg-white border border-[#e5e5e5] rounded-[18px] px-2 py-0.5 shrink-0 h-9">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onNavigate(mes, ano - 1)}
            className={cn(
              "p-1 text-[#737373] hover:text-[#0a0a0a] transition-colors rounded-[10px] hover:bg-[#f5f5f5]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title="Ano anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-[#0a0a0a] px-1 select-none tracking-tight">
            {ano}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onNavigate(mes, ano + 1)}
            className={cn(
              "p-1 text-[#737373] hover:text-[#0a0a0a] transition-colors rounded-[10px] hover:bg-[#f5f5f5]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title="Próximo ano"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-1.5 bg-transparent p-0 justify-start overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-auto pb-0.5 w-full scroll-smooth"
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
                "rounded-[18px] px-3.5 py-1 text-xs font-medium transition-all whitespace-nowrap shrink-0 h-9 flex items-center justify-center cursor-pointer",
                isSelected
                  ? "bg-primary/10 text-primary border border-primary/20 font-semibold shadow-2xs"
                  : "bg-white text-[#737373] hover:text-[#0a0a0a] hover:bg-[#fafafa] border border-[#e5e5e5]",
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
