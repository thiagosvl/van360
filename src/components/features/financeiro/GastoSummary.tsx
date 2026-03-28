import { Gasto } from "@/types/gasto";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/domain";
import {
  Bus,
  Calendar
} from "lucide-react";

interface GastoSummaryProps {
  gasto: Gasto;
  veiculoPlaca?: string | null;
}

export const GastoSummary = ({ gasto, veiculoPlaca }: GastoSummaryProps) => {
  const diaGasto = new Date(gasto.data).getUTCDate().toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-3 p-5 bg-white dark:bg-zinc-800/40 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">
      {/* Cabeçalho com Dia e Categoria */}
      <div className="flex justify-between items-start mb-0.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-10 w-10 bg-[#1a3a5c] text-white rounded-xl shrink-0 font-headline font-black text-sm">
            {diaGasto}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
              Categoria
            </p>
            <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-200 leading-tight">
              {gasto.categoria}
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className={`${gasto.valor > 9999 ? 'text-[13px]' : 'text-base'} font-headline font-bold text-[#1a3a5c] dark:text-zinc-100 tracking-tight leading-none pt-2`}>
            {formatCurrency(gasto.valor)}
          </p>
        </div>
      </div>

      {/* Descrição */}
      {gasto.descricao && (
        <div className="p-3 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl border border-slate-100/50 dark:border-zinc-800/50">
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
            {gasto.descricao}
          </p>
        </div>
      )}

      {/* Rodapé com Datas e Veículo */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-1.5 opacity-70">
          <Calendar className="h-3 w-3 text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {formatDateToBR(gasto.data)}
          </p>
        </div>

        <div className={`flex items-center gap-1.5 ${veiculoPlaca ? 'opacity-70' : 'opacity-40'}`}>
          <Bus className="h-3 w-3 text-slate-400" />
          <p className={`${veiculoPlaca ? 'text-[10px] font-black text-[#1a3a5c]' : 'text-[8.5px] font-bold text-slate-600'} dark:text-zinc-400 uppercase tracking-tighter`}>
            {veiculoPlaca ? formatarPlacaExibicao(veiculoPlaca) : "Veículo não especificado"}
          </p>
        </div>
      </div>
    </div>
  );
};
