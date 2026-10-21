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
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="pr-8">
        <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight line-clamp-2 break-words w-full min-w-0 capitalize">
          {obterDescricaoFormatadaGasto(gasto)}
        </h2>
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 w-full min-w-0 text-[#737373]">
        <TrendingDown className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] leading-none truncate">
          {metadata.label}{veiculoInfo}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e5e5e5]/80 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 text-[#737373]">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium truncate">
            {formatDateToBR(gasto.data)}
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight leading-none">
            {formatCurrency(gasto.valor)}
          </span>
        </div>
      </div>
    </div>
  );
};
