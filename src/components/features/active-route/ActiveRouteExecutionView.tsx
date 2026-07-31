import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  XCircle, MapPin, Check, CheckCircle2, UserMinus, Route, Compass, Navigation, Flag, X, ArrowUp, ArrowDown, Loader2, Play, AlertTriangle, School, User,
  Home
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { GoogleMapsIcon } from "@/components/icons/GoogleMapsIcon";
import { WazeIcon } from "@/components/icons/WazeIcon";
import { RouteExecutionStatus, RouteNodeType, RouteStopStatus, RouteSentido } from "@/types/route";

import { formatFirstName, formatParentesco, formatarEnderecoCompleto, formatarEnderecoParcialRota, formatShortName } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { useRouteRules } from "@/hooks/business/useRouteRules";
import { useSession } from "@/hooks/business/useSession";
import { useExecucoesRota } from "@/hooks/api/useRoutes";

import { openExternalNavigation } from "@/utils/browser";
import { NavigationApp } from "@/constants";

const TAB_DEFAULT = "default";
const TAB_PRINCIPAL = "principal";

const getTextoSentidoDescritivo = (sentido?: RouteSentido | null): string => {
  return sentido === RouteSentido.VOLTANDO
    ? "Voltando para casa"
    : "Indo para a escola";
};

interface ActiveRouteExecutionViewProps {
  execucao: any;
  paradaAtual: any;
  proximasParadas: any[];
  paradasConcluidas: any[];
  isLoading: boolean;
  handleStep: (paradaId: string, status: RouteStopStatus.EMBARCADO | RouteStopStatus.AUSENTE, callback?: () => void) => Promise<void>;
  handleFinalizarRota?: (callback?: () => void) => Promise<void>;
  handleCancel: (callback?: () => void) => Promise<void>;
  handleReordenar: (novaOrdem: Array<{ id: string; ordem: number }>, callback?: () => void) => Promise<void>;
  concludedStops: number;
  totalStops: number;
  progressPercentage: number;
  isPreview?: boolean;
  iniciarMutation?: any;
  onShowSuccess?: () => void;
}

