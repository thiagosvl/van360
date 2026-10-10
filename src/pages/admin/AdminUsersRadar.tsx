import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Radio,
  RefreshCw,
  Filter,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Loader2,
  RotateCcw,
  Zap,
  CalendarClock,
} from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";
import {
  useAdminUsersLatestActivity,
  useAdminUsersRadarStats,
} from "@/hooks/api/adminHooks";
import { useAdminTrialsPipeline } from "@/hooks/api/admin/useAdminFinancialHooks";
import { AdminTrialsPipelineTable } from "@/components/features/admin/financial/AdminTrialsPipelineTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banner } from "@/components/ui/Banner";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminRadarDriverCard } from "@/components/features/admin/AdminRadarDriverCard";
import { AdminRadarDailyPulseTab } from "@/components/features/admin/AdminRadarDailyPulseTab";

export default function AdminUsersRadar() {
  const { setPageTitle } = useLayout();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"daily_pulse" | "health_radar" | "trials_pipeline">("daily_pulse");

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("25");
  const [search, setSearch] = useState("");
  const [healthStatus, setHealthStatus] = useState<"all" | "active" | "alert" | "risk" | "inactive">("all");
  const [subscriptionStatus, setSubscriptionStatus] = useState("active_trial");
  const [sort, setSort] = useState<"recent_first" | "inactive_first" | "newest_first" | "oldest_first" | "name_asc">("recent_first");

  useEffect(() => {
    setPageTitle("Radar de Usuários");
  }, [setPageTitle]);

  const isHealthRadarActive = activeTab === "health_radar";
  const isTrialsPipelineActive = activeTab === "trials_pipeline";

  const {
    data: trialsPipelineData,
    isLoading: isLoadingTrialsPipeline,
    refetch: refetchTrialsPipeline,
  } = useAdminTrialsPipeline({
    enabled: isTrialsPipelineActive,
  });

  const { data: trialStats, isLoading: isLoadingTrialStats } = useAdminUsersRadarStats("TRIAL", {
    enabled: isHealthRadarActive,
  });
  const { data: activeStats, isLoading: isLoadingActiveStats } = useAdminUsersRadarStats("ACTIVE", {
    enabled: isHealthRadarActive,
  });

  const {
    data: radarResponse,
    isLoading: isLoadingRadar,
    isFetching: isFetchingRadar,
  } = useAdminUsersLatestActivity(
    {
      search: search.trim() || undefined,
      sort,
      page,
      limit: parseInt(limit, 10),
      healthStatus,
      subscriptionStatus,
    },
    { enabled: isHealthRadarActive }
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users", "latest-activity"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "users", "radar-stats"] });
  };

  const handleResetFilters = () => {
    setSearch("");
    setHealthStatus("all");
    setSubscriptionStatus("active_trial");
    setSort("recent_first");
    setPage(1);
  };

  const total = radarResponse?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / parseInt(limit, 10)));
  const drivers = radarResponse?.data || [];

  return (
    <div className="space-y-6 text-left">

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "daily_pulse" | "health_radar" | "trials_pipeline")}
        className="w-full space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full sm:max-w-lg h-11 p-1 bg-secondary/60 border border-border rounded-2xl">
          <TabsTrigger
            value="daily_pulse"
            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl text-xs font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all px-1 sm:px-3"
          >
            <Zap className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Acessos</span>
            <span className="hidden sm:inline">Acessos do dia</span>
          </TabsTrigger>
          <TabsTrigger
            value="health_radar"
            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl text-xs font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all px-1 sm:px-3"
          >
            <Radio className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Saúde</span>
            <span className="hidden sm:inline">Saúde da base</span>
          </TabsTrigger>
          <TabsTrigger
            value="trials_pipeline"
            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl text-xs font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all px-1 sm:px-3"
          >
            <CalendarClock className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Vencimentos</span>
            <span className="hidden sm:inline">Vencimento trials</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily_pulse" className="m-0 focus-visible:ring-0">
          <AdminRadarDailyPulseTab isActive={activeTab === "daily_pulse"} />
        </TabsContent>

        <TabsContent value="health_radar" className="m-0 space-y-6 focus-visible:ring-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  Trial (em avaliação)
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Motoristas no período de testes
                </span>
              </div>

              <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 md:grid md:grid-cols-5 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-0 touch-pan-x">
                <AdminKpiCard
                  title="Total em trial"
                  value={isLoadingTrialStats ? "..." : (trialStats?.totalMotoristas ?? 0)}
                  subtext="Motoristas em teste"
                  cardBorder="border-sky-500/30 shadow-xs"
                  iconBg="bg-sky-500/10 text-sky-500 border-sky-500/20"
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("TRIAL");
                    setHealthStatus("all");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "TRIAL" && healthStatus === "all" ? "ring-2 ring-primary" : "")}
                />

                <AdminKpiCard
                  title="Ativos recentes"
                  value={isLoadingTrialStats ? "..." : (trialStats?.totalAtivos ?? 0)}
                  subtext="Uso nos últimos 2 dias"
                  cardBorder="border-emerald-500/30 shadow-xs"
                  iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("TRIAL");
                    setHealthStatus("active");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "TRIAL" && healthStatus === "active" ? "ring-2 ring-emerald-500" : "")}
                />

                <AdminKpiCard
                  title="Em alerta"
                  value={isLoadingTrialStats ? "..." : (trialStats?.totalAlerta ?? 0)}
                  subtext="3 a 7 dias sem uso"
                  cardBorder="border-amber-500/30 shadow-xs"
                  iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
                  icon={<AlertTriangle className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("TRIAL");
                    setHealthStatus("alert");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "TRIAL" && healthStatus === "alert" ? "ring-2 ring-amber-500" : "")}
                />

                <AdminKpiCard
                  title="Em risco crítico"
                  value={isLoadingTrialStats ? "..." : (trialStats?.totalEmRisco ?? 0)}
                  subtext="Mais de 7 dias sem uso"
                  cardBorder="border-destructive/30 shadow-xs"
                  iconBg="bg-destructive/10 text-destructive border-destructive/20"
                  icon={<ShieldAlert className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("TRIAL");
                    setHealthStatus("risk");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "TRIAL" && healthStatus === "risk" ? "ring-2 ring-destructive" : "")}
                />

                <AdminKpiCard
                  title="Sem atividade"
                  value={isLoadingTrialStats ? "..." : (trialStats?.totalSemAtividade ?? 0)}
                  subtext="Nunca executaram ação"
                  cardBorder="border-border shadow-xs"
                  iconBg="bg-secondary text-muted-foreground border-border"
                  icon={<Clock className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("TRIAL");
                    setHealthStatus("inactive");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "TRIAL" && healthStatus === "inactive" ? "ring-2 ring-muted-foreground" : "")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Assinantes (pagantes)
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Motoristas com assinatura ativa
                </span>
              </div>

              <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 md:grid md:grid-cols-5 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-0 touch-pan-x">
                <AdminKpiCard
                  title="Total assinantes"
                  value={isLoadingActiveStats ? "..." : (activeStats?.totalMotoristas ?? 0)}
                  subtext="Motoristas pagantes"
                  cardBorder="border-emerald-500/30 shadow-xs"
                  iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("ACTIVE");
                    setHealthStatus("all");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "ACTIVE" && healthStatus === "all" ? "ring-2 ring-emerald-500" : "")}
                />

                <AdminKpiCard
                  title="Ativos recentes"
                  value={isLoadingActiveStats ? "..." : (activeStats?.totalAtivos ?? 0)}
                  subtext="Uso nos últimos 2 dias"
                  cardBorder="border-emerald-500/30 shadow-xs"
                  iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("ACTIVE");
                    setHealthStatus("active");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "ACTIVE" && healthStatus === "active" ? "ring-2 ring-emerald-500" : "")}
                />

                <AdminKpiCard
                  title="Em alerta"
                  value={isLoadingActiveStats ? "..." : (activeStats?.totalAlerta ?? 0)}
                  subtext="3 a 7 dias sem uso"
                  cardBorder="border-amber-500/30 shadow-xs"
                  iconBg="bg-amber-500/10 text-amber-500 border-amber-500/20"
                  icon={<AlertTriangle className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("ACTIVE");
                    setHealthStatus("alert");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "ACTIVE" && healthStatus === "alert" ? "ring-2 ring-amber-500" : "")}
                />

                <AdminKpiCard
                  title="Em risco crítico"
                  value={isLoadingActiveStats ? "..." : (activeStats?.totalEmRisco ?? 0)}
                  subtext="Mais de 7 dias sem uso"
                  cardBorder="border-destructive/30 shadow-xs"
                  iconBg="bg-destructive/10 text-destructive border-destructive/20"
                  icon={<ShieldAlert className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("ACTIVE");
                    setHealthStatus("risk");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "ACTIVE" && healthStatus === "risk" ? "ring-2 ring-destructive" : "")}
                />

                <AdminKpiCard
                  title="Sem atividade"
                  value={isLoadingActiveStats ? "..." : (activeStats?.totalSemAtividade ?? 0)}
                  subtext="Nunca executaram ação"
                  cardBorder="border-border shadow-xs"
                  iconBg="bg-secondary text-muted-foreground border-border"
                  icon={<Clock className="h-5 w-5" />}
                  onClick={() => {
                    setSubscriptionStatus("ACTIVE");
                    setHealthStatus("inactive");
                    setPage(1);
                  }}
                  className={cn("w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", subscriptionStatus === "ACTIVE" && healthStatus === "inactive" ? "ring-2 ring-muted-foreground" : "")}
                />
              </div>
            </div>
          </div>

          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
            <CardHeader className="pb-3 border-b border-border/60 bg-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Radio className="h-4 w-4 text-primary animate-pulse" />
                  <span>Painel do radar de motoristas</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                    className={`md:hidden h-8 rounded-xl px-2.5 flex items-center gap-1.5 border transition-all text-xs font-medium ${isMobileFiltersOpen
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-secondary/60 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filtros</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="h-8 rounded-xl text-muted-foreground bg-secondary/60 border border-border hover:bg-secondary hover:text-foreground px-2.5 flex items-center gap-1.5 text-xs font-medium"
                    title="Limpar todos os filtros"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Limpar</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isFetchingRadar}
                    className="h-8 rounded-xl text-primary bg-secondary/60 border border-border hover:bg-primary/10 px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingRadar ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${!isMobileFiltersOpen ? "hidden md:grid" : ""}`}>
                <div className="space-y-1.5 text-left w-full">
                  <Label className="text-xs font-medium text-muted-foreground block">
                    Busca de motorista
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nome, apelido, telefone ou e-mail..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5 text-left w-full">
                  <Label className="text-xs font-medium text-muted-foreground block">
                    Saúde / atividade
                  </Label>
                  <Select
                    value={healthStatus}
                    onValueChange={(val: "all" | "active" | "alert" | "risk" | "inactive") => {
                      setHealthStatus(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="all" className="text-sm">Todas as faixas</SelectItem>
                      <SelectItem value="active" className="text-sm">Ativos (≤ 2 dias)</SelectItem>
                      <SelectItem value="alert" className="text-sm">Em alerta (3 a 7 dias)</SelectItem>
                      <SelectItem value="risk" className="text-sm">Em risco crítico (&gt; 7 dias)</SelectItem>
                      <SelectItem value="inactive" className="text-sm">Sem atividade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left w-full">
                  <Label className="text-xs font-medium text-muted-foreground block">
                    Assinatura
                  </Label>
                  <Select
                    value={subscriptionStatus}
                    onValueChange={(val) => {
                      setSubscriptionStatus(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="active_trial" className="text-sm">Ativos e trial (padrão)</SelectItem>
                      <SelectItem value="all" className="text-sm">Todas as assinaturas</SelectItem>
                      <SelectItem value="ACTIVE" className="text-sm">Somente ativos (pagantes)</SelectItem>
                      <SelectItem value="TRIAL" className="text-sm">Somente em teste (trial)</SelectItem>
                      <SelectItem value="VITALICIO" className="text-sm">Vitalício</SelectItem>
                      <SelectItem value="PAST_DUE" className="text-sm">Atrasados (past due)</SelectItem>
                      <SelectItem value="EXPIRED" className="text-sm">Expirados</SelectItem>
                      <SelectItem value="CANCELED" className="text-sm">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left w-full">
                  <Label className="text-xs font-medium text-muted-foreground block">
                    Ordenação
                  </Label>
                  <Select
                    value={sort}
                    onValueChange={(val: "recent_first" | "inactive_first" | "newest_first" | "oldest_first" | "name_asc") => {
                      setSort(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="recent_first" className="text-sm">Mais recentes primeiro</SelectItem>
                      <SelectItem value="inactive_first" className="text-sm">Mais inativos primeiro</SelectItem>
                      <SelectItem value="newest_first" className="text-sm">Cadastro mais novo</SelectItem>
                      <SelectItem value="oldest_first" className="text-sm">Cadastro mais antigo</SelectItem>
                      <SelectItem value="name_asc" className="text-sm">Nome (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingRadar ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">Escaneando atividades dos motoristas...</p>
                </div>
              ) : drivers.length === 0 ? (
                <AdminEmptyState
                  icon={Radio}
                  title="Nenhum motorista encontrado"
                  description="Nenhum registro corresponde aos critérios de busca e filtros selecionados."
                />
              ) : (
                <div className="space-y-3 pt-2">
                  {drivers.map((driver) => (
                    <AdminRadarDriverCard key={driver.id} driver={driver} />
                  ))}
                </div>
              )}

              {!isLoadingRadar && total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-border/40 gap-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Página {page} de {totalPages} ({total} motoristas encontrados)
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">Exibir:</Label>
                      <Select
                        value={limit}
                        onValueChange={(val) => {
                          setLimit(val);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-9 rounded-lg bg-background border border-border text-foreground text-xs w-[72px] focus-visible:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="10" className="text-xs">10</SelectItem>
                          <SelectItem value="25" className="text-xs">25</SelectItem>
                          <SelectItem value="50" className="text-xs">50</SelectItem>
                          <SelectItem value="100" className="text-xs">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="h-9 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 text-xs font-medium"
                      >
                        Anterior
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="h-9 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 text-xs font-medium"
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trials_pipeline" className="m-0 focus-visible:ring-0">
          <AdminTrialsPipelineTable
            trials={trialsPipelineData?.trials || []}
            isLoading={isLoadingTrialsPipeline}
            onRefresh={refetchTrialsPipeline}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
