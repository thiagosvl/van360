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
    <div className="bg-card border border-border rounded-2xl p-3 shadow-xl text-left min-w-[160px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-semibold text-foreground text-xs">{item.name}</span>
      </div>
      <div className="pt-2 border-t border-border/40 space-y-1 font-mono text-xs">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Motoristas:</span>
          <span className="font-semibold text-foreground">{item.value}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Participação:</span>
          <span className="font-semibold text-primary">{item.porcentagem}%</span>
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
    <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-left flex flex-col w-full min-w-0">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="h-4 w-4 text-purple-400 shrink-0" />
            <span className="truncate">Distribuição por região</span>
          </div>
          <span className="text-xs font-mono font-normal text-muted-foreground shrink-0 ml-2">
            5 regiões
          </span>
        </CardTitle>
        <p className="text-xs font-normal text-muted-foreground mt-0.5">
          Concentração consolidada por macrorregiões do território nacional
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-4 w-full min-w-0">
        {totalMotoristas === 0 ? (
          <div className="py-6">
            <AdminEmptyState
              icon={Layers}
              title="Sem dados de regiões"
              description="Nenhum motorista com localização geográfica identificada."
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full">
            {chartData.length > 0 && (
              <div className="h-[150px] w-[150px] shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip content={<CustomRegionTooltip />} />
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xl font-semibold font-headline text-foreground leading-none">
                    {totalMotoristas}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground mt-0.5">
                    Total
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2.5 flex-1 w-full min-w-0">
              {regioes.map((item) => (
                <div key={item.regiao} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-xl border ${item.badgeClass} shrink-0`}
                      >
                        {item.regiao}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.estadosComMotoristas} {item.estadosComMotoristas === 1 ? "UF ativa" : "UFs ativas"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                      <span className="font-semibold text-foreground text-xs">
                        {item.porcentagem}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.quantidade})
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/40">
                    <div
                      className={`h-full ${item.corBarra} transition-all duration-700 rounded-full`}
                      style={{ width: `${Math.max(item.porcentagem, item.quantidade > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
