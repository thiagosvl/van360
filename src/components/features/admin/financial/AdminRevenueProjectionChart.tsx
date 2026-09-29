import { useState } from "react";
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
import { CalendarRange, Coins, Clock } from "lucide-react";
import type { Projecao12MesesItem } from "@/services/api/admin/admin-financial.api";

interface AdminRevenueProjectionChartProps {
  data: Projecao12MesesItem[];
  diasRetencaoCartao: number;
}

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: Projecao12MesesItem;
  }>;
  label?: string;
  mode: "caixa" | "vencimento";
}

function CustomTooltip({ active, payload, label, mode }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const total = mode === "caixa" ? item.totalCaixaReal : item.totalVencimento;
    const mensalVal = mode === "caixa" ? item.mensalCaixa : item.mensal;
    const anualVal = mode === "caixa" ? item.anualCaixa : item.anual;

    return (
      <div className="bg-[#0f172a] text-slate-100 p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-2 text-left min-w-[200px]">
        <div className="border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
          <p className="font-bold text-white text-sm">{item.labelMes}</p>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
            {item.quantidadeRenovacoes} renovações
          </span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between items-center text-blue-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Plano Mensal:
            </span>
            <span className="font-bold">{formatCurrency(mensalVal)}</span>
          </div>

          <div className="flex justify-between items-center text-sky-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
              Plano Anual:
            </span>
            <span className="font-bold">{formatCurrency(anualVal)}</span>
          </div>

          {item.trialPotencial > 0 && (
            <div className="flex justify-between items-center text-purple-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Potencial Trial:
              </span>
              <span className="font-bold">{formatCurrency(item.trialPotencial)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-700/80 pt-1.5 flex justify-between items-center text-white font-bold text-xs">
          <span>{mode === "caixa" ? "Caixa Estimado:" : "Total Previsto:"}</span>
          <span className="text-amber-400 font-extrabold">{formatCurrency(total)}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function AdminRevenueProjectionChart({
  data,
  diasRetencaoCartao,
}: AdminRevenueProjectionChartProps) {
  const [mode, setMode] = useState<"caixa" | "vencimento">("caixa");

  return (
    <Card className="border border-slate-800/80 bg-[#131b2e] rounded-2xl shadow-xl overflow-hidden text-left">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-blue-400" />
            <span>Projeção de Receita (Próximos 12 Meses)</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "caixa"
              ? `Considerando liquidação física: Pix imediato (D+0) e Cartão após ${diasRetencaoCartao} dias.`
              : "Considerando a data de vencimento da fatura/assinatura (Regime de Competência)."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMode("caixa")}
            className={`h-8 px-3 text-xs rounded-lg font-bold transition-all ${
              mode === "caixa"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Coins className="h-3.5 w-3.5 mr-1.5" />
            Caixa Real (D+{diasRetencaoCartao})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMode("vencimento")}
            className={`h-8 px-3 text-xs rounded-lg font-bold transition-all ${
              mode === "vencimento"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Por Vencimento
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="h-[320px] sm:h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="labelMes"
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
                tickFormatter={(v) => (v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`)}
              />
              <Tooltip content={<CustomTooltip mode={mode} />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
                formatter={(value) => <span className="text-slate-300 font-semibold">{value}</span>}
              />
              <Bar dataKey={mode === "caixa" ? "mensalCaixa" : "mensal"} name="Mensal" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey={mode === "caixa" ? "anualCaixa" : "anual"} name="Anual" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="trialPotencial" name="Potencial Trial" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
