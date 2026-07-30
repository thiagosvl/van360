import { Gasto } from "@/types/gasto";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { formatarPlacaExibicao, getCategoriaMetadata, obterDescricaoFormatadaGasto } from "@/utils/domain";
import { useGastoCategorias } from "@/hooks";
import {
  Calendar,
  Wallet,
  TrendingDown
} from "lucide-react";

interface GastoSummaryProps {
  gasto: Gasto;
  veiculoPlaca?: string | null;
}

export const GastoSummary = ({ gasto, veiculoPlaca }: GastoSummaryProps) => {
  const { data: categoriasData } = useGastoCategorias();
  const metadata = getCategoriaMetadata(gasto.categoria, categoriasData);

  // Se o gasto tem veículo, mostramos a placa no contexto superior
  const veiculoInfo = veiculoPlaca ? ` • ${formatarPlacaExibicao(veiculoPlaca)}` : (gasto.veiculo?.placa ? ` • ${formatarPlacaExibicao(gasto.veiculo.placa)}` : "");

  return (
    <div className="flex flex-col p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left w-full min-w-0 overflow-hidden">

      {/* LINHA 1: Overline Categoria + Contexto Veículo */}
      <div className="flex justify-between items-center mb-2 w-full min-w-0 gap-2">
        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider leading-none truncate min-w-0 flex-1">
          {metadata.label}{veiculoInfo}
        </p>

        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100/60 text-red-600 dark:bg-red-950/30 shrink-0">
          <TrendingDown className="h-3 w-3" />
        </div>
      </div>

      {/* LINHA 2: Título (Descrição) */}
      <div className="flex items-start gap-2 mt-0.5 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-[#1a3a5c] dark:text-zinc-100 leading-snug line-clamp-3 break-words w-full min-w-0 capitalize">
          {obterDescricaoFormatadaGasto(gasto)}
        </h1>
      </div>

      {/* LINHA 3: Footer com Data e Valor */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-[11px] sm:text-[12px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wide truncate">
            {formatDateToBR(gasto.data)}
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-lg sm:text-[20px] font-bold text-[#1a3a5c] dark:text-zinc-100 tracking-tight leading-none">
            {formatCurrency(gasto.valor)}
          </span>
        </div>
      </div>
    </div>
  );
};
