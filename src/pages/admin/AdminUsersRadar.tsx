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
} from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useAdminUsersLatestActivity,
  useAdminUsersRadarStats,
} from "@/hooks/api/adminHooks";
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
import { Banner } from "@/components/ui/Banner";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminRadarDriverCard } from "@/components/features/admin/AdminRadarDriverCard";

export default function AdminUsersRadar() {
  const { setPageTitle } = useLayout();
  const queryClient = useQueryClient();

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

  const { data: statsData, isLoading: isLoadingStats } = useAdminUsersRadarStats(subscriptionStatus);

  const { data: radarResponse, isLoading: isLoadingRadar, isFetching: isFetchingRadar } = useAdminUsersLatestActivity({
    search: search.trim() || undefined,
    sort,
    page,
    limit: parseInt(limit, 10),
    healthStatus,
    subscriptionStatus,
  });

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
      <Banner
        variant="info"
        title="Monitoramento Contínuo de Engajamento"
        description="Acompanhe a atividade recente e a saúde operacional de cada motorista. Identifique rapidamente usuários em risco de inatividade para suporte preventivo."
      />

      {/* TOP KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <AdminKpiCard
          title="TOTAL MONITORADOS"
          value={isLoadingStats ? "..." : (statsData?.totalMotoristas ?? 0)}
          subtext={subscriptionStatus === "active_trial" ? "Ativos & Em Teste" : "Filtro selecionado"}
          cardBorder="border-blue-500/40 shadow-blue-500/10"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          icon={<Users className="h-5 w-5" />}
          onClick={() => {
            setHealthStatus("all");
            setPage(1);
          }}
          className={healthStatus === "all" ? "ring-2 ring-blue-500" : ""}
        />

        <AdminKpiCard
          title="ATIVOS RECENTES"
          value={isLoadingStats ? "..." : (statsData?.totalAtivos ?? 0)}
          subtext="Uso nos últimos 2 dias"
          cardBorder="border-emerald-500/40 shadow-emerald-500/10"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<CheckCircle2 className="h-5 w-5" />}
          onClick={() => {
            setHealthStatus("active");
            setPage(1);
          }}
          className={healthStatus === "active" ? "ring-2 ring-emerald-500" : ""}
        />

        <AdminKpiCard
          title="EM ALERTA"
          value={isLoadingStats ? "..." : (statsData?.totalAlerta ?? 0)}
          subtext="3 a 7 dias sem uso"
          cardBorder="border-amber-500/40 shadow-amber-500/10"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          icon={<AlertTriangle className="h-5 w-5" />}
          onClick={() => {
            setHealthStatus("alert");
            setPage(1);
          }}
          className={healthStatus === "alert" ? "ring-2 ring-amber-500" : ""}
        />

        <AdminKpiCard
          title="EM RISCO CRÍTICO"
          value={isLoadingStats ? "..." : (statsData?.totalEmRisco ?? 0)}
          subtext="Mais de 7 dias sem uso"
          cardBorder="border-rose-500/40 shadow-rose-500/10"
          iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20"
          icon={<ShieldAlert className="h-5 w-5" />}
          onClick={() => {
            setHealthStatus("risk");
            setPage(1);
          }}
          className={healthStatus === "risk" ? "ring-2 ring-rose-500" : ""}
        />

        <AdminKpiCard
          title="SEM ATIVIDADE"
          value={isLoadingStats ? "..." : (statsData?.totalSemAtividade ?? 0)}
          subtext="Nunca executaram ação"
          cardBorder="border-slate-700/80 shadow-slate-900/50"
          iconBg="bg-slate-800 text-slate-400 border-slate-700"
          icon={<Clock className="h-5 w-5" />}
          onClick={() => {
            setHealthStatus("inactive");
            setPage(1);
          }}
          className={healthStatus === "inactive" ? "ring-2 ring-slate-400" : ""}
        />
      </div>

      {/* PAINEL PRINCIPAL DE FILTROS E LISTAGEM */}
      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
              <Radio className="h-4 w-4 text-blue-400 animate-pulse" />
              <span>Painel do Radar de Motoristas</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                className={`md:hidden h-8 rounded-xl px-2.5 flex items-center gap-1.5 border transition-all text-[10px] font-bold uppercase tracking-wider ${
                  isMobileFiltersOpen
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white"
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
                className="h-8 rounded-xl text-slate-400 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:text-white px-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
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
                className="h-8 rounded-xl text-blue-400 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:text-blue-300 px-3 flex items-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingRadar ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* BARRA DE FILTROS */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${!isMobileFiltersOpen ? "hidden md:grid" : ""}`}>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Busca de Motorista
              </Label>
              <Input
                type="text"
                placeholder="Nome, apelido, telefone ou e-mail..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Saúde / Atividade
              </Label>
              <Select
                value={healthStatus}
                onValueChange={(val: "all" | "active" | "alert" | "risk" | "inactive") => {
                  setHealthStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="all" className="text-xs">Todas as faixas</SelectItem>
                  <SelectItem value="active" className="text-xs">Ativos (≤ 2 dias)</SelectItem>
                  <SelectItem value="alert" className="text-xs">Em Alerta (3 a 7 dias)</SelectItem>
                  <SelectItem value="risk" className="text-xs">Em Risco Crítico (&gt; 7 dias)</SelectItem>
                  <SelectItem value="inactive" className="text-xs">Sem Atividade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Assinatura
              </Label>
              <Select
                value={subscriptionStatus}
                onValueChange={(val) => {
                  setSubscriptionStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="active_trial" className="text-xs">Ativos e Trial (Padrão)</SelectItem>
                  <SelectItem value="all" className="text-xs">Todas as assinaturas</SelectItem>
                  <SelectItem value="ACTIVE" className="text-xs">Somente Ativos (Pagantes)</SelectItem>
                  <SelectItem value="TRIAL" className="text-xs">Somente Em Teste (Trial)</SelectItem>
                  <SelectItem value="PAST_DUE" className="text-xs">Atrasados (Past Due)</SelectItem>
                  <SelectItem value="EXPIRED" className="text-xs">Expirados</SelectItem>
                  <SelectItem value="CANCELED" className="text-xs">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Ordenação
              </Label>
              <Select
                value={sort}
                onValueChange={(val: "recent_first" | "inactive_first" | "newest_first" | "oldest_first" | "name_asc") => {
                  setSort(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="recent_first" className="text-xs">Mais Recentes Primeiro</SelectItem>
                  <SelectItem value="inactive_first" className="text-xs">Mais Inativos Primeiro</SelectItem>
                  <SelectItem value="newest_first" className="text-xs">Cadastro Mais Novo</SelectItem>
                  <SelectItem value="oldest_first" className="text-xs">Cadastro Mais Antigo</SelectItem>
                  <SelectItem value="name_asc" className="text-xs">Nome (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LISTAGEM DE MOTORISTAS */}
          {isLoadingRadar ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-xs font-bold text-slate-400">Escaneando atividades dos motoristas...</p>
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

          {/* PAGINAÇÃO */}
          {!isLoadingRadar && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 gap-4">
              <p className="text-xs font-semibold text-slate-400">
                Página {page} de {totalPages} ({total} motoristas encontrados)
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                  <Select
                    value={limit}
                    onValueChange={(val) => {
                      setLimit(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs w-[72px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
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
                    className="h-8 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 text-xs font-bold"
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 text-xs font-bold"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
