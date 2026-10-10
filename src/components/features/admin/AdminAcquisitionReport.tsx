import { useState, useMemo } from "react";
import { useAdminAcquisitionStats } from "@/hooks/api/admin/useAdminUserHooks";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminPeriodFilter, calculateDateRangeForPreset } from "@/components/ui/AdminPeriodFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Clock,
  RefreshCw,
  Loader2,
  Calendar,
  Layers,
  Smartphone,
  TrendingUp,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import { CANAL_AQUISICAO_CONFIG } from "@/utils/acquisition-channel.utils";
import { CanalAquisicao, AtribuicaoCategoria } from "@/types/enums";
import { toStartOfDayISO, toEndOfDayISO } from "@/utils/dateUtils";
const CATEGORIA_COLORS: Record<AtribuicaoCategoria, string> = {
  [AtribuicaoCategoria.META_ADS]: "#E1306C",
  [AtribuicaoCategoria.GOOGLE_ADS]: "#F59E0B",
  [AtribuicaoCategoria.TIKTOK_ADS]: "#06B6D4",
  [AtribuicaoCategoria.PLAY_STORE]: "#10B981",
  [AtribuicaoCategoria.SITE_ORGANICO]: "#94A3B8",
  [AtribuicaoCategoria.INDICACAO]: "#A855F7",
  [AtribuicaoCategoria.DIRETO]: "#64748B",
};

interface TooltipPayloadItem {
  name: string;
  quantidade: number;
  porcentagem: number;
  color: string;
}

function CustomChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TooltipPayloadItem }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card text-foreground p-3 rounded-2xl border border-border shadow-xl text-xs space-y-1 text-left">
        <p className="font-semibold flex items-center gap-2 text-foreground">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-muted-foreground font-normal">
          {data.quantidade} lead{data.quantidade !== 1 ? "s" : ""} ({data.porcentagem}%)
        </p>
      </div>
    );
  }
  return null;
}

