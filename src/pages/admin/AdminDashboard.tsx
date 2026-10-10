import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAdminStats,
  useAdminLogs,
  useAdminUsersRadarStats,
  useAdminFinancialStats,
  useAdminDemographicsStats,
  useAdminRealtimeLogs,
} from "@/hooks/api/adminHooks";
import { AdminFinancialKpis } from "@/components/features/admin/financial/AdminFinancialKpis";
import { AdminRevenueProjectionChart } from "@/components/features/admin/financial/AdminRevenueProjectionChart";
import { AdminTrialCohortChart } from "@/components/features/admin/financial/AdminTrialCohortChart";
import { AdminDailyMaturityScatter } from "@/components/features/admin/financial/AdminDailyMaturityScatter";
import { AdminPaymentMethodBreakdown } from "@/components/features/admin/financial/AdminPaymentMethodBreakdown";
import { AdminUpcomingRenewalsTable } from "@/components/features/admin/financial/AdminUpcomingRenewalsTable";
import { AdminAgeDemographicsChart } from "@/components/features/admin/users/AdminAgeDemographicsChart";
import { AdminUserGrowthFunnel } from "@/components/features/admin/users/AdminUserGrowthFunnel";
import { AdminGeographicSection } from "@/components/features/admin/users/AdminGeographicSection";
import { AdminAcquisitionReport } from "@/components/features/admin/AdminAcquisitionReport";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { apiClient } from "@/services/api/client";
import { ROUTES } from "@/constants/routes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { CANAL_AQUISICAO_CONFIG } from "@/utils/acquisition-channel.utils";
import { DISPOSITIVO_CADASTRO_CONFIG } from "@/utils/dispositivo-cadastro.utils";
import { SubscriptionStatusBadge, getSubscriptionStatusDetails } from "@/components/ui/SubscriptionStatusBadge";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminVencimentosTabela } from "@/components/features/admin/AdminVencimentosTabela";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { openBrowserLink } from "@/utils/browser";
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
  Gift,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatRelativeTime, formatCurrency, formatDateBR, formatDateTimeToBR } from "@/utils/formatters";
import { useLayout } from "@/hooks";

interface CustomTooltipPayloadItem {
  color: string;
  name: string;
  quantidade: number;
  porcentagem: number;
}

interface CustomAcquisitionTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CustomTooltipPayloadItem }>;
}

