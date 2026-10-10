import { useState, useEffect } from "react";
import {
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  Send,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayout } from "@/contexts/LayoutContext";
import { getNowBR, toPersistenceString } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { toast } from "@/utils/notifications/toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminBroadcastNotificationView } from "@/components/features/admin/broadcast/AdminBroadcastNotificationView";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotificationLogsList,
  NotificationFiltersState,
  NOTIFICATION_FILTER_ALL,
} from "@/components/features/admin/NotificationLogsList";
import { NotificationCategoryEnum } from "@/utils/formatters/notificationEvents";
import {
  useAdminGlobalNotifications,
  useAdminRetryBulkNotifications,
} from "@/hooks/api/admin/useAdminNotificationHooks";
import { useDebounce } from "@/hooks/ui/useDebounce";

interface ExtendedNotificationFiltersState extends NotificationFiltersState {
  dataInicio: string;
  dataFim: string;
}

export default function AdminNotificationsHistory() {
  const { setPageTitle, openConfirmationDialog } = useLayout();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("historico");

  useEffect(() => {
    setPageTitle("Notificações");
  }, [setPageTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("25");

  const today = toPersistenceString(getNowBR());

  const [filters, setFilters] = useState<ExtendedNotificationFiltersState>({
    categoria: NotificationCategoryEnum.TODOS,
    canal: NOTIFICATION_FILTER_ALL,
    status: NOTIFICATION_FILTER_ALL,
    search: "",
    dataInicio: today,
    dataFim: today,
  });

  const debouncedSearch = useDebounce(filters.search.trim(), 400);

  const { data, isFetching } = useAdminGlobalNotifications(
    {
      page,
      limit: parseInt(limit),
      categoria:
        filters.categoria === NotificationCategoryEnum.TODOS
          ? undefined
          : filters.categoria,
      canal:
        filters.canal === NOTIFICATION_FILTER_ALL ? undefined : filters.canal,
      status:
        filters.status === NOTIFICATION_FILTER_ALL ? undefined : filters.status,
      search: debouncedSearch || undefined,
      dataInicio: filters.dataInicio || undefined,
      dataFim: filters.dataFim || undefined,
    },
    activeTab === "historico"
  );

  const kpis = data?.kpis;

  const handleBaseFiltersChange = (baseFilters: NotificationFiltersState) => {
    setFilters((prev) => ({
      ...prev,
      ...baseFilters,
    }));
    setPage(1);
  };

  const bulkRetryMutation = useAdminRetryBulkNotifications();

  const handleBatchRetryFiltered = () => {
    openConfirmationDialog({
      title: "Reprocessar Notificações em Lote",
      description: (
        <div className="space-y-3 text-left">
          <p className="text-xs text-muted-foreground">
            Deseja reenfileirar todas as notificações com falha ou canceladas que atendem aos filtros ativos?
          </p>
          <div className="p-3 bg-secondary/40 rounded-xl border border-border space-y-1.5 text-xs text-muted-foreground font-mono">
            <div>
              <span className="text-muted-foreground">Período: </span>
              <strong className="text-foreground">{filters.dataInicio} até {filters.dataFim}</strong>
            </div>
            {filters.canal !== NOTIFICATION_FILTER_ALL && (
              <div>
                <span className="text-muted-foreground">Canal: </span>
                <strong className="text-foreground">{filters.canal}</strong>
              </div>
            )}
            {filters.categoria !== NotificationCategoryEnum.TODOS && (
              <div>
                <span className="text-muted-foreground">Categoria: </span>
                <strong className="text-foreground">{filters.categoria}</strong>
              </div>
            )}
            {filters.search.trim() && (
              <div>
                <span className="text-muted-foreground">Busca: </span>
                <strong className="text-foreground">{filters.search}</strong>
              </div>
            )}
          </div>
        </div>
      ),
      confirmText: "Reenfileirar Notificações",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        try {
          const res = await bulkRetryMutation.mutateAsync({
            filters: {
              categoria: filters.categoria === NotificationCategoryEnum.TODOS ? undefined : filters.categoria,
              canal: filters.canal === NOTIFICATION_FILTER_ALL ? undefined : filters.canal,
              status: filters.status === NOTIFICATION_FILTER_ALL ? undefined : filters.status,
              search: debouncedSearch || undefined,
              dataInicio: filters.dataInicio || undefined,
              dataFim: filters.dataFim || undefined,
            },
          });
          toast.success(res.message || "Notificações reenfileiradas com sucesso!");
        } catch (err: unknown) {
          const error = err as Error;
          toast.error(error.message || "Erro ao reenfileirar notificações.");
        }
      },
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-primary" />
            <span>Notificações</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Histórico completo de eventos e disparo de comunicados em massa para motoristas
          </p>
        </div>

        <TabsList className="bg-secondary/60 border border-border p-1 rounded-2xl h-11 w-full sm:w-auto flex">
          <TabsTrigger
            value="historico"
            className="flex-1 sm:flex-initial justify-center rounded-xl px-3 sm:px-4 py-2 text-xs font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="sm:hidden">Histórico</span>
            <span className="hidden sm:inline">Histórico e reprocessamento</span>
          </TabsTrigger>
          <TabsTrigger
            value="broadcast"
            className="flex-1 sm:flex-initial justify-center rounded-xl px-3 sm:px-4 py-2 text-xs font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="sm:hidden">Enviar</span>
            <span className="hidden sm:inline">Disparar notificações</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="historico" className="mt-0 space-y-6">
        <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
          <CardHeader className="pb-3 border-b border-border/60 bg-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Bell className="h-4 w-4 text-primary" />
                <span className="sm:hidden">Histórico</span>
                <span className="hidden sm:inline">Histórico de notificações</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleBatchRetryFiltered}
                  disabled={isFetching || bulkRetryMutation.isPending}
                  className="h-9 rounded-lg text-amber-500 bg-secondary/60 border border-border hover:bg-amber-500/10 px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
                >
                  {bulkRetryMutation.isPending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Reprocessar falhas</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setPage(1);
                    queryClient.invalidateQueries({
                      queryKey: ["admin", "global", "notifications"],
                    });
                  }}
                  disabled={isFetching}
                  className="h-9 rounded-lg text-primary bg-secondary/60 border border-border hover:bg-primary/10 px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Atualizar</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 pb-2 mb-2 md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-0 touch-pan-x">
            <AdminKpiCard
              title="Total de notificações"
              value={kpis?.total ?? (isFetching ? "..." : 0)}
              subtext="No período selecionado"
              cardBorder="border-primary/40 shadow-xs"
              iconBg="bg-primary/10 text-primary border-primary/20"
              icon={<Bell className="h-5 w-5" />}
              className="w-[185px] sm:w-[200px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
              onClick={() =>
                handleBaseFiltersChange({
                  ...filters,
                  status: NOTIFICATION_FILTER_ALL,
                  canal: NOTIFICATION_FILTER_ALL,
                  categoria: NotificationCategoryEnum.TODOS,
                })
              }
            />

            <AdminKpiCard
              title="Taxa de entrega"
              value={kpis ? `${kpis.taxaSucesso}%` : (isFetching ? "..." : "100%")}
              subtext={
                kpis
                  ? kpis.cancelled > 0
                    ? `${kpis.sent} enviadas • ${kpis.cancelled} cancelada${kpis.cancelled > 1 ? "s" : ""} preventivamente`
                    : `${kpis.sent} enviadas com sucesso`
                  : "Envios concluídos"
              }
              cardBorder="border-emerald-500/40 shadow-xs"
              iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              icon={<CheckCircle2 className="h-5 w-5" />}
              className="w-[185px] sm:w-[200px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
            />

            <AdminKpiCard
              title="Falhas no envio"
              value={kpis?.failed ?? (isFetching ? "..." : 0)}
              subtext="Clique para filtrar falhas"
              cardBorder={
                kpis && kpis.failed > 0
                  ? "border-destructive/40 shadow-xs"
                  : "border-border shadow-xs"
              }
              iconBg={
                kpis && kpis.failed > 0
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-secondary text-muted-foreground border-border"
              }
              icon={<AlertTriangle className="h-5 w-5" />}
              className="w-[185px] sm:w-[200px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
              onClick={() => handleBaseFiltersChange({ ...filters, status: "FAILED" })}
            />

            <AdminKpiCard
              title="Mensagens WABA (Meta)"
              value={kpis?.wabaSent ?? (isFetching ? "..." : 0)}
              subtext={
                kpis && kpis.wabaFailed > 0
                  ? `${kpis.wabaFailed} falha(s) • Filtrar WABA`
                  : "Clique para filtrar WABA"
              }
              cardBorder="border-emerald-500/40 shadow-xs"
              iconBg="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              icon={<MessageSquare className="h-5 w-5" />}
              className="w-[185px] sm:w-[200px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
              onClick={() => handleBaseFiltersChange({ ...filters, canal: "WABA" })}
            />

            <AdminKpiCard
              title="Custo estimado WABA"
              value={
                kpis
                  ? `R$ ${kpis.custoEstimadoWaba.toFixed(2).replace(".", ",")}`
                  : (isFetching ? "..." : "R$ 0,00")
              }
              subtext="Base R$ 0,04 / msg entregue"
              cardBorder="border-purple-500/40 shadow-xs"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<DollarSign className="h-5 w-5" />}
              className="w-[185px] sm:w-[200px] shrink-0 md:w-auto md:shrink flex flex-col justify-between"
            />
          </div>

          {kpis && kpis.total > 0 && (
            <div className="bg-secondary/40 p-3 sm:p-4 rounded-2xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-xs font-semibold text-muted-foreground shrink-0">
                Distribuição por canal no período:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 -mx-1 px-1 touch-pan-x">
                {kpis.canais.waba > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "WABA" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    WABA: {kpis.canais.waba} ({Math.round((kpis.canais.waba / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.firebase > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "FIREBASE" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-medium hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Firebase: {kpis.canais.firebase} ({Math.round((kpis.canais.firebase / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.resend > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "RESEND" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-500 text-xs font-medium hover:bg-sky-500/20 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Resend: {kpis.canais.resend} ({Math.round((kpis.canais.resend / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.telegram > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "TELEGRAM" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Telegram: {kpis.canais.telegram} ({Math.round((kpis.canais.telegram / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.evolution > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "EVOLUTION" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-green-500/10 border border-green-500/25 text-green-500 text-xs font-medium hover:bg-green-500/20 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Evolution: {kpis.canais.evolution} ({Math.round((kpis.canais.evolution / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.sms > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "SMS" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    SMS: {kpis.canais.sms} ({Math.round((kpis.canais.sms / kpis.total) * 100)}%)
                  </button>
                )}
              </div>
            </div>
          )}

          <NotificationLogsList
            notifications={data?.data || []}
            isLoading={isFetching}
            filters={filters}
            onFiltersChange={handleBaseFiltersChange}
            hideDriverColumn={false}
            showPeriodFilter={true}
            startDate={filters.dataInicio}
            endDate={filters.dataFim}
            onPeriodChange={(start, end) => {
              setPage(1);
              setFilters((p) => ({ ...p, dataInicio: start, dataFim: end }));
            }}
            isPeriodActive={filters.dataInicio !== today || filters.dataFim !== today}
            onResetAllFilters={() => {
              setPage(1);
              setFilters((p) => ({ ...p, dataInicio: today, dataFim: today }));
            }}
          />

          {!isFetching && data && data.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border/40 gap-4">
              <p className="text-xs font-medium text-muted-foreground">
                Página {data.page} de{" "}
                {Math.max(1, Math.ceil(data.total / data.limit))} ({data.total}{" "}
                notificações)
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Exibir:
                  </Label>
                  <Select
                    value={limit}
                    onValueChange={(val) => {
                      setLimit(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 rounded-lg bg-background border border-border text-foreground text-xs focus-visible:ring-0 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={page >= Math.ceil(data.total / data.limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="broadcast" className="mt-0">
        <AdminBroadcastNotificationView />
      </TabsContent>
    </Tabs>
  );
}
