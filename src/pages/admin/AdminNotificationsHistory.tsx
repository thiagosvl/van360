import { useState, useEffect } from "react";
import {
  Filter,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Calendar,
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
  searchMotorista: string;
  dataInicio: string;
  dataFim: string;
}

export default function AdminNotificationsHistory() {
  const { setPageTitle, openConfirmationDialog } = useLayout();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("historico");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setPageTitle("Notificações");
  }, [setPageTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("25");

  const today = toPersistenceString(getNowBR());
  const sevenDaysAgo = toPersistenceString(
    new Date(getNowBR().getTime() - 7 * 24 * 60 * 60 * 1000)
  );

  const [filters, setFilters] = useState<ExtendedNotificationFiltersState>({
    categoria: NotificationCategoryEnum.TODOS,
    canal: NOTIFICATION_FILTER_ALL,
    status: NOTIFICATION_FILTER_ALL,
    search: "",
    searchMotorista: "",
    dataInicio: sevenDaysAgo,
    dataFim: today,
  });

  const [motoristaInput, setMotoristaInput] = useState("");
  const debouncedMotorista = useDebounce(motoristaInput, 400);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.searchMotorista === debouncedMotorista) return prev;
      return { ...prev, searchMotorista: debouncedMotorista };
    });
    setPage(1);
  }, [debouncedMotorista]);

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
      search: filters.search.trim() || undefined,
      searchMotorista: filters.searchMotorista.trim() || undefined,
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

  const handleResetUpperFilters = () => {
    setMotoristaInput("");
    setFilters((prev) => ({
      ...prev,
      searchMotorista: "",
      dataInicio: sevenDaysAgo,
      dataFim: today,
    }));
    setPage(1);
  };

  const hasUpperFiltersActive =
    motoristaInput.trim() !== "" ||
    filters.dataInicio !== sevenDaysAgo ||
    filters.dataFim !== today;

  const bulkRetryMutation = useAdminRetryBulkNotifications();

  const handleBatchRetryFiltered = () => {
    openConfirmationDialog({
      title: "Reprocessar Notificações em Lote",
      description: (
        <div className="space-y-3 text-left">
          <p className="text-xs text-slate-300">
            Deseja reenfileirar todas as notificações com falha ou canceladas que atendem aos filtros ativos?
          </p>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-400 font-mono">
            <div>
              <span className="text-slate-500">Período: </span>
              <strong className="text-slate-200">{filters.dataInicio} até {filters.dataFim}</strong>
            </div>
            {filters.canal !== NOTIFICATION_FILTER_ALL && (
              <div>
                <span className="text-slate-500">Canal: </span>
                <strong className="text-slate-200">{filters.canal}</strong>
              </div>
            )}
            {filters.categoria !== NotificationCategoryEnum.TODOS && (
              <div>
                <span className="text-slate-500">Categoria: </span>
                <strong className="text-slate-200">{filters.categoria}</strong>
              </div>
            )}
            {filters.searchMotorista && (
              <div>
                <span className="text-slate-500">Motorista: </span>
                <strong className="text-slate-200">{filters.searchMotorista}</strong>
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
              search: filters.search.trim() || undefined,
              searchMotorista: filters.searchMotorista.trim() || undefined,
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
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-headline font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-blue-400" />
            <span>Notificações</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Histórico completo de eventos e disparo de comunicados em massa para motoristas
          </p>
        </div>

        <TabsList className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl h-11">
          <TabsTrigger
            value="historico"
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Histórico e Reprocessamento</span>
          </TabsTrigger>
          <TabsTrigger
            value="broadcast"
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center gap-2"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Disparar Notificações</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="historico" className="mt-0 space-y-6">
        <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
          <CardHeader className="pb-2 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
                <Bell className="h-4 w-4 text-indigo-400" />
                <span>Histórico de Notificações</span>
              </CardTitle>
              <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleBatchRetryFiltered}
                disabled={isFetching || bulkRetryMutation.isPending}
                className="h-8 rounded-xl text-amber-400 bg-slate-900/60 border border-slate-800/80 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/40 px-3 flex items-center gap-1.5 transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
              >
                {bulkRetryMutation.isPending ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Reprocessar Falhas</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsMobileFiltersOpen((p) => !p)}
                className={`md:hidden h-8 rounded-xl px-2.5 flex items-center gap-1.5 border transition-all text-[10px] font-bold uppercase tracking-wider ${
                  isMobileFiltersOpen
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
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
                className="h-8 rounded-xl text-blue-400 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:text-blue-300 hover:border-slate-700/80 px-3 flex items-center gap-1.5 transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
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
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 ${
              !isMobileFiltersOpen ? "hidden md:grid" : ""
            }`}
          >
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User className="h-3 w-3 text-blue-400" />
                <span>Motorista</span>
              </Label>
              <Input
                type="text"
                placeholder="Nome, apelido, telefone, CPF ou ID..."
                value={motoristaInput}
                onChange={(e) => setMotoristaInput(e.target.value)}
                className="h-9 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-emerald-400" />
                <span>Data Início</span>
              </Label>
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => {
                  setPage(1);
                  setFilters((p) => ({ ...p, dataInicio: e.target.value }));
                }}
                className="h-9 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 text-xs focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-emerald-400" />
                <span>Data Fim</span>
              </Label>
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => {
                  setPage(1);
                  setFilters((p) => ({ ...p, dataFim: e.target.value }));
                }}
                className="h-9 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 text-xs focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              {hasUpperFiltersActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetUpperFilters}
                  className="h-9 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 px-3 w-full border border-slate-800"
                >
                  Limpar Período / Motorista
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <AdminKpiCard
              title="TOTAL DE NOTIFICAÇÕES"
              value={kpis?.total ?? (isFetching ? "..." : 0)}
              subtext="No período selecionado"
              cardBorder="border-blue-500/40 shadow-blue-500/10"
              iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
              icon={<Bell className="h-5 w-5" />}
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
              title="TAXA DE ENTREGA"
              value={kpis ? `${kpis.taxaSucesso}%` : (isFetching ? "..." : "100%")}
              subtext={
                kpis
                  ? kpis.cancelled > 0
                    ? `${kpis.sent} enviadas • ${kpis.cancelled} cancelada${kpis.cancelled > 1 ? "s" : ""} preventivamente`
                    : `${kpis.sent} enviadas com sucesso`
                  : "Envios concluídos"
              }
              cardBorder="border-emerald-500/40 shadow-emerald-500/10"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />

            <AdminKpiCard
              title="FALHAS NO ENVIO"
              value={kpis?.failed ?? (isFetching ? "..." : 0)}
              subtext="Clique para filtrar falhas"
              cardBorder={
                kpis && kpis.failed > 0
                  ? "border-rose-500/40 shadow-rose-500/10"
                  : "border-slate-800 shadow-slate-900/50"
              }
              iconBg={
                kpis && kpis.failed > 0
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }
              icon={<AlertTriangle className="h-5 w-5" />}
              onClick={() => handleBaseFiltersChange({ ...filters, status: "FAILED" })}
            />

            <AdminKpiCard
              title="MENSAGENS WABA (META)"
              value={kpis?.wabaSent ?? (isFetching ? "..." : 0)}
              subtext={
                kpis && kpis.wabaFailed > 0
                  ? `${kpis.wabaFailed} falha(s) • Filtrar WABA`
                  : "Clique para filtrar WABA"
              }
              cardBorder="border-emerald-500/40 shadow-emerald-500/10"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<MessageSquare className="h-5 w-5" />}
              onClick={() => handleBaseFiltersChange({ ...filters, canal: "WABA" })}
            />

            <AdminKpiCard
              title="CUSTO ESTIMADO WABA"
              value={
                kpis
                  ? `R$ ${kpis.custoEstimadoWaba.toFixed(2).replace(".", ",")}`
                  : (isFetching ? "..." : "R$ 0,00")
              }
              subtext="Base R$ 0,04 / msg entregue"
              cardBorder="border-purple-500/40 shadow-purple-500/10"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<DollarSign className="h-5 w-5" />}
            />
          </div>

          {kpis && kpis.total > 0 && (
            <div className="bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Distribuição por Canal no Período:
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {kpis.canais.waba > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "WABA" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    WABA: {kpis.canais.waba} ({Math.round((kpis.canais.waba / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.firebase > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "FIREBASE" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-bold hover:bg-amber-500/20 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Firebase: {kpis.canais.firebase} ({Math.round((kpis.canais.firebase / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.resend > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "RESEND" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[11px] font-bold hover:bg-sky-500/20 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    Resend: {kpis.canais.resend} ({Math.round((kpis.canais.resend / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.telegram > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "TELEGRAM" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[11px] font-bold hover:bg-blue-500/20 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Telegram: {kpis.canais.telegram} ({Math.round((kpis.canais.telegram / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.evolution > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "EVOLUTION" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-[11px] font-bold hover:bg-green-500/20 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Evolution: {kpis.canais.evolution} ({Math.round((kpis.canais.evolution / kpis.total) * 100)}%)
                  </button>
                )}
                {kpis.canais.sms > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBaseFiltersChange({ ...filters, canal: "SMS" })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[11px] font-bold hover:bg-indigo-500/20 transition-colors"
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
          />

          {!isFetching && data && data.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-800 gap-4">
              <p className="text-xs font-semibold text-slate-400">
                Página {data.page} de{" "}
                {Math.max(1, Math.ceil(data.total / data.limit))} ({data.total}{" "}
                notificações)
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-slate-400">
                    Exibir:
                  </Label>
                  <Select
                    value={limit}
                    onValueChange={(val) => {
                      setLimit(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs focus-visible:ring-0 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
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
                    className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={page >= Math.ceil(data.total / data.limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
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
