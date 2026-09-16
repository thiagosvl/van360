import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, TrendingUp, UserCheck, UserX, ArrowRight } from "lucide-react";
import type {
  FunilConversao,
  EvolucaoMensalUsuarioItem,
} from "@/services/api/admin/admin-financial.api";

interface AdminUserGrowthFunnelProps {
  funnel: FunilConversao;
  evolution: EvolucaoMensalUsuarioItem[];
}

export function AdminUserGrowthFunnel({ funnel, evolution }: AdminUserGrowthFunnelProps) {
  const steps = [
    {
      label: "Cadastrados",
      value: funnel.cadastrados,
      pct: 100,
      color: "bg-slate-700 text-slate-200 border-slate-600",
    },
    {
      label: "Iniciaram Trial",
      value: funnel.trialsIniciados,
      pct: funnel.cadastrados > 0 ? Math.round((funnel.trialsIniciados / funnel.cadastrados) * 100) : 0,
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      label: "Primeira Assinatura",
      value: funnel.convertidosPagantes,
      pct: funnel.taxaConversaoTrial,
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      label: "Ativos Recorrentes",
      value: funnel.assinantesAtivos,
      pct: funnel.taxaRetencaoAtiva,
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
  ];

  return (
    <Card className="border border-slate-800/80 bg-[#131b2e] rounded-2xl shadow-xl overflow-hidden text-left h-full flex flex-col justify-between">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/60">
        <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Filter className="h-5 w-5 text-emerald-400" />
          <span>Funil de Aquisição & Retenção de Motoristas</span>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Jornada desde o cadastro até a conversão e permanência na assinatura.
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {steps.map((step, idx) => (
            <div
              key={step.label}
              className={`border rounded-xl p-3 space-y-1 relative ${step.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  {step.label}
                </span>
                {idx > 0 && (
                  <span className="text-[10px] font-black opacity-80">
                    {step.pct}%
                  </span>
                )}
              </div>
              <p className="text-xl font-headline font-black text-white">{step.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            <span>Evolução Mensal (Últimos 6 Meses)</span>
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="labelMes"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "11px" }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                />
                <Bar dataKey="novosCadastros" name="Cadastros" fill="#818cf8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="novosAssinantes" name="Novos Assinantes" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cancelados" name="Cancelados/Exp." fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
