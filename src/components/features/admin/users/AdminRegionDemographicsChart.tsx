import { Layers } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import type { RegiaoDemographicsItem } from "@/hooks/business/admin/useAdminGeographicDemographics";
import type { RegiaoBrasil } from "@/constants/brazilMapData";

interface AdminRegionDemographicsChartProps {
  regioes: RegiaoDemographicsItem[];
  totalMotoristas: number;
}

const REGIAO_HEX: Record<RegiaoBrasil, string> = {
  Sudeste: "#3b82f6",
  Sul: "#10b981",
  Nordeste: "#f59e0b",
  "Centro-Oeste": "#a855f7",
  Norte: "#14b8a6",
};

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
    porcentagem: number;
    color: string;
    estadosComMotoristas: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomRegionTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[160px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-bold text-slate-200 text-xs">{item.name}</span>
      </div>
      <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Motoristas:</span>
          <span className="font-black text-white">{item.value}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Participação:</span>
          <span className="font-black text-cyan-400">{item.porcentagem}%</span>
        </div>
      </div>
    </div>
  );
}

export function AdminRegionDemographicsChart({
  regioes,
  totalMotoristas,
}: AdminRegionDemographicsChartProps) {
  const chartData = regioes
    .filter((r) => r.quantidade > 0)
    .map((r) => ({
      name: r.regiao,
      value: r.quantidade,
      porcentagem: r.porcentagem,
      color: REGIAO_HEX[r.regiao] || "#64748b",
      estadosComMotoristas: r.estadosComMotoristas,
    }));

  return (
    <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-left flex flex-col w-full min-w-0">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="truncate">DISTRIBUIÇÃO POR REGIÃO</span>
          </div>
          <span className="text-[10px] font-bold font-mono text-slate-400 shrink-0 ml-2">
            5 REGIÕES
          </span>
        </CardTitle>
        <p className="text-[11px] font-medium text-slate-400 mt-1">
          Concentração consolidada por macrorregiões do território nacional
        </p>
      </CardHeader>

      <CardContent className="p-6 pt-4 flex-1 flex flex-col justify-between space-y-4 w-full min-w-0">
        {totalMotoristas === 0 ? (
          <div className="py-8">
            <AdminEmptyState
              icon={Layers}
              title="Sem dados de regiões"
              description="Nenhum motorista com localização geográfica identificada."
            />
          </div>
        ) : (
          <>
            {chartData.length > 0 && (
              <div className="h-[140px] w-full min-w-0 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip content={<CustomRegionTooltip />} />
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-3 flex-1 w-full min-w-0">
              {regioes.map((item) => (
                <div key={item.regiao} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${item.badgeClass} shrink-0`}
                      >
                        {item.regiao}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate hidden sm:inline-block">
                        {item.estadosComMotoristas} {item.estadosComMotoristas === 1 ? "estado ativo" : "estados ativos"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                      <span className="font-black text-slate-200 text-xs">
                        {item.porcentagem}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ({item.quantidade})
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${item.corBarra} transition-all duration-700 rounded-full`}
                      style={{ width: `${Math.max(item.porcentagem, item.quantidade > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
