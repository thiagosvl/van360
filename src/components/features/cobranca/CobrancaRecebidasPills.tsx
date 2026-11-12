import { cn } from "@/lib/utils";
import { CobrancaOrigemFiltro } from "@/types/enums";
import { formatCurrency } from "@/utils/formatters/currency";
import { Zap } from "lucide-react";

export interface CobrancaRecebidasOrigemResumo {
  totalCount: number;
  repasseCount: number;
  repasseValor: number;
  manualCount: number;
  manualValor: number;
}

interface CobrancaRecebidasPillsProps {
  activeOrigem: CobrancaOrigemFiltro;
  onSelectOrigem: (origem: CobrancaOrigemFiltro) => void;
  resumo: CobrancaRecebidasOrigemResumo;
}

interface OrigemPillItem {
  id: CobrancaOrigemFiltro;
  label: string;
  count: number;
  valor?: number;
  icon?: React.ComponentType<{ className?: string }>;
  activeClasses: string;
  activeBadgeClasses: string;
  iconClasses?: string;
}

export function CobrancaRecebidasPills({
  activeOrigem,
  onSelectOrigem,
  resumo,
}: CobrancaRecebidasPillsProps) {
  const pills: OrigemPillItem[] = [
    {
      id: CobrancaOrigemFiltro.TODAS,
      label: "Todas",
      count: resumo.totalCount,
      activeClasses: "bg-primary/10 text-primary border-primary/25 font-semibold shadow-xs",
      activeBadgeClasses: "bg-primary/20 text-primary font-bold",
    },
    {
      id: CobrancaOrigemFiltro.REPASSE,
      label: "Repasse",
      count: resumo.repasseCount,
      valor: resumo.repasseValor,
      icon: Zap,
      activeClasses: "bg-emerald-50 text-emerald-800 border-emerald-300/80 font-semibold shadow-xs",
      activeBadgeClasses: "bg-emerald-100/90 text-emerald-800 font-bold",
      iconClasses: "fill-current",
    },
    {
      id: CobrancaOrigemFiltro.MANUAL,
      label: "Manual",
      count: resumo.manualCount,
      valor: resumo.manualValor,
      activeClasses: "bg-[#f5f5f5] text-[#0a0a0a] border-[#0a0a0a]/25 font-semibold shadow-xs",
      activeBadgeClasses: "bg-white text-[#0a0a0a] border border-[#e5e5e5] font-bold",
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {pills.map((pill) => {
        const isSelected = activeOrigem === pill.id;
        const Icon = pill.icon;

        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelectOrigem(pill.id)}
            className={cn(
              "flex flex-shrink-0 items-center gap-2 rounded-[18px] px-3.5 h-9 text-xs transition-all border cursor-pointer",
              isSelected
                ? pill.activeClasses
                : "bg-white text-[#737373] hover:text-[#0a0a0a] border-[#e5e5e5] hover:bg-[#fafafa]"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isSelected ? pill.iconClasses : "text-emerald-600 fill-emerald-600"
                )}
              />
            )}
            <span>{pill.label}</span>
            {pill.valor !== undefined && pill.count > 0 && (
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  isSelected ? "opacity-90 font-semibold" : "text-[#737373] font-normal"
                )}
              >
                • {formatCurrency(pill.valor)}
              </span>
            )}
            <span
              className={cn(
                "rounded-[18px] px-2 py-0.5 text-[11px] leading-none inline-flex items-center gap-1",
                isSelected
                  ? pill.activeBadgeClasses
                  : "bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]"
              )}
            >
              <span>{pill.count}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
