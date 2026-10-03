import { useState, useEffect } from "react";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Filter,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayout } from "@/contexts/LayoutContext";
import { getNowBR, toPersistenceString, addDays } from "@/utils/dateUtils";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/formatters/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminRepasses,
  useAdminRepasseKpis,
  useAdminRetryRepasse,
  ADMIN_REPASSE_KEYS,
} from "@/hooks/api/admin/useAdminRepasseHooks";
import { useAdminRealtimeRepasses } from "@/hooks/api/admin/useAdminRealtimeRepasses";
import { RepasseLogsList } from "@/components/features/admin/RepasseLogsList";
import { RepasseFiltersState } from "@/types/admin-repasse";

export default function AdminRepasses() {
  const { setPageTitle } = useLayout();
  const queryClient = useQueryClient();
  const { isConnected } = useAdminRealtimeRepasses();

  useEffect(() => {
    setPageTitle("Repasses Pix");
  }, [setPageTitle]);

  const now = getNowBR();
  const today = toPersistenceString(now);
  const monthStart = toPersistenceString(new Date(now.getFullYear(), now.getMonth(), 1));

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("25");

  const [filters, setFilters] = useState<RepasseFiltersState>({
    status: "TODOS",
    search: "",
    dataInicio: monthStart,
    dataFim: today,
  });

  const repassesQuery = useAdminRepasses({
    page,
    limit: Number(limit),
    data_inicio: filters.dataInicio,
    data_fim: filters.dataFim,
    status: filters.status,
    search: filters.search,
  });

  const kpisQuery = useAdminRepasseKpis({
    data_inicio: filters.dataInicio,
    data_fim: filters.dataFim,
  });

  const retryMutation = useAdminRetryRepasse();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_REPASSE_KEYS.all });
  };

  const handleApplyPeriod = (inicio: string, fim: string) => {
    setFilters((prev) => ({ ...prev, dataInicio: inicio, dataFim: fim }));
    setPage(1);
  };

  const kpis = kpisQuery.data || {
    total_repassado: 0,
    total_taxa_plataforma: 0,
    total_sucesso: 0,
    total_falhas: 0,
    total_pendentes: 0,
  };

  const totalPages = Math.ceil((repassesQuery.data?.total || 0) / Number(limit)) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-black text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            Gestão de Repasses Pix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Auditoria, acompanhamento e liquidação das transferências bancárias via BaaS (Woovi).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400"
            }`}
            title={isConnected ? "Conectado em tempo real via WebSocket" : "Sincronizando com o servidor..."}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? "bg-emerald-500" : "bg-slate-500"
                }`}
              />
            </span>
            <span>{isConnected ? "Ao Vivo" : "Sincronizando"}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={repassesQuery.isFetching || kpisQuery.isFetching}
            className="h-9 px-3.5 bg-slate-900 border-slate-700 text-slate-200 text-xs rounded-xl hover:text-white gap-2 shadow-sm"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${repassesQuery.isFetching || kpisQuery.isFetching ? "animate-spin" : ""}`}
            />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AdminKpiCard
          title="TOTAL REPASSADO"
          value={formatCurrency(kpis.total_repassado)}
          subtext="Líquido transferido aos motoristas"
          cardBorder="border-emerald-500/30 shadow-emerald-500/10"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          icon={<DollarSign className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="TAXA RETIDA VAN360"
          value={formatCurrency(kpis.total_taxa_plataforma)}
          subtext="Receita bruta retida da plataforma"
          cardBorder="border-blue-500/30 shadow-blue-500/10"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="REPASSES CONCLUÍDOS"
          value={kpis.total_sucesso}
          subtext="Transferências Pix liquidadas com sucesso"
          cardBorder="border-slate-800"
          iconBg="bg-slate-800 text-emerald-400 border-slate-700"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="FALHAS / ATENÇÃO"
          value={kpis.total_falhas}
          subtext={
            kpis.total_falhas > 0
              ? `${kpis.total_falhas} repasse(s) requerem retentativa manual`
              : "Nenhuma pendência crítica"
          }
          cardBorder={
            kpis.total_falhas > 0
              ? "border-rose-500/50 shadow-rose-500/20 animate-pulse"
              : "border-slate-800"
          }
          iconBg={
            kpis.total_falhas > 0
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="h-4 w-4 text-blue-400" />
            <span>Filtro de Período</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPeriod(today, today)}
              className="h-7 px-2.5 text-[11px] bg-slate-900 border-slate-700 text-slate-300 hover:text-white rounded-lg"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPeriod(toPersistenceString(addDays(now, -7)), today)}
              className="h-7 px-2.5 text-[11px] bg-slate-900 border-slate-700 text-slate-300 hover:text-white rounded-lg"
            >
              Últimos 7 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPeriod(monthStart, today)}
              className="h-7 px-2.5 text-[11px] bg-slate-900 border-slate-700 text-slate-300 hover:text-white rounded-lg"
            >
              Mês Atual
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Início</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, dataInicio: e.target.value }));
                  setPage(1);
                }}
                className="pl-9 h-9 bg-slate-950/60 border-slate-800 text-slate-200 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Término</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, dataFim: e.target.value }));
                  setPage(1);
                }}
                className="pl-9 h-9 bg-slate-950/60 border-slate-800 text-slate-200 text-xs rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <RepasseLogsList
        repasses={repassesQuery.data?.data || []}
        isLoading={repassesQuery.isLoading}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onRetry={(id) => retryMutation.mutate(id)}
        isRetryingId={retryMutation.isPending ? (retryMutation.variables as string) : null}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131b2e] border border-slate-800/80 p-3.5 rounded-2xl text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Exibindo</span>
          <Select
            value={limit}
            onValueChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-16 bg-slate-900 border-slate-700 text-slate-200 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>de {repassesQuery.data?.total || 0} repasses</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || repassesQuery.isLoading}
            className="h-8 px-2.5 bg-slate-900 border-slate-700 text-slate-300 hover:text-white rounded-lg disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-slate-300 font-semibold px-2">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || repassesQuery.isLoading}
            className="h-8 px-2.5 bg-slate-900 border-slate-700 text-slate-300 hover:text-white rounded-lg disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
