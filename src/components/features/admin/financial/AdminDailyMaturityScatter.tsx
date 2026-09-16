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
import { Calendar, BarChart2 } from "lucide-react";
import type { DistribuicaoDiaMesItem } from "@/services/api/admin/admin-financial.api";

interface AdminDailyMaturityScatterProps {
  data: DistribuicaoDiaMesItem[];
}

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DistribuicaoDiaMesItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0f172a] text-slate-100 p-3 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1 text-left">
        <p className="font-bold text-white flex items-center gap-1.5">
          <span>Dia {item.dia}</span>
          {item.isHoje && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
              Hoje
            </span>
          )}
        </p>
        <p className="text-slate-300 font-semibold">
          {item.quantidade} renovaç{item.quantidade === 1 ? "ão" : "ões"}
        </p>
        <p className="text-amber-400 font-bold">
          Valor Previsto: {formatCurrency(item.valor)}
        </p>
      </div>
    );
  }
  return null;
}

export function AdminDailyMaturityScatter({ data }: AdminDailyMaturityScatterProps) {
  const peakDay = [...data].sort((a, b) => b.valor - a.valor)[0];

  return (
    <Card className="border border-slate-800/80 bg-[#131b2e] rounded-2xl shadow-xl overflow-hidden text-left">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-amber-400" />
            <span>Distribuição de Vencimentos no Mês (Dias 1 a 31)</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Concentração diária de renovações de assinaturas e faturamento ao longo do mês.
          </p>
        </div>

        {peakDay && peakDay.valor > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 self-start sm:self-auto text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Pico: Dia {peakDay.dia} ({formatCurrency(peakDay.valor)})</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="h-[240px] sm:h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="dia"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                tickFormatter={(v) => `R$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valor" radius={[3, 3, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.dia}`}
                    fill={entry.isHoje ? "#f59e0b" : "#3b82f6"}
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
