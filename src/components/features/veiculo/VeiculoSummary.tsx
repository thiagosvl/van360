import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain";
import { cn } from "@/lib/utils";
import {
  Users2,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

interface VeiculoSummaryProps {
  veiculo: Veiculo;
}

export const VeiculoSummary = ({ veiculo }: VeiculoSummaryProps) => {
  const isAtivo = veiculo.ativo;

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline Categoria + Status Badge */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider leading-none">
          VEÍCULO
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
        )}>
          <StatusBadge
            status={veiculo.ativo}
          />
        </div>
      </div>

      {/* LINHA 2: Placa em Destaque */}
      <h1 className="text-[22px] font-semibold text-[#1a3a5c] dark:text-zinc-100 leading-tight truncate mt-1">
        {formatarPlacaExibicao(veiculo.placa)}
      </h1>

      {/* Subtítulo: Marca e Modelo */}
      <p className="text-[13px] font-medium text-slate-500 dark:text-zinc-400 uppercase mt-1 leading-none truncate">
        {veiculo.marca} {veiculo.modelo}
      </p>

      {/* LINHA 3: Footer com Passageiros */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Users2 className="h-4 w-4 text-slate-400" />
          <span className="text-[12px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
            <strong className="text-slate-600 dark:text-zinc-300 font-semibold">{veiculo.passageiros_ativos_count || 0}</strong> PASSAGEIROS ATIVOS
          </span>
        </div>
      </div>
    </div>
  );
};
