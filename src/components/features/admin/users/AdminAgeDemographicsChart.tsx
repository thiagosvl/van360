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
      <div className="bg-[#0f172a] text-slate-100 p-3 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1 text-left">
        <p className="font-bold text-white">Faixa: {item.faixa}</p>
        <p className="text-slate-300 font-semibold">
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
    <Card className="border border-slate-800/80 bg-[#131b2e] rounded-2xl shadow-xl overflow-hidden text-left h-full">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/60">
        <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Users2 className="h-5 w-5 text-purple-400" />
          <span>Faixa Etária dos Motoristas</span>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Distribuição demográfica por faixa de idade (estilo Meta Ads / Google).
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="faixa"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.faixa}`}
                    fill={AGE_COLORS[entry.faixa] || "#6366f1"}
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
