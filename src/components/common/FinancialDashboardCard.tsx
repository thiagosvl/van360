import { cn } from "@/lib/utils";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { Eye, EyeOff } from "lucide-react";

interface FinancialDashboardCardProps {
  totalEsperado: number;
  recebido: number;
  pendente: number;
  atrasado?: number;
  loading?: boolean;
  showPrivacyToggle?: boolean;
}

export function FinancialDashboardCard({
  totalEsperado,
  recebido,
  pendente,
  atrasado,
  loading,
  showPrivacyToggle = true,
}: FinancialDashboardCardProps) {
  const { hideValues, toggleHideValues, formatPrivateCurrency } = usePrivacy();

  const recebidoPercent = totalEsperado > 0 ? (recebido / totalEsperado) * 100 : 0;
  const atrasadoPercent = totalEsperado > 0 && atrasado ? (atrasado / totalEsperado) * 100 : 0;
  const pendentePercent = totalEsperado > 0 ? ((pendente - (atrasado || 0)) / totalEsperado) * 100 : 0;

  const getDynamicFontSize = (val: number) => {
    const str = formatPrivateCurrency(val);
    if (str.length > 13) return "text-[14px] sm:text-[18px] md:text-[22px]";
    if (str.length > 10) return "text-[16px] sm:text-[20px] md:text-[24px]";
    return "text-[18px] sm:text-[22px] md:text-[24px]";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col gap-5 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end mb-1">
            <div className="h-4 bg-slate-100 rounded w-24"></div>
            <div className="h-5 bg-slate-100 rounded w-32"></div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full"></div>
        </div>

        <div className="flex flex-col mt-1">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 bg-slate-100 rounded w-16 mb-0.5"></div>
              <div className="h-6 bg-slate-100 rounded w-28"></div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="h-3.5 bg-slate-100 rounded w-16 mb-0.5"></div>
              <div className="h-6 bg-slate-100 rounded w-28"></div>
            </div>
          </div>

          <div className="flex w-full h-1.5 sm:h-2 mt-2 sm:mt-2.5 gap-1">
            <div className="h-full w-1/3 bg-slate-100 rounded-full"></div>
            <div className="h-full w-2/3 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100/50 flex flex-col gap-5">
      {/* Top Row: Total Esperado + Botão Olho */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[13px] font-medium text-slate-600">Total Esperado</span>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-slate-800">{formatPrivateCurrency(totalEsperado)}</span>
            {showPrivacyToggle && (
              <button
                type="button"
                onClick={toggleHideValues}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-lg focus:outline-hidden active:scale-95 cursor-pointer -mr-1"
                title={hideValues ? "Mostrar valores" : "Ocultar valores"}
                aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}
              >
                {hideValues ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
              </button>
            )}
          </div>
        </div>
        {/* Progress Bar Total */}
        <div className="h-2 w-full bg-[#dbeafe] rounded-full overflow-hidden">
          <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: `${recebidoPercent}%` }} />
        </div>
      </div>

      {/* Bottom Row: Recebido and Pendente */}
      <div className="flex flex-col mt-1">
        <div className="flex justify-between items-end">
          {/* Recebido */}
          <div className="flex flex-col">
            <span className="text-[12px] sm:text-[13px] font-medium text-slate-600 mb-0.5">Recebido</span>
            <span className={cn(getDynamicFontSize(recebido), "font-bold text-slate-800 tracking-tight leading-none")}>
              {formatPrivateCurrency(recebido)}
            </span>
          </div>

          {/* Pendente */}
          <div className="flex flex-col items-end">
            <span className="text-[12px] sm:text-[13px] font-medium text-slate-600 mb-0.5">Pendente</span>
            <span className={cn(getDynamicFontSize(pendente), "font-bold text-slate-800 tracking-tight leading-none")}>
              {formatPrivateCurrency(pendente)}
            </span>
            {atrasado && atrasado > 0 ? (
              <span className="text-[10px] sm:text-xs font-normal text-red-500 mt-1.5 leading-none">
                {formatPrivateCurrency(atrasado)} em atraso
              </span>
            ) : null}
          </div>
        </div>

        {/* Proportional Bar */}
        <div className="flex w-full h-1.5 sm:h-2 mt-2 sm:mt-2.5 gap-1">
          {recebidoPercent > 0 && (
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${recebidoPercent}%` }} />
          )}
          {pendentePercent > 0 && (
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pendentePercent}%` }} />
          )}
          {atrasadoPercent > 0 && (
            <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${atrasadoPercent}%` }} />
          )}
        </div>
      </div>
    </div>
  );
}
