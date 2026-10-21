import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Users2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePixVeiculoResolver } from "@/hooks";

interface VeiculoSummaryProps {
  veiculo: Veiculo & { passageiros_ativos_count?: number };
}

export const VeiculoSummary = ({ veiculo }: VeiculoSummaryProps) => {
  const { getPixInfo } = usePixVeiculoResolver();
  const pixInfo = getPixInfo(veiculo);

  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="pr-8">
        <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight break-words w-full min-w-0">
          {formatarPlacaExibicao(veiculo.placa)}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-1.5 w-full min-w-0">
        <div
          className={cn(
            "px-2 py-0.5 rounded-[12px] text-[10px] font-semibold uppercase tracking-wider shrink-0 border transition-colors",
            veiculo.ativo
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
          )}
        >
          {veiculo.ativo ? "Ativo" : "Inativo"}
        </div>

        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none shrink-0">
          Veículo
        </span>

        {(veiculo.marca || veiculo.modelo) && (
          <div className="flex items-center gap-1.5 min-w-0 text-[#737373] flex-1">
            <span className="text-xs text-[#737373]/60">•</span>
            <p className="text-xs font-normal leading-snug truncate">
              {veiculo.marca} {veiculo.modelo}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e5e5e5]/80 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 text-[#737373]">
          <Users2 className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-normal text-[#737373] truncate">
            Alunos ativos
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight leading-none">
            {veiculo.passageiros_ativos_count ?? 0}
          </span>
        </div>
      </div>

      {pixInfo && (
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#e5e5e5]/80 w-full min-w-0 gap-2">
          <div className="flex items-center gap-1.5 min-w-0 text-[#737373]">
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-normal text-[#737373] truncate">
              Chave Pix
            </span>
          </div>

          <div className="flex flex-col items-end min-w-0">
            <span className="text-xs font-semibold text-[#0a0a0a] tracking-tight truncate max-w-[200px]">
              {pixInfo.chaveFormatada}
            </span>
            {!pixInfo.isPropria && (
              <span className="text-[10px] font-normal text-[#737373]">
                (Padrão da conta)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
