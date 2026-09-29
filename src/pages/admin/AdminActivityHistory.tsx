import { useState, useEffect } from "react";
import { Filter, RefreshCw, ChevronLeft, ChevronRight, Users, Activity, Sparkles, ShieldCheck, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminLogs, useAdminLogsByUser, useAdminRealtimeLogs } from "@/hooks/api/adminHooks";
import { useLayout } from "@/contexts/LayoutContext";
import { getNowBR, toPersistenceString, addDays } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";
import { ActivityUserGroupList } from "@/components/features/admin/ActivityUserGroupList";
import { AdminActivityInspectDialog } from "@/components/dialogs/AdminActivityInspectDialog";
import { safeCloseDialog } from "@/utils/dialogUtils";
import type { AdminUserGroupLogItem, AdminUserLogItem } from "@/services/api/admin/admin-log.api";

export default function AdminActivityHistory() {
  const { setPageTitle, openAdminUserActivityHistoryDialog } = useLayout();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"by_user" | "feed">("by_user");
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
  const yesterday = toPersistenceString(addDays(getNowBR(), -1));

  const [logsFilter, setLogsFilter] = useState({
    dataInicio: yesterday,
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
      enabled: activeTab === "by_user",
      refetchOnWindowFocus: "always",
    }
  );

  const isFetching = activeTab === "by_user" ? isFetchingUsers : isFetchingLogs;

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
      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-sm font-headline font-black text-white uppercase tracking-tight">
                Histórico de Atividades
              </CardTitle>

              {isCurrentPageFirst && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors ${
                    isConnected
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400"
                  }`}
                  title={isConnected ? "Conectado em tempo real" : "Conectando ao tempo real..."}
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
              )}
            </div>

            <div className="flex items-center gap-2">
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
                onClick={handleRefresh}
                disabled={isFetching}
                className="h-8 rounded-xl text-blue-400 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:text-blue-300 hover:border-slate-700/80 px-3 flex items-center gap-1.5 transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800/90">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("by_user")}
                className={`h-7 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "by_user"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Por Usuário</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("feed")}
                className={`h-7 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "feed"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Feed Global</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 ${
              !isMobileFiltersOpen ? "hidden md:grid" : ""
            }`}
          >
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</Label>
              <Input
                type="text"
                placeholder="Documento, Telefone ou ID..."
                value={logsFilter.search_cpf}
                onChange={(e) => handleFilterChange({ search_cpf: e.target.value })}
                className="h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Início</Label>
              <Input
                type="date"
                value={logsFilter.dataInicio}
                onChange={(e) => handleFilterChange({ dataInicio: e.target.value })}
                className="h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Fim</Label>
              <Input
                type="date"
                value={logsFilter.dataFim}
                onChange={(e) => handleFilterChange({ dataFim: e.target.value })}
                className="h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</Label>
              <Select
                value={logsFilter.acao}
                onValueChange={(val) => handleFilterChange({ acao: val })}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-[13px] focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-64">
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.values(AtividadeAcao).map((acao) => (
                    <SelectItem key={acao} value={acao} className="text-[13px]">
                      {acao.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidade</Label>
              <Select
                value={logsFilter.entidade}
                onValueChange={(val) => handleFilterChange({ entidade: val })}
              >
                <SelectTrigger className="h-10 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-[13px] focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-64">
                  <SelectItem value="all">Todas as entidades</SelectItem>
                  {Object.values(AtividadeEntidadeTipo).map((ent) => (
                    <SelectItem key={ent} value={ent} className="text-[13px]">
                      {ent.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeTab === "by_user" ? (
            <>
              {usersData && usersData.total > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-left space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                      <span>Usuários Ativos</span>
                    </div>
                    <div className="text-xl font-headline font-black text-white">
                      {usersData.total}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">No período filtrado</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-left space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                      <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                      <span>Em Trial</span>
                    </div>
                    <div className="text-xl font-headline font-black text-sky-200">
                      {usersData.total_trial ?? 0}
                    </div>
                    <p className="text-[10px] text-sky-400/70 font-medium">Foco de conversão</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Assinantes</span>
                    </div>
                    <div className="text-xl font-headline font-black text-emerald-200">
                      {usersData.total_ativos ?? 0}
                    </div>
                    <p className="text-[10px] text-emerald-400/70 font-medium">Assinatura ativa</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-left space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      <RotateCcw className="h-3.5 w-3.5 text-purple-400" />
                      <span>Recorrentes</span>
                    </div>
                    <div className="text-xl font-headline font-black text-white">
                      {usersData.total_recorrentes ?? 0}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Não assinantes cadastrados antes</p>
                  </div>
                </div>
              )}

              <ActivityUserGroupList
                userGroups={usersData?.data || []}
                isLoading={isLoadingUsers && !usersData}
                onInspectLog={(log) => setInspectLog(log)}
                onOpenDetails={handleOpenUserDetails}
              />

              {usersData && usersData.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-800 gap-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Página {usersData.page} de {totalUserPages} ({usersData.total}{" "}
                    {usersData.total === 1 ? "usuário ativo" : "usuários ativos"} no período)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                      <Select
                        value={usersLimit}
                        onValueChange={(val) => {
                          setUsersLimit(val);
                          setUsersPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs focus-visible:ring-0 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={usersPage <= 1}
                        onClick={() => setUsersPage((p) => p - 1)}
                        className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={usersPage >= totalUserPages}
                        onClick={() => setUsersPage((p) => p + 1)}
                        className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
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
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-800 gap-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Página {logsData.page} de {totalFeedPages} ({logsData.total} logs)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                      <Select
                        value={feedLimit}
                        onValueChange={(val) => {
                          setFeedLimit(val);
                          setLogsPage(1);
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
                        disabled={logsPage <= 1}
                        onClick={() => setLogsPage((p) => p - 1)}
                        className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={logsPage >= totalFeedPages}
                        onClick={() => setLogsPage((p) => p + 1)}
                        className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
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
