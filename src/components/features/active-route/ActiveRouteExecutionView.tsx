import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import RegistrarAusenciaDialog from "@/components/dialogs/RegistrarAusenciaDialog";
import { RouteCompletedStopItem } from "./RouteCompletedStopItem";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { RouteNodeType, RouteStopStatus, RouteSentido, RouteExecution, ExecucaoParada, ChamadaEscolaItem, DELETE_AUSENCIA_BY_QUERY_PARAM } from "@/types/route";
import { toast } from "@/utils/notifications/toast";
import { useRouteRules } from "@/hooks/business/useRouteRules";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useRemoverAusenciaMutation } from "@/hooks/api/useRoutes";
import { ActiveRouteHeader } from "./ActiveRouteHeader";
import { AddressDetailsDialog, AddressDialogData } from "./AddressDetailsDialog";
import { ActiveRouteCurrentCard } from "./ActiveRouteCurrentCard";
import { ActiveRouteUpcomingCard } from "./ActiveRouteUpcomingCard";
import { ReordenarParadaSheet } from "./ReordenarParadaSheet";
import { ChamadaEscolaDialog } from "@/components/dialogs/ChamadaEscolaDialog";
import ConfirmStartRouteDialog from "@/components/dialogs/ConfirmStartRouteDialog";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";
import { useProcessarChamadaEscola } from "@/hooks/api/useRouteMutations";
import { formatarEnderecoParcialRota } from "@/utils/formatters/address";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

const TAB_DEFAULT = "default";
const TAB_PRINCIPAL = "principal";

interface ActiveRouteExecutionViewProps {
  execucao: RouteExecution;
  paradaAtual?: ExecucaoParada | null;
  proximasParadas: ExecucaoParada[];
  paradasConcluidas: ExecucaoParada[];
  isLoading: boolean;
  isStepping?: boolean;
  isFinalizing?: boolean;
  handleStep: (paradaId: string, status: RouteStopStatus.EMBARCADO | RouteStopStatus.AUSENTE | RouteStopStatus.PENDENTE, callback?: () => void) => Promise<void>;
  handleFinalizarRota?: (callback?: () => void) => Promise<void>;
  handleCancel: (callback?: () => void) => Promise<void>;
  handleReordenar: (novaOrdem: Array<{ id: string; ordem: number }>, callback?: () => void) => Promise<void>;
  concludedStops: number;
  totalStops: number;
  progressPercentage: number;
  isPreview?: boolean;
  isVehicleOccupied?: boolean;
  occupiedRouteName?: string;
  iniciarMutation?: any;
  onShowSuccess?: () => void;
}

