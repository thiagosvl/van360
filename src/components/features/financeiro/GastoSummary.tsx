import { Gasto, GASTO_CATEGORIA_LABELS } from "@/types/gasto";
import { GastoCategoria } from "@/types/enums";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/domain";
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
  // Se o gasto tem veículo, mostramos a placa no contexto superior
  const veiculoInfo = veiculoPlaca ? ` • ${formatarPlacaExibicao(veiculoPlaca)}` : (gasto.veiculo?.placa ? ` • ${formatarPlacaExibicao(gasto.veiculo.placa)}` : "");

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline Categoria + Contexto Veículo */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider leading-none truncate pr-2">
          {GASTO_CATEGORIA_LABELS[gasto.categoria as GastoCategoria] || gasto.categoria}{veiculoInfo}
        </p>

        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100/60 text-red-600 dark:bg-red-950/30">
          <TrendingDown className="h-3 w-3" />
        </div>
      </div>

      {/* LINHA 2: Título (Descrição) */}
      <h1 className="text-[22px] font-semibold text-[#1a3a5c] dark:text-zinc-100 leading-tight truncate capitalize mt-1">
        {gasto.descricao}
      </h1>

      {/* LINHA 3: Footer com Data e Valor */}
      <div className="flex items-end justify-between mt-5 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-[12px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
            {formatDateToBR(gasto.data)}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-[20px] font-semibold text-[#1a3a5c] dark:text-zinc-100 tracking-tight leading-none">
            {formatCurrency(gasto.valor)}
          </span>
        </div>
      </div>
    </div>
  );
};
