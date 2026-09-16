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
import { UserCheck, Sparkles } from "lucide-react";
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
      <div className="bg-[#0f172a] text-slate-100 p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-2 text-left min-w-[220px]">
        <div className="border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
          <p className="font-bold text-white text-sm">{item.labelMes}</p>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {item.taxaConversao}% conversão
          </span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between items-center text-slate-300">
            <span>Total de Entradas no Trial:</span>
            <span className="font-bold text-white">{item.novosTrials} motoristas</span>
          </div>

          <div className="flex justify-between items-center text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Viraram Assinantes Pagantes:
            </span>
            <span className="font-bold">{item.convertidos}</span>
          </div>

          {item.vitalicios > 0 && (
            <div className="flex justify-between items-center text-purple-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Acesso Vitalício:
              </span>
              <span className="font-bold">{item.vitalicios}</span>
            </div>
          )}

          {item.emAndamento > 0 && (
            <div className="flex justify-between items-center text-amber-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Período em Andamento:
              </span>
              <span className="font-bold">{item.emAndamento}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function AdminTrialCohortChart({ safras }: AdminTrialCohortChartProps) {
  const totalNovosTrials = safras.reduce((acc, s) => acc + s.novosTrials, 0);
  const totalConvertidos = safras.reduce((acc, s) => acc + s.convertidos, 0);
  const totalVitalicios = safras.reduce((acc, s) => acc + s.vitalicios, 0);
  const totalEmAndamento = safras.reduce((acc, s) => acc + s.emAndamento, 0);

  const concluidos = totalNovosTrials - totalEmAndamento;
  const taxaMediaGeral = concluidos > 0 ? Number(((totalConvertidos / concluidos) * 100).toFixed(1)) : 0;

  return (
    <Card className="border border-slate-800/80 bg-[#131b2e] rounded-2xl shadow-xl overflow-hidden text-left">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-purple-400" />
            <span>Conversão de Trials por Safra Mensal</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Volume de novos motoristas em teste gratuito e quantos se tornaram assinantes pagantes ao término do trial.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-bold text-purple-300">
            Taxa Média de Conversão: {taxaMediaGeral}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="h-[280px] sm:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safras} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
                formatter={(value) => <span className="text-slate-300 font-semibold">{value}</span>}
              />
              <Bar dataKey="convertidos" name="Assinantes Pagantes" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vitalicios" name="Acesso Vitalício" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="emAndamento" name="Trial em Andamento" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total em Testes</p>
            <p className="text-xl font-black text-white mt-1">{totalNovosTrials}</p>
            <p className="text-[10px] text-slate-500 font-semibold">nos últimos 6 meses</p>
          </div>

          <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-3">
            <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Viraram Clientes</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{totalConvertidos}</p>
            <p className="text-[10px] text-emerald-300/70 font-semibold">{taxaMediaGeral}% de sucesso</p>
          </div>

          <div className="bg-slate-900/60 border border-purple-500/20 rounded-xl p-3">
            <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wider">Vitalícios</p>
            <p className="text-xl font-black text-purple-400 mt-1">{totalVitalicios}</p>
            <p className="text-[10px] text-purple-300/70 font-semibold">cortesia / fundadores</p>
          </div>

          <div className="bg-slate-900/60 border border-sky-500/20 rounded-xl p-3">
            <p className="text-[11px] text-sky-400 font-bold uppercase tracking-wider">Em Andamento</p>
            <p className="text-xl font-black text-sky-400 mt-1">{totalEmAndamento}</p>
            <p className="text-[10px] text-sky-300/70 font-semibold">oportunidades ativas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
