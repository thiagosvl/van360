import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { RotasSkeleton, ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useRoutes, useExecucoesRota } from "@/hooks/api/useRoutes";
import { useDeleteRoute, useCancelarExecucao } from "@/hooks/api/useRouteMutations";
import { Route as RouteIcon, Play, Trash2, Edit, History, Calendar, Clock, Plus, Loader2, Check, X, UserMinus } from "lucide-react";
import RegistrarAusenciaDialog from "@/components/dialogs/RegistrarAusenciaDialog";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { RouteExecutionStatus } from "@/types/route";
import { UserType } from "@/types/enums";
import { formatDateTime } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";

import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TAB_MINHAS_ROTAS = "minhas-rotas";
const TAB_HISTORICO = "historico";

export default function Rotas() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_MINHAS_ROTAS);
  const [isAusenciaDialogOpen, setIsAusenciaDialogOpen] = useState(false);

  const { openConfirmationDialog, closeConfirmationDialog, setPageTitle, openRouteFormDialog } = useLayout();

  const { user } = useSession();
  const { profile, isLoading: isLoadingProfile } = useProfile(user?.id);
  const usuarioId = profile?.id || "";

  const { data: rotas = [], isLoading: isLoadingRotas, isFetching: isFetchingRotas, refetch: refetchRotas } = useRoutes(usuarioId, { enabled: !!usuarioId && can("rotas.visualizar") });
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
  const { data: execucoes = [], isLoading: isLoadingExecs, isFetching: isFetchingExecs, refetch: refetchExecs } = useExecucoesRota(usuarioId, { enabled: !!usuarioId && can("rotas.visualizar") });
  const deleteRouteMutation = useDeleteRoute(usuarioId);
  const cancelarExecucaoMutation = useCancelarExecucao();

  const userVeiculoId = profile?.veiculo_id;
  const isGestor = profile?.tipo === UserType.MOTORISTA || !profile?.conta_pai_id;

  // Supabase Realtime Sync para a Lista de Rotas (Broadcast + Postgres Changes)
  useEffect(() => {
    const isEventForThisDevice = (payloadData: any) => {
      if (isGestor) return true;
      if (!userVeiculoId) return false;

      const matchesCurrent = payloadData?.veiculoId && payloadData.veiculoId === userVeiculoId;
      const matchesPrevious = payloadData?.previousVeiculoId && payloadData.previousVeiculoId === userVeiculoId;

      if (matchesCurrent || matchesPrevious) {
        return true;
      }

      if (payloadData?.veiculoId || payloadData?.previousVeiculoId) {
        return false;
      }

      return true;
    };

    const channel = supabase
      .channel("van360-fleet-sync")
      .on(
        "broadcast",
        { event: "route_execution_changed" },
        (payload: any) => {
          const payloadData = payload?.payload || payload;
          if (!isEventForThisDevice(payloadData)) return;
          refetchExecs();
          refetchRotas();
        }
      )
      .on(
        "broadcast",
        { event: "route_definition_changed" },
        (payload: any) => {
          const payloadData = payload?.payload || payload;
          if (!isEventForThisDevice(payloadData)) return;
          refetchExecs();
          refetchRotas();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rotas"
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["routes-list"] });
          queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "execucoes_rota"
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
          queryClient.invalidateQueries({ queryKey: ["routes-list"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "execucoes_rota_passageiros"
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rota_ausencias"
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["execucoes-list"] });
          queryClient.invalidateQueries({ queryKey: ["routes-list"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchExecs, refetchRotas, queryClient]);

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

  const execucoesAtivas = useMemo(() => {
    return execucoes.filter(e => {
      if (e.status !== RouteExecutionStatus.INICIADA) return false;
      if (!isGestor && userVeiculoId && e.rota?.veiculo_id) {
        return e.rota.veiculo_id === userVeiculoId;
      }
      return true;
    });
  }, [execucoes, isGestor, userVeiculoId]);

  const execucoesHistorico = useMemo(() => {
    return execucoes.filter(e => {
      if (e.status === RouteExecutionStatus.INICIADA) return false;
      if (!isGestor && userVeiculoId && e.rota?.veiculo_id) {
        return e.rota.veiculo_id === userVeiculoId;
      }
      return true;
    });
  }, [execucoes, isGestor, userVeiculoId]);

  const veiculosDisponiveis = useMemo(() => {
    if (!isGestor) return [];
    const map = new Map<string, string>();
    rotas.forEach(r => {
      if (r.veiculo_id && r.veiculo) {
        const label = r.veiculo.placa ? `${r.veiculo.modelo || 'Veículo'} (${r.veiculo.placa})` : (r.veiculo.modelo || r.veiculo_id);
        map.set(r.veiculo_id, label);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [rotas, isGestor]);

  const [selectedVeiculoFilter, setSelectedVeiculoFilter] = useState<string>("TODOS");

  const rotasExibidas = useMemo(() => {
    if (!isGestor || selectedVeiculoFilter === "TODOS") return rotas;
    return rotas.filter(r => r.veiculo_id === selectedVeiculoFilter);
  }, [rotas, isGestor, selectedVeiculoFilter]);

  if (!can("rotas.visualizar")) {
    return <AccessRestrictedState moduleName="Rotas e Paradas" />;
  }

  const isCanceling = cancelarExecucaoMutation.isPending;
  const isInitialLoading = (isLoadingRotas && !rotas.length) || (isLoadingExecs && !execucoes.length) || isCanceling;

  if (isInitialLoading) {
    return <RotasSkeleton />;
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6">

          {/* Indicador Discreto de Rotas em Andamento */}
          {execucoesAtivas.length > 0 && (
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 flex items-center gap-2.5 shadow-2xs text-left">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="text-xs sm:text-sm font-bold text-emerald-950 font-headline truncate">
                {execucoesAtivas.length === 1
                  ? "1 rota está em andamento."
                  : `${execucoesAtivas.length} rotas estão em andamento.`}
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
                    {rotasExibidas.length || 0}
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
              {/* Filtro por Veículo para o Gestor da Frota */}
              {isGestor && veiculosDisponiveis.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedVeiculoFilter("TODOS")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer",
                      selectedVeiculoFilter === "TODOS"
                        ? "bg-[#1a3a5c] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    Todas as Vans
                  </button>
                  {veiculosDisponiveis.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVeiculoFilter(v.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer",
                        selectedVeiculoFilter === v.id
                          ? "bg-[#1a3a5c] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsAusenciaDialogOpen(true)}
                  className="flex-1 border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-xl sm:rounded-2xl px-3 sm:px-4 shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserMinus className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Registrar Ausência</span>
                </Button>

                {can("rotas.criar_editar") && (
                  <Button
                    onClick={handleOpenCreateRouteDialog}
                    className="flex-1 border-none bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-xl sm:rounded-2xl px-3 sm:px-6 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>Nova Rota</span>
                  </Button>
                )}
              </div>

              {isLoadingRotas || isLoadingProfile ? (
                <ListSkeleton count={3} />
              ) : rotas.length === 0 ? (
                <UnifiedEmptyState
                  icon={RouteIcon}
                  title="Nenhuma rota configurada"
                  description="Configure suas rotas de ida e volta para gerenciar os itinerários diários e organizar a prancheta de paradas."
                  action={can("rotas.criar_editar") ? {
                    label: "CONFIGURAR PRIMEIRA ROTA",
                    onClick: handleOpenCreateRouteDialog
                  } : undefined}
                />
              ) : (
                <div className="grid gap-3">
                  {rotasExibidas.map((rota) => {
                    const execucaoDestaRota = execucoesAtivas.find(e => e.rota_id === rota.id);
                    const isDestaRotaAtiva = !!execucaoDestaRota;

                    return (
                      <div
                        key={rota.id}
                        onClick={() => {
                          if (isDestaRotaAtiva && execucaoDestaRota) {
                            navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", execucaoDestaRota.id));
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

                        {(can("rotas.criar_editar") || can("rotas.excluir")) && (
                          <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {can("rotas.criar_editar") && (
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
                            )}
                            {can("rotas.excluir") && (() => {
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
                        )}
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

      <RegistrarAusenciaDialog
        isOpen={isAusenciaDialogOpen}
        onClose={() => setIsAusenciaDialogOpen(false)}
      />
    </>
  );
}
