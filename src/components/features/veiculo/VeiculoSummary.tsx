import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Users2, Car } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

interface VeiculoSummaryProps {
  veiculo: Veiculo & { passageiros_ativos_count?: number };
}

export const VeiculoSummary = ({ veiculo }: VeiculoSummaryProps) => {
  return (
    <div className="flex flex-col p-4 sm:p-5 bg-[#fafafa] rounded-[22px] border border-[#e5e5e5] shadow-2xs text-left w-full min-w-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2.5 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-5 rounded-[8px] bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
            <Car className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em] leading-none">
            Veículo
          </span>
        </div>

        <StatusBadge status={veiculo.ativo} />
      </div>

      <div className="flex items-start gap-2 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight leading-snug break-words w-full min-w-0">
          {formatarPlacaExibicao(veiculo.placa)}
        </h1>
      </div>

      <p className="text-xs font-normal text-[#737373] mt-0.5 leading-snug line-clamp-2 break-words w-full min-w-0">
        {veiculo.marca} {veiculo.modelo}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e5e5e5] w-full min-w-0">
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
