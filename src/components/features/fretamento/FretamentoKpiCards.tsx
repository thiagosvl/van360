import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";
import { DollarSign, CheckCircle2, Clock } from "lucide-react";

interface FretamentoKpiCardsProps {
  totalFaturado: number;
  totalRecebido: number;
  totalAReceber: number;
  percentualRecebido: number;
  totalViagens: number;
  isLoading?: boolean;
}

export const FretamentoKpiCards = memo(function FretamentoKpiCards({
  totalFaturado,
  totalRecebido,
  totalAReceber,
  percentualRecebido,
  totalViagens,
  isLoading = false,
}: FretamentoKpiCardsProps) {
  return (
    <div className="-mx-4 px-4 py-1 sm:mx-0 sm:px-0 sm:py-0 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible touch-pan-x">
      <div className="flex items-stretch gap-2.5 sm:gap-3 w-max sm:w-full sm:grid sm:grid-cols-3">
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[210px] min-w-[210px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Total Previsto"
            >
              Total Previsto
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                {formatCurrency(totalFaturado)}
              </span>
            )}
            <span className="text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              {totalViagens} {totalViagens === 1 ? "viagem" : "viagens"}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[210px] min-w-[210px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Já Recebido"
            >
              Já Recebido
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                {formatCurrency(totalRecebido)}
              </span>
            )}
            <span className="text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              {percentualRecebido}% arrecadado
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[210px] min-w-[210px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="A Receber"
            >
              A Receber
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-28 rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
                {formatCurrency(totalAReceber)}
              </span>
            )}
            <span className="text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              Saldo pendente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
