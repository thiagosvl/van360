import { useState, useMemo } from "react";
import { RouteCompletedStopItem } from "./RouteCompletedStopItem";
import { ActiveRouteUpcomingCard } from "./ActiveRouteUpcomingCard";
import { ReordenarParadaSheet } from "./ReordenarParadaSheet";
import { ChamadaEscolaDialog } from "@/components/dialogs/ChamadaEscolaDialog";
import { AddressDetailsDialog, AddressDialogData } from "./AddressDetailsDialog";
import { RouteExecution, RouteExecutionPassenger, RouteNodeType, RouteStopStatus, ChamadaEscolaItem, RouteSentido } from "@/types/route";
import { useRouteRules } from "@/hooks/business/useRouteRules";
import { routeStorage } from "@/utils/storage/routeStorage";
import { useRemoverAusenciaMutation } from "@/hooks/api/useRoutes";
import { useProcessarChamadaEscola, useRegistrarAusenciaMutation } from "@/hooks/api/useRouteMutations";
import { useLayout } from "@/contexts/LayoutContext";
import { formatFirstName, formatShortName } from "@/utils/formatters/name";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { toast } from "@/utils/notifications/toast";
import { Users, AlertCircle } from "lucide-react";

const TAB_PRINCIPAL = "principal";

interface ActiveRouteSimpleListViewProps {
  execucao: RouteExecution;
  paradas: RouteExecutionPassenger[];
  isLoading: boolean;
  onRefresh?: () => void;
  onOpenChamadaDialog?: () => void;
}

