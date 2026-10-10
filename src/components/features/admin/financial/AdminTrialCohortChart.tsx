import { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { UserCheck, Sparkles, Filter } from "lucide-react";
import type { SafraTrialItem } from "@/services/api/admin/admin-financial.api";

interface AdminTrialCohortChartProps {
  safras: SafraTrialItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: SafraTrialItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-card text-foreground p-3.5 rounded-2xl border border-border shadow-xl text-xs space-y-2 text-left min-w-[220px]">
        <div className="border-b border-border/40 pb-1.5 flex items-center justify-between">
          <p className="font-semibold text-foreground text-sm">{item.labelMes}</p>
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {item.taxaConversao}% conversão
          </span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Total de entradas no trial:</span>
            <span className="font-semibold text-foreground">{item.novosTrials} motoristas</span>
          </div>

          <div className="flex justify-between items-center text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Viraram assinantes pagantes:
            </span>
            <span className="font-semibold">{item.convertidos}</span>
          </div>

          {item.vitalicios > 0 && (
            <div className="flex justify-between items-center text-purple-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Acesso vitalício:
              </span>
              <span className="font-semibold">{item.vitalicios}</span>
            </div>
          )}

          {item.emAndamento > 0 && (
            <div className="flex justify-between items-center text-amber-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Período em andamento:
              </span>
              <span className="font-semibold">{item.emAndamento}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function AdminTrialCohortChart({ safras }: AdminTrialCohortChartProps) {
  const [periodFilter, setPeriodFilter] = useState<3 | 6 | 12>(6);

  const visibleSafras = useMemo(() => {
    return safras.slice(-periodFilter);
  }, [safras, periodFilter]);

  const totalNovosTrials = visibleSafras.reduce((acc, s) => acc + (s.novosTrials || 0), 0);
  const totalConvertidos = visibleSafras.reduce((acc, s) => acc + (s.convertidos || 0), 0);
  const totalVitalicios = visibleSafras.reduce((acc, s) => acc + (s.vitalicios || 0), 0);
  const totalEmAndamento = visibleSafras.reduce((acc, s) => acc + (s.emAndamento || 0), 0);
  const concluidos = totalNovosTrials - totalEmAndamento - totalVitalicios;
  const taxaMediaGeral = concluidos > 0 ? Number(((totalConvertidos / concluidos) * 100).toFixed(1)) : 0;

  return (
    <Card className="border border-border bg-card rounded-3xl shadow-xs overflow-hidden text-left">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <span>Conversão de trials por safra mensal</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Volume de novos motoristas em teste gratuito e quantos se tornaram assinantes pagantes ao término do trial
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-2xl border border-border">
            {([3, 6, 12] as const).map((months) => (
              <Button
                key={months}
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setPeriodFilter(months)}
                className={`h-7 px-2.5 text-xs rounded-xl font-medium transition-all ${
                  periodFilter === months
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {months} meses
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-2xl">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Conversão média: {taxaMediaGeral}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="h-[280px] sm:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleSafras} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="labelMes"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
                formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
              />
              <Bar dataKey="convertidos" name="Assinantes Pagantes" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vitalicios" name="Acesso Vitalício" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="emAndamento" name="Trial em Andamento" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-border/40">
          <div className="bg-secondary/40 border border-border rounded-2xl p-3.5 space-y-1">
            <p className="text-xs text-muted-foreground font-medium truncate">Total em testes</p>
            <p className="text-xl sm:text-2xl font-headline font-semibold text-foreground">{totalNovosTrials}</p>
            <p className="text-[11px] text-muted-foreground font-normal">Últimos {periodFilter} meses</p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3.5 space-y-1">
            <p className="text-xs text-emerald-400 font-medium truncate">Viraram clientes</p>
            <p className="text-xl sm:text-2xl font-headline font-semibold text-emerald-400">{totalConvertidos}</p>
            <p className="text-[11px] text-emerald-400/80 font-normal">{taxaMediaGeral}% de sucesso</p>
          </div>

          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-3.5 space-y-1">
            <p className="text-xs text-purple-400 font-medium truncate">Vitalícios</p>
            <p className="text-xl sm:text-2xl font-headline font-semibold text-purple-400">{totalVitalicios}</p>
            <p className="text-[11px] text-purple-400/80 font-normal">Cortesia / fundadores</p>
          </div>

          <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-3.5 space-y-1">
            <p className="text-xs text-sky-400 font-medium truncate">Em andamento</p>
            <p className="text-xl sm:text-2xl font-headline font-semibold text-sky-400">{totalEmAndamento}</p>
            <p className="text-[11px] text-sky-400/80 font-normal">Oportunidades ativas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
