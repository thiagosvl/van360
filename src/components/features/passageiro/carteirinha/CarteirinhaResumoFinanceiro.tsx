import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface FinanceSummary {
  qtdPago: number;
  valorPago: number;
  qtdPendente: number;
  valorPendente: number;
  qtdEmAtraso: number;
  valorEmAtraso: number;
}

interface CarteirinhaResumoFinanceiroProps {
  yearlySummary: FinanceSummary;
}

export const CarteirinhaResumoFinanceiro = ({
  yearlySummary,
}: CarteirinhaResumoFinanceiroProps) => {
  const kpis = [
    {
      label: "Pago",
      value: yearlySummary.valorPago,
      count: yearlySummary.qtdPago,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50/50",
      icon: CheckCircle2,
    },
    {
      label: "Pendente",
      value: yearlySummary.valorPendente,
      count: yearlySummary.qtdPendente,
      color: "text-amber-500",
      bgColor: "bg-amber-50/50",
      icon: Clock,
    },
    {
      label: "Atrasado",
      value: yearlySummary.valorEmAtraso,
      count: yearlySummary.qtdEmAtraso,
      color: "text-rose-500",
      bgColor: "bg-rose-50/50",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Resumo Anual
        </span>
        <h3 className="text-sm font-headline font-black text-[#1a3a5c]">
          Saúde Financeira
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              "p-4 rounded-[2rem] border border-slate-100/60 shadow-sm transition-all hover:shadow-md group",
              kpi.bgColor
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", kpi.color, "bg-white shadow-sm")}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] opacity-60", kpi.color)}>
                {kpi.label}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="text-lg font-headline font-black text-[#1a3a5c] tracking-tight">
                {kpi.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {kpi.count} {kpi.count === 1 ? "parcela" : "parcelas"}
              </div>
            </div>

            {/* Subtle Progress Indicator */}
            <div className="mt-4 h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full rounded-full transition-all duration-1000", kpi.color.replace('text-', 'bg-'))}
                    style={{ width: kpi.value > 0 ? '100%' : '0%' }}
                />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
