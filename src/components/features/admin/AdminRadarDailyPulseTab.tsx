import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Repeat,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Filter,
  Loader2,
  Calendar,
  Zap,
  ShieldAlert,
} from "lucide-react";
import {
  useAdminUsersDailyPulse,
  useAdminUsersDailyPulseStats,
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
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminPeriodFilter } from "@/components/ui/AdminPeriodFilter";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminDailyPulseDriverCard } from "./AdminDailyPulseDriverCard";
import { getNowBR, toPersistenceString, addDays } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

interface AdminRadarDailyPulseTabProps {
  isActive: boolean;
}

export function AdminRadarDailyPulseTab({ isActive }: AdminRadarDailyPulseTabProps) {
  const queryClient = useQueryClient();

  const todayStr = toPersistenceString(getNowBR());
  const yesterdayStr = toPersistenceString(addDays(getNowBR(), -1));

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("25");
  const [search, setSearch] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"all" | "novo" | "recorrente">("all");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { data: stats, isLoading: isLoadingStats, isFetching: isFetchingStats } = useAdminUsersDailyPulseStats(
    selectedDate,
    { enabled: isActive }
  );

  const {
    data: listResponse,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
  } = useAdminUsersDailyPulse(
    {
      date: selectedDate,
      search: search.trim() || undefined,
      tipoUsuario,
      subscriptionStatus,
      page,
      limit: parseInt(limit, 10),
    },
    { enabled: isActive }
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users", "daily-pulse"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "users", "daily-pulse-stats"] });
  };

  const handleResetFilters = () => {
    setSearch("");
    setTipoUsuario("all");
    setSubscriptionStatus("all");
    setPage(1);
  };

  const total = listResponse?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / parseInt(limit, 10)));
  const drivers = listResponse?.data || [];

  const isToday = selectedDate === todayStr;
  const isYesterday = selectedDate === yesterdayStr;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Data do pulso de acessos</h3>
            <p className="text-xs text-muted-foreground">
              {isToday ? "Visualizando acessos em tempo real de hoje" : isYesterday ? "Visualizando acessos de ontem" : `Visualizando acessos em ${selectedDate}`}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <AdminPeriodFilter
            defaultPreset="hoje"
            allowedPresets={["hoje", "ontem", "custom"]}
            startDate={selectedDate}
            endDate={selectedDate}
            onChange={(start) => {
              if (start) {
                setSelectedDate(start);
                setPage(1);
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 md:grid md:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-0 touch-pan-x">
          <AdminKpiCard
            title="Acessos únicos no dia"
            value={isLoadingStats ? "..." : (stats?.totalAcessosUnicos ?? 0)}
            subtext="Motoristas únicos no dia"
            cardBorder="border-primary/30 shadow-xs"
            iconBg="bg-primary/10 text-primary border-primary/20"
            icon={<Users className="h-5 w-5" />}
            onClick={() => {
              setTipoUsuario("all");
              setSubscriptionStatus("all");
              setPage(1);
            }}
            className={cn("w-[190px] sm:w-[210px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", tipoUsuario === "all" && subscriptionStatus === "all" ? "ring-2 ring-primary" : "")}
          />

          <AdminKpiCard
            title="Recorrentes (veteranos)"
            value={isLoadingStats ? "..." : (stats?.totalRecorrentes ?? 0)}
            subtext="Não assinantes cadastrados antes"
            cardBorder="border-sky-500/30 shadow-xs"
            iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
            icon={<Repeat className="h-5 w-5" />}
            onClick={() => {
              setTipoUsuario("recorrente");
              setSubscriptionStatus("all");
              setPage(1);
            }}
            className={cn("w-[190px] sm:w-[210px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", tipoUsuario === "recorrente" ? "ring-2 ring-sky-500" : "")}
          />

          <AdminKpiCard
            title="Novos cadastros"
            value={isLoadingStats ? "..." : (stats?.totalNovos ?? 0)}
            subtext="Criaram conta neste dia"
            cardBorder="border-emerald-500/30 shadow-xs"
            iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            icon={<Sparkles className="h-5 w-5" />}
            onClick={() => {
              setTipoUsuario("novo");
              setSubscriptionStatus("all");
              setPage(1);
            }}
            className={cn("w-[190px] sm:w-[210px] shrink-0 md:w-auto md:shrink flex flex-col justify-between", tipoUsuario === "novo" ? "ring-2 ring-emerald-500" : "")}
          />

          <AdminKpiCard
            title="Novos reengajados"
            value={isLoadingStats ? "..." : (stats?.totalNovosReengajados ?? 0)}
            subtext="Retornaram após o cadastro"
            cardBorder="border-purple-500/30 shadow-xs"
            iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
            icon={<Zap className="h-5 w-5" />}
            className="w-[190px] sm:w-[210px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-muted-foreground">
              Assinaturas dos motoristas que acessaram no dia
            </span>
          </div>

          <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-3 px-3 pb-1 md:grid md:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0 touch-pan-x">
            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "ACTIVE" ? "all" : "ACTIVE");
                setPage(1);
              }}
              className={cn(
                "w-[140px] shrink-0 md:w-auto md:shrink p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                subscriptionStatus === "ACTIVE"
                  ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500"
                  : "bg-secondary/40 border-border hover:bg-secondary/60"
              )}
            >
              <div className="text-xs font-semibold text-emerald-500">Assinantes pagantes</div>
              <div className="text-lg font-bold text-foreground mt-0.5">{stats?.totalAtivos ?? 0}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "TRIAL" ? "all" : "TRIAL");
                setPage(1);
              }}
              className={cn(
                "w-[140px] shrink-0 md:w-auto md:shrink p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                subscriptionStatus === "TRIAL"
                  ? "bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500"
                  : "bg-secondary/40 border-border hover:bg-secondary/60"
              )}
            >
              <div className="text-xs font-semibold text-sky-400">Em trial (testes)</div>
              <div className="text-lg font-bold text-foreground mt-0.5">{stats?.totalTrial ?? 0}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "VITALICIO" ? "all" : "VITALICIO");
                setPage(1);
              }}
              className={cn(
                "w-[140px] shrink-0 md:w-auto md:shrink p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                subscriptionStatus === "VITALICIO"
                  ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500"
                  : "bg-secondary/40 border-border hover:bg-secondary/60"
              )}
            >
              <div className="text-xs font-semibold text-amber-400">Vitalícios</div>
              <div className="text-lg font-bold text-foreground mt-0.5">{stats?.totalVitalicios ?? 0}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "EXPIRED_PAST_DUE" ? "all" : "EXPIRED_PAST_DUE");
                setPage(1);
              }}
              className={cn(
                "w-[140px] shrink-0 md:w-auto md:shrink p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                subscriptionStatus === "EXPIRED_PAST_DUE"
                  ? "bg-destructive/10 border-destructive/40 ring-1 ring-destructive"
                  : "bg-secondary/40 border-border hover:bg-secondary/60"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-destructive">Vencidos / expirados</span>
                <ShieldAlert className="h-3 w-3 text-destructive" />
              </div>
              <div className="text-lg font-bold text-foreground mt-0.5">{stats?.totalVencidosExpirados ?? 0}</div>
            </button>
          </div>
        </div>
      </div>

      <Card className="border border-border shadow-xs rounded-2xl overflow-hidden bg-card">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Motoristas ativos no dia ({total})</span>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsMobileFiltersOpen(prev => !prev)}
                className={`md:hidden h-8 rounded-lg px-2.5 flex items-center gap-1.5 border transition-all text-xs font-medium ${
                  isMobileFiltersOpen
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
                className="h-8 rounded-lg text-muted-foreground bg-secondary/60 border border-border hover:bg-secondary hover:text-foreground px-2.5 flex items-center gap-1.5 text-xs font-medium"
                title="Limpar todos os filtros"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isFetchingList || isFetchingStats}
                className="h-8 rounded-lg text-primary bg-secondary/60 border border-border hover:bg-secondary hover:text-primary px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingList || isFetchingStats ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 ${!isMobileFiltersOpen ? "hidden md:grid" : ""}`}>
            <div className="space-y-1.5 text-left w-full">
              <Label className="text-xs font-medium text-muted-foreground">
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
                className="h-9 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5 text-left w-full">
              <Label className="text-xs font-medium text-muted-foreground">
                Perfil de acesso no dia
              </Label>
              <Select
                value={tipoUsuario}
                onValueChange={(val: "all" | "novo" | "recorrente") => {
                  setTipoUsuario(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-lg bg-background border-border text-foreground text-sm focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="all" className="text-xs">Todos os perfis</SelectItem>
                  <SelectItem value="recorrente" className="text-xs">Recorrentes (veteranos)</SelectItem>
                  <SelectItem value="novo" className="text-xs">Novos cadastros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 text-left w-full">
              <Label className="text-xs font-medium text-muted-foreground">
                Assinatura
              </Label>
              <Select
                value={subscriptionStatus}
                onValueChange={(val) => {
                  setSubscriptionStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-lg bg-background border-border text-foreground text-sm focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="all" className="text-xs">Todas as assinaturas</SelectItem>
                  <SelectItem value="ACTIVE" className="text-xs">Assinantes pagantes</SelectItem>
                  <SelectItem value="TRIAL" className="text-xs">Em teste (trial)</SelectItem>
                  <SelectItem value="VITALICIO" className="text-xs">Vitalício</SelectItem>
                  <SelectItem value="EXPIRED_PAST_DUE" className="text-xs">Vencidos / expirados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-xs font-bold text-slate-400">Buscando acessos registrados...</p>
            </div>
          ) : drivers.length === 0 ? (
            <AdminEmptyState
              icon={Users}
              title="Nenhum acesso registrado"
              description={`Nenhum motorista com os filtros selecionados registrou atividade em ${selectedDate}.`}
            />
          ) : (
            <div className="space-y-3 pt-2">
              {drivers.map((driver) => (
                <AdminDailyPulseDriverCard key={driver.id} driver={driver} />
              ))}
            </div>
          )}

          {!isLoadingList && total > 0 && (
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
