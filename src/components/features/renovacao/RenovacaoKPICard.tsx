import { ArrowUpRight, CheckCircle2, Rocket } from "lucide-react";
import { RenovacaoKPIs } from "@/types/renovacao";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RenovacaoKPICardProps {
  kpis: RenovacaoKPIs;
  anoDestino: number;
  onOpenViradaAno?: () => void;
}

export function RenovacaoKPICard({ kpis, anoDestino, onOpenViradaAno }: RenovacaoKPICardProps) {
  const isPositive = kpis.percentual_crescimento >= 0;
  const totalAlunos = kpis.contadores.total_ativos || 1;
  const percentualConfirmados = Math.round((kpis.contadores.confirmados / totalAlunos) * 100);

  return (
    <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#737373] block">
            Faturamento Projetado
          </span>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] tracking-tight leading-none">
              {formatCurrency(kpis.faturamento_projetado)}
            </h2>
            <span className="text-xs font-normal text-[#737373]">/mês</span>
          </div>
        </div>

        {kpis.faturamento_atual > 0 && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-[18px] px-2.5 py-0.5 text-xs font-medium border shrink-0",
              isPositive
                ? "bg-emerald-500/[0.08] text-emerald-700 border-emerald-500/20"
                : "bg-amber-500/[0.08] text-amber-700 border-amber-500/20"
            )}
          >
            <ArrowUpRight className={cn("w-3.5 h-3.5", !isPositive && "rotate-90")} />
            <span>{isPositive ? `+${kpis.percentual_crescimento}%` : `${kpis.percentual_crescimento}%`}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#737373]">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{kpis.contadores.confirmados} de {kpis.contadores.total_ativos} confirmados</span>
          </span>
          <span className="font-semibold text-[#0a0a0a] shrink-0 ml-2">{percentualConfirmados}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f5f5f5]">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, percentualConfirmados))}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-[#e5e5e5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-[#737373]">
          <span className="font-normal">Faturamento Atual:</span>
          <span className="font-semibold text-[#0a0a0a]">
            {formatCurrency(kpis.faturamento_atual)}/mês
          </span>
        </div>

        {onOpenViradaAno && (
          <Button
            type="button"
            onClick={onOpenViradaAno}
            disabled={kpis.contadores.confirmados === 0}
            className="w-full sm:w-auto h-10 px-4 rounded-[18px] bg-primary hover:bg-primary/90 text-white font-medium text-xs shadow-xs gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Iniciar Ano Letivo {anoDestino}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
