import { useState, useMemo } from "react";
import { useAdminAcquisitionStats } from "@/hooks/api/admin/useAdminUserHooks";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type PeriodPreset = "7d" | "15d" | "30d" | "mes_atual" | "mes_anterior" | "tudo" | "custom";

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
      <div className="bg-[#0f172a] text-slate-100 p-3 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1 text-left">
        <p className="font-bold flex items-center gap-2 text-white">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-slate-200 font-semibold">
          {data.quantidade} lead{data.quantidade !== 1 ? "s" : ""} ({data.porcentagem}%)
        </p>
      </div>
    );
  }
  return null;
}

export function AdminAcquisitionReport() {
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [customInicio, setCustomInicio] = useState("");
  const [customFim, setCustomFim] = useState("");

  const dates = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === "7d") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return { data_inicio: `${toYMD(start)}T00:00:00`, data_fim: `${toYMD(now)}T23:59:59` };
    }

    if (preset === "15d") {
      const start = new Date(now);
      start.setDate(now.getDate() - 15);
      return { data_inicio: `${toYMD(start)}T00:00:00`, data_fim: `${toYMD(now)}T23:59:59` };
    }

    if (preset === "30d") {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { data_inicio: `${toYMD(start)}T00:00:00`, data_fim: `${toYMD(now)}T23:59:59` };
    }

    if (preset === "mes_atual") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { data_inicio: `${toYMD(start)}T00:00:00`, data_fim: `${toYMD(now)}T23:59:59` };
    }

    if (preset === "mes_anterior") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { data_inicio: `${toYMD(start)}T00:00:00`, data_fim: `${toYMD(end)}T23:59:59` };
    }

    if (preset === "custom" && customInicio) {
      const fim = customFim ? `${customFim}T23:59:59` : undefined;
      return { data_inicio: `${customInicio}T00:00:00`, data_fim: fim };
    }

    return { data_inicio: undefined, data_fim: undefined };
  }, [preset, customInicio, customFim]);

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
      <div className="bg-[#131b2e] border border-slate-800/80 p-4 sm:p-5 rounded-[1.5rem] shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>Período de Análise</span>
          </h2>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Filtre os leads e a conversão de anúncios por data de cadastro
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-900/90 border border-slate-800 p-1 rounded-xl gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPreset("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === "7d"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setPreset("15d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === "15d"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              15 Dias
            </button>
            <button
              type="button"
              onClick={() => setPreset("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === "30d"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setPreset("mes_atual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === "mes_atual"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Este Mês
            </button>
            <button
              type="button"
              onClick={() => setPreset("mes_anterior")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === "mes_anterior"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Mês Anterior
            </button>
            <button
              type="button"
              onClick={() => setPreset("tudo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === "tudo"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Histórico Completo
            </button>
            <button
              type="button"
              onClick={() => setPreset("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === "custom"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Personalizado
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 border-slate-800 bg-slate-900 text-slate-300 hover:text-white rounded-xl shadow shrink-0 font-headline font-bold text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      {preset === "custom" && (
        <div className="bg-[#131b2e] border border-slate-800/80 p-4 rounded-[1.25rem] flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">De:</span>
            <Input
              type="date"
              value={customInicio}
              onChange={(e) => setCustomInicio(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white text-xs h-9 rounded-xl w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Até:</span>
            <Input
              type="date"
              value={customFim}
              onChange={(e) => setCustomFim(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white text-xs h-9 rounded-xl w-40"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3 bg-[#131b2e] border border-slate-800/80 rounded-[2rem]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-slate-400">Carregando dados de aquisição do período...</p>
        </div>
      ) : !data || data.resumo.total_leads === 0 ? (
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-[2rem] p-12 text-center space-y-2">
          <Layers className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum cadastro encontrado no período selecionado</h3>
          <p className="text-xs text-slate-400">Tente ampliar o intervalo de datas acima para visualizar as origens dos leads.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AdminKpiCard
              title="LEADS NO PERÍODO"
              value={data.resumo.total_leads}
              subtext="Novos motoristas cadastrados"
              cardBorder="border-blue-500/40 shadow-blue-500/10"
              iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
              icon={<UserPlus className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="EM TESTE (TRIAL)"
              value={data.resumo.em_trial}
              subtext="Período gratuito de 15 dias"
              cardBorder="border-purple-500/40 shadow-purple-500/10"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<Clock className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="PAGANTES (CONVERTIDOS)"
              value={data.resumo.ativos_pagantes}
              subtext={`Taxa de conversão: ${data.resumo.taxa_conversao}%`}
              cardBorder="border-emerald-500/40 shadow-emerald-500/10"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<ShieldCheck className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="LEADS COM ALUNOS"
              value={data.resumo.com_alunos_cadastrados}
              subtext={`${data.resumo.total_leads > 0 ? Math.round((data.resumo.com_alunos_cadastrados / data.resumo.total_leads) * 100) : 0}% ativaram a carteirinha`}
              cardBorder="border-amber-500/40 shadow-amber-500/10"
              iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
              icon={<Users className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center justify-between">
                  <span>CANAIS & ORIGEM DO TRÁFEGO</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{data.resumo.total_leads} LEADS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
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
                          <Cell key={`cell-canal-${index}`} fill={entry.color} stroke="#131b2e" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-headline font-black text-white">{data.resumo.total_leads}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LEADS</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  {data.canais.map((item) => (
                    <div
                      key={item.origem}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORIA_COLORS[item.categoria] || "#64748B" }}
                        />
                        <span className="font-bold text-white truncate">{item.origem}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 font-mono">
                        <span className="text-slate-400 font-semibold">{item.quantidade} leads ({item.porcentagem}%)</span>
                        {item.ativos_pagantes > 0 && (
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {item.ativos_pagantes} pago ({item.taxa_conversao}%)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center justify-between">
                  <span>DISPOSITIVOS DE CADASTRO</span>
                  <Smartphone className="h-4 w-4 text-blue-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-6">
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
                          <Cell key={`cell-disp-${index}`} fill={entry.color} stroke="#131b2e" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-headline font-black text-white">{data.resumo.total_leads}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">APARELHOS</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  {data.dispositivos.map((item, idx) => {
                    const colors = ["#007AFF", "#34A853", "#8B5CF6", "#F59E0B", "#EC4899"];
                    const color = colors[idx % colors.length];
                    return (
                      <div
                        key={item.dispositivo}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="font-bold text-white truncate">{item.label}</span>
                        </div>
                        <span className="font-mono text-slate-300 font-bold shrink-0">
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
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="p-6 pb-3 border-b border-slate-800/60">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>PERFORMANCE DE CAMPANHAS & CRIATIVOS (TRÁFEGO PAGO)</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {data.campanhas.length} VARIAÇÕES RASTREADAS
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                          className="border-b border-slate-800/40 hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="py-3 font-bold text-white">
                            <div className="space-y-0.5">
                              <span>{camp.nome}</span>
                              <span className="block text-[10px] font-normal text-slate-400">{camp.origem}</span>
                            </div>
                          </td>
                          <td className="py-3 font-medium text-slate-300">
                            {camp.criativo ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px]">
                                <Tag className="h-3 w-3" />
                                <span>{camp.criativo}</span>
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 font-mono text-slate-400 hidden md:table-cell">
                            {camp.conjunto || "—"}
                          </td>
                          <td className="py-3 text-center font-mono font-bold text-white">
                            {camp.quantidade}
                          </td>
                          <td className="py-3 text-center font-mono text-purple-300">
                            {camp.em_trial}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-emerald-400">
                            {camp.ativos_pagantes}
                          </td>
                          <td className="py-3 text-right font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-md ${
                                camp.taxa_conversao > 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "text-slate-400"
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
              </CardContent>
            </Card>
          )}

          {canaisAutodeclaradosList.length > 0 && (
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center justify-between">
                  <span>CANAL AUTODECLARADO PELOS MOTORISTAS (PESQUISA DE 3 DIAS)</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {canaisAutodeclaradosList.map((c) => (
                    <div
                      key={c.key}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-bold text-slate-200">{c.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-400">
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
