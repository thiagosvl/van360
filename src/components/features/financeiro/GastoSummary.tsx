import { Gasto } from "@/types/gasto";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { formatarPlacaExibicao, getCategoriaMetadata, obterDescricaoFormatadaGasto } from "@/utils/domain";
import { useGastoCategorias } from "@/hooks";
import { Calendar, TrendingDown } from "lucide-react";

interface GastoSummaryProps {
  gasto: Gasto;
  veiculoPlaca?: string | null;
}

export const GastoSummary = ({ gasto, veiculoPlaca }: GastoSummaryProps) => {
  const { data: categoriasData } = useGastoCategorias();
  const metadata = getCategoriaMetadata(gasto.categoria, categoriasData);

  const veiculoInfo = veiculoPlaca
    ? ` • ${formatarPlacaExibicao(veiculoPlaca)}`
    : gasto.veiculo?.placa
      ? ` • ${formatarPlacaExibicao(gasto.veiculo.placa)}`
      : "";

  return (
    <div className="flex flex-col p-4 sm:p-5 bg-[#fafafa] rounded-[22px] border border-[#e5e5e5] shadow-2xs text-left w-full min-w-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2.5 w-full min-w-0 gap-2">
        <p className="text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em] leading-none truncate min-w-0 flex-1">
          {metadata.label}{veiculoInfo}
        </p>

        <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] shrink-0">
          <TrendingDown className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex items-start gap-2 mt-0.5 w-full min-w-0">
        <h3 className="text-base sm:text-lg font-semibold text-[#0a0a0a] leading-snug line-clamp-3 break-words w-full min-w-0 capitalize">
          {obterDescricaoFormatadaGasto(gasto)}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[#e5e5e5] w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 text-[#737373]">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium truncate">
            {formatDateToBR(gasto.data)}
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight leading-none">
            {formatCurrency(gasto.valor)}
          </span>
        </div>
      </div>
    </div>
  );
};