export function ActiveRouteExecutionView({
  execucao,
  paradaAtual,
  proximasParadas,
  paradasConcluidas,
  isLoading,
  handleStep,
  handleFinalizarRota,
  handleCancel,
  handleReordenar,
  concludedStops,
  totalStops,
  progressPercentage,
  isPreview = false,
  iniciarMutation,
  onShowSuccess
}: ActiveRouteExecutionViewProps) {
  const navigate = useNavigate();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { validarMovimentoPermitido } = useRouteRules();
  const [selectedRespTab, setSelectedRespTab] = useState<string>(TAB_DEFAULT);
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (paradaAtual?.id && activeCardRef.current && !isPreview) {
      const timer = setTimeout(() => {
        if (activeCardRef.current) {
          activeCardRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [paradaAtual?.id, isPreview]);
  const [selectedPreviewTabs, setSelectedPreviewTabs] = useState<Record<string, string>>({});
  const [selectedDialogRespTab, setSelectedDialogRespTab] = useState<string>(TAB_PRINCIPAL);
  const [addressDialogData, setAddressDialogData] = useState<{
    open: boolean;
    title: string;
    address: string;
    latitude?: number;
    longitude?: number;
    sentido?: string | null;
    escolaNome?: string | null;
    tipoNo?: RouteNodeType | null;
    passageiro?: any | null;
    escola?: any | null;
  }>({
    open: false,
    title: "",
    address: "",
  });

  const { user } = useSession();
  const { data: execucoes = [] } = useExecucoesRota(user?.id || "");
  const outraRotaAtiva = execucoes.find(
    (e: any) => e.status === RouteExecutionStatus.INICIADA && e.rota_id !== execucao?.rota_id
  );

  const sentidoPassageiroAtivo = paradaAtual?.sentido || RouteSentido.INDO;
  const actionLabel = sentidoPassageiroAtivo === RouteSentido.VOLTANDO ? "Desembarcou" : "Embarcou";

  const todasParadas = [
    ...(paradasConcluidas || []),
    ...(paradaAtual ? [paradaAtual] : []),
    ...(proximasParadas || [])
  ];

  const getAlunosEscolaPorPosicao = (todasParadasList: any[], escolaNodeIndex: number) => {
    if (escolaNodeIndex < 0 || escolaNodeIndex >= todasParadasList.length) {
      return { desces: [], subes: [] };
    }

    const escolaNode = todasParadasList[escolaNodeIndex];
    if (escolaNode.tipo_no !== RouteNodeType.ESCOLA) {
      return { desces: [], subes: [] };
    }

    const escolaId = escolaNode.escola_id || escolaNode.escola?.id;
    if (!escolaId) {
      return { desces: [], subes: [] };
    }

    const desces = todasParadasList.filter((p, pIdx) => {
      if (p.tipo_no !== RouteNodeType.PASSAGEIRO) return false;
      const pEscolaId = p.passageiro?.escola_id || p.passageiro?.escola?.id || p.escola_id;
      if (pEscolaId !== escolaId) return false;

      const sentido = p.sentido || p.passageiro?.sentido || RouteSentido.INDO;
      if (sentido !== RouteSentido.INDO) return false;

      if (pIdx >= escolaNodeIndex) return false;

      const primeiraEscolaAposP = todasParadasList.findIndex((node, nodeIdx) =>
        nodeIdx > pIdx &&
        node.tipo_no === RouteNodeType.ESCOLA &&
        (node.escola_id === escolaId || node.escola?.id === escolaId)
      );

      return primeiraEscolaAposP === escolaNodeIndex;
    });

    const subes = todasParadasList.filter((p, pIdx) => {
      if (p.tipo_no !== RouteNodeType.PASSAGEIRO) return false;
      const pEscolaId = p.passageiro?.escola_id || p.passageiro?.escola?.id || p.escola_id;
      if (pEscolaId !== escolaId) return false;

      const sentido = p.sentido || p.passageiro?.sentido || RouteSentido.INDO;
      if (sentido !== RouteSentido.VOLTANDO) return false;

      if (pIdx <= escolaNodeIndex) return false;

      let ultimaEscolaAntesDeP = -1;
      for (let i = pIdx - 1; i >= 0; i--) {
        const node = todasParadasList[i];
        if (node.tipo_no === RouteNodeType.ESCOLA && (node.escola_id === escolaId || node.escola?.id === escolaId)) {
          ultimaEscolaAntesDeP = i;
          break;
        }
      }

      return ultimaEscolaAntesDeP === escolaNodeIndex;
    });

    return { desces, subes };
  };

  const paradaAtualIndexInTodas = paradaAtual ? (paradasConcluidas?.length || 0) : -1;
  const { desces: alunosParaDesembarcar, subes: alunosParaEmbarcar } =
    (paradaAtual?.tipo_no === RouteNodeType.ESCOLA && !isPreview && paradaAtualIndexInTodas >= 0)
      ? getAlunosEscolaPorPosicao(todasParadas, paradaAtualIndexInTodas)
      : { desces: [], subes: [] };

  const onCancel = () => {
    openConfirmationDialog({
      title: "Encerrar Rota?",
      description: "Deseja realmente encerrar esta rota? O progresso realizado até agora será salvo no histórico.",
      confirmText: "Encerrar Rota",
      variant: "destructive",
      onConfirm: async () => {
        await handleCancel(() => {
          safeCloseDialog(closeConfirmationDialog);
          navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
        });
      }
    });
  };

  const handleConfirmFalta = (paradaId: string, nome: string) => {
    const isLastStop = proximasParadas.length === 0;
    openConfirmationDialog({
      title: "Confirmar Falta Hoje?",
      description: `Tem certeza que deseja marcar ${formatFirstName(nome)} como ausente hoje nesta corrida?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await handleStep(paradaId, RouteStopStatus.AUSENTE, async () => {
          setSelectedRespTab(TAB_DEFAULT);
          if (isLastStop && handleFinalizarRota) {
            await handleFinalizarRota(() => {
              onShowSuccess?.();
            });
          }
        });
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  };

  const handleConfirmAction = async (paradaId: string) => {
    const isLastStop = proximasParadas.length === 0;
    await handleStep(paradaId, RouteStopStatus.EMBARCADO, async () => {
      setSelectedRespTab(TAB_DEFAULT);
      if (isLastStop && handleFinalizarRota) {
        await handleFinalizarRota(() => {
          onShowSuccess?.();
        });
      }
    });
  };

  const openNavigation = (app: NavigationApp, address: string, lat?: number, lng?: number) => {
    openExternalNavigation(app, address, lat, lng);
  };

  let activeRespName = "";
  let activeRespPhone = "";
  let activeRespParentesco = "";
  let activeAddressStr = "";

  if (paradaAtual && paradaAtual.tipo_no === RouteNodeType.PASSAGEIRO && paradaAtual.passageiro) {
    const pass = paradaAtual.passageiro;
    const responsaveisAdicionais = pass.responsaveis || [];

    const activeRespId = selectedRespTab === TAB_DEFAULT
      ? TAB_PRINCIPAL
      : selectedRespTab;

    if (activeRespId === TAB_PRINCIPAL) {
      activeRespName = pass.nome_responsavel || "Responsável Principal";
      activeRespPhone = pass.telefone_responsavel || "";
      activeRespParentesco = pass.parentesco_responsavel || "Principal";
      activeAddressStr = formatarEnderecoCompleto(pass) || "Endereço principal do aluno";
    } else {
      const respObj = responsaveisAdicionais.find((r: any) => r.id === activeRespId);
      if (respObj) {
        activeRespName = respObj.nome;
        activeRespPhone = respObj.telefone;
        activeRespParentesco = respObj.parentesco;
        activeAddressStr = respObj.logradouro ? formatarEnderecoCompleto(respObj) : (formatarEnderecoCompleto(pass) || "Mesmo endereço do aluno");
      } else {
        activeRespName = pass.nome_responsavel || "Responsável";
        activeRespPhone = pass.telefone_responsavel || "";
        activeRespParentesco = pass.parentesco_responsavel || "Principal";
        activeAddressStr = formatarEnderecoCompleto(pass) || "Endereço principal";
      }
    }
  } else if (paradaAtual && paradaAtual.tipo_no === RouteNodeType.ESCOLA && paradaAtual.escola) {
    const esc = paradaAtual.escola;
    activeRespName = "Desembarque na Escola";
    activeAddressStr = formatarEnderecoCompleto(esc) || "Endereço da escola";
  }

  const displayAddressStr = activeAddressStr;

  const displayProximasParadas = [...proximasParadas];

  const handleMoveParada = async (index: number, direction: "up" | "down") => {
    // Lista completa real de pendentes
    const totalPendentesReal = paradaAtual ? [paradaAtual, ...proximasParadas] : [...proximasParadas];

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= totalPendentesReal.length) return;

    // Regras de negócio compartilhadas do helper centralizado:
    if (!validarMovimentoPermitido(execucao.tipo, index, direction, totalPendentesReal)) {
      return;
    }

    const newPendentes = [...totalPendentesReal];
    const temp = newPendentes[index];
    newPendentes[index] = newPendentes[targetIndex];
    newPendentes[targetIndex] = temp;

    // Une com paradas concluídas para mandar a listagem inteira ordenada
    const allStops = [
      ...paradasConcluidas,
      ...newPendentes
    ];

    const novaOrdem = allStops.map((parada, idx) => ({
      id: parada.id,
      ordem: idx + 1
    }));

    try {
      await handleReordenar(novaOrdem);
    } catch (err) {
      toast.error("Erro ao reordenar trajeto.");
    }
  };

  const displayParadasConcluidas = [...paradasConcluidas].sort((a, b) => a.ordem - b.ordem);

  const totalTimelineItems = displayParadasConcluidas.length + (paradaAtual ? 1 : 0) + displayProximasParadas.length;

  const isLastNode = (proximasParadas.length === 0);

  return (
    <div className="space-y-4">
      {isPreview ? (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3.5 text-left">
          <div className="space-y-1 min-w-0 pr-1">
            <h2 className="text-xl font-extrabold text-[#1a3a5c] font-headline tracking-tight leading-snug break-words">
              {execucao?.rota?.nome || "Rota"}
            </h2>
            <p className="text-xs font-medium text-slate-400 leading-none pt-0.5">
              {(todasParadas.length || totalStops) === 1 ? "1 PARADA" : `${todasParadas.length || totalStops} PARADAS`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            {execucao?.rota_id && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EDIT.replace(":id", execucao.rota_id))}
                className="h-11 px-4 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] font-extrabold uppercase text-xs tracking-wider shadow-2xs shrink-0 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                title="Editar Rota"
              >
                <span>Editar</span>
              </Button>
            )}

            <Button
              onClick={() => {
                if (iniciarMutation && execucao?.rota_id) {
                  iniciarMutation.mutate(execucao.rota_id, {
                    onSuccess: (data: any) => {
                      navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", data.id), { replace: true });
                    }
                  });
                }
              }}
              disabled={!!outraRotaAtiva || isLoading}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 border-none transition-all active:scale-95 cursor-pointer"
            >
              {iniciarMutation?.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>Iniciar Rota</span>
            </Button>
          </div>

          {outraRotaAtiva && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-800 text-[11px] font-semibold mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-snug text-left">
                Uma outra rota (<strong className="font-bold">{outraRotaAtiva.rota?.nome}</strong>) está em execução. Encerre a rota ativa para poder iniciar esta.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4 text-left">
          <div className="flex items-start justify-between gap-3 w-full">
            <div className="space-y-1 min-w-0 pr-1 text-left">
              <h2 className="text-xl font-extrabold text-[#1a3a5c] font-headline tracking-tight leading-snug break-words">
                {execucao?.rota?.nome}
              </h2>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Em Execução
                </span>
              </div>
            </div>

            {execucao?.status === RouteExecutionStatus.INICIADA && (
              <Button
                variant="outline"
                className="rounded-lg border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs shrink-0 h-8 px-3 gap-1 shadow-2xs cursor-pointer"
                onClick={onCancel}
                disabled={isLoading}
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                Encerrar
              </Button>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#1a3a5c]">
              <span className="flex items-center gap-1.5 uppercase text-[9px] tracking-wider text-slate-500 font-bold">
                <Route className="w-3.5 h-3.5 text-slate-400" /> Progresso
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase bg-[#1a3a5c]/5 text-[#1a3a5c] px-2 py-0.5 rounded-md">
                {concludedStops} de {totalStops} Paradas ({progressPercentage}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE DE PARADAS */}
      {totalTimelineItems > 0 && (
        <div className="relative flex flex-col gap-5 pl-9 pb-1 text-left">
          {displayParadasConcluidas.map((parada, index) => {
            const absIndex = index;
            const showTopLine = absIndex > 0;
            const showBottomLine = absIndex < totalTimelineItems - 1;
            const isAusente = parada.status === RouteStopStatus.AUSENTE;
            const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;
            const statusLabel = isAusente ? "FALTOU" : "CONCLUÍDO";

            return (
              <div key={parada.id} className="relative w-full">
                {showTopLine && (
                  <div className="absolute left-[-24px] top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
                )}
                {showBottomLine && (
                  <div className="absolute left-[-24px] top-1/2 bottom-[-20px] w-[2.5px] bg-slate-200/70 z-0" />
                )}

                <span className={cn(
                  "absolute left-[-35px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center font-extrabold text-[10px] border-2 shadow-sm z-10",
                  isAusente ? "bg-white border-rose-400 text-rose-500" : "bg-emerald-500 border-emerald-500 text-white"
                )}>
                  {isAusente ? (
                    <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                  ) : isEscolaItem ? (
                    <School className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </span>

                <div className="bg-slate-50/70 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs opacity-65 min-h-[52px] transition-all">
                  <div className="min-w-0 flex-1">
                    <h4 className={cn(
                      "text-[11px] font-bold text-left break-words leading-tight pr-2",
                      isEscolaItem ? "text-blue-950" : "text-slate-700"
                    )}>
                      {isEscolaItem
                        ? `${parada.escola?.nome}`
                        : formatShortName(parada.passageiro?.nome || "", true)}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 text-left">
                      {isEscolaItem
                        ? "Parada na escola"
                        : isAusente
                          ? "Passageiro não embarcou"
                          : parada.sentido === RouteSentido.VOLTANDO
                            ? "Desembarque realizado"
                            : "Embarque realizado"}
                    </p>
                  </div>
                  <Badge className={cn(
                    "text-[9px] font-bold border px-1.5 py-0.5 rounded-md shrink-0 leading-none uppercase",
                    isAusente ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                  )}>
                    {statusLabel}
                  </Badge>
                </div>
              </div>
            );
          })}

          {paradaAtual && (() => {
            const absIndex = displayParadasConcluidas.length;
            const showTopLine = absIndex > 0;
            const showBottomLine = absIndex < totalTimelineItems - 1;
            const isEscola = paradaAtual.tipo_no === RouteNodeType.ESCOLA;
            const displayOrdem = paradaAtual.ordem || 0;

            const pass = paradaAtual.passageiro;
            const responsaveisAdicionais = pass?.responsaveis || [];
            const isPrincipal = selectedRespTab === TAB_DEFAULT || selectedRespTab === TAB_PRINCIPAL;
            const respObj = !isPrincipal ? responsaveisAdicionais.find((r: any) => r.id === selectedRespTab) : null;

            let currentAddressStr = isEscola
              ? formatarEnderecoCompleto(paradaAtual.escola) || ""
              : formatarEnderecoParcialRota(pass) || "";

            if (!isEscola && pass) {
              if (isPrincipal) {
                currentAddressStr = formatarEnderecoParcialRota(pass) || "";
              } else if (respObj) {
                currentAddressStr = respObj.logradouro
                  ? formatarEnderecoParcialRota(respObj)
                  : (formatarEnderecoParcialRota(pass) || "");
              }
            }

            const cardClass = "bg-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3.5 animate-in fade-in zoom-in-95 duration-200 text-left border border-slate-200";

            return (
              <div key={paradaAtual.id} ref={activeCardRef} className="relative w-full">
                {showTopLine && (
                  <div className="absolute left-[-24px] top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
                )}
                {showBottomLine && (
                  <div className="absolute left-[-24px] top-1/2 bottom-[-20px] w-[2.5px] bg-slate-200/70 z-0" />
                )}

                <span className={cn(
                  "absolute left-[-35px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] border-2 shadow-sm z-10",
                  isEscola ? "bg-blue-600 border-blue-600" : "bg-[#1a3a5c] border-white"
                )}>
                  {isEscola ? <School className="w-3.5 h-3.5" /> : displayOrdem}
                </span>

                <div className={cardClass}>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                      {isEscola
                        ? `Parada Atual`
                        : `Parada Atual`}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      {!isEscola && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAddressDialogData({
                              open: true,
                              title: paradaAtual.passageiro?.nome || "Passageiro",
                              address: currentAddressStr,
                              latitude: respObj?.latitude || paradaAtual.passageiro?.latitude,
                              longitude: respObj?.longitude || paradaAtual.passageiro?.longitude,
                              tipoNo: RouteNodeType.PASSAGEIRO,
                              sentido: paradaAtual.sentido,
                              escolaNome: paradaAtual.passageiro?.escola?.nome,
                              passageiro: paradaAtual.passageiro
                            });
                          }}
                          className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-[#1a3a5c] hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-2xs"
                          title="Ver endereço e detalhes"
                        >
                          <MapPin className="w-4 h-4 text-[#1a3a5c]" />
                        </Button>
                      )}

                      {/* Seta de reordenar parada ativa */}
                      {(() => {
                        const totalPendentesReal = paradaAtual ? [paradaAtual, ...proximasParadas] : [...proximasParadas];
                        if (totalPendentesReal.length <= 1) return null;

                        const index = 0;
                        const isUpDisabled = true;

                        const nextItem = totalPendentesReal[index + 1];
                        const isDownDisabled =
                          index === totalPendentesReal.length - 1 ||
                          isLoading;

                        return (
                          <div className="flex items-center gap-0.5 border border-slate-100 rounded-lg p-0.5 bg-slate-50 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isUpDisabled}
                              className="h-6 w-6 rounded-md text-slate-400 opacity-20 shrink-0 cursor-not-allowed"
                              title="Subir parada (já está ativa)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isDownDisabled}
                              onClick={() => handleMoveParada(index, "down")}
                              className="h-6 w-6 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-20 shrink-0"
                              title="Descer parada ativa"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {isEscola ? (
                    <div className="space-y-3.5">
                      {/* Cabecalho Limpo da Escola */}
                      <div className="space-y-1 text-left w-full">
                        <h2 className="text-base font-bold text-[#1a3a5c] font-headline leading-snug break-words">
                          {paradaAtual.escola?.nome}
                        </h2>
                        {activeAddressStr && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-0.5 text-left">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="break-words">{activeAddressStr}</span>
                          </div>
                        )}
                      </div>

                      {/* Tabs de Embarques e Desembarques */}
                      {(() => {
                        const defaultTab = alunosParaEmbarcar.length > 0 ? "embarques" : "desembarques";

                        return (
                          <Tabs defaultValue={defaultTab} className="w-full mt-3">
                            <div className="bg-slate-100/80 p-1 rounded-xl">
                              <TabsList className="grid grid-cols-2 w-full bg-transparent p-0 h-8">
                                <TabsTrigger
                                  value="embarques"
                                  className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs text-slate-500 py-1"
                                >
                                  Embarques ({alunosParaEmbarcar.length})
                                </TabsTrigger>
                                <TabsTrigger
                                  value="desembarques"
                                  className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs text-slate-500 py-1"
                                >
                                  Desembarques ({alunosParaDesembarcar.length})
                                </TabsTrigger>
                              </TabsList>
                            </div>

                            {/* Conteudo de Embarques */}
                            <TabsContent value="embarques" className="mt-2.5 space-y-1.5 focus-visible:outline-none">
                              {alunosParaEmbarcar.length === 0 ? (
                                <p className="text-xs text-slate-400 font-medium py-3 text-center bg-slate-50/50 rounded-xl border border-slate-100">
                                  Nenhum embarque nesta parada
                                </p>
                              ) : (
                                alunosParaEmbarcar.map((aluno) => {
                                  const isPendente = aluno.status === RouteStopStatus.PENDENTE;
                                  const isABordo = aluno.status === RouteStopStatus.EMBARCADO;

                                  return (
                                    <div key={aluno.id} className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                      <div className="flex items-center gap-2 min-w-0 pr-2">
                                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="max-[334px]:text-[10px] text-xs font-medium text-[#1a3a5c] truncate">
                                          {formatShortName(aluno.passageiro?.nome || aluno.nome, true)}
                                        </span>
                                      </div>
                                      {isPendente ? (
                                        <Button
                                          type="button"
                                          onClick={() => handleConfirmFalta(aluno.id, aluno.passageiro?.nome || aluno.nome)}
                                          disabled={isLoading}
                                          className="h-7 px-2.5 bg-white border border-rose-200/80 hover:bg-rose-50 text-rose-600 font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
                                        >
                                          <UserMinus className="w-3 h-3 text-rose-500" />
                                          <span>Faltou</span>
                                        </Button>
                                      ) : (
                                        <span className={cn(
                                          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border shadow-2xs shrink-0 leading-none",
                                          isABordo ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                          {isABordo ? "A BORDO" : "FALTOU"}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </TabsContent>

                            {/* Conteudo de Desembarques */}
                            <TabsContent value="desembarques" className="mt-2.5 space-y-1.5 focus-visible:outline-none">
                              {alunosParaDesembarcar.length === 0 ? (
                                <p className="text-xs text-slate-400 font-medium py-3 text-center bg-slate-50/50 rounded-xl border border-slate-100">
                                  Nenhum desembarque nesta parada
                                </p>
                              ) : (
                                alunosParaDesembarcar.map((aluno) => {
                                  const isAusente = aluno.status === RouteStopStatus.AUSENTE;
                                  const isABordo = aluno.status === RouteStopStatus.EMBARCADO && !aluno.visitado_em;
                                  const isConcluido = aluno.status === RouteStopStatus.EMBARCADO && !!aluno.visitado_em;

                                  let badgeText = "PENDENTE";
                                  let badgeClass = "bg-slate-50 text-slate-600 border-slate-200/60";
                                  if (isAusente) {
                                    badgeText = "FALTOU";
                                    badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
                                  } else if (isABordo) {
                                    badgeText = "A BORDO";
                                    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
                                  } else if (isConcluido) {
                                    badgeText = "DESEMBARCADO";
                                    badgeClass = "bg-slate-50 text-slate-600 border-slate-200/60";
                                  }

                                  return (
                                    <div key={aluno.id} className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                      <div className="flex items-center gap-2 min-w-0 pr-2">
                                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-xs font-medium text-[#1a3a5c] truncate">
                                          {formatShortName(aluno.passageiro?.nome || aluno.nome, true)}
                                        </span>
                                      </div>
                                      <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border shadow-2xs shrink-0 leading-none", badgeClass)}>
                                        {badgeText}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </TabsContent>
                          </Tabs>
                        );
                      })()}

                      {/* Botao de Acao Principal da Escola */}
                      <Button
                        onClick={() => handleConfirmAction(paradaAtual.id)}
                        disabled={isLoading}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 border-none mt-3.5 cursor-pointer"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>Concluir Parada</span>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* Cabecalho do Passageiro */}
                      <div className="space-y-1 text-left w-full">
                        <h2 className="text-base font-bold text-[#1a3a5c] font-headline leading-snug break-words">
                          {formatShortName(paradaAtual.passageiro?.nome || "", true)}
                        </h2>

                        {/* Endereço Principal do Passageiro */}
                        {displayAddressStr && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1 text-left">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="break-words">{displayAddressStr}</span>
                          </div>
                        )}

                        {/* Linha de contexto do sentido */}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1">
                          {sentidoPassageiroAtivo === RouteSentido.VOLTANDO ? (
                            <>
                              <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Voltando para casa</span>
                            </>
                          ) : (
                            <>
                              <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Indo para a escola</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Botoes de Acao do Passageiro */}
                      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                        <Button
                          type="button"
                          onClick={() => handleConfirmAction(paradaAtual.id)}
                          disabled={isLoading}
                          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1.5 border-none transition-colors cursor-pointer"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          {actionLabel}
                        </Button>

                        {sentidoPassageiroAtivo !== RouteSentido.VOLTANDO && paradaAtual.status !== RouteStopStatus.EMBARCADO && (
                          <Button
                            type="button"
                            onClick={() => handleConfirmFalta(paradaAtual.id, paradaAtual.passageiro?.nome || "")}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full h-10 border border-rose-200/80 hover:bg-rose-50/50 text-rose-600 font-bold uppercase text-xs tracking-wider rounded-xl shadow-2xs flex items-center justify-center gap-1.5 bg-white transition-colors cursor-pointer"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            <span>Faltou</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {displayProximasParadas.map((parada, index) => {
            const absIndex = displayParadasConcluidas.length + (paradaAtual ? 1 : 0) + index;
            const showTopLine = absIndex > 0;
            const showBottomLine = absIndex < totalTimelineItems - 1;
            const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;

            // Determinação de endereço e responsáveis
            const pass = parada.passageiro;
            const responsaveisAdicionais = pass?.responsaveis || [];
            const activeTabForCard = selectedPreviewTabs[parada.id] || TAB_PRINCIPAL;

            let currentAddressStr = "";
            let currentLat = isEscolaItem ? parada.escola?.latitude : parada.passageiro?.latitude;
            let currentLng = isEscolaItem ? parada.escola?.longitude : parada.passageiro?.longitude;

            if (isEscolaItem) {
              currentAddressStr = formatarEnderecoParcialRota(parada.escola) || "Endereço da escola";
            } else if (pass) {
              if (activeTabForCard === TAB_PRINCIPAL) {
                currentAddressStr = formatarEnderecoParcialRota(pass) || "Endereço principal do aluno";
                currentLat = pass.latitude;
                currentLng = pass.longitude;
              } else {
                const respObj = responsaveisAdicionais.find((r: any) => r.id === activeTabForCard);
                if (respObj) {
                  currentAddressStr = respObj.logradouro ? formatarEnderecoParcialRota(respObj) : (formatarEnderecoParcialRota(pass) || "Mesmo endereço do aluno");
                  currentLat = respObj.latitude || pass.latitude;
                  currentLng = respObj.longitude || pass.longitude;
                } else {
                  currentAddressStr = formatarEnderecoParcialRota(pass) || "Endereço principal";
                  currentLat = pass.latitude;
                  currentLng = pass.longitude;
                }
              }
            }

            return (
              <div key={parada.id} className="relative w-full">
                {showTopLine && (
                  <div className="absolute left-[-24px] top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
                )}
                {showBottomLine && (
                  <div className="absolute left-[-24px] top-1/2 bottom-[-20px] w-[2.5px] bg-slate-200/70 z-0" />
                )}

                <span className={cn(
                  "absolute left-[-35px] top-1/2 -translate-y-1/2 h-6 w-6 font-bold text-[10px] flex items-center justify-center shrink-0 text-white border-2 rounded-full shadow-sm z-10",
                  isEscolaItem ? "bg-blue-600 border-blue-600" : "bg-[#1a3a5c] border-white"
                )}>
                  {isEscolaItem ? <School className="w-3.5 h-3.5" /> : parada.ordem}
                </span>

                <div className="bg-white p-3.5 rounded-2xl flex flex-col justify-center text-left shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] min-h-[52px] transition-all border border-slate-200">
                  <div className="flex flex-col gap-1 min-w-0 items-start">
                    {/* Cabeçalho do Card: Nome + Turma e Botão de Endereço no Canto Superior Direito */}
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex-1 min-w-0 pr-1 text-left">
                        <h4 className="text-sm font-bold text-[#1a3a5c] break-words leading-snug">
                          {isEscolaItem
                            ? parada.escola?.nome
                            : formatShortName(parada.passageiro?.nome || parada.nome || "", true)}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1 text-left">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="break-words">
                            {isEscolaItem
                              ? "Parada de Escola"
                              : (currentAddressStr || "Endereço cadastrado")}
                          </span>
                        </div>
                      </div>

                      {/* Botão de Endereço no Canto Superior Direito (Apenas Passageiro) */}
                      {!isEscolaItem && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedDialogRespTab(TAB_PRINCIPAL);
                            setAddressDialogData({
                              open: true,
                              title: pass?.nome || "Passageiro",
                              passageiro: pass,
                              escola: null,
                              address: currentAddressStr,
                              latitude: currentLat,
                              longitude: currentLng,
                              tipoNo: RouteNodeType.PASSAGEIRO,
                              sentido: parada.sentido,
                              escolaNome: pass?.escola?.nome || pass?.escola_nome
                            });
                          }}
                          className="h-8 w-8 rounded-lg border-slate-200 text-[#1a3a5c] hover:bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs -mt-0.5"
                          title="Ver endereço e detalhes"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#1a3a5c]" />
                        </Button>
                      )}
                    </div>

                    {isEscolaItem && (() => {
                      const paradaIndexInTodas = todasParadas.findIndex(p => p.id === parada.id);
                      const { desces, subes } = getAlunosEscolaPorPosicao(todasParadas, paradaIndexInTodas >= 0 ? paradaIndexInTodas : index);

                      return (
                        <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 w-full text-left">
                          {/* Lista Completa de Alunos de Desembarque e Embarque */}
                          <div className="space-y-1 text-left">
                            <div className="text-[11px] leading-snug">
                              <span className="font-semibold text-slate-700">⬇️ Desembarque ({desces.length}):{" "}</span>
                              {desces.length > 0 && (
                                <span className="text-slate-500 font-normal">
                                  {desces.map(d => formatShortName(d.passageiro?.nome || d.nome || "", true)).join(", ")}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] leading-snug">
                              <span className="font-semibold text-slate-700">⬆️ Embarque ({subes.length}):{" "}</span>
                              {subes.length > 0 && (
                                <span className="text-slate-500 font-normal">
                                  {subes.map(s => formatShortName(s.passageiro?.nome || s.nome || "", true)).join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {!isEscolaItem && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1 text-left">
                        {parada.sentido === RouteSentido.VOLTANDO ? (
                          <>
                            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="break-words">Voltando para casa</span>
                          </>
                        ) : (
                          <>
                            <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="break-words">Indo para a escola</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {!isPreview && (
                    <div className="flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const totalPendentesReal = paradaAtual ? [paradaAtual, ...proximasParadas] : [...proximasParadas];
                          if (totalPendentesReal.length <= 1) return null;

                          const realIndex = index + 1;

                          const isUpDisabled =
                            realIndex === 0 ||
                            isLoading;

                          const isDownDisabled =
                            realIndex === totalPendentesReal.length - 1 ||
                            isLoading;

                          return (
                            <div className="flex items-center gap-1 border border-slate-100 rounded-lg p-0.5 bg-slate-50 shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isUpDisabled}
                                onClick={() => handleMoveParada(realIndex, "up")}
                                className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-20 shrink-0"
                                title="Subir parada"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isDownDisabled}
                                onClick={() => handleMoveParada(realIndex, "down")}
                                className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-20 shrink-0"
                                title="Descer parada"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isEscolaItem ? null : parada.status === RouteStopStatus.EMBARCADO ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[10px] font-bold px-2 py-0.5 leading-none block whitespace-nowrap">
                            A BORDO
                          </span>
                        ) : parada.status === RouteStopStatus.AUSENTE ? (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[10px] font-bold px-2 py-0.5 leading-none block whitespace-nowrap">
                            FALTOU
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading}
                            onClick={() => handleConfirmFalta(parada.id, parada.passageiro?.nome || "")}
                            className="h-8 px-3 rounded-lg border-rose-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 shadow-xs flex items-center gap-1.5 bg-white text-[11px] font-bold transition-colors"
                            title="Marcar falta hoje"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserMinus className="w-3.5 h-3.5" />
                            )}
                            <span>Faltou</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diálogo Centralizado de Detalhes da Parada (Exclusivo Passageiro) */}
      <BaseDialog
        open={addressDialogData.open && addressDialogData.tipoNo === RouteNodeType.PASSAGEIRO}
        onOpenChange={(open) => {
          setAddressDialogData(prev => ({ ...prev, open }));
          if (!open) setSelectedDialogRespTab(TAB_PRINCIPAL);
        }}
        maxWidth="md"
      >
        <BaseDialog.Header
          title="Endereços do Passageiro"
          icon={<MapPin className="w-5 h-5 text-[#1a3a5c]" />}
          onClose={() => {
            setAddressDialogData(prev => ({ ...prev, open: false }));
            setSelectedDialogRespTab(TAB_PRINCIPAL);
          }}
        />

        <BaseDialog.Body className="space-y-3.5 text-left pt-2 pb-4">
          {(() => {
            const pass = addressDialogData.passageiro;
            const isPrincipal = selectedDialogRespTab === TAB_PRINCIPAL;
            const respObj = !isPrincipal ? pass?.responsaveis?.find((r: any) => r.id === selectedDialogRespTab) : null;

            let activeRespName = isPrincipal ? pass?.nome_responsavel : respObj?.nome;
            let rawParentesco = isPrincipal ? pass?.parentesco_responsavel : respObj?.parentesco;
            let activeAddress = addressDialogData.address;
            let activeLat = addressDialogData.latitude;
            let activeLng = addressDialogData.longitude;

            if (pass) {
              if (isPrincipal) {
                activeAddress = formatarEnderecoCompleto(pass) || formatarEnderecoParcialRota(pass) || addressDialogData.address;
                activeLat = pass.latitude ?? addressDialogData.latitude;
                activeLng = pass.longitude ?? addressDialogData.longitude;
              } else if (respObj) {
                activeAddress = respObj.logradouro
                  ? formatarEnderecoCompleto(respObj)
                  : (formatarEnderecoCompleto(pass) || formatarEnderecoParcialRota(pass) || addressDialogData.address);
                activeLat = (respObj as any).latitude ?? pass.latitude ?? addressDialogData.latitude;
                activeLng = (respObj as any).longitude ?? pass.longitude ?? addressDialogData.longitude;
              }
            }

            const activeRespFirstName = activeRespName ? formatFirstName(activeRespName) : "";
            const formattedParentesco = rawParentesco ? formatParentesco(rawParentesco) : "";
            const parentescoLabel = (formattedParentesco && formattedParentesco.trim().length > 0)
              ? formattedParentesco
              : (isPrincipal ? "Principal" : "Responsável");

            const isVolta = addressDialogData.sentido === RouteSentido.VOLTANDO;
            const casaAddress = activeAddress;
            const escolaNome = addressDialogData.escolaNome;

            const saindoDe = isVolta ? escolaNome : casaAddress;
            const chegandoEm = isVolta ? casaAddress : escolaNome;

            return (
              <>
                {/* 0. Nome e Avatar Inline do Passageiro */}
                <div className="flex items-center justify-start gap-2 py-0.5 text-left">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1a3a5c] shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1a3a5c] font-headline tracking-tight">
                    {formatShortName(pass?.nome || addressDialogData.title, true)}
                  </h3>
                </div>

                {/* 1. Tabs de Responsáveis Adicionais (Somente se existirem adicionais) */}
                {pass?.responsaveis && pass.responsaveis.length > 0 && (
                  <div className="w-full min-w-0">
                    <Tabs value={selectedDialogRespTab} onValueChange={setSelectedDialogRespTab} className="w-full min-w-0">
                      <TabsList className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1 w-full min-w-0 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <TabsTrigger
                          value={TAB_PRINCIPAL}
                          className="rounded-full border border-slate-200 bg-white text-slate-600 px-3.5 py-1 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-2xs shrink-0 cursor-pointer"
                        >
                          Principal
                        </TabsTrigger>
                        {pass.responsaveis.map((resp: any) => (
                          <TabsTrigger
                            key={resp.id}
                            value={resp.id!}
                            className="rounded-full border border-slate-200 bg-white text-slate-600 px-3.5 py-1 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-2xs shrink-0 cursor-pointer"
                          >
                            {formatParentesco(resp.parentesco) || formatFirstName(resp.nome)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                )}

                {/* 2. Alerta de Atenção para Responsável Alternativo (ex: Pai/Mãe) */}
                {!isPrincipal && respObj && (
                  <div className="flex items-start gap-2 bg-amber-50/90 border border-amber-200/80 p-2.5 rounded-xl text-amber-900 text-[11px] font-normal leading-tight animate-in fade-in duration-200 text-left shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-950 block mb-0.5">Aviso de endereço alternativo:</span>
                      Você está visualizando e navegando para o endereço de <strong className="font-semibold">{formatFirstName(respObj.nome)}</strong> ({parentescoLabel}).
                    </div>
                  </div>
                )}

                {/* 3. Card de Endereço Ativo (Com os Botões de Navegação Maps e Waze) */}
                <div className="bg-white border border-slate-200/90 p-3.5 rounded-xl space-y-2.5 text-left shadow-2xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Endereço
                    </span>
                    {activeRespFirstName && (
                      <span className={cn(
                        "text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md border leading-none shadow-2xs bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {activeRespFirstName} ({parentescoLabel})
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#1a3a5c] leading-relaxed break-words">
                    {activeAddress || "Endereço não informado"}
                  </p>

                  {/* Botões de Navegação com Cores Oficiais */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-slate-100">
                    <Button
                      type="button"
                      onClick={() => {
                        openNavigation(NavigationApp.GOOGLE_MAPS, activeAddress, activeLat, activeLng);
                      }}
                      className="h-10 border-none bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 w-full cursor-pointer"
                    >
                      <GoogleMapsIcon className="w-4 h-4 shrink-0" />
                      <span>Maps</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        openNavigation(NavigationApp.WAZE, activeAddress, activeLat, activeLng);
                      }}
                      className="h-10 border-none bg-[#33CCFF] hover:bg-[#28b6e6] text-[#000000] font-bold text-xs rounded-full flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 w-full cursor-pointer"
                    >
                      <WazeIcon className="w-4 h-4 fill-current text-[#000000] shrink-0" />
                      <span>Waze</span>
                    </Button>
                  </div>
                </div>

                {/* 4. Trajeto da Rota (Com Linha Conectora) */}
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-3 text-left shadow-2xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Trajeto da Rota
                    </span>
                    <span className={cn(
                      "text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md border leading-none shadow-2xs",
                      !isVolta ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-red text-[#1a3a5c] border-[#1a3a5c]/20"
                    )}>
                      {isVolta ? "Voltando" : "Indo"}
                    </span>
                  </div>

                  <div className="relative pl-0.5 space-y-4 pt-1 text-xs">
                    {/* Saindo de */}
                    <div className="flex items-start gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#1a3a5c] shadow-2xs z-10">
                        {isVolta ? <School className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                      </div>
                      {/* Linha Conectora Vertical */}
                      <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-200" />
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider block">
                          Saindo de:
                        </span>
                        <span className="font-semibold text-[#1a3a5c] break-words block leading-snug">
                          {saindoDe}
                        </span>
                      </div>
                    </div>

                    {/* Chegando em */}
                    <div className="flex items-start gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#1a3a5c] shadow-2xs z-10">
                        {isVolta ? <Home className="w-3.5 h-3.5" /> : <School className="w-3.5 h-3.5" />}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <span className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider block">
                          Chegando em:
                        </span>
                        <span className="font-semibold text-[#1a3a5c] break-words block leading-snug">
                          {chegandoEm}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </BaseDialog.Body>
      </BaseDialog>
    </div>
  );
}
