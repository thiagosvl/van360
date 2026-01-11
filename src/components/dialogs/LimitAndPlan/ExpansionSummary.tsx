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
    <div className="bg-violet-50/60 rounded-xl p-4 border border-violet-100 space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 font-medium">Capacidade</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 line-through decoration-gray-400/50 text-xs">
            {currentLimit}
          </span>
          <ChevronRight className="w-3 h-3 text-violet-400" />
          <span className="font-bold text-violet-700">
            {newLimit} Passageiros
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 font-medium">Próxima Mensalidade</span>
        <span className="font-bold text-gray-900">
          {formatCurrency(nextMonthlyPrice)}
        </span>
      </div>

      <div className="h-px bg-violet-200/50 my-1" />

      <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-violet-100/50">
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">
            Pagar Agora
          </span>
          <span className="text-[10px] text-gray-500 leading-tight">
            Diferença Proporcional
          </span>
        </div>
        <span className="text-xl font-extrabold text-violet-700">
          {formatCurrency(proRataAmount)}
        </span>
      </div>
    </div>
  );
}
