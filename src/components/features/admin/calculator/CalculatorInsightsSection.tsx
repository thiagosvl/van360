import React from "react";
import { Sparkles, AlertCircle, Info, Lightbulb } from "lucide-react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorInsightsSectionProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorInsightsSection({ calcHook }: CalculatorInsightsSectionProps) {
  const { calculations } = calcHook;
  const { insights } = calculations;

  if (!insights || insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Insights & Recomendações de Inteligência Financeira
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => {
          let borderClass = "border-slate-800 bg-slate-950/40";
          let icon = <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;

          if (insight.tipo === "sucesso") {
            borderClass = "border-emerald-500/20 bg-emerald-500/5";
            icon = <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
          } else if (insight.tipo === "alerta") {
            borderClass = "border-amber-500/20 bg-amber-500/5";
            icon = <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
          } else if (insight.tipo === "estrategia") {
            borderClass = "border-purple-500/20 bg-purple-500/5";
            icon = <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={insight.id}
              className={`p-3.5 rounded-xl border ${borderClass} flex items-start gap-3`}
            >
              {icon}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-white block">
                  {insight.titulo}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {insight.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