export function AdminAcquisitionReport() {
  const initialRange = calculateDateRangeForPreset("30d");
  const [dates, setDates] = useState<{ data_inicio?: string; data_fim?: string }>({
    data_inicio: initialRange.dataInicio ? toStartOfDayISO(initialRange.dataInicio) : undefined,
    data_fim: initialRange.dataFim ? toEndOfDayISO(initialRange.dataFim) : undefined,
  });

  const { data, isLoading, isFetching, refetch } = useAdminAcquisitionStats(dates);

  const canaisChartData = useMemo(() => {
    if (!data?.canais) return [];
    return data.canais.map((item) => ({
      key: item.origem,
      name: item.origem,
      quantidade: item.quantidade,
      porcentagem: item.porcentagem,
      color: CATEGORIA_COLORS[item.categoria] || "#64748B",
    }));
  }, [data?.canais]);

  const dispositivosChartData = useMemo(() => {
    if (!data?.dispositivos) return [];
    const colors = ["#007AFF", "#34A853", "#8B5CF6", "#F59E0B", "#EC4899"];
    return data.dispositivos.map((item, idx) => ({
      key: item.dispositivo,
      name: item.label,
      quantidade: item.quantidade,
      porcentagem: item.porcentagem,
      color: colors[idx % colors.length],
    }));
  }, [data?.dispositivos]);

  const canaisAutodeclaradosList = useMemo(() => {
    if (!data?.canais_autodeclarados) return [];
    const total = Object.values(data.canais_autodeclarados).reduce((acc, v) => acc + v, 0);
    return Object.entries(data.canais_autodeclarados)
      .map(([key, count]) => {
        const cfg = CANAL_AQUISICAO_CONFIG[key as CanalAquisicao | "NAO_INFORMADO"] || { label: key, color: "#64748B" };
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          key,
          name: cfg.label,
          quantidade: count,
          porcentagem: pct,
          color: cfg.color,
        };
      })
      .filter((i) => i.quantidade > 0)
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [data?.canais_autodeclarados]);

  return (
    <div className="space-y-6 text-left">
      <div className="bg-card border border-border p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-headline font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Período de análise</span>
          </h2>
          <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
            Filtre os leads e a conversão de canais por período de cadastro
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-auto">
            <AdminPeriodFilter
              defaultPreset="30d"
              className="h-9 rounded-xl bg-secondary/60 border-input text-xs sm:w-auto"
              onChange={(start, end) => {
                setDates({
                  data_inicio: start ? toStartOfDayISO(start) : undefined,
                  data_fim: end ? toEndOfDayISO(end) : undefined,
                });
              }}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 border-border bg-card text-foreground hover:bg-secondary rounded-xl shadow-xs shrink-0 font-medium text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3 bg-card border border-border rounded-3xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">Carregando dados de aquisição do período...</p>
        </div>
      ) : !data || data.resumo.total_leads === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-2">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">Nenhum cadastro encontrado no período selecionado</h3>
          <p className="text-xs text-muted-foreground">Tente ampliar o intervalo de datas acima para visualizar as origens dos leads.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AdminKpiCard
              title="Leads no período"
              value={data.resumo.total_leads}
              subtext="Novos motoristas cadastrados"
              cardBorder="border-border/80"
              iconBg="bg-primary/10 text-primary border-primary/20"
              icon={<UserPlus className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="Em teste (trial)"
              value={data.resumo.em_trial}
              subtext="Período gratuito de 15 dias"
              cardBorder="border-border/80"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<Clock className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="Pagantes convertidos"
              value={data.resumo.ativos_pagantes}
              subtext={`Taxa de conversão: ${data.resumo.taxa_conversao}%`}
              cardBorder="border-border/80"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<ShieldCheck className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="Leads com alunos"
              value={data.resumo.com_alunos_cadastrados}
              subtext={`${data.resumo.total_leads > 0 ? Math.round((data.resumo.com_alunos_cadastrados / data.resumo.total_leads) * 100) : 0}% cadastraram alunos`}
              cardBorder="border-border/80"
              iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
              icon={<Users className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between">
                  <span>Canais e origem do tráfego</span>
                  <span className="text-xs font-mono font-normal text-muted-foreground">{data.resumo.total_leads} leads</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-4 space-y-6">
                <div className="relative w-full h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={canaisChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="quantidade"
                      >
                        {canaisChartData.map((entry, index) => (
                          <Cell key={`cell-canal-${index}`} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-headline font-semibold text-foreground">{data.resumo.total_leads}</span>
                    <span className="text-xs font-normal text-muted-foreground">Leads</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/40">
                  {data.canais.map((item) => (
                    <div
                      key={item.origem}
                      className="p-3 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORIA_COLORS[item.categoria] || "#64748B" }}
                        />
                        <span className="font-medium text-foreground truncate">{item.origem}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono">
                        <span className="text-muted-foreground font-normal">{item.quantidade} leads ({item.porcentagem}%)</span>
                        {item.ativos_pagantes > 0 && (
                          <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            {item.ativos_pagantes} pago ({item.taxa_conversao}%)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between">
                  <span>Dispositivos de cadastro</span>
                  <Smartphone className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-4 space-y-6">
                <div className="relative w-full h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dispositivosChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="quantidade"
                      >
                        {dispositivosChartData.map((entry, index) => (
                          <Cell key={`cell-disp-${index}`} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-headline font-semibold text-foreground">{data.resumo.total_leads}</span>
                    <span className="text-xs font-normal text-muted-foreground">Aparelhos</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/40">
                  {data.dispositivos.map((item, idx) => {
                    const colors = ["#007AFF", "#34A853", "#8B5CF6", "#F59E0B", "#EC4899"];
                    const color = colors[idx % colors.length];
                    return (
                      <div
                        key={item.dispositivo}
                        className="p-3 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="font-medium text-foreground truncate">{item.label}</span>
                        </div>
                        <span className="font-mono text-muted-foreground shrink-0">
                          {item.quantidade} ({item.porcentagem}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {data.campanhas.length > 0 && (
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>Performance de campanhas e criativos</span>
                  </span>
                  <span className="text-xs font-mono font-normal text-muted-foreground">
                    {data.campanhas.length} variações
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-4">
                <div className="hidden md:block overflow-x-auto [scrollbar-width:thin]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-[11px] font-medium text-muted-foreground">
                        <th className="pb-3">Campanha / Canal</th>
                        <th className="pb-3">Criativo (Content)</th>
                        <th className="pb-3 hidden md:table-cell">Conjunto (Term)</th>
                        <th className="pb-3 text-center">Cadastros</th>
                        <th className="pb-3 text-center">Em Trial</th>
                        <th className="pb-3 text-right">Pagantes</th>
                        <th className="pb-3 text-right">Conversão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.campanhas.map((camp, idx) => (
                        <tr
                          key={`${camp.nome}-${idx}`}
                          className="border-b border-border/40 hover:bg-secondary/40 transition-colors"
                        >
                          <td className="py-3 font-semibold text-foreground">
                            <div className="space-y-0.5">
                              <span>{camp.nome}</span>
                              <span className="block text-[10px] font-normal text-muted-foreground">{camp.origem}</span>
                            </div>
                          </td>
                          <td className="py-3 font-medium text-foreground">
                            {camp.criativo ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono text-[11px]">
                                <Tag className="h-3 w-3" />
                                <span>{camp.criativo}</span>
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 font-mono text-muted-foreground hidden md:table-cell">
                            {camp.conjunto || "—"}
                          </td>
                          <td className="py-3 text-center font-mono font-semibold text-foreground">
                            {camp.quantidade}
                          </td>
                          <td className="py-3 text-center font-mono text-purple-400">
                            {camp.em_trial}
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-emerald-400">
                            {camp.ativos_pagantes}
                          </td>
                          <td className="py-3 text-right font-mono font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded-md ${
                                camp.taxa_conversao > 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {camp.taxa_conversao}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {data.campanhas.map((camp, idx) => (
                    <div
                      key={`mobile-${camp.nome}-${idx}`}
                      className="p-3.5 rounded-2xl bg-secondary/30 border border-border/80 space-y-2.5 text-xs text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground text-xs">{camp.nome}</p>
                          <span className="text-[10px] text-muted-foreground">{camp.origem}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold shrink-0 ${
                            camp.taxa_conversao > 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "text-muted-foreground bg-secondary"
                          }`}
                        >
                          {camp.taxa_conversao}% conv.
                        </span>
                      </div>

                      {camp.criativo && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono text-[10px]">
                            <Tag className="h-3 w-3" />
                            <span>{camp.criativo}</span>
                          </span>
                          {camp.conjunto && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ({camp.conjunto})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center font-mono">
                        <div className="p-2 rounded-xl bg-secondary/50">
                          <span className="text-[10px] text-muted-foreground block font-sans">Cadastros</span>
                          <span className="font-bold text-foreground text-xs">{camp.quantidade}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <span className="text-[10px] text-purple-400 block font-sans">Trial</span>
                          <span className="font-bold text-purple-300 text-xs">{camp.em_trial}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[10px] text-emerald-400 block font-sans">Pagantes</span>
                          <span className="font-bold text-emerald-300 text-xs">{camp.ativos_pagantes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {canaisAutodeclaradosList.length > 0 && (
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between">
                  <span>Canal autodeclarado pelos motoristas</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {canaisAutodeclaradosList.map((c) => (
                    <div
                      key={c.key}
                      className="p-3 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-muted-foreground">
                        {c.quantidade} ({c.porcentagem}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
