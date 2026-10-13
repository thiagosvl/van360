import { useState, useId } from "react";
import { Compass, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BRAZIL_STATES_DATA,
  type BrazilStateMapPath,
  type RegiaoBrasil,
} from "@/constants/brazilMapData";
import type { EstadoDensidadeItem } from "@/hooks/business/admin/useAdminGeographicDemographics";

interface AdminBrazilMapChartProps {
  estadosMap: Map<string, EstadoDensidadeItem>;
  maxQuantidade: number;
  totalMotoristas: number;
}

const REGIAO_BADGES: Record<RegiaoBrasil, string> = {
  Sudeste: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Sul: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Nordeste: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Centro-Oeste": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Norte: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

function getHeatColor(intensidade: number, quantidade: number): string {
  if (quantidade === 0) return "#162032";
  if (intensidade < 0.15) return "#1e3a8a";
  if (intensidade < 0.35) return "#1d4ed8";
  if (intensidade < 0.6) return "#2563eb";
  if (intensidade < 0.85) return "#0284c7";
  return "#0ea5e9";
}

function getStrokeColor(quantidade: number, isHovered: boolean): string {
  if (isHovered) return "#38bdf8";
  if (quantidade > 0) return "#60a5fa";
  return "#334155";
}

export function AdminBrazilMapChart({
  estadosMap,
  maxQuantidade,
  totalMotoristas,
}: AdminBrazilMapChartProps) {
  const [hoveredUf, setHoveredUf] = useState<string | null>(null);
  const filterId = useId();

  const hoveredItem = hoveredUf ? estadosMap.get(hoveredUf) : null;
  const hoveredStateDef = hoveredUf
    ? BRAZIL_STATES_DATA.find((s) => s.uf.toUpperCase() === hoveredUf)
    : null;
  const isLeftHalf = hoveredStateDef ? hoveredStateDef.x < 225 : false;

  const estadosAtivos = Array.from(estadosMap.values()).filter(
    (e) => e.quantidade > 0
  ).length;

  return (
    <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-left flex flex-col h-full w-full min-w-0">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Densidade geográfica nacional</span>
          </div>
          <span className="text-xs font-mono font-normal text-muted-foreground shrink-0 ml-2">
            {estadosAtivos} de 27 UFs ativas
          </span>
        </CardTitle>
        <p className="text-xs font-normal text-muted-foreground mt-0.5">
          Distribuição e concentração de motoristas estimada por DDD do WhatsApp
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-2 flex-1 flex flex-col justify-between w-full min-w-0">
        <div className="relative w-full flex-1 flex items-center justify-center min-h-[380px] my-auto">
          {hoveredItem && (
            <div
              className={`absolute top-2 z-20 pointer-events-none bg-card border border-border rounded-2xl p-3 shadow-xl min-w-[170px] animate-in fade-in zoom-in-95 duration-150 ${
                isLeftHalf ? "right-2" : "left-2"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {hoveredItem.uf}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg border ${
                    REGIAO_BADGES[hoveredItem.regiao] || ""
                  }`}
                >
                  {hoveredItem.regiao}
                </span>
              </div>
              <div className="font-medium text-foreground text-xs truncate">
                {hoveredItem.nome}
              </div>
              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground text-[11px]">Motoristas:</span>
                <span className="font-semibold text-foreground">
                  {hoveredItem.quantidade}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono mt-0.5">
                <span className="text-muted-foreground text-[11px]">Participação:</span>
                <span className="font-semibold text-primary">
                  {hoveredItem.porcentagem}%
                </span>
              </div>
            </div>
          )}

          <svg
            viewBox="0 0 450 460"
            className="w-full h-auto max-h-[500px] object-contain select-none"
            style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))" }}
          >
            <defs>
              <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.8" />
              </filter>
            </defs>

            <g>
              {BRAZIL_STATES_DATA.map((state: BrazilStateMapPath) => {
                const uf = state.uf.toUpperCase();
                const item = estadosMap.get(uf);
                const quantidade = item ? item.quantidade : 0;
                const intensidade = item ? item.intensidade : 0;
                const isHovered = hoveredUf === uf;
                const fillColor = getHeatColor(intensidade, quantidade);
                const strokeColor = getStrokeColor(quantidade, isHovered);

                return (
                  <g
                    key={uf}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredUf(uf)}
                    onMouseLeave={() => setHoveredUf((prev) => (prev === uf ? null : prev))}
                    onClick={() => setHoveredUf((prev) => (prev === uf ? null : uf))}
                  >
                    <path
                      d={state.d1}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 1.8 : quantidade > 0 ? 1.2 : 0.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter={isHovered ? `url(#glow-${filterId})` : undefined}
                      className="transition-colors duration-200"
                    />

                    {state.d2 && (
                      <path
                        d={state.d2}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered ? 1.8 : 1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-colors duration-200"
                      />
                    )}

                    <g transform={`translate(${state.x}, ${state.y})`} className="pointer-events-none">
                      <text
                        x={0}
                        y={quantidade > 0 ? -1 : 3}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`font-mono font-black select-none ${
                          quantidade > 0
                            ? "fill-white text-[9px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                            : "fill-slate-400 text-[8px]"
                        }`}
                      >
                        {uf}
                      </text>
                      {quantidade > 0 && (
                        <text
                          x={0}
                          y={8}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-mono font-bold text-[7.5px] fill-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] select-none"
                        >
                          {quantidade}
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-mono">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Total nacional:</span>
            <span className="font-semibold text-foreground font-mono">
              {totalMotoristas} motoristas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Densidade:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-muted-foreground">0</span>
              <div className="flex h-2 w-28 rounded-full overflow-hidden border border-border/60">
                <div className="w-1/5 bg-[#162032]" title="0" />
                <div className="w-1/5 bg-[#1e3a8a]" title="Baixa" />
                <div className="w-1/5 bg-[#1d4ed8]" title="Moderada" />
                <div className="w-1/5 bg-[#0284c7]" title="Média-Alta" />
                <div className="w-1/5 bg-[#0ea5e9]" title="Alta" />
              </div>
              <span className="text-xs font-mono font-semibold text-primary">
                {maxQuantidade}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