export function ActiveRouteExecutionView({
  execucao,
  paradaAtual,
  proximasParadas,
  paradasConcluidas,
  isLoading,
  isStepping = false,
  isFinalizing = false,
  handleStep,
  handleFinalizarRota,
  handleCancel,
  handleReordenar,
  concludedStops,
  totalStops,
  progressPercentage,
  isPreview = false,
  isVehicleOccupied = false,
  occupiedRouteName = "",
  iniciarMutation,
  onShowSuccess
}: ActiveRouteExecutionViewProps) {
  const navigate = useNavigate();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { validarMovimentoPermitido, validarItinerarioPronto } = useRouteRules();
  const [selectedRespTab, setSelectedRespTab] = useState<string>(TAB_DEFAULT);
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (paradaAtual?.id && activeCardRef.current && !isPreview) {
      const timer = setTimeout(() => {
        if (activeCardRef.current) {
          const rect = activeCardRef.current.getBoundingClientRect();
          const header = document.querySelector("header");
          const headerHeight = header?.offsetHeight || (Capacitor.isNativePlatform() ? 115 : 70);
          const topMargin = 16;
          const targetY = window.scrollY + rect.top - headerHeight - topMargin;
          window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [paradaAtual?.id, isPreview]);
  const [isAusenciaDialogOpen, setIsAusenciaDialogOpen] = useState(false);
  const [isChamadaDialogOpen, setIsChamadaDialogOpen] = useState(false);
  const [isConfirmStartDialogOpen, setIsConfirmStartDialogOpen] = useState(false);
  const [reordenarSheetTarget, setReordenarSheetTarget] = useState<ExecucaoParada | null>(null);
  const chamadaEscolaMutation = useProcessarChamadaEscola();
  const [selectedPreviewTabs, setSelectedPreviewTabs] = useState<Record<string, string>>({});
  const [selectedDialogRespTab, setSelectedDialogRespTab] = useState<string>(TAB_PRINCIPAL);
  const [addressDialogData, setAddressDialogData] = useState<{
    open: boolean;
    title: string;
    address: string;
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

  const { can } = usePermissions();

  const removerAusenciaMutation = useRemoverAusenciaMutation();
  const [desfazendoStopId, setDesfazendoStopId] = useState<string | null>(null);

  const handleDesfazerAusencia = (parada: any) => {
    const isAusente = parada.status === RouteStopStatus.AUSENTE || parada.is_ausente;
    if (!isAusente) return;

    const nomeAluno = formatShortName(parada.passageiro?.nome);

    openConfirmationDialog({
      title: "Desfazer Ausência?",
      description: `Tem certeza que deseja desfazer a ausência de ${nomeAluno} e retorná-lo para a rota?`,
      confirmText: "Desfazer",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        setDesfazendoStopId(parada.id);

        try {
          const pid = parada.passageiro_id || parada.passageiro?.id;
          const rid = execucao?.rota_id || parada.rota_id;

          if (isPreview) {
            await removerAusenciaMutation.mutateAsync({
              id: parada.ausencia_id || DELETE_AUSENCIA_BY_QUERY_PARAM,
              passageiro_id: pid,
              rota_id: rid,
            });
            toast.success("Registro de Ausência desfeito!", { description: "Passageiro retornado ao itinerário." });
          } else if (execucao?.id) {
            await handleStep(parada.id, RouteStopStatus.PENDENTE);
            toast.success("Registro de Ausência desfeito!", { description: "Passageiro retornado ao trajeto." });
          }

          safeCloseDialog(closeConfirmationDialog);
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Erro ao desfazer ausência.";
          toast.error(errorMsg);
        } finally {
          setDesfazendoStopId(null);
        }
      }
    });
  };

  const [submittingStopId, setSubmittingStopId] = useState<string | null>(null);
  const [isFinishingLastStop, setIsFinishingLastStop] = useState(false);
  const lastParadaAtualRef = useRef<any>(null);

  if (paradaAtual) {
    lastParadaAtualRef.current = paradaAtual;
  }

  const activeParadaToRender = (isFinishingLastStop || isFinalizing)
    ? (paradaAtual || lastParadaAtualRef.current)
    : paradaAtual;

  useEffect(() => {
    if (paradaAtual?.id && submittingStopId && paradaAtual.id !== submittingStopId) {
      setSubmittingStopId(null);
    }
  }, [paradaAtual?.id, submittingStopId]);

  const isActionDisabled = isLoading || isStepping || isFinalizing || (!!submittingStopId && submittingStopId === activeParadaToRender?.id);

  const todasParadas = [
    ...(paradasConcluidas || []),
    ...(activeParadaToRender ? [activeParadaToRender] : []),
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
    if (!escolaId) return { desces: [], subes: [] };

    const desces = todasParadasList.filter((node, i) => {
      if (node.tipo_no !== RouteNodeType.PASSAGEIRO) return false;
      const passEscolaId = node.passageiro?.escola_id || node.passageiro?.escola?.id || node.escola_id;
      if (passEscolaId !== escolaId) return false;
      if (node.sentido !== RouteSentido.INDO) return false;
      if (i >= escolaNodeIndex) return false;
      return true;
    });

    const subes = todasParadasList.filter((node, i) => {
      if (node.tipo_no !== RouteNodeType.PASSAGEIRO) return false;
      const passEscolaId = node.passageiro?.escola_id || node.passageiro?.escola?.id || node.escola_id;
      if (passEscolaId !== escolaId) return false;
      if (node.sentido !== RouteSentido.VOLTANDO) return false;

      let ultimaEscolaAntesDeP = -1;
      for (let idx = i - 1; idx >= 0; idx--) {
        if (todasParadasList[idx].tipo_no === RouteNodeType.ESCOLA) {
          ultimaEscolaAntesDeP = idx;
          break;
        }
      }

      if (node.status === RouteStopStatus.PENDENTE && i > escolaNodeIndex) {
        let temEscolaDestaEntrem = false;
        for (let idx = escolaNodeIndex + 1; idx < i; idx++) {
          const n = todasParadasList[idx];
          if (n.tipo_no === RouteNodeType.ESCOLA && (n.escola_id === escolaId || n.escola?.id === escolaId)) {
            temEscolaDestaEntrem = true;
            break;
          }
        }
        if (!temEscolaDestaEntrem) return true;
      }

      for (let idx = i - 1; idx >= 0; idx--) {
        const node = todasParadasList[idx];
        if (node.tipo_no === RouteNodeType.ESCOLA && (node.escola_id === escolaId || node.escola?.id === escolaId)) {
          ultimaEscolaAntesDeP = idx;
          break;
        }
      }

      return ultimaEscolaAntesDeP === escolaNodeIndex;
    });

    return { desces, subes };
  };

  const { desces: alunosParaDesembarcar, subes: alunosParaEmbarcar } = useMemo(() => {
    const paradaAtualIndexInTodas = activeParadaToRender ? (paradasConcluidas?.length || 0) : -1;
    if (activeParadaToRender?.tipo_no === RouteNodeType.ESCOLA && !isPreview && paradaAtualIndexInTodas >= 0) {
      return getAlunosEscolaPorPosicao(todasParadas, paradaAtualIndexInTodas);
    }
    return { desces: [], subes: [] };
  }, [activeParadaToRender, isPreview, paradasConcluidas?.length, todasParadas]);

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
    if (submittingStopId) return;
    const isLastStop = proximasParadas.length === 0;

    openConfirmationDialog({
      title: "Confirmar Ausência?",
      description: `Tem certeza que deseja marcar ${formatFirstName(nome)} como ausente hoje nesta corrida?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        setSubmittingStopId(paradaId);
        if (isLastStop) {
          setIsFinishingLastStop(true);
        }
        try {
          await handleStep(paradaId, RouteStopStatus.AUSENTE);
          setSelectedRespTab(TAB_DEFAULT);
          if (isLastStop && handleFinalizarRota) {
            await handleFinalizarRota(() => {
              setIsFinishingLastStop(false);
              onShowSuccess?.();
            });
          }
        } finally {
          setSubmittingStopId(null);
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  };

  const handleConfirmAction = async (paradaId: string) => {
    if (submittingStopId) return;
    const isLastStop = proximasParadas.length === 0;

    setSubmittingStopId(paradaId);
    if (isLastStop) {
      setIsFinishingLastStop(true);
    }
    try {
      await handleStep(paradaId, RouteStopStatus.EMBARCADO);
      setSelectedRespTab(TAB_DEFAULT);
      if (isLastStop && handleFinalizarRota) {
        await handleFinalizarRota(() => {
          setIsFinishingLastStop(false);
          onShowSuccess?.();
        });
      }
    } finally {
      setSubmittingStopId(null);
    }
  };

  const handleConfirmChamadaEscola = async (chamada: ChamadaEscolaItem[]) => {
    if (!execucao?.id) return;

    const apenasAusentes = chamada.filter((item) => item.status === RouteStopStatus.AUSENTE);

    if (apenasAusentes.length === 0) {
      setIsChamadaDialogOpen(false);
      toast.success("Chamada concluída!", {
        description: "Todos os alunos estão presentes.",
      });
      return;
    }

    try {
      await chamadaEscolaMutation.mutateAsync({
        execucaoId: execucao.id,
        escolaParadaId: activeParadaToRender?.id || paradaAtual?.id,
        chamada: apenasAusentes,
      });

      setIsChamadaDialogOpen(false);
      toast.success("Chamada concluída com sucesso!");
    } catch (err) {
      // Erro notificado via onError da mutation
    }
  };

  let activeRespName = "";
  let activeRespPhone = "";
  let activeRespParentesco = "";
  let activeAddressStr = "";

  const targetParadaForContext = activeParadaToRender || paradaAtual;

  if (targetParadaForContext && targetParadaForContext.tipo_no === RouteNodeType.PASSAGEIRO && targetParadaForContext.passageiro) {
    const pass = targetParadaForContext.passageiro;
    const responsaveisAdicionais = pass.responsaveis || [];

    const activeRespId = selectedRespTab === TAB_DEFAULT
      ? TAB_PRINCIPAL
      : selectedRespTab;

    if (activeRespId === TAB_PRINCIPAL) {
      activeRespName = pass.responsavel_principal?.nome || "Responsável";
      activeRespPhone = pass.responsavel_principal?.telefone || "";
      activeRespParentesco = pass.responsavel_principal?.parentesco;
      activeAddressStr = formatarEnderecoParcialRota(pass.responsavel_principal || pass);
    } else {
      const respObj = responsaveisAdicionais.find((r: any) => r.id === activeRespId);
      if (respObj) {
        activeRespName = respObj.nome;
        activeRespPhone = respObj.telefone;
        activeRespParentesco = respObj.parentesco;
        activeAddressStr = respObj.logradouro ? formatarEnderecoParcialRota(respObj) : (formatarEnderecoParcialRota(pass.responsavel_principal || pass) || "Endereço não cadastrado.");
      } else {
        activeRespName = pass.responsavel_principal?.nome;
        activeRespPhone = pass.responsavel_principal?.telefone;
        activeRespParentesco = pass.responsavel_principal?.parentesco;
        activeAddressStr = formatarEnderecoParcialRota(pass.responsavel_principal || pass);
      }
    }
  } else if (targetParadaForContext && targetParadaForContext.tipo_no === RouteNodeType.ESCOLA && targetParadaForContext.escola) {
    const esc = targetParadaForContext.escola;
    activeRespName = "Desembarque na Escola";
    activeAddressStr = formatarEnderecoParcialRota(esc) || "Endereço da escola";
  }

  const displayProximasParadas = [...proximasParadas];

  const [reorderingTarget, setReorderingTarget] = useState<{ index: number; direction: "up" | "down" } | null>(null);
  const [isReorderingViaSheetStopId, setIsReorderingViaSheetStopId] = useState<string | null>(null);

  const isAnyActionBusy =
    isLoading ||
    isActionDisabled ||
    desfazendoStopId !== null ||
    submittingStopId !== null ||
    isFinishingLastStop ||
    reorderingTarget !== null ||
    isReorderingViaSheetStopId !== null;

  const handleMoveParada = async (index: number, direction: "up" | "down") => {
    const totalPendentesReal = activeParadaToRender ? [activeParadaToRender, ...proximasParadas] : [...proximasParadas];

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= totalPendentesReal.length) return;

    if (!validarMovimentoPermitido(execucao.tipo, index, direction, totalPendentesReal, paradasConcluidas)) {
      const simulado = [...totalPendentesReal];
      const temp = simulado[index];
      simulado[index] = simulado[targetIndex];
      simulado[targetIndex] = temp;
      const fullItinerario = [...paradasConcluidas, ...simulado];
      const check = validarItinerarioPronto(execucao.tipo, fullItinerario);
      toast.error(check.errorMsg || "Movimento não permitido para este itinerário.");
      return;
    }

    const newPendentes = [...totalPendentesReal];
    const temp = newPendentes[index];
    newPendentes[index] = newPendentes[targetIndex];
    newPendentes[targetIndex] = temp;

    const allStops = [
      ...paradasConcluidas,
      ...newPendentes
    ];

    const novaOrdem = allStops.map((parada, idx) => ({
      id: parada.id,
      ordem: idx + 1
    }));

    try {
      setReorderingTarget({ index, direction });
      await handleReordenar(novaOrdem);
    } catch (err) {
      toast.error("Erro ao reordenar trajeto.");
    } finally {
      setReorderingTarget(null);
    }
  };

  const handleConfirmReordenacaoSheet = async (novasPendentes: ExecucaoParada[]) => {
    const targetStopId = reordenarSheetTarget?.id || null;
    if (targetStopId) {
      setIsReorderingViaSheetStopId(targetStopId);
    }
    const allStops = [
      ...paradasConcluidas,
      ...novasPendentes
    ];

    const novaOrdem = allStops.map((parada, idx) => ({
      id: parada.id,
      ordem: idx + 1
    }));

    try {
      await handleReordenar(novaOrdem);
    } catch (err) {
      toast.error("Erro ao reordenar trajeto.");
    } finally {
      setIsReorderingViaSheetStopId(null);
    }
  };

  const displayParadasConcluidas = useMemo(() => {
    const activeStopId = activeParadaToRender?.id || paradaAtual?.id;
    const rawConcluidas = paradasConcluidas.filter(p => p.id !== activeStopId);
    return [...rawConcluidas].sort((a, b) => a.ordem - b.ordem);
  }, [activeParadaToRender?.id, paradaAtual?.id, paradasConcluidas]);

  const totalTimelineItems = displayParadasConcluidas.length + (activeParadaToRender ? 1 : 0) + displayProximasParadas.length;

  return (
    <div className="space-y-4">
      <ActiveRouteHeader
        execucao={execucao}
        todasParadasCount={todasParadas.length}
        totalStops={totalStops}
        concludedStops={concludedStops}
        progressPercentage={progressPercentage}
        isPreview={isPreview}
        isVehicleOccupied={isVehicleOccupied}
        occupiedRouteName={occupiedRouteName}
        iniciarMutation={iniciarMutation}
        isLoading={isLoading}
        can={can}
        isAnyActionBusy={isAnyActionBusy}
        onOpenAusenciaDialog={() => setIsAusenciaDialogOpen(true)}
        onCancel={onCancel}
        onEditRoute={() => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EDIT.replace(":id", execucao.rota_id))}
        onIniciarRota={() => {
          if (!isVehicleOccupied && iniciarMutation && execucao?.rota_id) {
            setIsConfirmStartDialogOpen(true);
          }
        }}
      />

      {/* TIMELINE DE PARADAS */}
      {totalTimelineItems > 0 && (
        <div className="relative flex flex-col gap-6 pl-10 pb-1 text-left w-full max-w-full">
          {displayParadasConcluidas.map((parada, index) => {
            const absIndex = index;
            const showTopLine = absIndex > 0;
            const showBottomLine = absIndex < totalTimelineItems - 1;

            return (
              <RouteCompletedStopItem
                key={parada.id}
                parada={parada}
                showTopLine={showTopLine}
                showBottomLine={showBottomLine}
                onDesfazer={() => handleDesfazerAusencia(parada)}
                isDesfazendo={desfazendoStopId === parada.id}
                disabled={isAnyActionBusy}
              />
            );
          })}

          {activeParadaToRender && (() => {
            const absIndex = displayParadasConcluidas.length;
            const showTopLine = absIndex > 0;
            const showBottomLine = absIndex < totalTimelineItems - 1;
            const isLastStop = proximasParadas.length === 0;
            const totalPendentesReal = [activeParadaToRender, ...proximasParadas];

            return (
              <ActiveRouteCurrentCard
                key={activeParadaToRender.id}
                parada={activeParadaToRender}
                activeCardRef={activeCardRef}
                showTopLine={showTopLine}
                showBottomLine={showBottomLine}
                isLastStop={isLastStop}
                selectedRespTab={selectedRespTab}
                setSelectedRespTab={setSelectedRespTab}
                execucaoTipo={execucao.tipo}
                totalPendentesReal={totalPendentesReal}
                isAnyActionBusy={isAnyActionBusy}
                reorderingTarget={reorderingTarget}
                reorderingSheetStopId={isReorderingViaSheetStopId}
                validarMovimentoPermitido={validarMovimentoPermitido}
                paradasConcluidas={paradasConcluidas}
                proximasParadas={proximasParadas}
                alunosParaEmbarcar={alunosParaEmbarcar}
                alunosParaDesembarcar={alunosParaDesembarcar}
                isLoading={isLoading}
                isStepping={isStepping}
                isFinalizing={isFinalizing}
                onOpenAddressDialog={(data) => {
                  setSelectedDialogRespTab(TAB_PRINCIPAL);
                  setAddressDialogData(data);
                }}
                onMoveParada={handleMoveParada}
                onConfirmFalta={handleConfirmFalta}
                onConfirmEmbarqueDialog={() => handleConfirmAction(activeParadaToRender.id)}
                onDirectStep={() => handleConfirmAction(activeParadaToRender.id)}
                onOpenChamadaDialog={() => setIsChamadaDialogOpen(true)}
                onOpenReordenarSheet={(p) => setReordenarSheetTarget(p)}
              />
            );
          })()}

          {displayProximasParadas.map((parada, index) => {
            const absIndex = displayParadasConcluidas.length + (activeParadaToRender ? 1 : 0) + index;
            const showTopLine = absIndex > 0;
            const showBottomLine = absIndex < totalTimelineItems - 1;

            return (
              <ActiveRouteUpcomingCard
                key={parada.id}
                parada={parada}
                index={index}
                showTopLine={showTopLine}
                showBottomLine={showBottomLine}
                isPreview={isPreview}
                selectedPreviewTabs={selectedPreviewTabs}
                todasParadas={todasParadas}
                activeParadaToRender={activeParadaToRender}
                proximasParadas={proximasParadas}
                execucaoTipo={execucao.tipo}
                isAnyActionBusy={isAnyActionBusy}
                reorderingTarget={reorderingTarget}
                reorderingSheetStopId={isReorderingViaSheetStopId}
                validarMovimentoPermitido={validarMovimentoPermitido}
                paradasConcluidas={paradasConcluidas}
                isLoading={isLoading}
                onOpenAddressDialog={(data) => {
                  setSelectedDialogRespTab(TAB_PRINCIPAL);
                  setAddressDialogData(data);
                }}
                onMoveParada={handleMoveParada}
                onConfirmFalta={handleConfirmFalta}
                getAlunosEscolaPorPosicao={getAlunosEscolaPorPosicao}
                onOpenReordenarSheet={(p) => setReordenarSheetTarget(p)}
              />
            );
          })}
        </div>
      )}

      <ChamadaEscolaDialog
        open={isChamadaDialogOpen}
        onOpenChange={setIsChamadaDialogOpen}
        escolaNome={activeParadaToRender?.escola?.nome}
        alunos={alunosParaEmbarcar}
        isSubmitting={chamadaEscolaMutation.isPending}
        onConfirmChamada={handleConfirmChamadaEscola}
      />

      <RegistrarAusenciaDialog
        isOpen={isAusenciaDialogOpen}
        onClose={() => setIsAusenciaDialogOpen(false)}
        lockedRotaId={execucao?.rota_id}
      />

      <AddressDetailsDialog
        addressDialogData={addressDialogData}
        onClose={() => setAddressDialogData(prev => ({ ...prev, open: false }))}
        selectedDialogRespTab={selectedDialogRespTab}
        setSelectedDialogRespTab={setSelectedDialogRespTab}
      />

      <ReordenarParadaSheet
        isOpen={reordenarSheetTarget !== null}
        onClose={() => setReordenarSheetTarget(null)}
        paradaTarget={reordenarSheetTarget}
        totalPendentes={activeParadaToRender ? [activeParadaToRender, ...proximasParadas] : [...proximasParadas]}
        paradasConcluidas={paradasConcluidas}
        isConfigMode={false}
        execucaoTipo={execucao.tipo}
        validarMovimentoPermitido={validarMovimentoPermitido}
        onConfirmReordenação={handleConfirmReordenacaoSheet}
      />

      <ConfirmStartRouteDialog
        isOpen={isConfirmStartDialogOpen}
        onClose={() => setIsConfirmStartDialogOpen(false)}
        routeName={execucao?.rota?.nome || "Rota"}
        isLoading={iniciarMutation?.isPending}
        onConfirm={(notificarPais) => {
          if (execucao?.rota_id && iniciarMutation) {
            iniciarMutation.mutate(
              { id: execucao.rota_id, notificar_pais: notificarPais },
              {
                onSuccess: (data: any) => {
                  setIsConfirmStartDialogOpen(false);
                  navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", data.id), { replace: true });
                }
              }
            );
          }
        }}
      />
    </div>
  );
}
