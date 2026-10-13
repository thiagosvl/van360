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
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayout } from "@/contexts/LayoutContext";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { calculateDateRangeForPreset } from "@/components/ui/AdminPeriodFilter";
import { Button } from "@/components/ui/button";
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

  const initialPeriod = calculateDateRangeForPreset("mes_atual");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("25");

  const [filters, setFilters] = useState<RepasseFiltersState>({
    status: "TODOS",
    search: "",
    dataInicio: initialPeriod.dataInicio || "",
    dataFim: initialPeriod.dataFim || "",
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground tracking-tight flex items-center gap-2.5">
            <ArrowUpRight className="h-6 w-6 text-primary" />
            Gestão de repasses Pix
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Auditoria, acompanhamento e liquidação das transferências bancárias via BaaS (Woovi).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-secondary border-border text-muted-foreground"
            }`}
            title={isConnected ? "Conectado em tempo real via WebSocket" : "Sincronizando com o servidor..."}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? "bg-emerald-500" : "bg-muted-foreground"
                }`}
              />
            </span>
            <span>{isConnected ? "Ao vivo" : "Sincronizando"}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={repassesQuery.isFetching || kpisQuery.isFetching}
            className="h-9 px-3.5 bg-card border-border text-foreground text-xs rounded-xl hover:bg-secondary gap-2 shadow-xs"
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
          title="Total repassado"
          value={formatCurrency(kpis.total_repassado)}
          subtext="Líquido transferido aos motoristas"
          cardBorder="border-emerald-500/30 shadow-xs"
          iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          icon={<DollarSign className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Taxa retida Van360"
          value={formatCurrency(kpis.total_taxa_plataforma)}
          subtext="Receita bruta retida da plataforma"
          cardBorder="border-primary/30 shadow-xs"
          iconBg="bg-primary/10 text-primary border-primary/20"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Repasses concluídos"
          value={kpis.total_sucesso}
          subtext="Transferências Pix liquidadas com sucesso"
          cardBorder="border-border shadow-xs"
          iconBg="bg-secondary text-emerald-500 border-border"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <AdminKpiCard
          title="Falhas / atenção"
          value={kpis.total_falhas}
          subtext={
            kpis.total_falhas > 0
              ? `${kpis.total_falhas} repasse(s) requerem retentativa manual`
              : "Nenhuma pendência crítica"
          }
          cardBorder={
            kpis.total_falhas > 0
              ? "border-destructive/50 shadow-xs animate-pulse"
              : "border-border shadow-xs"
          }
          iconBg={
            kpis.total_falhas > 0
              ? "bg-destructive/20 text-destructive border-destructive/30"
              : "bg-secondary text-muted-foreground border-border"
          }
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <RepasseLogsList
        repasses={repassesQuery.data?.data || []}
        isLoading={repassesQuery.isLoading}
        filters={filters}
        showPeriodFilter={true}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onRetry={(id) => retryMutation.mutate(id)}
        isRetryingId={retryMutation.isPending ? (retryMutation.variables as string) : null}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-3.5 rounded-2xl text-xs text-muted-foreground shadow-xs">
        <div className="flex items-center gap-2">
          <span>Exibindo</span>
          <Select
            value={limit}
            onValueChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-16 bg-background border border-border text-foreground text-xs rounded-lg focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
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
            className="h-9 px-3 bg-background border border-border text-foreground hover:bg-secondary rounded-lg disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-foreground font-medium px-2">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || repassesQuery.isLoading}
            className="h-9 px-3 bg-background border border-border text-foreground hover:bg-secondary rounded-lg disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
