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
  labelTotal?: string;
  labelRecebido?: string;
  labelPendente?: string;
}

export function FinancialDashboardCard({
  totalEsperado,
  recebido,
  pendente,
  atrasado,
  loading,
  showPrivacyToggle = true,
  labelTotal = "Total Esperado",
  labelRecebido = "Recebido",
  labelPendente = "A receber",
}: FinancialDashboardCardProps) {
  const { hideValues, toggleHideValues, formatPrivateCurrency } = usePrivacy();

  const recebidoPercent = totalEsperado > 0 ? (recebido / totalEsperado) * 100 : 0;
  const atrasadoPercent = totalEsperado > 0 && atrasado ? (atrasado / totalEsperado) * 100 : 0;
  const pendentePercent = totalEsperado > 0 ? (Math.max(0, pendente - (atrasado || 0)) / totalEsperado) * 100 : 0;

  const getDynamicFontSize = (val: number) => {
    const str = formatPrivateCurrency(val);
    if (str.length > 13) return "text-[15px] sm:text-[18px] md:text-[20px] lg:text-[22px]";
    if (str.length > 10) return "text-[16px] sm:text-[20px] md:text-[22px] lg:text-[24px]";
    return "text-[18px] sm:text-[22px] md:text-[24px]";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] p-4 sm:p-5 lg:p-6 shadow-xs border border-[#e5e5e5] flex flex-col justify-between gap-5 h-full animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end mb-1">
            <div className="h-4 bg-[#f5f5f5] rounded-full w-24"></div>
            <div className="h-5 bg-[#f5f5f5] rounded-full w-32"></div>
          </div>
          <div className="h-2 w-full bg-[#f5f5f5] rounded-full"></div>
        </div>

        <div className="flex flex-col mt-1">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 bg-[#f5f5f5] rounded-full w-16 mb-0.5"></div>
              <div className="h-6 bg-[#f5f5f5] rounded-full w-28"></div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="h-3.5 bg-[#f5f5f5] rounded-full w-16 mb-0.5"></div>
              <div className="h-6 bg-[#f5f5f5] rounded-full w-28"></div>
            </div>
          </div>

          <div className="flex w-full h-2 mt-2.5 gap-1">
            <div className="h-full w-1/3 bg-[#f5f5f5] rounded-full"></div>
            <div className="h-full w-2/3 bg-[#f5f5f5] rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-4 sm:p-5 lg:p-6 shadow-xs border border-[#e5e5e5] flex flex-col justify-between gap-4 sm:gap-5 h-full">
      {/* Top Row: Total Esperado + Botão Olho */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-xs sm:text-[13px] font-medium text-[#737373]">{labelTotal}</span>
          <div className="flex items-center gap-2">
            <span className="text-[15px] sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
              {formatPrivateCurrency(totalEsperado)}
            </span>
            {showPrivacyToggle && (
              <button
                type="button"
                onClick={toggleHideValues}
                className="p-1.5 text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors rounded-[10px] focus:outline-hidden active:scale-95 cursor-pointer -mr-1"
                title={hideValues ? "Mostrar valores" : "Ocultar valores"}
                aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}
              >
                {hideValues ? <EyeOff className="w-4 h-4 text-[#737373]" /> : <Eye className="w-4 h-4 text-[#737373]" />}
              </button>
            )}
          </div>
        </div>
        {/* Progress Bar Total */}
        <div className="h-2 w-full bg-primary/15 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${recebidoPercent}%` }} />
        </div>
      </div>

      {/* Bottom Row: Recebido and Pendente */}
      <div className="flex flex-col mt-1">
        <div className="flex justify-between items-end">
          {/* Recebido */}
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-medium text-[#737373] mb-1">{labelRecebido}</span>
            <span className={cn(getDynamicFontSize(recebido), "font-semibold text-[#0a0a0a] tracking-tight leading-none")}>
              {formatPrivateCurrency(recebido)}
            </span>
          </div>

          {/* Pendente */}
          <div className="flex flex-col items-end">
            <span className="text-[11px] sm:text-xs font-medium text-[#737373] mb-1">{labelPendente}</span>
            <span className={cn(getDynamicFontSize(pendente), "font-semibold text-[#0a0a0a] tracking-tight leading-none")}>
              {formatPrivateCurrency(pendente)}
            </span>
          </div>
        </div>

        {/* Proportional Bar */}
        <div className="flex w-full h-2 mt-2.5 sm:mt-3 gap-1">
          {recebidoPercent > 0 && (
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${recebidoPercent}%` }} />
          )}
          {pendentePercent > 0 && (
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pendentePercent}%` }} />
          )}
          {atrasadoPercent > 0 && (
            <div className="h-full bg-[#e7000b] rounded-full transition-all duration-500" style={{ width: `${atrasadoPercent}%` }} />
          )}
        </div>

        {atrasado && atrasado > 0 ? (
          <div className="flex justify-end mt-1.5">
            <span className="text-[10px] sm:text-xs font-medium text-[#e7000b] leading-none">
              {formatPrivateCurrency(atrasado)} em atraso
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
