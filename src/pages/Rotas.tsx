import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { RotasSkeleton, ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useRoutes, useExecucoesRota } from "@/hooks/api/useRoutes";
import { useDeleteRoute, useCancelarExecucao } from "@/hooks/api/useRouteMutations";
import { Route as RouteIcon, Play, Trash2, Edit, History, Calendar, Clock, Plus, Loader2, XCircle, Check, X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { RouteExecutionStatus } from "@/types/route";
import { formatDateTime } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";

const TAB_MINHAS_ROTAS = "minhas-rotas";
const TAB_HISTORICO = "historico";

export default function Rotas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_MINHAS_ROTAS);

  const { openConfirmationDialog, closeConfirmationDialog, setPageTitle, openRouteFormDialog } = useLayout();

  const { user } = useSession();
  const { profile, isLoading: isLoadingProfile } = useProfile(user?.id);
  const usuarioId = profile?.id || "";

  const { data: rotas = [], isLoading: isLoadingRotas, isFetching: isFetchingRotas, refetch: refetchRotas } = useRoutes(usuarioId);
  const handleOpenCreateRouteDialog = () => {
    openRouteFormDialog({
      onSuccess: (data) => {
        navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_SETUP, {
          state: {
            nome: data.nome,
            veiculoId: data.veiculoId,
            escolaFixaId: data.escolaFixaId
          }
        });
      }
    });
  };
  const { data: execucoes = [], isLoading: isLoadingExecs, isFetching: isFetchingExecs, refetch: refetchExecs } = useExecucoesRota(usuarioId);
  const deleteRouteMutation = useDeleteRoute(usuarioId);
  const cancelarExecucaoMutation = useCancelarExecucao();

  const handleEncerrarExecucao = (execucaoId: string) => {
    openConfirmationDialog({
      title: "Encerrar rota?",
      description: "Tem certeza que deseja encerrar a execução da rota em andamento?",
      confirmText: "Encerrar Rota",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await cancelarExecucaoMutation.mutateAsync(execucaoId);
          safeCloseDialog(closeConfirmationDialog);
          refetchExecs();
        } catch (error) {
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  };

  useEffect(() => {
    setPageTitle("Rotas");
  }, [setPageTitle]);

  const handleRefresh = async () => {
    await Promise.all([refetchRotas(), refetchExecs()]);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmationDialog({
      title: "Excluir rota?",
      description: "Tem certeza que deseja excluir esta rota? As execuções anteriores (histórico) também serão apagadas.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteRouteMutation.mutateAsync(id);
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  };

  const execucaoAtiva = execucoes.find(e => e.status === RouteExecutionStatus.INICIADA);
  const execucoesHistorico = useMemo(() => {
    return execucoes.filter(e => e.status !== RouteExecutionStatus.INICIADA);
  }, [execucoes]);

  const isCanceling = cancelarExecucaoMutation.isPending;
  const isInitialOrRefetchLoading = isLoadingRotas || isLoadingExecs || isCanceling || (isFetchingExecs && !!execucaoAtiva);

  if (isInitialOrRefetchLoading && (!rotas.length || !execucoes.length || isCanceling || (isFetchingExecs && !!execucaoAtiva))) {
    return <RotasSkeleton />;
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6">

          {/* Banner de Rota Ativa */}
          {execucaoAtiva && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <h3 className="text-sm font-bold text-emerald-900 font-headline">Rota em Andamento</h3>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Atenção: <strong className="font-bold">{execucaoAtiva.rota?.nome}</strong> está em execução.
                </p>
              </div>

              <div className="flex items-center shrink-0 w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm h-10 px-4 cursor-pointer flex items-center justify-center gap-1.5"
                  onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", execucaoAtiva.id))}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Ver Execução</span>
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
              <TabsList className="grid grid-cols-2 w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
                <TabsTrigger
                  value={TAB_MINHAS_ROTAS}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
                >
                  Minhas Rotas
                  <span className={cn(
                    "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                    activeTab === TAB_MINHAS_ROTAS ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                  )}>
                    {rotas.length || 0}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value={TAB_HISTORICO}
                  className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
                >
                  Histórico
                  <span className={cn(
                    "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                    activeTab === TAB_HISTORICO ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                  )}>
                    {execucoes.length || 0}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={TAB_MINHAS_ROTAS} className="space-y-4 mt-0">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">{rotas.length > 0 ? "Rotas Cadastradas" : ""}</h2>
                <Button
                  onClick={handleOpenCreateRouteDialog}
                  className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-sm h-12 md:h-14 rounded-2xl px-4 md:px-6 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Rota</span>
                </Button>
              </div>

              {isLoadingRotas || isLoadingProfile ? (
                <ListSkeleton count={3} />
              ) : rotas.length === 0 ? (
                <UnifiedEmptyState
                  icon={RouteIcon}
                  title="Nenhuma rota configurada"
                  description="Configure suas rotas de ida e volta para gerenciar os itinerários diários e organizar a prancheta de paradas."
                  action={{
                    label: "CONFIGURAR PRIMEIRA ROTA",
                    onClick: handleOpenCreateRouteDialog
                  }}
                />
              ) : (
                <div className="grid gap-3">
                  {rotas.map((rota) => {
                    const isDestaRotaAtiva = execucaoAtiva && execucaoAtiva.rota_id === rota.id;

                    return (
                      <div
                        key={rota.id}
                        onClick={() => {
                          if (isDestaRotaAtiva && execucaoAtiva) {
                            navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", execucaoAtiva.id));
                          } else {
                            navigate(`${ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", rota.id)}?preview=true`);
                          }
                        }}
                        className={cn(
                          "bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 relative px-4 text-left cursor-pointer group border",
                          isDestaRotaAtiva ? "border-emerald-500 shadow-sm" : "border-gray-100/50"
                        )}
                      >
                        <div className="rounded-full bg-white p-[2px] shadow-sm shrink-0 flex items-center justify-center transition-all">
                          <div className={cn(
                            "rounded-full border flex items-center justify-center transition-colors",
                            isDestaRotaAtiva ? "border-emerald-500" : "border-[#1a3a5c]"
                          )}>
                            <div className="h-8 w-8 rounded-full border-[2px] border-white flex items-center justify-center bg-slate-100/60">
                              <RouteIcon className={cn("w-4 h-4 transition-colors", isDestaRotaAtiva ? "text-emerald-600" : "text-[#1a3a5c]")} />
                            </div>
                          </div>
                        </div>

                        <div className="flex-grow min-w-0 pr-2 space-y-0.5">
                          <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-snug transition-colors break-words">
                            {rota.nome}
                          </p>
                          <div className="text-[10px] text-slate-400 font-medium leading-tight">
                            <span>{rota.numero_passageiros === 1 ? "1 parada" : `${rota.numero_passageiros || 0} paradas`} • {rota.veiculo.placa}</span>
                          </div>
                          {isDestaRotaAtiva && (
                            <div className="pt-0.5">
                              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                                EM ANDAMENTO
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Editar rota"
                            className="rounded-lg text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 h-8 w-8 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isDestaRotaAtiva) {
                                toast.error("Rota em andamento. Para editar, encerre ou conclua a execução primeiro.");
                                return;
                              }
                              navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EDIT.replace(":id", rota.id));
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {(() => {
                            const isDestaRotaDeletando = deleteRouteMutation.isPending && deleteRouteMutation.variables === rota.id;

                            return (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isDestaRotaAtiva) {
                                    toast.error("Rota em andamento. Para excluir, encerre ou conclua a execução primeiro.");
                                    return;
                                  }
                                  handleDelete(rota.id, e);
                                }}
                                disabled={deleteRouteMutation.isPending}
                                title="Excluir rota"
                              >
                                {isDestaRotaDeletando ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value={TAB_HISTORICO} className="space-y-4 mt-0">
              <div className="px-1 text-left">
                <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">Histórico</h2>
              </div>

              {isLoadingExecs ? (
                <ListSkeleton count={4} />
              ) : execucoesHistorico.length === 0 ? (
                <UnifiedEmptyState
                  icon={History}
                  title="Nada para exibir"
                  description="O histórico das rotas executadas aparecerá aqui assim que você concluir sua primeira rota."
                />
              ) : (
                <div className="grid gap-3">
                  {execucoesHistorico.map((exec) => {
                    const isAtiva = exec.status === RouteExecutionStatus.INICIADA;

                    return (
                      <div
                        key={exec.id}
                        onClick={() => {
                          const targetRoute = isAtiva
                            ? ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE
                            : ROUTES.PRIVATE.MOTORISTA.ROUTE_DETAILS;
                          navigate(targetRoute.replace(":id", exec.id));
                        }}
                        className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50 relative px-4 text-left cursor-pointer group"
                      >
                        <div className="rounded-full bg-white p-[2px] shadow-sm shrink-0 flex items-center justify-center">
                          <div className={cn(
                            "rounded-full border flex items-center justify-center transition-colors",
                            exec.status === RouteExecutionStatus.CONCLUIDA
                              ? "border-emerald-500"
                              : exec.status === RouteExecutionStatus.CANCELADA
                                ? "border-rose-400"
                                : "border-[#1a3a5c]"
                          )}>
                            <div className="h-8 w-8 rounded-full border-[2px] border-white flex items-center justify-center bg-slate-100/60">
                              {isAtiva ? (
                                <History className="w-4 h-4 text-[#1a3a5c]" />
                              ) : exec.status === RouteExecutionStatus.CONCLUIDA ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <X className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-grow min-w-0 pr-2 space-y-0.5">
                          <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-snug transition-colors break-words">
                            {exec.rota?.nome || "Rota Removida"}
                          </p>

                          <div className="text-[10px] text-slate-400 font-medium leading-tight flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDateTime(exec.iniciada_em)}
                            </span>
                            {exec.finalizada_em && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {Math.round((new Date(exec.finalizada_em).getTime() - new Date(exec.iniciada_em).getTime()) / 60000)} min
                                </span>
                              </>
                            )}
                          </div>

                          <div className="pt-0.5">
                            {exec.status === RouteExecutionStatus.INICIADA ? (
                              <span className="inline-block bg-[#1a3a5c]/10 text-[#1a3a5c] border border-[#1a3a5c]/20 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                                EM ANDAMENTO
                              </span>
                            ) : exec.status === RouteExecutionStatus.CONCLUIDA ? (
                              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                                CONCLUÍDA
                              </span>
                            ) : (
                              <span className="inline-block bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                                CANCELADA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>
    </>
  );
}