function CustomAcquisitionTooltip({ active, payload }: CustomAcquisitionTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card text-foreground p-3 rounded-2xl border border-border shadow-xl text-xs space-y-1 text-left">
        <p className="font-semibold flex items-center gap-2 text-foreground">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-muted-foreground font-normal">
          {data.quantidade} motorista{data.quantidade !== 1 ? "s" : ""} ({data.porcentagem}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "geral";

  const { data: stats, isLoading, refetch: refetchStats, isFetching: isFetchingStats } = useAdminStats();
  const { data: financialData, isLoading: isLoadingFinancial, refetch: refetchFinancial, isFetching: isFetchingFinancial } = useAdminFinancialStats();
  const { data: demographicsData, isLoading: isLoadingDemographics, refetch: refetchDemographics } = useAdminDemographicsStats();
  const { setPageTitle } = useLayout();
  const { data: logsData, isLoading: isLoadingLogs } = useAdminLogs({ limit: 10 });
  const { data: radarStats, isLoading: isLoadingRadarStats } = useAdminUsersRadarStats("active_trial");

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

  const dispositivosChartData = useMemo(() => {
    if (!stats?.dispositivosCadastro) return [];
    const total = Object.values(stats.dispositivosCadastro).reduce((acc, v) => acc + v, 0);

    return Object.entries(stats.dispositivosCadastro)
      .map(([key, count]) => {
        const cfg = DISPOSITIVO_CADASTRO_CONFIG[key as keyof typeof DISPOSITIVO_CADASTRO_CONFIG] || { label: key, color: "#64748B" };
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
  }, [stats?.dispositivosCadastro]);

  const { isConnected: isRealtimeConnected } = useAdminRealtimeLogs();

  const handleTabChange = (val: string) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("tab", val);
      return p;
    });
  };

  const leadsMesCount = useMemo(() => {
    if (demographicsData?.evolucaoMensal && demographicsData.evolucaoMensal.length > 0) {
      const ultimo = demographicsData.evolucaoMensal[demographicsData.evolucaoMensal.length - 1];
      return ultimo.novosCadastros;
    }
    return stats?.assinaturas?.trial || 0;
  }, [demographicsData?.evolucaoMensal, stats?.assinaturas?.trial]);

  const proximosMesesRecebiveis = useMemo(() => {
    if (!financialData?.projecao12Meses) return [];
    return financialData.projecao12Meses.slice(0, 6);
  }, [financialData?.projecao12Meses]);

  const maxRecebivel = useMemo(() => {
    if (proximosMesesRecebiveis.length === 0) return 1;
    return Math.max(...proximosMesesRecebiveis.map((m) => m.totalVencimento), 1);
  }, [proximosMesesRecebiveis]);

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Carregando métricas do ecossistema...</p>
      </div>
    );
  }

  const logsList = (logsData?.data || []).slice(0, 10);

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

  const indicacoesStats = stats.indicacoesStats || {
    total: 0,
    concluidas: 0,
    pendentes: 0,
    taxaConversao: 0,
    diasBonusConcedidos: 0,
    motoristasIndicados: stats.canaisAquisicao?.INDICACAO || 0,
  };

  return (
    <div className="text-left space-y-6">
      {/* Header Executivo de Alto Nível */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-headline font-semibold text-foreground tracking-tight">
            Painel Executivo
          </h1>
          <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5">
            Monitoramento de receita, pipeline de leads e tração do ecossistema Van360
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRealtimeConnected ? "bg-emerald-400" : "bg-emerald-400"} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isRealtimeConnected ? "bg-emerald-500" : "bg-emerald-500"}`} />
            </span>
            <span className="font-medium text-foreground">
              {isRealtimeConnected ? "Tempo real conectado" : "Monitoramento online"}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStats();
              refetchFinancial();
              refetchDemographics();
            }}
            disabled={isFetchingStats || isFetchingFinancial}
            className="h-9 px-3 border-border bg-card text-foreground hover:bg-secondary rounded-lg shadow-xs flex items-center gap-1.5 font-medium text-xs shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingStats || isFetchingFinancial ? "animate-spin text-primary" : ""}`} />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="md:hidden flex items-center gap-2 mb-6">
          <div className="flex-1 bg-card border border-border p-1.5 rounded-2xl shadow-xs">
            <Select value={activeTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full bg-background border-border text-foreground font-medium h-9 rounded-lg focus-visible:ring-0 text-sm">
                <SelectValue placeholder="Selecione uma visão" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                <SelectItem value="geral" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>Visão Geral</span>
                  </span>
                </SelectItem>
                <SelectItem value="financeiro" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span>Receita & Previsões</span>
                  </span>
                </SelectItem>
                <SelectItem value="aquisicao" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-pink-400" />
                    <span>Leads & Aquisição</span>
                  </span>
                </SelectItem>
                <SelectItem value="usuarios" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span>Base & Retenção</span>
                  </span>
                </SelectItem>
                <SelectItem value="operacional" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-400" />
                    <span>Operacional</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 mb-6">
          <div className="flex-1 bg-card/80 border border-border p-1 rounded-2xl shadow-xs overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="flex w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
              <TabsTrigger
                value="geral"
                className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger
                value="financeiro"
                className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Receita & Previsões</span>
              </TabsTrigger>
              <TabsTrigger
                value="aquisicao"
                className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Leads & Aquisição</span>
              </TabsTrigger>
              <TabsTrigger
                value="usuarios"
                className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Base & Retenção</span>
              </TabsTrigger>
              <TabsTrigger
                value="operacional"
                className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Operacional</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="geral" className="space-y-6 m-0 outline-none">
          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-0 touch-pan-x">
            <AdminKpiCard
              title="Receita no mês"
              value={formatCurrency(financialData?.kpis?.receitaRealizadaMes || 0)}
              subtext={`vs. mês anterior: ${formatCurrency(financialData?.kpis?.receitaRealizadaMesAnterior || 0)}`}
              cardBorder="border-border/80"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<DollarSign className="h-5 w-5" />}
              className="w-[190px] sm:w-[220px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
            />

            <AdminKpiCard
              title="Previsão de fechamento"
              value={formatCurrency(financialData?.kpis?.previsaoFechamentoMes || stats.receitaTotal)}
              subtext={`+ ${formatCurrency(Math.max(0, (financialData?.kpis?.previsaoFechamentoMes || 0) - (financialData?.kpis?.receitaRealizadaMes || 0)))} a receber até dia 31`}
              cardBorder="border-border/80"
              iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
              icon={<TrendingUp className="h-5 w-5" />}
              className="w-[190px] sm:w-[220px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
            />

            <AdminKpiCard
              title="MRR (Recorrência)"
              value={formatCurrency(financialData?.kpis?.mrr || 0)}
              subtext={`ARR projetado: ${formatCurrency(financialData?.kpis?.arr || 0)}`}
              cardBorder="border-border/80"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<RefreshCw className="h-5 w-5" />}
              className="w-[190px] sm:w-[220px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
            />

            <AdminKpiCard
              title="Novos leads no mês"
              value={`${leadsMesCount} cadastros`}
              subtext={`${financialData?.kpis?.trialsAtivosCount || stats.assinaturas.trial || 0} em trial ativo`}
              cardBorder="border-border/80"
              iconBg="bg-pink-500/10 text-pink-400 border-pink-500/20"
              icon={<UserPlus className="h-5 w-5" />}
              className="w-[190px] sm:w-[220px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium block">Pipeline em degustação (Trials)</span>
                <p className="text-base font-semibold font-headline text-foreground mt-0.5">
                  {financialData?.kpis?.trialsAtivosCount || stats.assinaturas.trial || 0} motoristas
                </p>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {formatCurrency(financialData?.kpis?.trialsReceitaPotencial || 0)} receita potencial
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Gift className="h-4 w-4" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium block">Previsão próximo mês</span>
                <p className="text-base font-semibold font-headline text-foreground mt-0.5">
                  {formatCurrency(proximosMesesRecebiveis[0]?.totalVencimento || 0)}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Caixa líquido: {formatCurrency(proximosMesesRecebiveis[0]?.totalCaixaReal || 0)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium block">Viralidade (Indicações)</span>
                <p className="text-base font-semibold font-headline text-foreground mt-0.5">
                  {indicacoesStats.total} cadastros
                </p>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {indicacoesStats.taxaConversao}% convertidos em receita
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Share2 className="h-4 w-4" />
              </div>
            </div>
          </div>

          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span>Previsão de recebíveis mês a mês</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cronograma dos próximos meses com valores a vencer e projeção de caixa líquido
                </p>
              </div>

              <Button
                variant="tonal"
                size="sm"
                onClick={() => handleTabChange("financeiro")}
                className="text-xs h-7 px-3 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Ver projeção completa</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4 space-y-3">
              {proximosMesesRecebiveis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {proximosMesesRecebiveis.map((item) => {
                    const pct = Math.min(100, Math.round((item.totalVencimento / maxRecebivel) * 100));
                    const nomeMes = item.labelMes || item.chaveMes || "Mês";
                    return (
                      <div
                        key={item.chaveMes || item.labelMes}
                        className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 hover:border-primary/40 transition-colors flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground capitalize">
                            {nomeMes}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {item.quantidadeRenovacoes} renovações
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-base font-bold font-headline text-foreground">
                              {formatCurrency(item.totalVencimento)}
                            </span>
                            <span className="text-[11px] text-emerald-400 font-medium">
                              Líquido: {formatCurrency(item.totalCaixaReal)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Calculando projeções dos próximos meses...
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Pulso da base de motoristas</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Composição do ciclo de vida dos motoristas e monitoramento de retenção
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="tonal"
                  size="sm"
                  onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS)}
                  className="text-xs h-7 px-3 rounded-xl flex items-center gap-1.5"
                >
                  <span>Gerenciar base</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Distribuição por ciclo de faturamento</span>
                  <span className="font-mono text-foreground font-medium">{stats.totalMotoristas} motoristas totais</span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex border border-border/80">
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.round(((stats.assinaturas.active || 0) / (stats.totalMotoristas || 1)) * 100)}%` }}
                    title={`Ativos: ${stats.assinaturas.active}`}
                  />
                  <div
                    className="bg-sky-500 transition-all duration-500"
                    style={{ width: `${Math.round(((stats.assinaturas.trial || 0) / (stats.totalMotoristas || 1)) * 100)}%` }}
                    title={`Em Trial: ${stats.assinaturas.trial}`}
                  />
                  <div
                    className="bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.round(((stats.assinaturas.vitalicio || 0) / (stats.totalMotoristas || 1)) * 100)}%` }}
                    title={`Vitalício: ${stats.assinaturas.vitalicio}`}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.round(((stats.assinaturas.past_due || 0) / (stats.totalMotoristas || 1)) * 100)}%` }}
                    title={`Em Atraso: ${stats.assinaturas.past_due}`}
                  />
                  <div
                    className="bg-rose-500/80 transition-all duration-500"
                    style={{ width: `${Math.round((((stats.assinaturas.expired || 0) + (stats.assinaturas.canceled || 0)) / (stats.totalMotoristas || 1)) * 100)}%` }}
                    title={`Cancelados / Expirados: ${(stats.assinaturas.expired || 0) + (stats.assinaturas.canceled || 0)}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}?status=active`)}
                  className="p-3 rounded-2xl bg-secondary/40 border border-emerald-500/20 hover:bg-secondary/70 transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-emerald-400 truncate">Ativos</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-headline font-semibold text-foreground">{stats.assinaturas.active}</span>
                    <span className="text-xs font-mono text-emerald-400">
                      {Math.round(((stats.assinaturas.active || 0) / (stats.totalMotoristas || 1)) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Pagamento em dia</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}?status=trial`)}
                  className="p-3 rounded-2xl bg-secondary/40 border border-sky-500/20 hover:bg-secondary/70 transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-xs font-medium text-sky-400 truncate">Em Trial</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-headline font-semibold text-foreground">{stats.assinaturas.trial}</span>
                    <span className="text-xs font-mono text-sky-400">
                      {Math.round(((stats.assinaturas.trial || 0) / (stats.totalMotoristas || 1)) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Degustação ativa</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}?status=vitalicio`)}
                  className="p-3 rounded-2xl bg-secondary/40 border border-purple-500/20 hover:bg-secondary/70 transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-xs font-medium text-purple-400 truncate">Vitalício</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-headline font-semibold text-foreground">{stats.assinaturas.vitalicio}</span>
                    <span className="text-xs font-mono text-purple-400">
                      {Math.round(((stats.assinaturas.vitalicio || 0) / (stats.totalMotoristas || 1)) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Acesso permanente</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}?status=past_due`)}
                  className="p-3 rounded-2xl bg-secondary/40 border border-amber-500/20 hover:bg-secondary/70 transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-amber-400 truncate">Em Atraso</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-headline font-semibold text-foreground">{stats.assinaturas.past_due}</span>
                    <span className="text-xs font-mono text-amber-400">
                      {Math.round(((stats.assinaturas.past_due || 0) / (stats.totalMotoristas || 1)) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Cobrança pendente</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}?status=canceled`)}
                  className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-secondary/40 border border-rose-500/20 hover:bg-secondary/70 transition-colors text-left flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-xs font-medium text-rose-400 truncate">Inativos / Churn</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-headline font-semibold text-foreground">
                      {(stats.assinaturas.expired || 0) + (stats.assinaturas.canceled || 0)}
                    </span>
                    <span className="text-xs font-mono text-rose-400">
                      {Math.round((((stats.assinaturas.expired || 0) + (stats.assinaturas.canceled || 0)) / (stats.totalMotoristas || 1)) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Cancelado/Expirado</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card flex flex-col justify-between">
              <div>
                <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                      Últimas atividades
                    </CardTitle>
                    {isRealtimeConnected && (
                      <span className="relative flex h-2 w-2" title="Tempo real ativo">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <Button
                    variant="tonal"
                    size="sm"
                    onClick={() => navigate(ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY)}
                    className="text-xs h-7 px-3 rounded-xl"
                  >
                    Ver todas
                  </Button>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-4 space-y-3">
                  <ActivityLogsList logs={logsList} isLoading={isLoadingLogs && !logsData} highlightFirst={true} />
                </CardContent>
              </div>
            </Card>

            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card flex flex-col justify-between">
              <div>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 pb-3 gap-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                      Radar de engajamento
                    </CardTitle>
                  </div>

                  <Button
                    variant="tonal"
                    size="sm"
                    onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS_RADAR)}
                    className="text-xs h-7 px-3 rounded-xl flex items-center gap-1.5"
                  >
                    <span>Abrir radar</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
                  {isLoadingRadarStats ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-emerald-500/20 flex flex-col justify-between text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-medium text-emerald-400 truncate">Ativos recentes</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" />
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-lg sm:text-xl font-headline font-semibold text-foreground">{radarStats?.totalAtivos ?? 0}</span>
                            <span className="text-[11px] sm:text-xs font-medium font-mono text-emerald-400">
                              {radarStats && radarStats.totalMotoristas > 0
                                ? Math.round((radarStats.totalAtivos / radarStats.totalMotoristas) * 100)
                                : 0}%
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal truncate mt-0.5">Últimos 2 dias</span>
                        </div>

                        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-amber-500/20 flex flex-col justify-between text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-medium text-amber-400 truncate">Em alerta</span>
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-1" />
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-lg sm:text-xl font-headline font-semibold text-foreground">{radarStats?.totalAlerta ?? 0}</span>
                            <span className="text-[11px] sm:text-xs font-medium font-mono text-amber-400">
                              {radarStats && radarStats.totalMotoristas > 0
                                ? Math.round((radarStats.totalAlerta / radarStats.totalMotoristas) * 100)
                                : 0}%
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal truncate mt-0.5">3 a 7 dias</span>
                        </div>

                        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-rose-500/20 flex flex-col justify-between text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-medium text-rose-400 truncate">Em risco crítico</span>
                            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 ml-1" />
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-lg sm:text-xl font-headline font-semibold text-foreground">{radarStats?.totalEmRisco ?? 0}</span>
                            <span className="text-[11px] sm:text-xs font-medium font-mono text-rose-400">
                              {radarStats && radarStats.totalMotoristas > 0
                                ? Math.round((radarStats.totalEmRisco / radarStats.totalMotoristas) * 100)
                                : 0}%
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal truncate mt-0.5">+7 dias sem uso</span>
                        </div>

                        <div className="p-3 sm:p-3.5 rounded-2xl bg-secondary/50 border border-border flex flex-col justify-between text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">Sem atividade</span>
                            <span className="w-2 h-2 rounded-full bg-muted-foreground/60 shrink-0 ml-1" />
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-lg sm:text-xl font-headline font-semibold text-foreground">{radarStats?.totalSemAtividade ?? 0}</span>
                            <span className="text-[11px] sm:text-xs font-medium font-mono text-muted-foreground">
                              {radarStats && radarStats.totalMotoristas > 0
                                ? Math.round((radarStats.totalSemAtividade / radarStats.totalMotoristas) * 100)
                                : 0}%
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground font-normal truncate mt-0.5">Sem ações</span>
                        </div>
                      </div>

                      {radarStats && radarStats.totalMotoristas > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-xs font-normal text-muted-foreground">
                            <span>Distribuição de saúde</span>
                            <span className="font-mono text-foreground font-medium">{radarStats.totalMotoristas} motoristas monitorados</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex border border-border/80">
                            <div
                              className="bg-emerald-500 transition-all duration-500"
                              style={{ width: `${(radarStats.totalAtivos / radarStats.totalMotoristas) * 100}%` }}
                              title={`Ativos: ${radarStats.totalAtivos}`}
                            />
                            <div
                              className="bg-amber-500 transition-all duration-500"
                              style={{ width: `${(radarStats.totalAlerta / radarStats.totalMotoristas) * 100}%` }}
                              title={`Em Alerta: ${radarStats.totalAlerta}`}
                            />
                            <div
                              className="bg-rose-500 transition-all duration-500"
                              style={{ width: `${(radarStats.totalEmRisco / radarStats.totalMotoristas) * 100}%` }}
                              title={`Em Risco: ${radarStats.totalEmRisco}`}
                            />
                            <div
                              className="bg-muted-foreground/40 transition-all duration-500"
                              style={{ width: `${(radarStats.totalSemAtividade / radarStats.totalMotoristas) * 100}%` }}
                              title={`Sem Atividade: ${radarStats.totalSemAtividade}`}
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS_RADAR)}
                        className="w-full h-9 rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-xs pt-0"
                      >
                        <Radio className="h-3.5 w-3.5 animate-pulse" />
                        <span>Ver todos os motoristas</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6 m-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center justify-between">
                  <span>Distribuição por status</span>
                  <span className="text-xs font-mono font-normal text-muted-foreground">{stats.totalMotoristas} motoristas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
                {subBreakdown.map((item) => {
                  const pct = totalAssinaturas > 0 ? Math.round((item.value / totalAssinaturas) * 100) : 0;

                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">{item.pluralLabel}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className={`font-semibold ${item.textColor}`}>{pct}%</span>
                          <span className="font-bold text-foreground text-sm">{item.value}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/60">
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

            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                  Dispositivos de cadastro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-4">
                {dispositivosChartData.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-16 text-center">Nenhum dispositivo registrado.</p>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6">
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
                          <RechartsTooltip content={<CustomAcquisitionTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-headline font-semibold text-foreground">
                          {stats.totalMotoristas}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Usuários
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-3 border-t border-border/40">
                      {dispositivosChartData.map((item) => (
                        <div key={item.key} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-foreground break-words flex-1 truncate">{item.name}</span>
                          <span className="text-xs text-muted-foreground font-mono ml-auto shrink-0">{item.porcentagem}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
              <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                  Canais de aquisição
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 pt-4">
                {canaisChartData.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-16 text-center">Nenhum canal cadastrado.</p>
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
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomAcquisitionTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-headline font-semibold text-foreground">
                          {stats.totalMotoristas}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Usuários
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-3 border-t border-border/40">
                      {canaisChartData.map((item) => (
                        <div key={item.key} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-foreground break-words flex-1 truncate">{item.name}</span>
                          <span className="text-xs text-muted-foreground font-mono ml-auto shrink-0">{item.porcentagem}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                  Programa de indicações
                </CardTitle>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Métricas de aquisição e conversão via convite entre motoristas
                </p>
              </div>
              <Button
                variant="tonal"
                size="sm"
                onClick={() => navigate(ROUTES.PRIVATE.ADMIN.REFERRALS)}
                className="h-8 px-3 rounded-xl text-xs font-medium gap-1.5 self-start sm:self-auto"
              >
                <span>Ver listagem completa</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <AdminKpiCard
                  title="Cadastros via indicação"
                  value={indicacoesStats.total}
                  subtext={`${indicacoesStats.pendentes} em teste (trial)`}
                  cardBorder="border-border/80"
                  iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
                  icon={<Share2 className="h-5 w-5" />}
                />

                <AdminKpiCard
                  title="Convertidos em assinantes"
                  value={indicacoesStats.concluidas}
                  subtext="Pagaram a 1ª mensalidade"
                  cardBorder="border-border/80"
                  iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  icon={<CheckCircle2 className="h-5 w-5" />}
                />

                <AdminKpiCard
                  title="Taxa de conversão"
                  value={`${indicacoesStats.taxaConversao}%`}
                  subtext={`${indicacoesStats.concluidas} de ${indicacoesStats.total} convertidos`}
                  cardBorder="border-border/80"
                  iconBg="bg-primary/10 text-primary border-primary/20"
                  icon={<UserPlus className="h-5 w-5" />}
                />

                <AdminKpiCard
                  title="Bônus gerado"
                  value={`${indicacoesStats.diasBonusConcedidos} Dias`}
                  subtext={
                    indicacoesStats.diasBonusConcedidos === 0
                      ? "0 meses grátis aos indicadores"
                      : `~${Math.round(indicacoesStats.diasBonusConcedidos / 30)} meses grátis aos indicadores`
                  }
                  cardBorder="border-border/80"
                  iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
                  icon={<Gift className="h-5 w-5" />}
                />
              </div>
            </CardContent>
          </Card>

          {isLoadingDemographics ? (
            <div className="w-full p-12 text-center text-muted-foreground font-medium flex items-center justify-center gap-2 border border-border rounded-3xl bg-card">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Carregando dados demográficos e funil...</span>
            </div>
          ) : demographicsData ? (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <AdminAgeDemographicsChart data={demographicsData.faixasEtarias} />
                <AdminUserGrowthFunnel
                  funnel={demographicsData.funil}
                  evolution={demographicsData.evolucaoMensal}
                />
              </div>

              <div className="w-full">
                <AdminGeographicSection data={demographicsData.distribuicaoEstados || []} />
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* ABA: AQUISIÇÃO & LEADS */}
        <TabsContent value="aquisicao" className="space-y-6 m-0 outline-none">
          <AdminAcquisitionReport />
        </TabsContent>

        {/* ABA 3: OPERACIONAL */}
        <TabsContent value="operacional" className="space-y-6 m-0 outline-none">
          <AdminVencimentosTabela />
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6 m-0 outline-none">
          {isLoadingFinancial ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Carregando inteligência financeira e projeções...</p>
            </div>
          ) : financialData ? (
            <>
              <AdminFinancialKpis kpis={financialData.kpis} />

              <AdminRevenueProjectionChart
                data={financialData.projecao12Meses}
                historico={financialData.historicoReceitaMensal}
                diasRetencaoCartao={financialData.diasRetencaoCartao}
              />

              <AdminTrialCohortChart safras={financialData.safrasTrials} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AdminDailyMaturityScatter data={financialData.distribuicaoDiasMes} />
                </div>
                <div className="lg:col-span-1">
                  <AdminPaymentMethodBreakdown
                    data={financialData.meiosPagamento}
                    diasRetencaoCartao={financialData.diasRetencaoCartao}
                  />
                </div>
              </div>

              <AdminUpcomingRenewalsTable renewals={financialData.proximasRenovacoes} />
            </>
          ) : (
            <AdminEmptyState
              icon={DollarSign}
              title="Sem dados financeiros disponíveis"
              description="Não foram encontradas informações financeiras suficientes para calcular projeções."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
