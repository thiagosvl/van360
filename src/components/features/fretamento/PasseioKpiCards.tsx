import { memo } from "react";
import { formatCurrency } from "@/utils/formatters";
import { Users, CheckCircle2, DollarSign, Wallet } from "lucide-react";
import type { FretamentoDetalhesCalculado } from "@/hooks/business/useFretamentoCalculations";

interface PasseioKpiCardsProps {
  calculados: FretamentoDetalhesCalculado;
}

export const PasseioKpiCards = memo(function PasseioKpiCards({
  calculados,
}: PasseioKpiCardsProps) {
  const vagasLabel =
    calculados.vagasRestantes !== null
      ? calculados.vagasRestantes === 0
        ? "Lotado"
        : `${calculados.vagasRestantes} livres`
      : "Abertas";

  return (
    <div className="-mx-4 px-4 py-1 sm:mx-0 sm:px-0 sm:py-0 overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible touch-pan-x">
      <div className="flex items-stretch gap-2.5 sm:gap-3 w-max sm:w-full sm:grid sm:grid-cols-4">
        {/* Vagas */}
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Vagas e Ocupação"
            >
              Vagas
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <span className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
              {calculados.vagas_ocupadas}
              <span className="text-xs font-normal text-[#737373] ml-1">
                /{calculados.vagas_totais ?? "∞"}
              </span>
            </span>
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              {vagasLabel}
            </span>
          </div>
        </div>

        {/* Arrecadado */}
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Valores já recebidos"
            >
              Arrecadado
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <span className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
              {formatCurrency(calculados.totalPagoParticipantes)}
            </span>
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              {calculados.participantesPagosCount} pago(s)
            </span>
          </div>
        </div>

        {/* A Receber */}
        <div className="p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white border border-[#e5e5e5] text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-[200px] min-w-[200px] sm:w-auto sm:min-w-0 shrink-0 sm:shrink overflow-hidden flex flex-col justify-between gap-3 select-none">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span
              className="text-[11px] sm:text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em] truncate min-w-0 flex-1"
              title="Valores pendentes"
            >
              A Receber
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0">
              <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            <span className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none truncate">
              {formatCurrency(calculados.totalPendenteParticipantes)}
            </span>
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              {calculados.participantesPendentesCount} aberto(s)
            </span>
          </div>
        </div>

        {/* Lucro Previsto */}
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
            <span
              className={`text-xl sm:text-2xl font-semibold tracking-tight leading-none truncate ${
                calculados.lucroLiquido > 0
                  ? "text-emerald-700"
                  : calculados.lucroLiquido < 0
                    ? "text-red-600"
                    : "text-[#0a0a0a]"
              }`}
            >
              {formatCurrency(calculados.lucroLiquido)}
            </span>
            <span className="hidden lg:inline-block text-[11px] sm:text-xs font-normal text-[#737373] shrink-0">
              Previsto - Custos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
