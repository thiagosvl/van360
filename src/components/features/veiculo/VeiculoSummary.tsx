import { Veiculo } from "@/types/veiculo";
import { Bus, Users2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import { formatarPlacaExibicao } from "@/utils/domain";

interface VeiculoSummaryProps {
  veiculo: Veiculo;
}

export const VeiculoSummary = ({ veiculo }: VeiculoSummaryProps) => {
  return (
    <div className="flex flex-col gap-3 p-5 bg-white dark:bg-zinc-800/40 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">
      {/* Cabeçalho com Placa e Status */}
      <div className="flex justify-between items-start mb-0.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-10 w-10 bg-[#1a3a5c] text-white rounded-xl shrink-0">
            <Bus className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
              Veículo
            </p>
            <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-200 leading-tight">
              {formatarPlacaExibicao(veiculo.placa)}
            </h1>
          </div>
        </div>
      </div>

      {/* Marca e Modelo */}
      <div className="p-3 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl border border-slate-100/50 dark:border-zinc-800/50 flex flex-col gap-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          Marca / Modelo
        </p>
        <p className="text-sm text-slate-700 dark:text-zinc-300 font-bold leading-relaxed">
          {veiculo.marca} {veiculo.modelo}
        </p>
      </div>

      {/* Rodapé com Passageiros */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-1.5 ">
          <Users2 className="h-3 w-3 text-slate-400" />
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-black text-[#1a3a5c] dark:text-zinc-100 leading-none">
              {veiculo.passageiros_ativos_count ?? 0}
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none ml-1">
              Passageiros Ativos
            </p>
          </div>
        </div>
        <StatusBadge
          status={veiculo.ativo}
          className={cn(
            "font-bold text-[8px] h-3.5 px-1.5 rounded-sm border-none shadow-none uppercase tracking-widest leading-none",
            veiculo.ativo ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
          )}
        />
      </div>
    </div>
  );
};
