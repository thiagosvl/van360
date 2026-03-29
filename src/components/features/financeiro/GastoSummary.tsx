import { Gasto } from "@/types/gasto";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/domain";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Wallet,
  Tag,
  Bus,
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
    <div className="flex flex-col p-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-950 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">
      
      {/* LINHA 1: Overline Categoria + Contexto Veículo */}
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none truncate pr-2">
          {gasto.categoria}{veiculoInfo}
        </p>
        
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30">
          <TrendingDown className="h-3 w-3" />
        </div>
      </div>

      {/* LINHA 2: Título (Descrição ou Categoria) */}
      <h1 className="text-[19px] font-black text-[#1a3a5c] dark:text-zinc-100 leading-tight tracking-tight truncate">
        {gasto.descricao || gasto.categoria}
      </h1>
      
      {/* Subtítulo: Badge de Categoria se estiver usando Descrição no título */}
      {gasto.descricao && (
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mt-0.5 leading-none">
          {gasto.categoria}
        </p>
      )}

      {/* LINHA 3: Footer com Valor e Data */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 grayscale-0 opacity-80">
          <Calendar className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-tighter">
            {formatDateToBR(gasto.data)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-red-500 opacity-60" />
          <span className="text-[14px] font-black text-red-600 dark:text-red-400 tracking-tight leading-none">
            - {formatCurrency(gasto.valor)}
          </span>
        </div>
      </div>
    </div>
  );
};
