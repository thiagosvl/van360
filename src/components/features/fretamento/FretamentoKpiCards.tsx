import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";
import { DollarSign, CheckCircle2, TrendingDown, Wallet } from "lucide-react";

interface FretamentoKpiCardsProps {
  totalFaturado: number;
  totalRecebido: number;
  totalAReceber: number;
  totalGastos?: number;
  lucroTotal?: number;
  percentualRecebido: number;
  totalViagens: number;
  isLoading?: boolean;
}

export const FretamentoKpiCards = memo(function FretamentoKpiCards({
  totalFaturado,
  totalRecebido,
  totalAReceber,
  totalGastos = 0,
  lucroTotal = 0,
  percentualRecebido,
  totalViagens,
  isLoading = false,
}: FretamentoKpiCardsProps) {
  return (
    <div className="-mx-4 px-4 py-1 sm:mx-0 sm:px-0 sm:py-0 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible touch-pan-x">
      <div className="flex items-stretch gap-2.5 sm:gap-3 w-max sm:w-full sm:grid sm:grid-cols-4">
        {/* Total Previsto */}
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Faturamento Previsto"
            >
              Faturamento
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <span className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                {formatCurrency(totalFaturado)}
              </span>
            )}
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              {totalViagens} {totalViagens === 1 ? "viagem" : "viagens"}
            </span>
          </div>
        </div>

        {/* Já Recebido */}
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Já Recebido"
            >
              Recebido
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <span className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                {formatCurrency(totalRecebido)}
              </span>
            )}
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              {percentualRecebido}%
            </span>
          </div>
        </div>

        {/* Gastos Totais em Viagens */}
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Gastos Totais nas Viagens"
            >
              Custos/Gastos
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <span className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                {formatCurrency(totalGastos)}
              </span>
            )}
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              Despesas
            </span>
          </div>
        </div>

        {/* Lucro Real Previsto */}
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Lucro Líquido Previsto"
            >
              Lucro Líquido
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shrink-0">
              <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <span
                className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none truncate ${
                  lucroTotal > 0 ? "text-emerald-700" : lucroTotal < 0 ? "text-red-600" : "text-[#0a0a0a]"
                }`}
              >
                {formatCurrency(lucroTotal)}
              </span>
            )}
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              Pendente: {formatCurrency(totalAReceber)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
