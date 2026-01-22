import { formatCurrency } from "@/utils/formatters/currency";
import { ChevronRight } from "lucide-react";

interface ExpansionSummaryProps {
  currentLimit: number;
  newLimit: number;
  nextMonthlyPrice: number;
  proRataAmount: number;
}

export function ExpansionSummary({
  currentLimit,
  newLimit,
  nextMonthlyPrice,
  proRataAmount,
}: ExpansionSummaryProps) {
  return (
    <div className="bg-violet-50/60 rounded-xl p-5 sm:p-4 border border-violet-100 space-y-4 sm:space-y-3">
      {/* Capacidade - Mobile First */}
      <div className="flex justify-between items-center gap-3">
        <span className="text-[13px] sm:text-sm text-gray-500 font-medium">Capacidade</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 line-through decoration-gray-400/50 text-[13px] sm:text-xs">
            {currentLimit}
          </span>
          <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3 text-violet-400" />
          <span className="font-bold text-violet-700 text-[15px] sm:text-sm">
            {newLimit} Passageiros
          </span>
        </div>
      </div>

      {/* Próxima Mensalidade - Mobile First */}
      <div className="flex justify-between items-center gap-3">
        <span className="text-[13px] sm:text-sm text-gray-500 font-medium">Próxima Mensalidade</span>
        <span className="font-bold text-gray-900 text-[15px] sm:text-sm">
          {formatCurrency(nextMonthlyPrice)}
        </span>
      </div>

      <div className="h-px bg-violet-200/50 my-1" />

      {/* Pagar Agora - Mobile First (destaque maior) */}
      <div className="flex justify-between items-center bg-white/50 p-3 sm:p-2 rounded-lg border border-violet-100/50">
        <div className="flex flex-col text-left">
          <span className="text-[13px] sm:text-xs font-bold text-violet-600 uppercase tracking-wide">
            Pagar Agora
          </span>
          <span className="text-[11px] sm:text-[10px] text-gray-500 leading-tight">
            Diferença Proporcional
          </span>
        </div>
        <span className="text-2xl sm:text-xl font-extrabold text-violet-700">
          {formatCurrency(proRataAmount)}
        </span>
      </div>
    </div>
  );
}
