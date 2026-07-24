import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminStats, useAdminWhatsappInstances, useAdminLogs } from "@/hooks/api/adminHooks";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { phoneMask, cpfMask } from "@/utils/masks";
import { apiClient } from "@/services/api/client";
import { ROUTES } from "@/constants/routes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { CANAL_AQUISICAO_CONFIG } from "@/utils/acquisition-channel.utils";
import { SubscriptionStatusBadge, getSubscriptionStatusDetails } from "@/components/ui/SubscriptionStatusBadge";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import {
  Users,
  DollarSign,
  Loader2,
  FileText,
  Eye,
  Bus,
  Radio,
  Clock,
  CheckCircle2,
  ShieldCheck,
  LayoutDashboard,
  Activity,
  Terminal,
  Share2,
  UserPlus,
  FileCheck,
  Gift,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type LoginAttempt } from "./AdminLoginAttempts";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDateTimeBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CustomAcquisitionTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a] text-slate-100 p-3 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1 text-left">
        <p className="font-bold flex items-center gap-2 text-white">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-slate-200 font-semibold">
          {data.quantidade} motorista{data.quantidade !== 1 ? "s" : ""} ({data.porcentagem}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  const { data: stats, isLoading } = useAdminStats();
  const { data: instances, isLoading: isLoadingInstances } = useAdminWhatsappInstances();
  const { data: logsData, isLoading: isLoadingLogs } = useAdminLogs({ limit: 10 });

  const { data: loginAttemptsResponse, isLoading: isLoadingLoginAttempts } = useQuery({
    queryKey: ["admin", "login-attempts", "recent-dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LoginAttempt[]; total: number }>("/admin/login-attempts", {
        params: { page: 1, limit: 5 }
      });
      return data;
    },
    staleTime: 60 * 1000,
  });

  const recentLoginAttempts = loginAttemptsResponse?.data || [];

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  const canaisChartData = useMemo(() => {
    if (!stats?.canaisAquisicao) return [];
    const total = Object.values(stats.canaisAquisicao).reduce((acc, v) => acc + v, 0);

    return Object.entries(stats.canaisAquisicao)
      .map(([key, count]) => {
        const cfg = CANAL_AQUISICAO_CONFIG[key as keyof typeof CANAL_AQUISICAO_CONFIG] || { label: key, color: "#64748B" };
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return {
          key,
          name: cfg.label,
          quantidade: count,
          porcentagem: pct,
          color: cfg.color,
        };
      })
      .filter((item) => item.quantidade > 0)
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [stats?.canaisAquisicao]);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "geral";

  const handleTabChange = (val: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("tab", val);
      return p;
    });
  };

  const [selectedLogModal, setSelectedLogModal] = useState<any | null>(null);

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-bold text-slate-400">Carregando métricas do ecossistema...</p>
      </div>
    );
  }

  const logsList = (logsData?.data || []).slice(0, 10);
  const latestLog = logsList.length > 0 ? logsList[0] : null;
  const remainingLogs = logsList.slice(1);

  const subKeys: Array<keyof typeof stats.assinaturas> = ["active", "trial", "vitalicio", "past_due", "expired", "canceled"];
  const subBreakdown = subKeys.map((key) => {
    const detail = getSubscriptionStatusDetails(key);
    return {
      key,
      pluralLabel: detail?.pluralLabel || key,
      value: stats.assinaturas[key] || 0,
      color: detail?.color || "bg-slate-500",
      textColor: detail?.textColor || "text-slate-400",
    };
  });

  const totalAssinaturas = subBreakdown.reduce((acc, item) => acc + item.value, 0);

  const contratosStats = stats.contratosStats || {
    totalContratos: 0,
    contratosAssinados: 0,
    contratosPendentes: 0,
    contratosSubstituidos: 0,
    valorTotalContratos: 0,
    motoristasConfig: { ativo: 0, inativo: 0, nao_configurado: 0 },
  };

  const motoristasConfigurados = contratosStats.motoristasConfigurados ?? (contratosStats.motoristasConfig.ativo + contratosStats.motoristasConfig.inativo);
  const motoristasAtivos = contratosStats.motoristasAtivos ?? contratosStats.motoristasConfig.ativo;
  const motoristasPausados = contratosStats.motoristasPausados ?? contratosStats.motoristasConfig.inativo;
  const motoristasNaoConfigurados = contratosStats.motoristasNaoConfigurados ?? contratosStats.motoristasConfig.nao_configurado;
  const totalMotoristas = stats.totalMotoristas || 1;
  const pctConfigurados = Math.round((motoristasConfigurados / totalMotoristas) * 100);
  const pctAssinados = contratosStats.totalContratos > 0 ? Math.round((contratosStats.contratosAssinados / contratosStats.totalContratos) * 100) : 0;

  const indicacoesStats = stats.indicacoesStats || {
    total: 0,
    concluidas: 0,
    pendentes: 0,
    taxaConversao: 0,
    diasBonusConcedidos: 0,
    motoristasIndicados: stats.canaisAquisicao?.INDICACAO || 0,
  };

  return (
    <div className="text-left">
      {/* SELETOR DE ABAS PRINCIPAIS DO DASHBOARD (DUAL-MODE) */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* MOBILE SELECT (< 768px) */}
        <div className="md:hidden w-full bg-slate-900/90 border border-slate-800/80 p-2 rounded-[1.25rem] shadow-xl mb-6">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white font-bold h-12 rounded-[0.85rem] focus:ring-blue-500 text-xs">
              <SelectValue placeholder="Selecione uma visão" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
              <SelectItem value="geral" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-400" />
                  <span>Visão Geral</span>
                </span>
              </SelectItem>
              <SelectItem value="usuarios" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>Usuários</span>
                </span>
              </SelectItem>
              <SelectItem value="operacional" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <span>Operacional</span>
                </span>
              </SelectItem>
              <SelectItem value="contratos" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  <span>Contratos Digitais</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DESKTOP TABS (≥ 768px) */}
        <div className="hidden md:block bg-slate-900/90 border border-slate-800/80 rounded-[1.25rem] shadow-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mb-6">
          <TabsList className="flex w-full min-h-[48px] bg-transparent p-0 gap-1.5 mt-0">
            <TabsTrigger
              value="geral"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-5 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4 text-blue-300" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="usuarios"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-5 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4 text-purple-300" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger
              value="operacional"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-5 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Activity className="h-4 w-4 text-amber-300" />
              <span>Operacional</span>
            </TabsTrigger>
            <TabsTrigger
              value="contratos"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-5 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <FileCheck className="h-4 w-4 text-emerald-300" />
              <span>Contratos Digitais</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ABA 1: VISÃO GERAL */}
        <TabsContent value="geral" className="space-y-6 m-0 outline-none">
          {/* 1. TOP MAIN KPIS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AdminKpiCard
              title="TOTAL DE MOTORISTAS"
              value={stats.totalMotoristas}
              subtext="Motoristas cadastrados"
              cardBorder="border-blue-500/40 shadow-blue-500/10"
              iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
              icon={<Bus className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="PASSAGEIROS ATIVOS"
              value={stats.totalPassageiros}
              subtext="Em rotas ativas"
              cardBorder="border-emerald-500/40 shadow-emerald-500/10"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<Users className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="RECEITA ACUMULADA"
              value={formatCurrency(stats.receitaTotal)}
              subtext="Faturamento acumulado"
              cardBorder="border-amber-500/40 shadow-amber-500/10"
              iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
              icon={<DollarSign className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="ASSINATURAS ATIVAS"
              value={stats.assinaturas.active}
              subtext="Motoristas pagantes"
              cardBorder="border-purple-500/40 shadow-purple-500/10"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<FileText className="h-5 w-5" />}
            />
          </div>

          {/* 2. ÚLTIMAS ATIVIDADES (EXIBINDO OS ÚLTIMOS 10 REGISTROS) */}
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                  ÚLTIMAS ATIVIDADES
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY)}
                  className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-7 px-2.5 rounded-xl border border-transparent hover:border-slate-700/80 transition-colors"
                >
                  Ver Todas
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-3">
                {isLoadingLogs ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                ) : !latestLog ? (
                  <AdminEmptyState
                    icon={Terminal}
                    title="Nenhuma atividade recente"
                    description="Não há registros de atividades recentes no sistema."
                  />
                ) : (
                  <div className="space-y-3">
                    {/* ATIVIDADE DESTAQUE */}
                    <div className="p-4 rounded-2xl bg-blue-950/30 border-2 border-blue-500/60 shadow-lg shadow-blue-500/10 relative space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2 break-words">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                            {(latestLog.usuario_id || latestLog.usuarios?.id) ? (
                              <Link
                                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${latestLog.usuario_id || latestLog.usuarios?.id}?tab=logs`}
                                className="hover:text-blue-400 hover:underline transition-colors"
                              >
                                {latestLog.usuarios?.nome || latestLog.entidade_tipo}
                              </Link>
                            ) : (
                              <span>{latestLog.usuarios?.nome || latestLog.entidade_tipo}</span>
                            )}
                          </h4>
                          <p className="text-xs font-medium text-slate-200 leading-relaxed break-words">
                            {latestLog.descricao}
                          </p>
                        </div>
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-blue-500/20 gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 text-[11px] font-bold font-mono">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          {formatDateTimeBR(latestLog.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLogModal(latestLog)}
                          className="h-8 px-2.5 bg-blue-600 text-white hover:bg-blue-500 rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">INSPECIONAR</span>
                        </Button>
                      </div>
                    </div>

                    {/* SECUNDÁRIAS (ATÉ 9 REGISTROS) */}
                    {remainingLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 transition-colors hover:bg-slate-900/90"
                      >
                        <div className="space-y-1 md:space-y-0.5 min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-100 break-words md:truncate leading-tight">
                            {(log.usuario_id || log.usuarios?.id) ? (
                              <Link
                                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${log.usuario_id || log.usuarios?.id}?tab=logs`}
                                className="hover:text-blue-400 hover:underline transition-colors"
                              >
                                {log.usuarios?.nome || log.entidade_tipo}
                              </Link>
                            ) : (
                              <span>{log.usuarios?.nome || log.entidade_tipo}</span>
                            )}
                          </h5>
                          <p className="text-xs text-slate-300 md:text-slate-400 leading-relaxed md:leading-normal break-words md:truncate">
                            {log.descricao}
                          </p>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1.5 md:pt-0 border-t border-slate-800/50 md:border-t-0">
                          <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold font-mono text-slate-400 md:text-slate-300 bg-slate-950 px-2.5 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-slate-800/80 shrink-0">
                            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-500 md:text-slate-400" />
                            {formatDateTimeBR(log.created_at)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLogModal(log)}
                            className="h-7 w-7 p-0 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white shrink-0"
                            title="Ver detalhes da atividade"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </TabsContent>

        {/* ABA 2: USUÁRIOS */}
        <TabsContent value="usuarios" className="space-y-6 m-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DISTRIBUIÇÃO DAS ASSINATURAS */}
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest flex items-center justify-between">
                  <span>DISTRIBUIÇÃO DE ASSINATURAS SAAS</span>
                  <span className="text-[10px] font-bold font-mono text-slate-400">{totalAssinaturas} TOTAL</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-4">
                {subBreakdown.map((item) => {
                  const pct = totalAssinaturas > 0 ? Math.round((item.value / totalAssinaturas) * 100) : 0;

                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">{item.pluralLabel}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className={`font-black ${item.textColor}`}>{pct}%</span>
                          <span className="font-bold text-white text-sm">{item.value}</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${item.color} transition-all duration-1000 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* CANAIS DE AQUISIÇÃO */}
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                  CANAIS DE AQUISIÇÃO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                {canaisChartData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-16 text-center">Nenhum canal cadastrado.</p>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6">
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
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="#131b2e" strokeWidth={2} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomAcquisitionTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-headline font-black text-white">
                          {stats.totalMotoristas}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          USUÁRIOS
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-3 border-t border-slate-800/80">
                      {canaisChartData.map((item) => (
                        <div key={item.key} className="flex items-center gap-2 text-xs">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-slate-300 break-words flex-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold ml-auto shrink-0">{item.porcentagem}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* NOVOS MOTORISTAS */}
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
              <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                NOVOS MOTORISTAS
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS)}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-7 px-2.5 rounded-xl border border-transparent hover:border-slate-700/80 transition-colors"
              >
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-3">
              {stats.recentUsers.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">Nenhum motorista cadastrado recentemente.</p>
              ) : (
                stats.recentUsers.slice(0, 5).map((user) => {
                  const sub = user.assinaturas?.[0];

                  return (
                    <div
                      key={user.id}
                      onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white">{user.nome}</h4>
                        <p className="text-[11px] font-semibold text-slate-400">
                          Registrado: {formatDateBR(user.created_at)}
                        </p>
                      </div>

                      <SubscriptionStatusBadge status={sub?.status} dataVencimento={sub?.data_vencimento} className="text-[10px] px-2.5 py-1" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* PROGRAMA DE INDICAÇÕES (REFERRAL) */}
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
            <CardHeader className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                  INDICAÇÕES
                </CardTitle>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Métricas de aquisição e conversão via convite entre motoristas
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <AdminKpiCard
                  title="CADASTROS VIA INDICAÇÃO"
                  value={indicacoesStats.total}
                  subtext={`${indicacoesStats.pendentes} em teste (trial)`}
                  cardBorder="border-purple-500/40 shadow-purple-500/10"
                  iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
                  icon={<Share2 className="h-5 w-5" />}
                />

                <AdminKpiCard
                  title="CONVERTIDOS EM ASSINANTES"
                  value={indicacoesStats.concluidas}
                  subtext="Pagaram a 1ª mensalidade"
                  cardBorder="border-emerald-500/40 shadow-emerald-500/10"
                  iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  icon={<CheckCircle2 className="h-5 w-5" />}
                />

                <AdminKpiCard
                  title="TAXA DE CONVERSÃO"
                  value={`${indicacoesStats.taxaConversao}%`}
                  subtext={`${indicacoesStats.concluidas} de ${indicacoesStats.total} indicados convertidos`}
                  cardBorder="border-blue-500/40 shadow-blue-500/10"
                  iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
                  icon={<UserPlus className="h-5 w-5" />}
                />

                <AdminKpiCard
                  title="BÔNUS GERADO"
                  value={`${indicacoesStats.diasBonusConcedidos} Dias`}
                  subtext={
                    indicacoesStats.diasBonusConcedidos === 0
                      ? "0 meses grátis aos indicadores"
                      : `~${Math.round(indicacoesStats.diasBonusConcedidos / 30)} meses grátis aos indicadores`
                  }
                  cardBorder="border-amber-500/40 shadow-amber-500/10"
                  iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
                  icon={<Gift className="h-5 w-5" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: OPERACIONAL */}
        <TabsContent value="operacional" className="space-y-6 m-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TENTATIVAS DE LOGIN */}
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                  TENTATIVAS DE LOGIN
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.PRIVATE.ADMIN.LOGIN_ATTEMPTS)}
                  className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-7 px-2.5 rounded-xl border border-transparent hover:border-slate-700/80 transition-colors"
                >
                  Ver Todas
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-3">
                {isLoadingLoginAttempts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                ) : !recentLoginAttempts || recentLoginAttempts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center">Nenhuma tentativa de login recente.</p>
                ) : (
                  recentLoginAttempts.slice(0, 5).map((attempt) => {
                    const rawDigits = (attempt.login_tentado || "").replace(/\D/g, "");
                    const isCpfCnpj = rawDigits.length === 11 || rawDigits.length === 14;
                    const ipOrLogin = attempt.ip || (isCpfCnpj ? cpfMask(attempt.login_tentado) : attempt.login_tentado);

                    return (
                      <div
                        key={attempt.id}
                        onClick={() => navigate(ROUTES.PRIVATE.ADMIN.LOGIN_ATTEMPTS)}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col gap-1.5 cursor-pointer hover:bg-slate-800/80 transition-colors text-left"
                      >
                        {/* LINHA 1: IP À ESQUERDA, SUCESSO/FALHA À DIREITA */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-slate-100 truncate">
                            {ipOrLogin}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${attempt.sucesso
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                          >
                            {attempt.sucesso ? "Sucesso" : "Falha"}
                          </span>
                        </div>

                        {/* LINHA 2: DISPOSITIVO OU FRASE DE ERRO À ESQUERDA, HORÁRIO À DIREITA */}
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="font-semibold text-slate-400 truncate">
                            {attempt.motivo_falha || attempt.dispositivo || "Tentativa de acesso"}
                          </span>
                          <span className="font-mono font-bold text-slate-400 shrink-0">
                            {formatDateTimeBR(attempt.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* INSTÂNCIAS WHATSAPP */}
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                  INSTÂNCIAS WHATSAPP
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.PRIVATE.ADMIN.WHATSAPP_INSTANCES)}
                  className="text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300 h-7 px-2.5 rounded-xl border border-transparent hover:border-slate-700/80 transition-colors"
                >
                  Gerenciar
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-3">
                {isLoadingInstances ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                ) : !instances || instances.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center">Nenhuma instância cadastrada.</p>
                ) : (
                  instances.map((instance) => {
                    const statusStr = (instance.evolution_status || "").toLowerCase();
                    const isOnline = statusStr === "open" || statusStr === "connected" || statusStr === "connecting";
                    const isAlert = statusStr === "connecting";

                    return (
                      <div
                        key={instance.id}
                        onClick={() => navigate(ROUTES.PRIVATE.ADMIN.WHATSAPP_INSTANCES)}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${isOnline ? (isAlert ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20') : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            <Radio className="h-4 w-4 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{instance.instance_name}</h4>
                            <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                              {isOnline ? (
                                <span className={isAlert ? "text-amber-400" : "text-emerald-400"}>
                                  {isAlert ? "ALERTA" : "ONLINE"} - Taxa: {instance.rate_limit_max}/min
                                </span>
                              ) : (
                                <span className="text-red-400">OFFLINE - Taxa: 0/min</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 3: CONTRATOS DIGITAIS */}
        <TabsContent value="contratos" className="space-y-6 m-0 outline-none">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-headline font-black text-slate-300 uppercase tracking-widest">
                CONTRATOS DIGITAIS DE TRANSPORTE
              </h3>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {contratosStats.totalContratos} GERADOS NO TOTAL
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <AdminKpiCard
                title="MOTORISTAS COM CONTRATO"
                value={motoristasConfigurados}
                subtext={`${pctConfigurados}% dos motoristas (${stats.totalMotoristas} no total)`}
                cardBorder="border-sky-500/40 shadow-sky-500/10"
                iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
                icon={<ShieldCheck className="h-5 w-5" />}
              />

              <AdminKpiCard
                title="USANDO CONTRATO ATIVO"
                value={`${motoristasAtivos} Ativos`}
                subtext={`${motoristasPausados} pausados | ${motoristasNaoConfigurados} sem matriz`}
                cardBorder="border-purple-500/40 shadow-purple-500/10"
                iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
                icon={<CheckCircle2 className="h-5 w-5" />}
              />

              <AdminKpiCard
                title="CONTRATOS GERADOS"
                value={contratosStats.totalContratos}
                subtext="Emitidos no aplicativo"
                cardBorder="border-blue-500/40 shadow-blue-500/10"
                iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
                icon={<FileText className="h-5 w-5" />}
              />

              <AdminKpiCard
                title="CONTRATOS ASSINADOS"
                value={contratosStats.contratosAssinados}
                subtext={`${pctAssinados}% conversão (${contratosStats.contratosPendentes} pendentes)`}
                cardBorder="border-emerald-500/40 shadow-emerald-500/10"
                iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL DE INSPEÇÃO DE DETALHES DA ATIVIDADE COMPLETO COM ADMINBASEDIALOG */}
      <AdminBaseDialog open={!!selectedLogModal} onOpenChange={(open) => !open && setSelectedLogModal(null)} maxWidth="lg">
        <AdminBaseDialog.Header
          title="Detalhes do Log de Atividade"
          subtitle="Informações registradas no sistema"
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          onClose={() => setSelectedLogModal(null)}
        />
        <AdminBaseDialog.Body>
          {selectedLogModal && (
            <div className="space-y-4 text-xs text-left">
              {/* CRUCIAL LOG HEADER: AÇÃO & ENTIDADE */}
              <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Ação
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 mt-1">
                    {selectedLogModal.acao?.replace(/_/g, " ") || selectedLogModal.entidade_tipo || "SISTEMA"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Entidade
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/80 mt-1">
                    {selectedLogModal.entidade_tipo || "GERAL"}
                  </span>
                </div>
              </div>

              {/* USUÁRIO / AUTOR */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Usuário / Autor
                </span>
                <p className="text-sm font-bold text-white">
                  {selectedLogModal.usuarios?.nome || "Sistema / Desconhecido"}
                </p>
                {selectedLogModal.usuarios?.email && (
                  <p className="text-xs font-semibold text-slate-400">{selectedLogModal.usuarios.email}</p>
                )}
                {selectedLogModal.usuarios?.telefone && (
                  <p className="text-xs font-mono text-slate-400">{phoneMask(selectedLogModal.usuarios.telefone)}</p>
                )}
              </div>

              {/* DESCRIÇÃO COMPLETA */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Descrição da Ação
                </span>
                <p className="text-xs font-semibold text-slate-200 leading-relaxed break-words">
                  {selectedLogModal.descricao}
                </p>
              </div>

              {/* DATA, HORA, IP & ENTIDADE ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Data e Hora
                  </span>
                  <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                    {formatDateTimeBR(selectedLogModal.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Endereço IP
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                    {selectedLogModal.ip_address || "—"}
                  </p>
                </div>
                {selectedLogModal.entidade_id && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      ID da Entidade
                    </span>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5 break-all">
                      {selectedLogModal.entidade_id}
                    </p>
                  </div>
                )}
              </div>

              {/* METADADOS JSON COM BOTÃO COPIAR */}
              {selectedLogModal.meta && Object.keys(selectedLogModal.meta).length > 0 && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Metadados do Evento (JSON)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(JSON.stringify(selectedLogModal.meta, null, 2));
                        toast.success("Metadados copiados para a área de transferência!");
                      }}
                      className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                    >
                      Copiar JSON
                    </Button>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto p-3 bg-slate-900 rounded-lg max-h-48 leading-tight border border-slate-800 select-all">
                    {JSON.stringify(selectedLogModal.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </AdminBaseDialog.Body>
      </AdminBaseDialog>
    </div>
  );
}
