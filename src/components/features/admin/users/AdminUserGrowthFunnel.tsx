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
  const trialsAtivos =
    funnel.trialsAtivos !== undefined
      ? funnel.trialsAtivos
      : Math.max(0, funnel.trialsIniciados - funnel.convertidosPagantes - funnel.expiradosOuCancelados);

  const steps = [
    {
      label: "Cadastrados",
      value: funnel.cadastrados,
      pct: 100,
      color: "bg-secondary text-foreground border-border",
    },
    {
      label: "Em teste (trial)",
      value: trialsAtivos,
      pct: funnel.cadastrados > 0 ? Math.round((trialsAtivos / funnel.cadastrados) * 100) : 0,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      label: "Assinantes",
      value: funnel.convertidosPagantes,
      pct: funnel.cadastrados > 0 ? Math.round((funnel.convertidosPagantes / funnel.cadastrados) * 100) : 0,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Não converteram",
      value: funnel.expiradosOuCancelados,
      pct: funnel.cadastrados > 0 ? Math.round((funnel.expiradosOuCancelados / funnel.cadastrados) * 100) : 0,
      color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
  ];

  return (
    <Card className="border border-border bg-card rounded-3xl shadow-xs overflow-hidden text-left h-full flex flex-col justify-between">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-400" />
          <span>Funil de aquisição e retenção</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Jornada desde o cadastro inicial até a conversão e competência de retenção
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {steps.map((step, idx) => (
            <div
              key={step.label}
              className={`border rounded-2xl p-3.5 space-y-1 relative ${step.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium block truncate">
                  {step.label}
                </span>
                {idx > 0 && (
                  <span className="text-xs font-mono font-semibold opacity-90">
                    {step.pct}%
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-headline font-semibold">{step.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Evolução mensal (últimos 6 meses)</span>
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="labelMes"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                    borderRadius: "1rem",
                    fontSize: "11px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
                />
                <Bar dataKey="novosCadastros" name="Cadastros" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="novosAssinantes" name="Novos Assinantes" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelados" name="Cancelados/Exp." fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
