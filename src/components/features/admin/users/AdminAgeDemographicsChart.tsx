import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2 } from "lucide-react";
import type { FaixaEtariaItem } from "@/services/api/admin/admin-financial.api";

interface AdminAgeDemographicsChartProps {
  data: FaixaEtariaItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: FaixaEtariaItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-card text-foreground p-3 rounded-2xl border border-border shadow-xl text-xs space-y-1 text-left">
        <p className="font-semibold text-foreground">Faixa: {item.faixa}</p>
        <p className="text-muted-foreground font-normal">
          {item.quantidade} motorista{item.quantidade !== 1 ? "s" : ""} ({item.porcentagem}%)
        </p>
      </div>
    );
  }
  return null;
}

const AGE_COLORS: Record<string, string> = {
  "18-24": "#38bdf8",
  "25-34": "#3b82f6",
  "35-44": "#6366f1",
  "45-54": "#8b5cf6",
  "55-64": "#a855f7",
  "65+": "#d946ef",
  "Não informado": "#64748b",
};

export function AdminAgeDemographicsChart({ data }: AdminAgeDemographicsChartProps) {
  return (
    <Card className="border border-border bg-card rounded-3xl shadow-xs overflow-hidden text-left h-full">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          <Users2 className="h-4 w-4 text-primary" />
          <span>Faixa etária dos motoristas</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Distribuição demográfica por faixa de idade cadastrada
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="faixa"
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.faixa}`}
                    fill={AGE_COLORS[entry.faixa] || "#3b82f6"}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
