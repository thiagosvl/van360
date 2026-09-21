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
import { AddressDetailsDialog } from "./AddressDetailsDialog";
import { ActiveRouteCurrentCard } from "./ActiveRouteCurrentCard";
import { ActiveRouteUpcomingCard } from "./ActiveRouteUpcomingCard";
import { ReordenarParadaSheet } from "./ReordenarParadaSheet";
import { ChamadaEscolaDialog } from "@/components/dialogs/ChamadaEscolaDialog";
import ConfirmStartRouteDialog from "@/components/dialogs/ConfirmStartRouteDialog";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";
import { useProcessarChamadaEscola } from "@/hooks/api/useRouteMutations";
import { formatarEnderecoParcialRota } from "@/utils/formatters/address";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ChamadaRapidaDialog, EscolaChamadaItem } from "@/components/dialogs/ChamadaRapidaDialog";
import { obterChamadaRapida, salvarChamadaRapida, limparChamadasRapidasObsoletas } from "@/utils/domain/route/routeStorage.utils";

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
  const { validarMovimentoPermitido, validarItinerarioPronto, getAlunosEscolaPorPosicao } = useRouteRules();
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
  const [isChamadaRapidaOpen, setIsChamadaRapidaOpen] = useState(false);
  const [chamadaRapidaSavedMap, setChamadaRapidaSavedMap] = useState<Record<string, RouteStopStatus> | null>(null);
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

  const handleDesfazerParada = (parada: any) => {
    const isAusente = parada.status === RouteStopStatus.AUSENTE || parada.is_ausente;
    const isEscola = parada.tipo_no === RouteNodeType.ESCOLA;
    const nomeItem = isEscola ? (parada.escola?.nome || "Escola") : formatShortName(parada.passageiro?.nome || parada.nome);

    const dialogTitle = isAusente
      ? "Desfazer Ausência?"
      : isEscola
        ? "Desfazer Parada na Escola?"
        : "Desfazer Confirmação?";

    const dialogDescription = isAusente
      ? `Tem certeza que deseja desfazer a ausência de ${nomeItem} e retorná-lo para a rota?`
      : isEscola
        ? `Tem certeza que deseja desfazer a confirmação da parada em ${nomeItem} e retorná-la para a rota?`
        : `Tem certeza que deseja desfazer a confirmação de ${nomeItem} e retorná-lo para a rota?`;

    openConfirmationDialog({
      title: dialogTitle,
      description: dialogDescription,
      confirmText: "Desfazer",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        setDesfazendoStopId(parada.id);

        try {
          const pid = parada.passageiro_id || parada.passageiro?.id;
          const rid = execucao?.rota_id || parada.rota_id;

          if (isAusente && isPreview) {
            await removerAusenciaMutation.mutateAsync({
              id: parada.ausencia_id || DELETE_AUSENCIA_BY_QUERY_PARAM,
              passageiro_id: pid,
              rota_id: rid,
            });

            if (rid && pid && chamadaRapidaSavedMap && chamadaRapidaSavedMap[pid]) {
              const updated = {
                ...chamadaRapidaSavedMap,
                [pid]: RouteStopStatus.EMBARCADO,
              };
              salvarChamadaRapida(rid, updated);
              setChamadaRapidaSavedMap(updated);
            }

            toast.success("Registro de Ausência desfeito!", { description: "Aluno retornado ao itinerário." });
          } else if (execucao?.id) {
            await handleStep(parada.id, RouteStopStatus.PENDENTE);
            toast.success(isAusente ? "Registro de Ausência desfeito!" : "Confirmação desfeita!", {
              description: "Parada retornada ao trajeto.",
            });
          }

          safeCloseDialog(closeConfirmationDialog);
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Erro ao desfazer ação.";
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

  const todasParadas = useMemo(() => {
    const list = [
      ...(paradasConcluidas || []),
      ...(activeParadaToRender ? [activeParadaToRender] : []),
      ...(proximasParadas || [])
    ];
    if (isPreview) {
      return [...list].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    }
    return list;
  }, [paradasConcluidas, activeParadaToRender, proximasParadas, isPreview]);

  const { desces: alunosParaDesembarcar, subes: alunosParaEmbarcar } = useMemo(() => {
    const paradaAtualIndexInTodas = activeParadaToRender ? todasParadas.findIndex((p) => p.id === activeParadaToRender.id) : -1;
    if (activeParadaToRender?.tipo_no === RouteNodeType.ESCOLA && !isPreview && paradaAtualIndexInTodas >= 0) {
      return getAlunosEscolaPorPosicao(todasParadas, paradaAtualIndexInTodas);
    }
    return { desces: [], subes: [] };
  }, [activeParadaToRender, isPreview, todasParadas]);

  useEffect(() => {
    if (isPreview && execucao?.rota_id) {
      limparChamadasRapidasObsoletas();
      const saved = obterChamadaRapida(execucao.rota_id);
      setChamadaRapidaSavedMap(saved ? saved.statusAlunos : null);
    }
  }, [isPreview, execucao?.rota_id]);

  const escolasComAlunosVolta = useMemo<EscolaChamadaItem[]>(() => {
    if (!isPreview) return [];

    const passageirosAusentesSet = new Set<string>();
    todasParadas.forEach((p) => {
      if (p.status === RouteStopStatus.AUSENTE || p.is_ausente || p.ausencia_id) {
        const pid = p.passageiro_id || p.passageiro?.id;
        if (pid) passageirosAusentesSet.add(pid);
      }
    });

    const escolasMap = new Map<string, EscolaChamadaItem>();

    todasParadas.forEach((parada, index) => {
      if (parada.tipo_no !== RouteNodeType.ESCOLA) return;
      const escolaId = parada.escola_id || parada.escola?.id;
      if (!escolaId) return;

      const { subes } = getAlunosEscolaPorPosicao(todasParadas, index);
      if (!subes || subes.length === 0) return;

      if (!escolasMap.has(escolaId)) {
        escolasMap.set(escolaId, {
          escolaId,
          escolaNome: parada.escola?.nome || "Escola",
          alunos: [],
        });
      }

      const escolaEntry = escolasMap.get(escolaId)!;
      subes.forEach((node) => {
        const passageiroId = node.passageiro_id || node.passageiro?.id || node.id;
        const jaExiste = escolaEntry.alunos.some((a) => a.passageiroId === passageiroId);
        if (!jaExiste) {
          const temAusenciaRegistrada = passageirosAusentesSet.has(passageiroId) ||
            node.status === RouteStopStatus.AUSENTE || !!node.is_ausente || !!node.ausencia_id;

          escolaEntry.alunos.push({
            id: node.id,
            passageiroId,
            nome: node.passageiro?.nome || node.nome || "Aluno",
            turma: node.passageiro?.turma || null,
            temAusenciaRegistrada,
          });
        }
      });
    });

    return Array.from(escolasMap.values()).filter((e) => e.alunos.length > 0);
  }, [isPreview, todasParadas, getAlunosEscolaPorPosicao]);

  const chamadaRealizada = chamadaRapidaSavedMap !== null;

  const resumoChamada = useMemo(() => {
    if (!chamadaRapidaSavedMap || escolasComAlunosVolta.length === 0) return null;
    let presentes = 0;
    let total = 0;

    escolasComAlunosVolta.forEach((escola) => {
      escola.alunos.forEach((aluno) => {
        total += 1;
        const status = chamadaRapidaSavedMap[aluno.passageiroId];
        if (status !== RouteStopStatus.AUSENTE) {
          presentes += 1;
        }
      });
    });

    return { presentes, total };
  }, [chamadaRapidaSavedMap, escolasComAlunosVolta]);

  const handleOpenChamadaRapida = () => {
    limparChamadasRapidasObsoletas();
    if (execucao?.rota_id) {
      const saved = obterChamadaRapida(execucao.rota_id);
      setChamadaRapidaSavedMap(saved ? saved.statusAlunos : null);
    }
    setIsChamadaRapidaOpen(true);
  };

  const handleSalvarChamadaRapida = (statusMap: Record<string, RouteStopStatus>) => {
    if (!execucao?.rota_id) return;
    salvarChamadaRapida(execucao.rota_id, statusMap);
    setChamadaRapidaSavedMap(statusMap);
    setIsChamadaRapidaOpen(false);
    toast.success("Chamada rápida salva com sucesso!");
  };

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
    return [...rawConcluidas].sort((a, b) => {
      if (a.visitado_em && b.visitado_em) {
        const timeA = new Date(a.visitado_em).getTime();
        const timeB = new Date(b.visitado_em).getTime();
        if (timeA !== timeB) return timeA - timeB;
      }
      if (a.visitado_em && !b.visitado_em) return -1;
      if (!a.visitado_em && b.visitado_em) return 1;
      return a.ordem - b.ordem;
    });
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
        temAlunosVolta={escolasComAlunosVolta.length > 0}
        chamadaRealizada={chamadaRealizada}
        resumoChamada={resumoChamada}
        onOpenAusenciaDialog={() => setIsAusenciaDialogOpen(true)}
        onOpenChamadaRapida={handleOpenChamadaRapida}
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
                onDesfazer={() => handleDesfazerParada(parada)}
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
                chamadaRapidaSavedMap={chamadaRapidaSavedMap}
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

      {isPreview && escolasComAlunosVolta.length > 0 && (
        <ChamadaRapidaDialog
          open={isChamadaRapidaOpen}
          onOpenChange={setIsChamadaRapidaOpen}
          escolas={escolasComAlunosVolta}
          initialStatusMap={chamadaRapidaSavedMap || undefined}
          onSalvar={handleSalvarChamadaRapida}
        />
      )}
    </div>
  );
}
