import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Users2, Car } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

interface VeiculoSummaryProps {
  veiculo: Veiculo & { passageiros_ativos_count?: number };
}

export const VeiculoSummary = ({ veiculo }: VeiculoSummaryProps) => {
  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="flex justify-between items-center mb-1.5 w-full min-w-0 gap-2">
        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none">
          Veículo
        </span>

        <StatusBadge status={veiculo.ativo} />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight break-words w-full min-w-0 mt-0.5">
        {formatarPlacaExibicao(veiculo.placa)}
      </h2>

      <p className="text-xs font-normal text-[#737373] mt-0.5 leading-snug line-clamp-2 break-words w-full min-w-0">
        {veiculo.marca} {veiculo.modelo}
      </p>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e5e5e5]/80 w-full min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Users2 className="h-4 w-4 text-[#737373] shrink-0" />
          <span className="text-xs font-medium text-[#737373] truncate">
            <strong className="text-[#0a0a0a] font-semibold">
              {veiculo.passageiros_ativos_count ?? 0}
            </strong>{" "}
            {(veiculo.passageiros_ativos_count ?? 0) === 1 ? "aluno ativo" : "alunos ativos"}
          </span>
        </div>
      </div>
    </div>
  );
};
