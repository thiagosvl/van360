import { CheckCircle2 } from "lucide-react";
import { RenovacaoKPIs } from "@/types/renovacao";
import { formatCurrency } from "@/utils/formatters";

interface RenovacaoKPICardProps {
  kpis: RenovacaoKPIs;
  anoDestino: number;
}

export function RenovacaoKPICard({
  kpis,
  anoDestino,
}: RenovacaoKPICardProps) {
  const totalAlunos = kpis.contadores.total_ativos || 1;
  const percentualConfirmados = Math.round(
    (kpis.contadores.confirmados / totalAlunos) * 100
  );

  return (
    <div className="bg-[#ffffff] rounded-[20px] border border-[#e5e5e5] p-4 sm:p-5 shadow-xs space-y-3.5 h-full flex flex-col justify-between">
      <div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] block">
          Faturamento Projetado
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0a0a0a]">
            {formatCurrency(kpis.faturamento_projetado)}
          </span>
          <span className="text-xs text-[#737373] font-normal">/mês</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#737373]">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {kpis.contadores.confirmados} de {kpis.contadores.total_ativos} confirmados
            </span>
          </span>
          <span className="font-semibold text-[#0a0a0a] shrink-0 ml-2">
            {percentualConfirmados}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f5f5f5]">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, percentualConfirmados))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
