import { useState, useEffect } from "react";
import { Filter, RefreshCw, ChevronLeft, ChevronRight, Users, Activity } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminLogs, useAdminLogsByUser, useAdminRealtimeLogs } from "@/hooks/api/adminHooks";
import { useLayout } from "@/contexts/LayoutContext";
import { getNowBR, toPersistenceString, addDays } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";
import { ActivityUserGroupList } from "@/components/features/admin/ActivityUserGroupList";
import { ActivityMetricsSummary } from "@/components/features/admin/ActivityMetricsSummary";
import { AdminPeriodFilter } from "@/components/ui/AdminPeriodFilter";
import { AdminActivityInspectDialog } from "@/components/dialogs/AdminActivityInspectDialog";
import { safeCloseDialog } from "@/utils/dialogUtils";
import type { AdminUserGroupLogItem, AdminUserLogItem } from "@/services/api/admin/admin-log.api";

export default function AdminActivityHistory() {
  const { setPageTitle, openAdminUserActivityHistoryDialog } = useLayout();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"feed" | "by_user">("feed");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [inspectLog, setInspectLog] = useState<AdminUserLogItem | null>(null);

  useEffect(() => {
    setPageTitle("Histórico de Atividades");
  }, [setPageTitle]);

  const [logsPage, setLogsPage] = useState(1);
  const [feedLimit, setFeedLimit] = useState("25");

  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState("20");

  const today = toPersistenceString(getNowBR());

  const [logsFilter, setLogsFilter] = useState({
    dataInicio: today,
    dataFim: today,
    acao: "all",
    entidade: "all",
    search_cpf: "",
  });

  const isCurrentPageFirst = activeTab === "by_user" ? usersPage === 1 : logsPage === 1;

  const { isConnected } = useAdminRealtimeLogs({
    enabled: isCurrentPageFirst,
  });

  const {
    data: logsData,
    isFetching: isFetchingLogs,
    isLoading: isLoadingLogs,
  } = useAdminLogs(
    {
      page: logsPage,
      limit: parseInt(feedLimit, 10),
      dataInicio: logsFilter.dataInicio || undefined,
      dataFim: logsFilter.dataFim || undefined,
      acao: logsFilter.acao === "all" ? undefined : logsFilter.acao,
      entidade: logsFilter.entidade === "all" ? undefined : logsFilter.entidade,
      search_cpf: logsFilter.search_cpf || undefined,
    },
    {
      refetchOnWindowFocus: "always",
    }
  );

  const {
    data: usersData,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useAdminLogsByUser(
    {
      page: usersPage,
      limit: parseInt(usersLimit, 10),
      dataInicio: logsFilter.dataInicio || undefined,
      dataFim: logsFilter.dataFim || undefined,
      acao: logsFilter.acao === "all" ? undefined : logsFilter.acao,
      entidade: logsFilter.entidade === "all" ? undefined : logsFilter.entidade,
      search_cpf: logsFilter.search_cpf || undefined,
    },
    {
      refetchOnWindowFocus: "always",
    }
  );

  const isFetching = isFetchingUsers || isFetchingLogs;

  const handleRefresh = () => {
    if (activeTab === "by_user") {
      setUsersPage(1);
    } else {
      setLogsPage(1);
    }
    queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
  };

  const handleFilterChange = (updates: Partial<typeof logsFilter>) => {
    setLogsPage(1);
    setUsersPage(1);
    setLogsFilter((prev) => ({ ...prev, ...updates }));
  };

  const handleOpenUserDetails = (group: AdminUserGroupLogItem) => {
    openAdminUserActivityHistoryDialog({
      userId: group.usuario_id,
      userName: group.usuario_apelido || group.usuario_nome || "Usuário",
      userPhone: group.usuario_telefone,
      dataInicio: logsFilter.dataInicio,
      dataFim: logsFilter.dataFim,
    });
  };

  const totalUserPages = usersData ? Math.max(1, Math.ceil(usersData.total / usersData.limit)) : 1;
  const totalFeedPages = logsData ? Math.max(1, Math.ceil(logsData.total / logsData.limit)) : 1;

  return (
    <div className="space-y-6">
      <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              {isCurrentPageFirst && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${isConnected
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-muted border-border text-muted-foreground"
                    }`}
                  title={isConnected ? "Conectado em tempo real" : "Conectando ao tempo real..."}
                >
                  <span className="relative flex h-2 w-2">
                    {isConnected && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-muted-foreground"
                        }`}
                    />
                  </span>
                  <span>{isConnected ? "Ao vivo" : "Sincronizando"}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsMobileFiltersOpen((p) => !p)}
                className={`md:hidden h-8 rounded-lg px-2.5 flex items-center gap-1.5 border transition-all text-xs font-medium ${isMobileFiltersOpen
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
                variant="outline"
                onClick={handleRefresh}
                disabled={isFetching}
                className="h-8 rounded-lg text-primary bg-secondary/60 border border-border hover:bg-secondary hover:text-primary px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <div className="flex items-center p-1 rounded-lg bg-secondary/60 border border-border w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("feed")}
                className={`flex-1 sm:flex-initial justify-center h-7 px-3 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === "feed"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Feed global</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("by_user")}
                className={`flex-1 sm:flex-initial justify-center h-7 px-3 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === "by_user"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Por usuário</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ActivityMetricsSummary
            total={usersData?.total}
            total_novos={usersData?.total_novos}
            total_recorrentes={usersData?.total_recorrentes}
            total_trial={usersData?.total_trial}
            total_ativos={usersData?.total_ativos}
            total_vitalicios={usersData?.total_vitalicios}
          />

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 ${!isMobileFiltersOpen ? "hidden md:grid" : ""
              }`}
          >
            <div className="flex flex-col gap-1.5 text-left">
              <Label className="text-xs font-medium text-muted-foreground block leading-none">Usuário</Label>
              <Input
                type="text"
                placeholder="Documento, telefone ou ID..."
                value={logsFilter.search_cpf}
                onChange={(e) => handleFilterChange({ search_cpf: e.target.value })}
                className="h-9 w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
              />
            </div>
            <AdminPeriodFilter
              label="Período da atividade"
              defaultPreset="hoje"
              showLabelAbove={true}
              startDate={logsFilter.dataInicio}
              endDate={logsFilter.dataFim}
              onChange={(start, end) => handleFilterChange({ dataInicio: start, dataFim: end })}
            />
            <div className="flex flex-col gap-1.5 text-left">
              <Label className="text-xs font-medium text-muted-foreground block leading-none">Ação</Label>
              <Select
                value={logsFilter.acao}
                onValueChange={(val) => handleFilterChange({ acao: val })}
              >
                <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground max-h-64">
                  <SelectItem value="all" className="text-sm">Todas as ações</SelectItem>
                  {Object.values(AtividadeAcao).map((acao) => (
                    <SelectItem key={acao} value={acao} className="text-sm">
                      {acao.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <Label className="text-xs font-medium text-muted-foreground block leading-none">Entidade</Label>
              <Select
                value={logsFilter.entidade}
                onValueChange={(val) => handleFilterChange({ entidade: val })}
              >
                <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground max-h-64">
                  <SelectItem value="all" className="text-sm">Todas as entidades</SelectItem>
                  {Object.values(AtividadeEntidadeTipo).map((ent) => (
                    <SelectItem key={ent} value={ent} className="text-sm">
                      {ent.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeTab === "by_user" ? (
            <>
              <ActivityUserGroupList
                userGroups={usersData?.data || []}
                isLoading={isLoadingUsers && !usersData}
                onInspectLog={(log) => setInspectLog(log)}
                onOpenDetails={handleOpenUserDetails}
              />

              {usersData && usersData.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border gap-4">
                  <p className="text-xs font-normal text-muted-foreground">
                    Página {usersData.page} de {totalUserPages} ({usersData.total}{" "}
                    {usersData.total === 1 ? "usuário ativo" : "usuários ativos"} no período)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">Exibir:</Label>
                      <Select
                        value={usersLimit}
                        onValueChange={(val) => {
                          setUsersLimit(val);
                          setUsersPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 rounded-lg bg-background border-border text-foreground text-xs focus-visible:ring-0 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={usersPage <= 1}
                        onClick={() => setUsersPage((p) => p - 1)}
                        className="h-8 w-8 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={usersPage >= totalUserPages}
                        onClick={() => setUsersPage((p) => p + 1)}
                        className="h-8 w-8 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <ActivityLogsList
                logs={logsData?.data || []}
                isLoading={isLoadingLogs && !logsData}
                highlightFirst={logsPage === 1}
              />

              {logsData && logsData.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border gap-4">
                  <p className="text-xs font-normal text-muted-foreground">
                    Página {logsData.page} de {totalFeedPages} ({logsData.total} logs)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">Exibir:</Label>
                      <Select
                        value={feedLimit}
                        onValueChange={(val) => {
                          setFeedLimit(val);
                          setLogsPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 rounded-lg bg-background border-border text-foreground text-xs focus-visible:ring-0 w-[70px]">
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
                        variant="outline"
                        size="icon"
                        disabled={logsPage <= 1}
                        onClick={() => setLogsPage((p) => p - 1)}
                        className="h-8 w-8 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={logsPage >= totalFeedPages}
                        onClick={() => setLogsPage((p) => p + 1)}
                        className="h-8 w-8 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AdminActivityInspectDialog
        log={inspectLog}
        onClose={() => safeCloseDialog(() => setInspectLog(null))}
      />
    </div>
  );
}
