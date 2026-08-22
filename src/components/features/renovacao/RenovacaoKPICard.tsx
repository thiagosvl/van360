import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { RenovacaoKPIs } from "@/types/renovacao";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface RenovacaoKPICardProps {
  kpis: RenovacaoKPIs;
  anoDestino: number;
}

export function RenovacaoKPICard({ kpis }: RenovacaoKPICardProps) {
  const isPositive = kpis.percentual_crescimento >= 0;
  const totalAlunos = kpis.contadores.total_ativos || 1;
  const percentualConfirmados = Math.round((kpis.contadores.confirmados / totalAlunos) * 100);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100/80 flex flex-col gap-4">
      {/* Linha Superior: Faturamento Projetado + Badge de Crescimento */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[13px] font-medium text-slate-500 block">
            Faturamento Projetado
          </span>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(kpis.faturamento_projetado)}
            </h2>
            <span className="text-xs font-normal text-slate-400">/mês</span>
          </div>
        </div>

        {kpis.faturamento_atual > 0 && (
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 mt-0.5",
              isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            )}
          >
            <ArrowUpRight className={cn("w-3.5 h-3.5", !isPositive && "rotate-90")} />
            <span>{isPositive ? `+${kpis.percentual_crescimento}%` : `${kpis.percentual_crescimento}%`}</span>
          </div>
        )}
      </div>

      {/* Barra de Progresso de Confirmações */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{kpis.contadores.confirmados} de {kpis.contadores.total_ativos} confirmados</span>
          </span>
          <span className="font-bold text-slate-800 shrink-0 ml-2">{percentualConfirmados}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, percentualConfirmados))}%` }}
          />
        </div>
      </div>

      {/* Linha Inferior com Faturamento Atual */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
        <span className="truncate font-medium">Faturamento Atual:</span>
        <span className="font-semibold text-slate-700 shrink-0">
          {formatCurrency(kpis.faturamento_atual)}/mês
        </span>
      </div>
    </div>
  );
}
