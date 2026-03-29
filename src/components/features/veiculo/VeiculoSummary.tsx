import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain";
import { cn } from "@/lib/utils";
import {
  Bus,
  Activity,
  User,
  Hash
} from "lucide-react";

interface VeiculoSummaryProps {
  veiculo: Veiculo;
}

export const VeiculoSummary = ({ veiculo }: VeiculoSummaryProps) => {
  const isAtivo = veiculo.ativo;
  const statusLabel = isAtivo ? "Ativo" : "Inativo";

  return (
    <div className="flex flex-col p-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-950 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline Categoria + Status Badge */}
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
          VEÍCULO • {veiculo.marca} {veiculo.modelo}
        </p>
      </div>

      {/* LINHA 2: Placa em Destaque */}
      <div className="flex items-center gap-2">
        <h1 className="text-[22px] font-black text-[#1a3a5c] dark:text-zinc-100 leading-tight tracking-tight">
          {formatarPlacaExibicao(veiculo.placa)}
        </h1>
      </div>

      {/* Subtítulo: Marca e Modelo */}
      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mt-0.5 leading-none">
        {veiculo.marca} {veiculo.modelo}
      </p>

      {/* LINHA 3: Footer com Passageiros e Info Extra */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 grayscale-0 opacity-80">
          <User className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-tighter">
            {veiculo.passageiros_ativos_count || 0} Passageiros Ativos
          </span>
        </div>

        <div className={cn(
          "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
          isAtivo ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-slate-50 text-slate-500 dark:bg-zinc-800"
        )}>
          {statusLabel}
        </div>
      </div>
    </div>
  );
};
