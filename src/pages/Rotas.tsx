import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoutes, useExecucoesRota } from "@/hooks/api/useRoutes";
import { useDeleteRoute, useIniciarRota } from "@/hooks/api/useRouteMutations";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { Route, MapPin, Play, Trash2, Edit, History, Calendar, Clock, AlertTriangle } from "lucide-react";
import { toast } from "@/utils/notifications/toast";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function Rotas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("minhas-rotas");

  const { data: userSummary, isLoading: isLoadingUser } = useUsuarioResumo();
  const usuarioId = userSummary?.id || "";
  const { data: rotas = [], isLoading: isLoadingRotas, refetch: refetchRotas } = useRoutes(usuarioId);
  const { data: execucoes = [], isLoading: isLoadingExecs, refetch: refetchExecs } = useExecucoesRota(usuarioId);
  const deleteRouteMutation = useDeleteRoute(usuarioId);
  const iniciarRotaMutation = useIniciarRota();

  const handleRefresh = async () => {
    await Promise.all([refetchRotas(), refetchExecs()]);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir esta rota? Todos os dados de sequenciamento serão apagados.")) {
      deleteRouteMutation.mutate(id);
    }
  };

  const handleIniciar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    iniciarRotaMutation.mutate(id, {
      onSuccess: (data) => {
        navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_ACTIVE.replace(":id", data.id));
      }
    });
  };

  const getPeriodoBadgeColor = (periodo?: string) => {
    const p = (periodo || "").toLowerCase();
    if (p === "manha") return "bg-amber-50 text-amber-700 border-amber-200/60";
    if (p === "tarde") return "bg-orange-50 text-orange-700 border-orange-200/60";
    if (p === "integral") return "bg-teal-50 text-teal-700 border-teal-200/60";
    return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
  };

  const getTipoBadgeColor = (tipo?: string) => {
    return tipo === "ida"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : "bg-sky-50 text-sky-700 border-sky-200/60";
  };

  const formatarDataHora = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const execucaoAtiva = execucoes.find(e => e.status === "iniciada");

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="space-y-6">
        
        {/* Banner de Rota Ativa (se aplicável) */}
        {execucaoAtiva && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-[1.25rem] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <h3 className="text-sm font-bold text-emerald-800">Trajeto em Andamento</h3>
              </div>
              <p className="text-xs text-emerald-700/90 font-medium">
                Você possui uma corrida ativa para a rota: <strong className="font-bold">{execucaoAtiva.rota?.nome}</strong>.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
              onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_ACTIVE.replace(":id", execucaoAtiva.id))}
            >
              <Play className="w-3 h-3 mr-1.5 fill-white" />
              Retornar ao Painel
            </Button>
          </div>
        )}

        {/* Estatísticas Simples no Topo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-4 rounded-[1.25rem] shadow-sm flex flex-col justify-between h-[100px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total de Rotas</span>
            <span className="text-2xl font-bold text-[#1a3a5c] font-headline">{rotas.length}</span>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-4 rounded-[1.25rem] shadow-sm flex flex-col justify-between h-[100px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última Corrida</span>
            <span className="text-[11px] font-bold text-slate-500 truncate mt-2 leading-tight">
              {execucoes.length > 0 ? (
                <>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatarDataHora(execucoes[0].iniciada_em).split(",")[0]}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">{execucoes[0].rota?.nome}</div>
                </>
              ) : "Nenhuma realizada"}
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
            <TabsList className="grid grid-cols-2 w-full h-[52px] bg-transparent p-0 gap-1 mt-0">
              <TabsTrigger
                value="minhas-rotas"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
              >
                Minhas Rotas
                <span className="ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-[#1a3a5c]/5 text-[#1a3a5c]">
                  {rotas.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="historico"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
              >
                Histórico
                <span className="ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-[#1a3a5c]/5 text-[#1a3a5c]">
                  {execucoes.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Minhas Rotas */}
          <TabsContent value="minhas-rotas" className="space-y-6 mt-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">Rotas Cadastradas</h2>
              <Button
                onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_SETUP)}
                size="sm"
                className="bg-[#1a3a5c] hover:bg-[#16314f] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Cadastrar Rota
              </Button>
            </div>

            {isLoadingRotas || isLoadingUser ? (
              <ListSkeleton count={3} />
            ) : rotas.length === 0 ? (
              <UnifiedEmptyState
                icon={Route}
                title="Nenhuma rota criada"
                description="Cadastre suas rotas de ida e volta para gerenciar os itinerários diários e automatizar avisos para as famílias."
                action={{
                  label: "Configurar Primeira Rota",
                  onClick: () => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_SETUP)
                }}
              />
            ) : (
              <div className="grid gap-4">
                {rotas.map((rota) => (
                  <div
                    key={rota.id}
                    onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EDIT.replace(":id", rota.id))}
                    className="group bg-white border border-slate-100 hover:border-slate-200/80 p-4 rounded-[1.25rem] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#1a3a5c] font-headline group-hover:text-[#16314f]">
                          {rota.nome}
                        </h3>
                        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase rounded-lg border", getPeriodoBadgeColor(rota.periodo))}>
                          {rota.periodo}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase rounded-lg border", getTipoBadgeColor(rota.tipo))}>
                          {rota.tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs font-semibold text-slate-400">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-300" />
                        {rota.numero_passageiros === 1
                          ? "1 passageiro ordenado"
                          : `${rota.numero_passageiros || 0} passageiros ordenados`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs px-4"
                        onClick={(e) => handleIniciar(rota.id, e)}
                        disabled={iniciarRotaMutation.isPending}
                      >
                        <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                        Iniciar
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-xl text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 border border-transparent"
                        onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EDIT.replace(":id", rota.id))}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent"
                        onClick={(e) => handleDelete(rota.id, e)}
                        disabled={deleteRouteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Histórico de Corridas */}
          <TabsContent value="historico" className="space-y-6 mt-0">
            <div className="px-1">
              <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">Histórico de Corridas</h2>
            </div>

            {isLoadingExecs ? (
              <ListSkeleton count={4} />
            ) : execucoes.length === 0 ? (
              <UnifiedEmptyState
                icon={History}
                title="Sem histórico de trajetos"
                description="O histórico de trajetos e corridas diárias executadas aparecerá aqui assim que você concluir sua primeira rota."
              />
            ) : (
              <div className="grid gap-3">
                {execucoes.map((exec) => (
                  <div
                    key={exec.id}
                    onClick={() => {
                      if (exec.status === "iniciada") {
                        navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_ACTIVE.replace(":id", exec.id));
                      } else {
                        toast.info("Detalhes de execuções passadas estarão disponíveis em breve.");
                      }
                    }}
                    className={cn(
                      "bg-white border border-slate-100 hover:border-slate-200/80 p-4 rounded-[1.25rem] shadow-sm flex items-center justify-between gap-4 cursor-pointer transition-all",
                      exec.status === "iniciada" && "border-emerald-500/30 hover:border-emerald-500/40 bg-emerald-500/5"
                    )}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[#1a3a5c] text-sm truncate font-headline block">
                          {exec.rota?.nome || "Rota Removida"}
                        </span>
                        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase rounded-lg border", getTipoBadgeColor(exec.tipo))}>
                          {exec.tipo}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-300" />
                          {formatarDataHora(exec.iniciada_em)}
                        </div>
                        {exec.finalizada_em && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                            Duração: {Math.round((new Date(exec.finalizada_em).getTime() - new Date(exec.iniciada_em).getTime()) / 60000)} min
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {exec.status === "iniciada" ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-bold py-1">
                          EM ANDAMENTO
                        </Badge>
                      ) : exec.status === "concluida" ? (
                        <Badge className="bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold py-1 border border-slate-200/60">
                          CONCLUÍDA
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 rounded-lg text-[9px] font-bold py-1 border border-red-100 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> CANCELADA
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PullToRefreshWrapper>
  );
}
