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
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminDailyPulseDriverCard } from "./AdminDailyPulseDriverCard";
import { getNowBR, toPersistenceString, addDays } from "@/utils/dateUtils";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Data do Pulso de Acessos</h3>
            <p className="text-xs text-slate-400">
              {isToday ? "Visualizando acessos em tempo real de hoje" : isYesterday ? "Visualizando acessos de ontem" : `Visualizando acessos em ${selectedDate}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            size="sm"
            variant={isToday ? "default" : "outline"}
            onClick={() => {
              setSelectedDate(todayStr);
              setPage(1);
            }}
            className={`h-8 rounded-xl text-xs font-bold ${
              isToday
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Hoje
          </Button>

          <Button
            type="button"
            size="sm"
            variant={isYesterday ? "default" : "outline"}
            onClick={() => {
              setSelectedDate(yesterdayStr);
              setPage(1);
            }}
            className={`h-8 rounded-xl text-xs font-bold ${
              isYesterday
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Ontem
          </Button>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                setPage(1);
              }
            }}
            className="h-8 w-36 rounded-xl bg-slate-900 border-slate-800 text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminKpiCard
            title="ACESSOS ÚNICOS NO DIA"
            value={isLoadingStats ? "..." : (stats?.totalAcessosUnicos ?? 0)}
            subtext="Motoristas únicos no dia"
            cardBorder="border-blue-500/40 shadow-blue-500/10"
            iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
            icon={<Users className="h-5 w-5" />}
            onClick={() => {
              setTipoUsuario("all");
              setSubscriptionStatus("all");
              setPage(1);
            }}
            className={tipoUsuario === "all" && subscriptionStatus === "all" ? "ring-2 ring-blue-500" : ""}
          />

          <AdminKpiCard
            title="RECORRENTES (VETERANOS)"
            value={isLoadingStats ? "..." : (stats?.totalRecorrentes ?? 0)}
            subtext="Cadastrados antes deste dia"
            cardBorder="border-sky-500/40 shadow-sky-500/10"
            iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
            icon={<Repeat className="h-5 w-5" />}
            onClick={() => {
              setTipoUsuario("recorrente");
              setSubscriptionStatus("all");
              setPage(1);
            }}
            className={tipoUsuario === "recorrente" ? "ring-2 ring-sky-500" : ""}
          />

          <AdminKpiCard
            title="NOVOS CADASTROS"
            value={isLoadingStats ? "..." : (stats?.totalNovos ?? 0)}
            subtext="Criaram conta neste dia"
            cardBorder="border-emerald-500/40 shadow-emerald-500/10"
            iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            icon={<Sparkles className="h-5 w-5" />}
            onClick={() => {
              setTipoUsuario("novo");
              setSubscriptionStatus("all");
              setPage(1);
            }}
            className={tipoUsuario === "novo" ? "ring-2 ring-emerald-500" : ""}
          />

          <AdminKpiCard
            title="NOVOS REENGAJADOS"
            value={isLoadingStats ? "..." : (stats?.totalNovosReengajados ?? 0)}
            subtext="Retornaram após o cadastro"
            cardBorder="border-purple-500/40 shadow-purple-500/10"
            iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
            icon={<Zap className="h-5 w-5" />}
          />
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Assinaturas dos Usuários que Acessaram no Dia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "ACTIVE" ? "all" : "ACTIVE");
                setPage(1);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                subscriptionStatus === "ACTIVE"
                  ? "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Assinantes Pagantes</div>
              <div className="text-lg font-black text-white">{stats?.totalAtivos ?? 0}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "TRIAL" ? "all" : "TRIAL");
                setPage(1);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                subscriptionStatus === "TRIAL"
                  ? "bg-sky-500/20 border-sky-500/50 ring-2 ring-sky-500"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Em Trial (Testes)</div>
              <div className="text-lg font-black text-white">{stats?.totalTrial ?? 0}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "VITALICIO" ? "all" : "VITALICIO");
                setPage(1);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                subscriptionStatus === "VITALICIO"
                  ? "bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Vitalícios</div>
              <div className="text-lg font-black text-white">{stats?.totalVitalicios ?? 0}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubscriptionStatus(prev => prev === "EXPIRED_PAST_DUE" ? "all" : "EXPIRED_PAST_DUE");
                setPage(1);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                subscriptionStatus === "EXPIRED_PAST_DUE"
                  ? "bg-rose-500/20 border-rose-500/50 ring-2 ring-rose-500"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Vencidos / Expirados</span>
                <ShieldAlert className="h-3 w-3 text-rose-400" />
              </div>
              <div className="text-lg font-black text-white">{stats?.totalVencidosExpirados ?? 0}</div>
            </button>
          </div>
        </div>
      </div>

      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>Motoristas Ativos no Dia ({total})</span>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setIsMobileFiltersOpen(prev => !prev)}
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
                disabled={isFetchingList || isFetchingStats}
                className="h-8 rounded-xl text-blue-400 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:text-blue-300 px-3 flex items-center gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingList || isFetchingStats ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${!isMobileFiltersOpen ? "hidden md:grid" : ""}`}>
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
                Perfil de Acesso no Dia
              </Label>
              <Select
                value={tipoUsuario}
                onValueChange={(val: "all" | "novo" | "recorrente") => {
                  setTipoUsuario(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="all" className="text-xs">Todos os perfis</SelectItem>
                  <SelectItem value="recorrente" className="text-xs">Recorrentes (Veteranos)</SelectItem>
                  <SelectItem value="novo" className="text-xs">Novos Cadastros</SelectItem>
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
                  <SelectItem value="all" className="text-xs">Todas as assinaturas</SelectItem>
                  <SelectItem value="ACTIVE" className="text-xs">Assinantes Pagantes</SelectItem>
                  <SelectItem value="TRIAL" className="text-xs">Em Trial (Testes)</SelectItem>
                  <SelectItem value="VITALICIO" className="text-xs">Vitalício</SelectItem>
                  <SelectItem value="EXPIRED_PAST_DUE" className="text-xs">Vencidos / Expirados</SelectItem>
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
