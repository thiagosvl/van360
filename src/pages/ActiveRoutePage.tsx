import { useParams, useNavigate } from "react-router-dom";
import { useActiveRouteViewModel } from "@/hooks/ui/useActiveRouteViewModel";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertOctagon, XCircle, MapPin, GraduationCap,
  Check, Calendar, UserMinus, AlertTriangle, Route, Compass, Navigation
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { RouteExecutionStatus, RouteStopStatus } from "@/types/route";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";

export default function ActiveRoutePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    openConfirmationDialog,
    closeConfirmationDialog
  } = useLayout();

  const {
    execucao,
    paradaAtual,
    paradasPendentes,
    paradasConcluidas,
    isLoading,
    isError,
    handleStep,
    handleCancel,
    abrirNoWaze,
    abrirNoMaps
  } = useActiveRouteViewModel({ execucaoId: id || "" });

  const isIda = execucao?.tipo === "ida";
  const actionLabel = isIda ? "Embarcou" : "Desembarcou";

  const onCancel = () => {
    openConfirmationDialog({
      title: "Cancelar Corrida?",
      description: "Deseja realmente cancelar a corrida de hoje? Todos os dados desta execução serão perdidos.",
      confirmText: "Sim, cancelar",
      variant: "destructive",
      onConfirm: async () => {
        handleCancel(() => {
          safeCloseDialog(closeConfirmationDialog);
          navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
        });
      }
    });
  };

  const handleConfirmStep = (
    passageiroId: string,
    nome: string,
    status: RouteStopStatus.EMBARCADO | RouteStopStatus.AUSENTE
  ) => {
    const shortName = formatShortName(nome, true);
    const isEmbarcado = status === RouteStopStatus.EMBARCADO;
    const title = isEmbarcado
      ? (isIda ? "Confirmar Embarque?" : "Confirmar Desembarque?")
      : "Confirmar Ausência?";
    const desc = isEmbarcado
      ? (isIda ? `Deseja confirmar que ${shortName} embarcou na van?` : `Deseja confirmar que ${shortName} desembarcou da van?`)
      : `Deseja confirmar ${shortName} como ausente hoje? Ele será pulado no trajeto.`;

    openConfirmationDialog({
      title,
      description: desc,
      confirmText: isEmbarcado ? actionLabel : "Não vai",
      variant: isEmbarcado ? "default" : "destructive",
      onConfirm: async () => {
        await handleStep(passageiroId, status);
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  };

  const onFinish = () => {
    navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[400px]">
        <AlertOctagon className="w-12 h-12 text-red-500" />
        <h3 className="text-base font-bold text-[#1a3a5c] font-headline">Erro ao Carregar Corrida</h3>
        <p className="text-xs text-slate-400 font-semibold max-w-[260px]">
          Não conseguimos obter as informações desta execução da rota ativa no momento.
        </p>
        <Button
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
          className="bg-[#1a3a5c] hover:bg-[#16314f] text-white rounded-xl font-bold text-xs"
        >
          Voltar para Rotas
        </Button>
      </div>
    );
  }

  const getTipoBadgeColor = (tipo?: string) => {
    return tipo === "ida"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : "bg-sky-50 text-sky-700 border-sky-200/60";
  };

  const totalStops = execucao?.paradas?.length || 0;
  const concludedStops = paradasConcluidas.length;
  const progressPercentage = totalStops > 0 ? Math.round((concludedStops / totalStops) * 100) : 0;

  return (
    <PullToRefreshWrapper onRefresh={async () => { }}>
      <div className="space-y-6">

        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/20 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {execucao?.status === RouteExecutionStatus.INICIADA && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Em Andamento
                  </span>
                </>
              )}
              {execucao?.status === RouteExecutionStatus.CONCLUIDA && (
                <>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Concluída
                  </span>
                </>
              )}
              {execucao?.status === RouteExecutionStatus.CANCELADA && (
                <>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Cancelada
                  </span>
                </>
              )}
            </div>
            <h1 className="text-base font-black text-[#1a3a5c] font-headline tracking-tight leading-tight">
              {execucao?.rota?.nome}
            </h1>
          </div>

          {execucao?.status === RouteExecutionStatus.INICIADA && (
            <Button
              variant="outline"
              className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold text-xs self-start sm:self-auto flex items-center gap-1.5 shadow-sm active:scale-95 transition-all h-9 px-3"
              onClick={onCancel}
              disabled={isLoading}
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancelar Corrida
            </Button>
          )}
        </div>

        {isLoading && !execucao ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="space-y-6">

            {/* Painel Superior de Progresso */}
            <Card className="p-4 border-slate-150/60 shadow-sm rounded-2xl bg-white/80 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#1a3a5c]">
                <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-500">
                  <Route className="w-3.5 h-3.5" /> Progresso do Trajeto
                </span>
                <span className="text-[10px] tracking-wider uppercase bg-[#1a3a5c]/5 text-[#1a3a5c] px-2 py-0.5 rounded-md">
                  {concludedStops} de {totalStops} Paradas ({progressPercentage}%)
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </Card>

            {/* Status da Corrida Finalizada ou Inativa */}
            {execucao?.status === RouteExecutionStatus.CONCLUIDA && (
              <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/40 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm backdrop-blur-md animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-sm shadow-emerald-200">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Corrida Concluída</h3>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Todos os passageiros do trajeto foram visitados com sucesso.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 px-5 h-9 shadow-sm shadow-emerald-100 active:scale-95 transition-all w-full sm:w-auto"
                >
                  Voltar para Rotas
                </Button>
              </div>
            )}

            {execucao?.status === RouteExecutionStatus.CANCELADA && (
              <div className="bg-gradient-to-r from-rose-50/90 to-red-50/40 border border-rose-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm backdrop-blur-md animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500 text-white p-2 rounded-xl shadow-sm shadow-rose-200">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h3 className="text-xs font-black text-rose-950 uppercase tracking-wider">Corrida Inativa</h3>
                    <p className="text-[11px] text-rose-700 font-semibold">
                      Esta corrida não está ativa ou foi encerrada pelo motorista.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 px-5 h-9 shadow-sm shadow-rose-100 active:scale-95 transition-all w-full sm:w-auto"
                >
                  Voltar para Rotas
                </Button>
              </div>
            )}

                {/* 🧭 LINHA DO TEMPO DO ITINERÁRIO (LARGURA CONTIDA E SEGURA) */}
                {execucao.paradas && execucao.paradas.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="px-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Linha do tempo do Trajeto
                      </span>
                    </div>

                    <div className="relative space-y-4">

                      {/* Linha vertical conectando os pontos */}
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100" />

                      {execucao.paradas.map((parada, index) => {
                        const isCompleted = parada.status === RouteStopStatus.EMBARCADO || parada.status === RouteStopStatus.AUSENTE;
                        const isActive = parada.status === RouteStopStatus.A_CAMINHO;
                        const isPending = parada.status === RouteStopStatus.PENDENTE;

                        if (isActive) {
                          return (
                            <div key={parada.id || parada.passageiro_id} className="relative z-10 w-full">
                              <Card className="p-4 border-blue-500/40 border-l-4 rounded-2xl bg-gradient-to-br from-blue-50/30 via-white to-white shadow-md space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none bg-blue-50 px-2 py-1 rounded-md">
                                    {isIda ? "PRÓXIMO EMBARQUE" : "PRÓXIMO DESEMBARQUE"}
                                  </span>
                                  <Badge variant="outline" className={cn("text-[9px] font-bold uppercase rounded-lg border px-2.5 py-1", getTipoBadgeColor(execucao?.tipo))}>
                                    {execucao?.tipo === "ida" ? "Ida" : "Volta"}
                                  </Badge>
                                </div>

                                <div className="space-y-1">
                                  <h2 className="text-xl font-black text-[#1a3a5c] font-headline leading-tight">
                                    {formatShortName(parada.nome, true)}
                                  </h2>
                                  <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                                    {formatFirstName(parada.nome_responsavel)}
                                  </p>
                                </div>

                                {/* Detalhes de Endereço */}
                                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-start gap-2.5 shadow-sm">
                                  <MapPin className="w-4.5 h-4.5 text-blue-500 mt-0.5 shrink-0" />
                                  <div className="space-y-0.5 min-w-0">
                                    <h4 className="text-[10px] font-bold text-[#1a3a5c] uppercase tracking-wider">Endereço de Parada</h4>
                                    <p className="text-xs text-slate-600 font-semibold leading-normal">
                                      {parada.logradouro}, {parada.numero}
                                    </p>
                                  </div>
                                </div>

                                {/* Botões de Navegação GPS */}
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    onClick={() => abrirNoWaze(parada.latitude, parada.longitude, parada.logradouro, parada.numero)}
                                    className="h-10 bg-[#33ccff] hover:bg-[#2bb8eb] text-white font-bold rounded-xl text-[11px] shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all border-none"
                                  >
                                    <Compass className="w-4 h-4" />
                                    Waze
                                  </Button>
                                  <Button
                                    onClick={() => abrirNoMaps(parada.latitude, parada.longitude, parada.logradouro, parada.numero)}
                                    className="h-10 bg-[#1a3a5c] hover:bg-[#132c47] text-white font-bold rounded-xl text-[11px] shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all border-none"
                                  >
                                    <Navigation className="w-4 h-4" />
                                    Google Maps
                                  </Button>
                                </div>

                                {/* Ações de Conclusão Stacked para evitar quebra no mobile */}
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <Button
                                    onClick={() => handleConfirmStep(parada.passageiro_id || parada.id, parada.nome, RouteStopStatus.EMBARCADO)}
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black uppercase text-[11px] tracking-wider rounded-xl shadow-md shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-1.5 border-none"
                                  >
                                    <Check className="w-4 h-4" />
                                    {actionLabel}
                                  </Button>
                                  <Button
                                    onClick={() => handleConfirmStep(parada.passageiro_id || parada.id, parada.nome, RouteStopStatus.AUSENTE)}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="w-full h-11 border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-600 font-bold uppercase text-[11px] tracking-wider rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                    Não vai
                                  </Button>
                                </div>
                              </Card>
                            </div>
                          );
                        }

                        return (
                          <div key={parada.id || parada.passageiro_id} className="flex gap-4 relative">

                            {/* Ponto na linha do tempo */}
                            <div className="flex flex-col items-center shrink-0 w-8">
                              {isCompleted ? (
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center border text-white shadow-sm z-10 transition-colors",
                                  parada.status === RouteStopStatus.EMBARCADO
                                    ? "bg-emerald-500 border-emerald-400"
                                    : "bg-red-500 border-red-400"
                                )}>
                                  {parada.status === RouteStopStatus.EMBARCADO ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10.5px] z-10 shadow-sm">
                                  {index + 1}
                                </div>
                              )}
                            </div>

                            {/* Conteúdo simples da parada na linha do tempo */}
                            <div className="flex-1 min-w-0">
                              {isCompleted && (
                                <Card className="p-3 border-slate-100 bg-slate-50/50 shadow-sm opacity-60 flex items-center justify-between gap-3">
                                  <div className="min-w-0 space-y-0.5">
                                    <h4 className="text-xs font-bold text-slate-500 font-headline truncate">
                                      {formatShortName(parada.nome, true)}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                      <GraduationCap className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                      <span className="truncate">{parada.escola?.nome || "Sem escola"}</span>
                                    </p>
                                  </div>
                                  <Badge className={cn(
                                    "rounded-lg text-[9px] font-bold border shrink-0",
                                    parada.status === RouteStopStatus.EMBARCADO
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      : "bg-red-50 text-red-600 border-red-100"
                                  )}>
                                    {parada.status === RouteStopStatus.EMBARCADO ? actionLabel.toUpperCase() : "AUSENTE"}
                                  </Badge>
                                </Card>
                              )}

                              {isPending && (
                                <Card className="p-3 border-slate-150/60 bg-white hover:border-slate-200/80 transition-all shadow-sm flex items-center justify-between gap-3">
                                  <div className="min-w-0 space-y-0.5">
                                    <h4 className="text-xs font-bold text-[#1a3a5c] font-headline truncate">
                                      {formatShortName(parada.nome, true)}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                      <GraduationCap className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                      <span className="truncate">{parada.escola?.nome || "Sem escola"}</span>
                                    </p>
                                  </div>

                                  {execucao.status === RouteExecutionStatus.INICIADA ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleConfirmStep(parada.passageiro_id || parada.id, parada.nome, RouteStopStatus.AUSENTE)}
                                      className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold h-8 flex items-center gap-1 shrink-0 px-2.5 active:scale-95 transition-all"
                                    >
                                      <UserMinus className="w-3.5 h-3.5" />
                                      Não vai
                                    </Button>
                                  ) : (
                                    <Badge className="rounded-lg text-[9px] font-bold border shrink-0 bg-slate-50 text-slate-400 border-slate-100">
                                      NÃO VISITADO
                                    </Badge>
                                  )}
                                </Card>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

          </div>
        )}

      </div>
    </PullToRefreshWrapper>
  );
}
