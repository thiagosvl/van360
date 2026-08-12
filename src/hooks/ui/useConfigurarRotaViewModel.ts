import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useRouteRules } from "@/hooks/business/useRouteRules";
import { useRouteDetail } from "@/hooks/api/useRoutes";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { useEscolas } from "@/hooks/api/useEscolas";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useCreateRoute, useUpdateRoute, useDeleteRoute } from "@/hooks/api/useRouteMutations";
import { useLayout } from "@/contexts/LayoutContext";
import { RouteNodeType, RouteSentido } from "@/types/route";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/utils/notifications/toast";

export interface ItineraryItem {
  id: string;
  tipo_no: RouteNodeType;
  passageiro_id?: string;
  escola_id?: string;
  nome: string;
  detalhe?: string;
  temEndereco: boolean;
  responsaveisAdicionais?: any[];
  escola?: any;
  passageiro?: any;
  sentido?: RouteSentido;
}

export function useConfigurarRotaViewModel() {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { user } = useSession();
  const { profile, donoContaId } = useProfile(user?.id);
  const usuarioId = donoContaId || user?.id || "";

  const [formData, setFormData] = useState({
    nome: "",
    veiculoId: "",
    escolaFixaId: "",
  });

  const { data: routeData, isLoading: isLoadingRoute } = useRouteDetail(isEditing && id ? id : "");

  const { data: passageirosData, isLoading: isLoadingPassageiros } = usePassageiros(
    { usuarioId },
    {
      enabled: !!usuarioId && (!isEditing || !isLoadingRoute),
    }
  );
  const passageirosList = passageirosData?.list || [];

  const { data: escolasData, isLoading: isLoadingEscolas } = useEscolas(
    { usuarioId },
    {
      enabled: !!usuarioId && (!isEditing || !isLoadingRoute),
    }
  );
  const escolasList = escolasData?.list || [];

  const { data: veiculosData, isLoading: isLoadingVeiculos } = useVeiculos(
    { usuarioId },
    {
      enabled: !!usuarioId && (!isEditing || !isLoadingRoute),
    }
  );
  const veiculosList = veiculosData?.list || [];

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  const { gerarErrosPorNo, validarItinerarioPronto, validarMovimentoPermitido } = useRouteRules();

  const [itinerario, setItinerario] = useState<ItineraryItem[]>([]);
  const [reordenarSheetTargetItem, setReordenarSheetTargetItem] = useState<ItineraryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInlinePassageiroId, setEditingInlinePassageiroId] = useState<string | null>(null);
  const [shouldAutoAddPassageiro, setShouldAutoAddPassageiro] = useState(false);
  const [insertTarget, setInsertTarget] = useState<"top" | "bottom" | number>("bottom");

  const listBottomRef = useRef<HTMLDivElement | null>(null);

  const triggerScrollToBottom = () => {
    setTimeout(() => {
      listBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 200);
  };

  const { isPronto: isRotaPronta, errorMsg: msgErroRota } = validarItinerarioPronto(null, itinerario);

  const temPassageiro = useMemo(() => itinerario.some((item) => item.tipo_no === RouteNodeType.PASSAGEIRO), [itinerario]);
  const temEscola = useMemo(() => itinerario.some((item) => item.tipo_no === RouteNodeType.ESCOLA), [itinerario]);
  const podeExibirErros = temPassageiro && temEscola;

  const errosPorNo = useMemo(() => {
    return gerarErrosPorNo(itinerario);
  }, [itinerario, gerarErrosPorNo]);

  const errosItinerario = useMemo(() => {
    const list: string[] = [];
    if (!podeExibirErros) return list;
    if (!isRotaPronta && msgErroRota) {
      list.push(msgErroRota);
    }
    return list;
  }, [podeExibirErros, isRotaPronta, msgErroRota]);

  const avisosItinerario = useMemo(() => {
    const list: string[] = [];
    if (itinerario.length > 0 && !temEscola) {
      list.push("Adicione ao menos 1 escola para concluir o itinerário.");
    }
    if (itinerario.length > 0 && !temPassageiro) {
      list.push("Adicione ao menos 1 passageiro para concluir o itinerário.");
    }
    return list;
  }, [itinerario, temEscola, temPassageiro]);

  const isFormValid = useMemo(() => {
    if (!formData.nome.trim()) return false;
    if (itinerario.length < 2) return false;
    if (!isRotaPronta) return false;
    if (Object.keys(errosPorNo).length > 0) return false;
    return true;
  }, [formData.nome, itinerario, isRotaPronta, errosPorNo]);

  // Preenchimento de estado via location.state (se originado da pré-configuração)
  useEffect(() => {
    if (!isEditing && location.state) {
      const state = location.state as { nome?: string; veiculoId?: string; escolaFixaId?: string };
      if (state.nome || state.veiculoId || state.escolaFixaId) {
        setFormData({
          nome: state.nome || "",
          veiculoId: state.veiculoId || "",
          escolaFixaId: state.escolaFixaId || "",
        });
      }
    }
  }, [isEditing, location.state]);

  // Preenchimento de estado ao editar rota existente
  useEffect(() => {
    if (isEditing && routeData) {
      setFormData({
        nome: routeData.nome || "",
        veiculoId: routeData.veiculo_id || "",
        escolaFixaId: routeData.escola_fixa_id || "",
      });

      const rawNos = routeData.paradas || [];
      if (rawNos.length > 0) {
        const sortedNos = [...rawNos].sort((a, b) => a.ordem - b.ordem);
        const mappedItems: ItineraryItem[] = sortedNos.map((no: any) => {
          const isEscola = no.tipo_no === RouteNodeType.ESCOLA;
          return {
            id: no.id || `no-${no.tipo_no}-${Date.now()}`,
            tipo_no: no.tipo_no as RouteNodeType,
            passageiro_id: no.passageiro_id,
            escola_id: no.escola_id,
            nome: isEscola ? no.escola?.nome || "Escola" : no.passageiro?.nome || "Passageiro",
            detalhe: isEscola ? "Parada em Escola" : no.passageiro?.escola?.nome ? `Escola: ${no.passageiro.escola.nome}` : undefined,
            temEndereco: true,
            responsaveisAdicionais: no.passageiro?.responsaveis || [],
            escola: no.escola,
            passageiro: no.passageiro,
            sentido: no.sentido as RouteSentido,
          };
        });
        setItinerario(mappedItems);
      }
    }
  }, [isEditing, routeData]);

  const getInitialSentido = (
    currentItinerario: ItineraryItem[],
    target: "top" | "bottom" | number,
    passageiroEscolaId?: string
  ): RouteSentido => {
    if (target === "top") return RouteSentido.INDO;
    const nodesAntes = typeof target === "number" ? currentItinerario.slice(0, target) : currentItinerario;
    if (passageiroEscolaId) {
      const temSuaEscolaAntes = nodesAntes.some((item) => {
        const itemEscolaId = item.escola_id || item.escola?.id;
        return item.tipo_no === RouteNodeType.ESCOLA && itemEscolaId === passageiroEscolaId;
      });
      return temSuaEscolaAntes ? RouteSentido.VOLTANDO : RouteSentido.INDO;
    }
    const temEscolaAntes = nodesAntes.some((item) => item.tipo_no === RouteNodeType.ESCOLA);
    return temEscolaAntes ? RouteSentido.VOLTANDO : RouteSentido.INDO;
  };

  const insertItemIntoItinerario = (prev: ItineraryItem[], newItem: ItineraryItem, target: "top" | "bottom" | number): ItineraryItem[] => {
    if (typeof target === "number") {
      const copy = [...prev];
      copy.splice(target, 0, newItem);
      return copy;
    } else if (target === "top") {
      return [newItem, ...prev];
    } else {
      return [...prev, newItem];
    }
  };

  const handleAddPassageiro = (passId: string) => {
    const pass = passageirosList.find((p) => p.id === passId);
    if (!pass) return;

    if (itinerario.some((item) => item.passageiro_id === passId)) {
      toast.warning("Este passageiro já está incluso nesta rota.");
      return;
    }

    if (!pass.logradouro || !pass.numero) {
      setEditingInlinePassageiroId(pass.id);
      setShouldAutoAddPassageiro(true);
      return;
    }

    const passEscolaId = pass.escola_id || pass.escola?.id;
    const sentidoInicial = getInitialSentido(itinerario, insertTarget, passEscolaId);

    const newItem: ItineraryItem = {
      id: `no-pass-${pass.id}-${Date.now()}`,
      tipo_no: RouteNodeType.PASSAGEIRO,
      passageiro_id: pass.id,
      nome: pass.nome,
      detalhe: pass.escola?.nome ? `Escola: ${pass.escola.nome}` : undefined,
      temEndereco: true,
      responsaveisAdicionais: (pass as any).responsaveis || [],
      passageiro: pass,
      sentido: sentidoInicial,
    };

    setItinerario((prev) => insertItemIntoItinerario(prev, newItem, insertTarget));
    setIsDialogOpen(false);
    triggerScrollToBottom();
  };

  const handleAddEscola = (escolaId: string) => {
    const esc = escolasList.find((e) => e.id === escolaId);
    if (!esc) return;

    const newItem: ItineraryItem = {
      id: `no-escola-${esc.id}-${Date.now()}`,
      tipo_no: RouteNodeType.ESCOLA,
      escola_id: esc.id,
      nome: esc.nome,
      escola: esc,
      detalhe: "Parada em Escola",
      temEndereco: true,
    };

    setItinerario((prev) => insertItemIntoItinerario(prev, newItem, insertTarget));
    setIsDialogOpen(false);
    triggerScrollToBottom();
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itinerario.length) return;

    const newItems = [...itinerario];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setItinerario(newItems);
  };

  const handleRemove = (index: number) => {
    setItinerario((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleSentido = (index: number) => {
    setItinerario((prev) => {
      const copy = [...prev];
      const current = copy[index];
      if (current.tipo_no === RouteNodeType.PASSAGEIRO) {
        copy[index] = {
          ...current,
          sentido: current.sentido === RouteSentido.VOLTANDO ? RouteSentido.INDO : RouteSentido.VOLTANDO,
        };
      }
      return copy;
    });
  };

  const openModalParadaGeral = () => {
    setInsertTarget("bottom");
    setIsDialogOpen(true);
  };

  const openModalParadaIntermediaria = (index: number) => {
    setInsertTarget(index + 1);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Preencha todos os campos obrigatórios e garanta que o itinerário está válido.");
      return;
    }

    const nodesPayload = itinerario.map((item, index) => ({
      tipo_no: item.tipo_no,
      passageiro_id: item.passageiro_id,
      escola_id: item.escola_id,
      ordem: index + 1,
      sentido: item.sentido || (item.tipo_no === RouteNodeType.PASSAGEIRO ? RouteSentido.INDO : undefined),
    }));

    const payload = {
      usuario_id: usuarioId,
      nome: formData.nome,
      veiculo_id: formData.veiculoId || undefined,
      paradas: nodesPayload,
    };

    try {
      let targetRouteId = id;
      if (isEditing && id) {
        await updateRouteMutation.mutateAsync({ id, data: payload });
      } else {
        const createdRoute = await createRouteMutation.mutateAsync(payload);
        targetRouteId = createdRoute?.id;
      }

      if (targetRouteId) {
        navigate(`${ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", targetRouteId)}?preview=true`);
      } else {
        navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar rota.");
    }
  };

  const deleteRouteMutation = useDeleteRoute(usuarioId);

  const handleDeleteRoute = () => {
    if (!id) return;
    openConfirmationDialog({
      title: "Excluir Rota",
      description: `Tem certeza que deseja excluir a rota "${formData.nome}"? Esta ação não poderá ser desfeita.`,
      confirmText: "Excluir Rota",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteRouteMutation.mutateAsync(id);
          closeConfirmationDialog();
          navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
        } catch (error: any) {
          closeConfirmationDialog();
          toast.error(error.message || "Erro ao excluir rota.");
        }
      },
    });
  };

  const handleCancel = () => {
    if (itinerario.length > 0 || formData.nome) {
      openConfirmationDialog({
        title: "Descartar alterações?",
        description: "Tem certeza que deseja sair? Todas as alterações não salvas serão perdidas.",
        confirmText: "Sim, descartar",
        cancelText: "Continuar editando",
        variant: "destructive",
        onConfirm: () => {
          closeConfirmationDialog();
          navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
        },
      });
    } else {
      navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES);
    }
  };

  return {
    id,
    isEditing,
    can,
    formData,
    setFormData,
    itinerario,
    setItinerario,
    passageirosList,
    escolasList,
    veiculosList,
    isLoading: isLoadingRoute || isLoadingPassageiros || isLoadingEscolas || isLoadingVeiculos,
    isSaving: createRouteMutation.isPending || updateRouteMutation.isPending,
    isDeleting: deleteRouteMutation.isPending,
    isFormValid,
    errosPorNo,
    errosItinerario,
    avisosItinerario,
    isDialogOpen,
    setIsDialogOpen,
    insertTarget,
    editingInlinePassageiroId,
    setEditingInlinePassageiroId,
    shouldAutoAddPassageiro,
    setShouldAutoAddPassageiro,
    reordenarSheetTargetItem,
    setReordenarSheetTargetItem,
    listBottomRef,
    validarMovimentoPermitido,
    handleAddPassageiro,
    handleAddEscola,
    handleMove,
    handleRemove,
    handleToggleSentido,
    openModalParadaGeral,
    openModalParadaIntermediaria,
    handleSubmit,
    handleDeleteRoute,
    handleCancel,
  };
}