export function ActiveRouteSimpleListView({
  execucao,
  paradas,
  isLoading,
  onRefresh
}: ActiveRouteSimpleListViewProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { validarMovimentoPermitido, validarItinerarioPronto } = useRouteRules();
  const removerAusenciaMutation = useRemoverAusenciaMutation();
  const registrarAusenciaMutation = useRegistrarAusenciaMutation();
  const chamadaEscolaMutation = useProcessarChamadaEscola();

  const [desfazendoStopId, setDesfazendoStopId] = useState<string | null>(null);
  const [submittingStopId, setSubmittingStopId] = useState<string | null>(null);
  const [reordenarSheetTarget, setReordenarSheetTarget] = useState<RouteExecutionPassenger | null>(null);
  const [isChamadaDialogOpen, setIsChamadaDialogOpen] = useState(false);
  const [selectedPreviewTabs, setSelectedPreviewTabs] = useState<Record<string, string>>({});
  const [selectedDialogRespTab, setSelectedDialogRespTab] = useState<string>(TAB_PRINCIPAL);
  const [localCustomOrder, setLocalCustomOrder] = useState<string[] | null>(() => {
    return routeStorage.getExecutionCustomOrder(execucao?.id);
  });

  const [addressDialogData, setAddressDialogData] = useState<AddressDialogData>({
    open: false,
    title: "",
    address: "",
  });

  const ausencias = useMemo(() => {
    return paradas.filter(p => p.is_ausente || p.status === RouteStopStatus.AUSENTE);
  }, [paradas]);

  const paradasAtivas = useMemo(() => {
    const pendentes = paradas.filter(p => !p.is_ausente && p.status !== RouteStopStatus.AUSENTE);

    if (localCustomOrder && localCustomOrder.length > 0) {
      const orderMap = new Map<string, number>();
      localCustomOrder.forEach((id, idx) => orderMap.set(id, idx));

      return [...pendentes].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        return orderA - orderB;
      });
    }

    return pendentes;
  }, [paradas, localCustomOrder]);

  const handleDesfazerAusencia = (parada: RouteExecutionPassenger) => {
    const nomeItem = parada.tipo_no === RouteNodeType.ESCOLA 
      ? (parada.escola?.nome || "Escola") 
      : formatShortName(parada.passageiro?.nome || parada.nome);

    openConfirmationDialog({
      title: "Desfazer Ausência?",
      description: `Tem certeza que deseja retornar ${nomeItem} para a rota de hoje?`,
      confirmText: "Desfazer",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        setDesfazendoStopId(parada.id);
        try {
          const pid = parada.passageiro_id || parada.passageiro?.id;
          const rid = execucao?.rota_id;

          if (pid && rid) {
            await removerAusenciaMutation.mutateAsync({
              id: parada.ausencia_id || DELETE_AUSENCIA_BY_QUERY_PARAM,
              passageiro_id: pid,
              rota_id: rid
            });
            onRefresh?.();
          }
        } finally {
          setDesfazendoStopId(null);
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  };

  const handleConfirmFalta = (paradaId: string, nome: string) => {
    const paradaObj = paradas.find(p => p.id === paradaId);
    if (!paradaObj || submittingStopId) return;

    openConfirmationDialog({
      title: "Confirmar Ausência?",
      description: `Tem certeza que deseja marcar ${formatFirstName(nome)} como ausente hoje nesta corrida?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        setSubmittingStopId(paradaId);
        try {
          const pid = paradaObj.passageiro_id || paradaObj.passageiro?.id;
          const rid = execucao?.rota_id;

          if (pid && rid) {
            await registrarAusenciaMutation.mutateAsync({
              passageiro_id: pid,
              rota_id: rid,
              data_ausencia: new Date().toISOString().split("T")[0]
            });
            onRefresh?.();
          }
        } finally {
          setSubmittingStopId(null);
          safeCloseDialog(closeConfirmationDialog);
        }
      }
    });
  };

  const handleConfirmReordenacaoSheet = (novaOrdem: Array<{ id: string; ordem: number }>) => {
    const sortedIds = [...novaOrdem].sort((a, b) => a.ordem - b.ordem).map(item => item.id);
    routeStorage.setExecutionCustomOrder(execucao.id, sortedIds);
    setLocalCustomOrder(sortedIds);
    setReordenarSheetTarget(null);
    toast.success("Ordem da lista atualizada para esta corrida!");
  };

  const handleMoveParada = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= paradasAtivas.length) return;

    const newOrder = [...paradasAtivas];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    const ids = newOrder.map(p => p.id);
    routeStorage.setExecutionCustomOrder(execucao.id, ids);
    setLocalCustomOrder(ids);
  };

  const [chamadaEscolaTarget, setChamadaEscolaTarget] = useState<{ escolaParada: RouteExecutionPassenger; alunos: any[] } | null>(null);

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
        const n = todasParadasList[idx];
        if (n.tipo_no === RouteNodeType.ESCOLA && (n.escola_id === escolaId || n.escola?.id === escolaId)) {
          ultimaEscolaAntesDeP = idx;
          break;
        }
      }

      return ultimaEscolaAntesDeP === escolaNodeIndex;
    });

    return { desces, subes };
  };

  const handleConfirmChamadaEscola = async (chamada: ChamadaEscolaItem[]) => {
    if (!execucao?.id || !chamadaEscolaTarget) return;

    const apenasAusentes = chamada.filter((item) => item.status === RouteStopStatus.AUSENTE);

    if (apenasAusentes.length === 0) {
      setChamadaEscolaTarget(null);
      toast.success("Chamada concluída!", {
        description: "Todos os alunos estão presentes.",
      });
      return;
    }

    try {
      await chamadaEscolaMutation.mutateAsync({
        execucaoId: execucao.id,
        escolaParadaId: chamadaEscolaTarget.escolaParada.id,
        chamada: apenasAusentes,
      });

      setChamadaEscolaTarget(null);
      onRefresh?.();
      toast.success("Chamada concluída com sucesso!");
    } catch (err) {
    }
  };

  const isAnyActionBusy = isLoading || desfazendoStopId !== null || submittingStopId !== null;
  const totalTimelineItems = ausencias.length + paradasAtivas.length;

  return (
    <div className="space-y-4">
      {totalTimelineItems === 0 && (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Nenhum passageiro nesta rota</p>
          <p className="text-xs text-slate-500">Configure alunos e paradas no cadastro da rota.</p>
        </div>
      )}

      {totalTimelineItems > 0 && (
        <div className="relative flex flex-col gap-6 pl-10 pb-1 text-left w-full max-w-full">
          {ausencias.map((parada, index) => {
            const showTopLine = index > 0;
            const showBottomLine = index < totalTimelineItems - 1;

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

          {paradasAtivas.map((parada, index) => {
            const absIndex = ausencias.length + index;
            const showTopLine = absIndex > 0;
            const showBottomLine = absIndex < totalTimelineItems - 1;

            return (
              <ActiveRouteUpcomingCard
                key={parada.id}
                parada={{ ...parada, ordem: index + 1 }}
                index={index}
                showTopLine={showTopLine}
                showBottomLine={showBottomLine}
                isPreview={false}
                selectedPreviewTabs={selectedPreviewTabs}
                todasParadas={paradasAtivas}
                proximasParadas={paradasAtivas.slice(index + 1)}
                execucaoTipo={execucao.tipo || ""}
                isAnyActionBusy={isAnyActionBusy}
                reorderingTarget={null}
                validarMovimentoPermitido={validarMovimentoPermitido}
                paradasConcluidas={ausencias}
                isLoading={isLoading}
                onOpenAddressDialog={(data) => {
                  setSelectedDialogRespTab(TAB_PRINCIPAL);
                  setAddressDialogData(data);
                }}
                onMoveParada={handleMoveParada}
                onConfirmFalta={handleConfirmFalta}
                getAlunosEscolaPorPosicao={getAlunosEscolaPorPosicao}
                onOpenReordenarSheet={(p) => setReordenarSheetTarget(p)}
                onOpenChamadaEscola={(escolaParada, alunos) => {
                  setChamadaEscolaTarget({ escolaParada, alunos });
                }}
              />
            );
          })}
        </div>
      )}

      <ChamadaEscolaDialog
        open={chamadaEscolaTarget !== null}
        onOpenChange={(open) => !open && setChamadaEscolaTarget(null)}
        escolaNome={chamadaEscolaTarget?.escolaParada?.escola?.nome}
        alunos={chamadaEscolaTarget?.alunos || []}
        isSubmitting={chamadaEscolaMutation.isPending}
        onConfirmChamada={handleConfirmChamadaEscola}
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
        totalPendentes={paradasAtivas}
        paradasConcluidas={ausencias}
        isConfigMode={false}
        execucaoTipo={execucao.tipo}
        validarMovimentoPermitido={validarMovimentoPermitido}
        onConfirmReordenação={handleConfirmReordenacaoSheet}
      />
    </div>
  );
}
