import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useRouteDetail } from "@/hooks/api/useRoutes";
import { useCreateRoute, useUpdateRoute } from "@/hooks/api/useRouteMutations";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { useEscolas } from "@/hooks/api/useEscolas";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useRouteRules } from "@/hooks/business/useRouteRules";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { RouteConfigSkeleton } from "@/components/skeletons";
import PassageiroEnderecoFormDialog from "@/components/dialogs/PassageiroEnderecoFormDialog";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Trash2, ArrowUp, ArrowDown,
  AlertCircle, AlertTriangle, User, School, MapPin, X, Loader2, Pencil,
  ChevronDown, ChevronUp, Save,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/utils/notifications/toast";
import { RouteNodeType, RouteSentido } from "@/types/route";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";

interface ItineraryItem {
  id: string;
  tipo_no: RouteNodeType;
  passageiro_id?: string;
  escola_id?: string;
  nome: string;
  detalhe?: string;
  temEndereco?: boolean;
  responsaveisAdicionais?: Array<{ id: string; nome: string; parentesco: string }>;
  passageiro?: any;
  sentido?: RouteSentido;
}

export default function ConfigurarRota() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { setPageTitle, openRouteFormDialog } = useLayout();

  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const usuarioId = profile?.id || "";

  useEffect(() => {
    setPageTitle(isEditing ? "Editar Rota" : "Criar Rota");
  }, [isEditing, setPageTitle]);

  const { data: routeData, isLoading: isLoadingRoute } = useRouteDetail(id || "");
  const { data: passageirosQueryData, refetch: refetchPassageiros } = usePassageiros({ usuarioId });
  const passageirosList = passageirosQueryData?.list || [];

  const { data: escolasQueryData } = useEscolas({ usuarioId });
  const escolasList = escolasQueryData?.list || [];

  const { data: veiculosQueryData } = useVeiculos({ usuarioId });
  const veiculosList = veiculosQueryData?.list || [];

  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();
  const { gerarErrosPorNo, validarItinerarioPronto } = useRouteRules();

  const location = useLocation();
  const stateData = location.state as { nome: string; veiculoId: string; escolaFixaId?: string } | null;

  const [nome, setNome] = useState(stateData?.nome || "");
  const [veiculoId, setVeiculoId] = useState(stateData?.veiculoId || "");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [itinerario, setItinerario] = useState<ItineraryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInlinePassageiroId, setEditingInlinePassageiroId] = useState<string | null>(null);
  const [shouldAutoAddPassageiro, setShouldAutoAddPassageiro] = useState(false);
  const [searchAlunos, setSearchAlunos] = useState("");
  const [searchEscolas, setSearchEscolas] = useState("");

  const [activeTab, setActiveTab] = useState<'passageiros' | 'escolas'>('passageiros');
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [expandedSchoolNodes, setExpandedSchoolNodes] = useState<Record<string, boolean>>({});

  const toggleSchoolNodeExpand = (nodeId: string) => {
    setExpandedSchoolNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const { isPronto: isRotaPronta, errorMsg: msgErroRota } = validarItinerarioPronto(null, itinerario);

  const temPassageiro = useMemo(() => itinerario.some(item => item.tipo_no === RouteNodeType.PASSAGEIRO), [itinerario]);
  const temEscola = useMemo(() => itinerario.some(item => item.tipo_no === RouteNodeType.ESCOLA), [itinerario]);
  const podeExibirErros = temPassageiro && temEscola;

  const errosPorNo = useMemo(() => {
    return gerarErrosPorNo(itinerario);
  }, [itinerario, gerarErrosPorNo]);

  const errosItinerario = useMemo(() => {
    const list: string[] = [];
    if (!podeExibirErros) return list;

    if (!isRotaPronta && msgErroRota) {
      if (Object.keys(errosPorNo).length === 0) {
        list.push(msgErroRota);
      } else {
        Object.values(errosPorNo).forEach(err => {
          if (!list.includes(err)) list.push(err);
        });
      }
    }
    return list;
  }, [isRotaPronta, msgErroRota, errosPorNo, podeExibirErros]);

  const isFormValid = useMemo(() => {
    return itinerario.length > 0 && temPassageiro && temEscola && isRotaPronta && errosItinerario.length === 0;
  }, [itinerario.length, temPassageiro, temEscola, isRotaPronta, errosItinerario.length]);

  const avisosItinerario = useMemo(() => {
    const list: string[] = [];
    if (!podeExibirErros) return list;

    const escolasNoItinerario = itinerario.filter(item => item.tipo_no === RouteNodeType.ESCOLA);
    const escolasComAlunos = new Set(
      itinerario
        .filter(item => item.tipo_no === RouteNodeType.PASSAGEIRO && (item.passageiro?.escola_id || item.passageiro?.escola?.id || item.escola_id))
        .map(item => item.passageiro?.escola_id || item.passageiro?.escola?.id || item.escola_id)
    );
    const escolasVazias = escolasNoItinerario.filter(esc => !escolasComAlunos.has(esc.escola_id));
    if (escolasVazias.length > 0) {
      list.push(
        `Uma ou mais escolas adicionadas ao trajeto (${escolasVazias.map(e => e.nome).join(", ")}) não possuem nenhum aluno associado nesta rota.`
      );
    }
    return list;
  }, [itinerario, podeExibirErros]);

  const getAlunosEscolaPorPosicao = (itinerarioList: ItineraryItem[], escolaNodeIndex: number) => {
    if (escolaNodeIndex < 0 || escolaNodeIndex >= itinerarioList.length) {
      return { desces: [], subes: [] };
    }

    const escolaNode = itinerarioList[escolaNodeIndex];
    if (escolaNode.tipo_no !== RouteNodeType.ESCOLA) {
      return { desces: [], subes: [] };
    }

    const escolaId = escolaNode.escola_id;
    if (!escolaId) {
      return { desces: [], subes: [] };
    }

    const desces = itinerarioList.filter((p, pIdx) => {
      if (p.tipo_no !== RouteNodeType.PASSAGEIRO) return false;
      const pEscolaId = p.passageiro?.escola_id || p.passageiro?.escola?.id || p.escola_id;
      if (pEscolaId !== escolaId) return false;

      const sentido = p.sentido || RouteSentido.INDO;
      if (sentido !== RouteSentido.INDO) return false;

      if (pIdx >= escolaNodeIndex) return false;

      const primeiraEscolaAposP = itinerarioList.findIndex((node, nodeIdx) =>
        nodeIdx > pIdx &&
        node.tipo_no === RouteNodeType.ESCOLA &&
        node.escola_id === escolaId
      );

      return primeiraEscolaAposP === escolaNodeIndex;
    });

    const subes = itinerarioList.filter((p, pIdx) => {
      if (p.tipo_no !== RouteNodeType.PASSAGEIRO) return false;
      const pEscolaId = p.passageiro?.escola_id || p.passageiro?.escola?.id || p.escola_id;
      if (pEscolaId !== escolaId) return false;

      const sentido = p.sentido || RouteSentido.INDO;
      if (sentido !== RouteSentido.VOLTANDO) return false;

      if (pIdx <= escolaNodeIndex) return false;

      let ultimaEscolaAntesDeP = -1;
      for (let i = pIdx - 1; i >= 0; i--) {
        const node = itinerarioList[i];
        if (node.tipo_no === RouteNodeType.ESCOLA && node.escola_id === escolaId) {
          ultimaEscolaAntesDeP = i;
          break;
        }
      }

      return ultimaEscolaAntesDeP === escolaNodeIndex;
    });

    return { desces, subes };
  };

  const handleToggleSentido = (idx: number, sentido: RouteSentido) => {
    setItinerario(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        sentido
      };
      return updated;
    });
  };

  const handleOpenEditRouteDialog = () => {
    openRouteFormDialog({
      editingRoute: {
        nome,
        veiculoId
      },
      onSuccess: (data) => {
        setNome(data.nome);
        setVeiculoId(data.veiculoId);
      }
    });
  };

  const [insertTarget, setInsertTarget] = useState<"top" | "bottom" | number>("bottom");

  const openModalParadaGeral = () => {
    setInsertTarget("bottom");
    setActiveTab('passageiros');
    setIsDialogOpen(true);
  };

  const openModalParadaTopo = () => {
    setInsertTarget("top");
    setActiveTab('passageiros');
    setIsDialogOpen(true);
  };

  const openModalParadaIntermediaria = (targetIndex: number) => {
    setInsertTarget(targetIndex);
    setActiveTab('passageiros');
    setIsDialogOpen(true);
  };



  useEffect(() => {
    if (routeData) {
      setNome(routeData.nome || "");
      setVeiculoId(routeData.veiculo_id || "");

      if (routeData.passageiros) {
        const mapped = routeData.passageiros.map((rp: any, idx: number) => {
          if (rp.tipo_no === RouteNodeType.ESCOLA && rp.escola) {
            return {
              id: `no-escola-${rp.escola.id}-${idx}`,
              tipo_no: RouteNodeType.ESCOLA,
              escola_id: rp.escola.id,
              nome: rp.escola.nome,
              detalhe: "Desembarque na Escola",
              temEndereco: true
            };
          } else if (rp.passageiro) {
            const pass = rp.passageiro;
            const hasAddr = !!(pass.logradouro && pass.numero);
            return {
              id: `no-pass-${pass.id}-${idx}`,
              tipo_no: RouteNodeType.PASSAGEIRO,
              passageiro_id: pass.id,
              nome: pass.nome,
              detalhe: pass.escola?.nome ? `Escola: ${pass.escola.nome}` : undefined,
              temEndereco: hasAddr,
              responsaveisAdicionais: pass.responsaveis || [],
              passageiro: pass,
              sentido: rp.sentido || null
            };
          }
          return null;
        }).filter(Boolean) as ItineraryItem[];

        setItinerario(mapped);
        setIsConfigExpanded(false);
      }
    }
  }, [routeData]);

  useEffect(() => {
    if (!isEditing && veiculosList.length === 1 && !veiculoId) {
      setVeiculoId(veiculosList[0].id);
    }
  }, [veiculosList, isEditing, veiculoId]);





  useEffect(() => {
    if (!isDialogOpen) {
      setSearchAlunos("");
      setSearchEscolas("");
    }
  }, [isDialogOpen]);

  const passageirosAtivos = passageirosList.filter(p => p.ativo !== false);
  const filteredPassageiros = passageirosAtivos.filter(p => {
    const jaAdicionado = itinerario.some(item => item.passageiro_id === p.id);
    if (jaAdicionado) return false;

    return (
      p.nome.toLowerCase().includes(searchAlunos.toLowerCase()) ||
      (p.escola?.nome || "").toLowerCase().includes(searchAlunos.toLowerCase())
    );
  });

  const filteredEscolas = escolasList.filter(e => {
    return e.nome.toLowerCase().includes(searchEscolas.toLowerCase());
  });

  const passageirosDisponiveisCount = passageirosAtivos.filter(
    p => !itinerario.some(item => item.passageiro_id === p.id)
  ).length;

  const escolasDisponiveisCount = escolasList.length;

  const getInitialSentido = (currentItinerario: ItineraryItem[], target: "top" | "bottom" | number): RouteSentido => {
    if (target === "top") return RouteSentido.INDO;
    if (typeof target === "number") {
      const temEscolaAntes = currentItinerario.slice(0, target).some(item => item.tipo_no === RouteNodeType.ESCOLA);
      return temEscolaAntes ? RouteSentido.VOLTANDO : RouteSentido.INDO;
    }
    const temEscolaAntes = currentItinerario.some(item => item.tipo_no === RouteNodeType.ESCOLA);
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
    const pass = passageirosList.find(p => p.id === passId);
    if (!pass) return;

    if (itinerario.some(item => item.passageiro_id === passId)) {
      toast.warning("Este passageiro já está incluso nesta rota.");
      return;
    }

    if (!pass.logradouro || !pass.numero) {
      setEditingInlinePassageiroId(pass.id);
      setShouldAutoAddPassageiro(true);
      return;
    }

    const sentidoInicial = getInitialSentido(itinerario, insertTarget);

    const newItem: ItineraryItem = {
      id: `no-pass-${pass.id}-${Date.now()}`,
      tipo_no: RouteNodeType.PASSAGEIRO,
      passageiro_id: pass.id,
      nome: pass.nome,
      detalhe: pass.escola?.nome ? `Escola: ${pass.escola.nome}` : undefined,
      temEndereco: true,
      responsaveisAdicionais: (pass as any).responsaveis || [],
      passageiro: pass,
      sentido: sentidoInicial
    };

    setItinerario(prev => insertItemIntoItinerario(prev, newItem, insertTarget));
    setIsDialogOpen(false);
  };

  const handleAddEscola = (escolaId: string) => {
    const esc = escolasList.find(e => e.id === escolaId);
    if (!esc) return;

    const newItem: ItineraryItem = {
      id: `no-escola-${esc.id}-${Date.now()}`,
      tipo_no: RouteNodeType.ESCOLA,
      escola_id: esc.id,
      nome: esc.nome,
      detalhe: "Parada em Escola",
      temEndereco: true
    };

    setItinerario(prev => insertItemIntoItinerario(prev, newItem, insertTarget));
    setIsDialogOpen(false);
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
    setItinerario(prev => prev.filter((_, idx) => idx !== index));
  };

  const renderAlertBlock = (idPrefix: "top" | "bottom") => {
    if (itinerario.length === 0 || (errosItinerario.length === 0 && avisosItinerario.length === 0)) return null;

    return (
      <div id={`itinerario-alert-${idPrefix}`} className="scroll-mt-24">
        {errosItinerario.length > 0 && (
          <div className="mx-1 mb-4 bg-rose-50/90 border border-rose-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-sm text-left animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-widest block">
                {errosItinerario.length > 1 ? `AJUSTES NECESSÁRIOS (${errosItinerario.length})` : "AJUSTE NECESSÁRIO"}
              </span>
              <ul className="space-y-1.5">
                {errosItinerario.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-normal text-rose-900 leading-snug">
                    <span className="h-1 w-1 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {errosItinerario.length === 0 && avisosItinerario.length > 0 && (
          <div className="mx-1 mb-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-sm text-left animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest block">
                {avisosItinerario.length > 1 ? `AVISOS (${avisosItinerario.length})` : "AVISO"}
              </span>
              <ul className="space-y-1.5">
                {avisosItinerario.map((warn, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-normal text-amber-900 leading-snug">
                    <span className="h-1 w-1 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = "O nome da rota é obrigatório.";
    if (!veiculoId || veiculoId === "none") errors.veiculoId = "O veículo da rota é obrigatório.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsConfigExpanded(true);
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    setValidationErrors({});

    const check = validarItinerarioPronto(null, itinerario);
    if (!check.isPronto || errosItinerario.length > 0 || itinerario.length === 0) {
      return;
    }

    const payload = {
      usuario_id: usuarioId,
      nome: nome.trim(),
      veiculo_id: veiculoId,
      passageiros: itinerario.map((item, idx) => ({
        tipo_no: item.tipo_no,
        passageiro_id: item.passageiro_id || null,
        escola_id: item.escola_id || null,
        ordem: idx + 1,
        sentido: item.sentido || null
      }))
    };

    if (isEditing && id) {
      updateRouteMutation.mutate(
        { id, data: payload },
        { onSuccess: () => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES) }
      );
    } else {
      createRouteMutation.mutate(payload, {
        onSuccess: () => navigate(ROUTES.PRIVATE.MOTORISTA.ROUTES)
      });
    }
  };

  const isDataReady = !isEditing || (!isLoadingRoute && !!routeData && (routeData.passageiros ? (itinerario.length > 0 || routeData.passageiros.length === 0) : true));

  if (isEditing && !isDataReady) {
    return <RouteConfigSkeleton count={4} />;
  }

  return (
    <PullToRefreshWrapper onRefresh={async () => { }}>
      <form onSubmit={handleSubmit} className="text-left pb-12 max-w-2xl mx-auto relative">
        {/* Header de Ações removido para otimização de hierarquia visual */}

        <div className="space-y-5 mt-1">
          {/* Card de Configuração de Preferências (Sempre Visível e Otimizado) */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 transition-all">
            <div className="min-w-0 flex-1 text-left space-y-1">
              <h2 className="text-lg font-extrabold text-[#1a3a5c] font-headline tracking-tight leading-snug break-words">
                {nome || "Configurar Rota"}
              </h2>
              {(() => {
                const veiculo = veiculosList.find(v => v.id === veiculoId);
                return veiculo ? (
                  <p className="text-xs font-medium text-slate-400 leading-none">
                    {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-slate-400 leading-none">
                    Nenhum veículo associado
                  </p>
                );
              })()}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenEditRouteDialog}
              className="h-8 px-3 rounded-lg border-slate-200 text-[#1a3a5c] hover:bg-slate-50 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-all"
            >
              <Pencil className="w-3 h-3" />
            </Button>
          </div>

          {/* Seção do Itinerário */}
          {!isConfigExpanded && (
            <div className="space-y-5 animate-in fade-in duration-300">

              {/* Seção 4: Sequência do Itinerário */}
              <div id="itinerario-container" className="bg-transparent scroll-mt-24 animate-in fade-in duration-300">
                <div className="flex items-center justify-between px-1 mb-2">
                  <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
                    Itinerário
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {itinerario.length} paradas
                  </span>
                </div>

                <div className="relative flex flex-col gap-1.5 pl-9 pb-1">

                  {/* Botão "Adicionar Parada" no Início (exibido apenas se tiver 1 ou mais paradas) */}
                  {itinerario.length > 0 && (
                    <div className="relative w-full my-3.5">
                      {/* Linha vertical conectora individual (Metade Inferior estendida) */}
                      <div className="absolute left-[-24px] top-1/2 -bottom-6 w-[2.5px] bg-slate-200/70 z-0" />
                      {/* Círculo do Timeline de ação (Topo - Clicável) */}
                      <button
                        type="button"
                        onClick={openModalParadaTopo}
                        className="absolute left-[-35px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white hover:bg-slate-100 border-2 border-dashed border-[#1a3a5c]/45 hover:border-[#1a3a5c] text-[#1a3a5c] flex items-center justify-center shrink-0 shadow-xs z-10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        title="Adicionar Parada no Início"
                      >
                        <Plus className="w-3 h-3 stroke-[3px]" />
                      </button>
                      {/* Botão Topo */}
                      <Button
                        type="button"
                        onClick={openModalParadaTopo}
                        className="w-full h-11 bg-white hover:bg-[#1a3a5c]/5 border-2 border-dashed border-[#1a3a5c]/30 hover:border-[#1a3a5c] text-[#1a3a5c] font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        <span>Adicionar Parada</span>
                      </Button>
                    </div>
                  )}

                  {/* Renderização das Paradas Intermediárias */}
                  {itinerario.map((item, index) => {
                    const displayLabel = index + 1;
                    const isEscola = item.tipo_no === RouteNodeType.ESCOLA;
                    const nodeError = errosPorNo[item.id];
                    const hasError = !!nodeError;

                    const showTopLine = true;

                    return (
                      <div key={item.id} className="relative w-full">
                        {/* Linha vertical conectora individual (Metade Superior estendida) */}
                        {showTopLine && (
                          <div className="absolute left-[-24px] -top-6 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
                        )}
                        {/* Linha vertical conectora individual (Metade Inferior estendida) */}
                        <div className="absolute left-[-24px] top-1/2 -bottom-6 w-[2.5px] bg-slate-200/70 z-0" />
                        {/* Círculo do Timeline contendo o ícone da escola ou o número exato da parada */}
                        <span className={cn(
                          "absolute left-[-35px] top-1/2 -translate-y-[calc(50%+8px)] h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] border-2 shadow-sm z-10 transition-colors",
                          isEscola
                            ? "bg-blue-600 border-blue-600"
                            : hasError
                              ? "bg-rose-500 border-rose-500 shadow-md shadow-rose-200"
                              : "bg-[#1a3a5c] border-white"
                        )}>
                          {isEscola ? <School className="w-3.5 h-3.5" /> : displayLabel}
                        </span>

                        {/* Card */}
                        <div className="bg-white flex flex-col overflow-hidden text-left transition-all w-full rounded-2xl border border-slate-200 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] relative">
                          {/* Conteúdo Superior: Lado Esquerdo (Dados + Tabs) + Lado Direito (Setas) */}
                          <div className="flex w-full items-stretch min-h-[96px]">
                            {/* Lado Esquerdo */}
                            <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                              {isEscola ? (
                                <div className="flex flex-col gap-1.5 min-w-0">
                                  {/* Nome da Escola (Sem Truncate - Full Width) + Lixeira no Canto Superior Direito */}
                                  <div className="w-full flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <span className="font-bold text-sm text-[#1a3a5c] leading-snug block break-words">
                                        {item.nome}
                                      </span>
                                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Parada de Escola</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(index)}
                                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0 cursor-pointer -mt-0.5"
                                      title="Remover Escola"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Resumo e Toggle de Alunos (Desembarque e Embarque) */}
                                  {(() => {
                                    const { desces, subes } = getAlunosEscolaPorPosicao(itinerario, index);
                                    const totalAlunos = desces.length + subes.length;
                                    const isExpanded = !!expandedSchoolNodes[item.id];

                                    return (
                                      <div className="mt-1 border-t border-slate-100 pt-2 w-full space-y-2">
                                        {/* Barra de Resumo + Toggle */}
                                        <button
                                          type="button"
                                          onClick={() => toggleSchoolNodeExpand(item.id)}
                                          disabled={totalAlunos === 0}
                                          className={cn(
                                            "flex items-center justify-between gap-1.5 w-full text-[11px] font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg transition-all select-none",
                                            totalAlunos > 0 ? "cursor-pointer" : "opacity-60 cursor-default"
                                          )}
                                        >
                                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                                            <span className="inline-flex items-center gap-1 shrink-0">
                                              <span>⬇️</span>
                                              <span className="font-bold text-[#1a3a5c]">{desces.length}</span>
                                              <span className="text-slate-600 font-medium">Desembarque</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1 shrink-0">
                                              <span>⬆️</span>
                                              <span className="font-bold text-[#1a3a5c]">{subes.length}</span>
                                              <span className="text-slate-600 font-medium">Embarque</span>
                                            </span>
                                          </div>
                                          {totalAlunos > 0 && (
                                            isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                          )}
                                        </button>

                                        {/* Lista Expandida de Alunos (Soft & Clean) */}
                                        {isExpanded && totalAlunos > 0 && (
                                          <div className="pt-2 space-y-1.5 text-left border-t border-slate-100/80 mt-1 animate-in fade-in duration-150">
                                            {desces.length > 0 && (
                                              <div className="text-[11px] leading-snug">
                                                <span className="font-semibold text-slate-700">⬇️ Desembarque ({desces.length}): </span>
                                                <span className="text-slate-500 font-normal">
                                                  {desces.map(d => formatShortName(d.passageiro?.nome || d.nome || "", true)).join(", ")}
                                                </span>
                                              </div>
                                            )}
                                            {subes.length > 0 && (
                                              <div className="text-[11px] leading-snug">
                                                <span className="font-semibold text-slate-700">⬆️ Embarque ({subes.length}): </span>
                                                <span className="text-slate-500 font-normal">
                                                  {subes.map(s => formatShortName(s.passageiro?.nome || s.nome || "", true)).join(", ")}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2 min-w-0">
                                  {/* Nome + Subtítulo (Turma) + Lixeira no Canto Superior Direito */}
                                  <div className="flex items-start justify-between gap-2 w-full">
                                    <div className="flex-1 min-w-0 pr-1">
                                      <span className="font-bold text-sm text-[#1a3a5c] break-words leading-snug block">
                                        {formatShortName(item.nome, true)}
                                      </span>
                                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1">
                                        {item.sentido === RouteSentido.VOLTANDO ? (
                                          <>
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="break-words">
                                              {formatarEnderecoParcialRota(item.passageiro)}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="break-words">
                                              {item.passageiro?.escola?.nome}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(index)}
                                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0 cursor-pointer -mt-0.5"
                                      title="Remover Parada"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Abas Pill (Indo / Voltando) - 100% da Largura (50% cada) */}
                                  <div className="flex items-center w-full mt-1.5 mb-0.5">
                                    <div className="w-full bg-slate-100 p-0.5 rounded-full flex items-center gap-0.5 border border-slate-200/60 shadow-inner">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSentido(index, RouteSentido.INDO)}
                                        className={cn(
                                          "flex-1 rounded-full py-1 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none",
                                          (item.sentido === RouteSentido.INDO || !item.sentido)
                                            ? "bg-[#1a3a5c] text-white font-bold shadow-xs"
                                            : "text-slate-500 hover:text-slate-800 font-medium"
                                        )}
                                      >
                                        <span>Indo</span>
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSentido(index, RouteSentido.VOLTANDO)}
                                        className={cn(
                                          "flex-1 rounded-full py-1 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none",
                                          item.sentido === RouteSentido.VOLTANDO
                                            ? "bg-[#1a3a5c] text-white font-bold shadow-xs"
                                            : "text-slate-500 hover:text-slate-800 font-medium"
                                        )}
                                      >
                                        <span>Voltando</span>
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Lado Direito: Ações de Reposicionamento (Setas Verticais) */}
                            <div className="w-[44px] flex flex-col border-l border-slate-100 shrink-0 bg-slate-50/50">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMove(index, "up")}
                                className="flex-1 flex items-center justify-center text-slate-500 hover:bg-slate-100/80 hover:text-[#1a3a5c] disabled:opacity-25 disabled:hover:bg-transparent transition-all border-b border-slate-100 outline-none select-none"
                                title="Mover para Cima"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={index === itinerario.length - 1}
                                onClick={() => handleMove(index, "down")}
                                className="flex-1 flex items-center justify-center text-slate-500 hover:bg-slate-100/80 hover:text-[#1a3a5c] disabled:opacity-25 disabled:hover:bg-transparent transition-all outline-none select-none"
                                title="Mover para Baixo"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Alerta de Erro Contextual Embutido Dentro do Próprio Card na Parte Inferior */}
                          {nodeError && (
                            <div className="w-full bg-rose-50 border-t border-rose-200/80 p-2.5 px-3.5 flex items-center gap-2.5 text-xs text-rose-900 font-medium text-left animate-in fade-in duration-200">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>{nodeError}</span>
                            </div>
                          )}
                        </div>

                        {/* Nó Intermediário da Linha do Tempo entre Cards (Centralização Óptica Ajustada) */}
                        {index < itinerario.length - 1 && (
                          <div className="relative w-full h-4 flex items-center justify-center my-1 z-10">
                            <div className="absolute left-[-24px] -top-3 -bottom-3 w-[2.5px] bg-slate-200/70 z-0" />
                            <button
                              type="button"
                              onClick={() => openModalParadaIntermediaria(index + 1)}
                              className="absolute left-[-35px] top-1/2 -translate-y-1/2 -translate-y-[8px] w-6 h-6 rounded-full bg-white hover:bg-slate-100 border-2 border-dashed border-[#1a3a5c]/45 hover:border-[#1a3a5c] text-[#1a3a5c] flex items-center justify-center shrink-0 shadow-xs z-10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                              title={`Inserir parada entre as paradas ${index + 1} e ${index + 2}`}
                            >
                              <Plus className="w-3 h-3 stroke-[3px]" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 4. Botão "Adicionar Parada" */}
                  <div className="relative w-full my-3.5">
                    {/* Linha vertical conectora individual (Metade Superior estendida) */}
                    {itinerario.length > 0 && (
                      <div className="absolute left-[-24px] -top-6 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
                    )}
                    {/* Círculo do Timeline de ação (Rodapé - Clicável) */}
                    <button
                      type="button"
                      onClick={openModalParadaGeral}
                      className="absolute left-[-35px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white hover:bg-slate-100 border-2 border-dashed border-[#1a3a5c]/45 hover:border-[#1a3a5c] text-[#1a3a5c] flex items-center justify-center shrink-0 shadow-xs z-10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      title="Adicionar Parada no Final"
                    >
                      <Plus className="w-3 h-3 stroke-[3px]" />
                    </button>
                    {/* Botão */}
                    <Button
                      type="button"
                      onClick={openModalParadaGeral}
                      className="w-full h-11 bg-white hover:bg-[#1a3a5c]/5 border-2 border-dashed border-[#1a3a5c]/30 hover:border-[#1a3a5c] text-[#1a3a5c] font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4 stroke-[3px]" />
                      <span>Adicionar Parada</span>
                    </Button>
                  </div>
                </div>
              </div>

              {renderAlertBlock("bottom")}

              {/* Botão de Ação Principal */}
              <Button
                type="submit"
                disabled={createRouteMutation.isPending || updateRouteMutation.isPending || !isFormValid}
                className="w-full h-11 bg-[#1a3a5c] hover:bg-[#16314f] text-white font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-4"
              >
                {createRouteMutation.isPending || updateRouteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{createRouteMutation.isPending || updateRouteMutation.isPending ? "Salvando..." : "Salvar Rota"}</span>
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Diálogo para selecionar Escola Fixa ou Paradas Intermediárias */}
      <BaseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} maxWidth="md">
        <BaseDialog.Header
          title="Adicionar Parada"
          icon={<Plus className="w-5 h-5" />}
          onClose={() => setIsDialogOpen(false)}
        />
        <BaseDialog.Body>

          <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val as 'passageiros' | 'escolas');
          }} className="w-full space-y-3">
            <div className="bg-slate-100/80 p-1 rounded-lg">
              <TabsList className="grid grid-cols-2 w-full bg-transparent p-0 h-9 gap-1">
                <TabsTrigger
                  value="passageiros"
                  className="rounded-lg font-bold text-xs h-7 data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-sm text-slate-500 hover:text-[#1a3a5c] transition-all"
                >
                  <User className="w-3.5 h-3.5 mr-1.5" /> Passageiros ({passageirosDisponiveisCount})
                </TabsTrigger>
                <TabsTrigger
                  value="escolas"
                  className="rounded-lg font-bold text-xs h-7 data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-sm text-slate-500 hover:text-[#1a3a5c] transition-all"
                >
                  <School className="w-3.5 h-3.5 mr-1.5" /> Escolas ({escolasDisponiveisCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="passageiros" className="space-y-2.5 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="relative">
                <Input
                  placeholder="Buscar passageiro..."
                  value={searchAlunos}
                  onChange={(e) => setSearchAlunos(e.target.value)}
                  className="h-9 text-xs rounded-lg bg-slate-50/50 pr-8"
                />
                {searchAlunos && (
                  <button
                    type="button"
                    onClick={() => setSearchAlunos("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {filteredPassageiros.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-4">Nenhum passageiro ativo encontrado.</p>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {filteredPassageiros.map((p) => {
                    const temEndereco = !!(p.logradouro && p.numero);
                    const estaAdicionado = itinerario.some((item) => item.passageiro_id === p.id);

                    return (
                      <div
                        key={p.id}
                        className="bg-slate-50/60 border border-slate-100 p-2.5 rounded-lg flex flex-col gap-1 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {/* Linha 1: Nome + Turma */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-bold text-[#1a3a5c] truncate">
                                {formatShortName(p.nome, true)}
                              </span>
                              {p.turma && (
                                <span className="text-slate-400 font-semibold text-[10px] inline-flex items-center gap-1 shrink-0">
                                  <span className="text-[7.5px] opacity-40">•</span>
                                  {p.turma}
                                </span>
                              )}
                            </div>

                            {/* Linha 2: Escola */}
                            <p className="text-[10px] text-slate-500 font-medium whitespace-normal break-words text-left mt-0.5 leading-snug">
                              {p.escola?.nome || "Escola não informada"}
                            </p>

                            {/* Linha 3: Aviso de Sem Endereço (quando aplicável) */}
                            {!temEndereco && (
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 mt-1">
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Sem endereço cadastrado</span>
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddPassageiro(p.id)}
                            disabled={estaAdicionado}
                            title={estaAdicionado ? "Passageiro já adicionado" : "Adicionar passageiro"}
                            className="h-8 w-8 rounded-lg bg-[#1a3a5c] hover:bg-[#11263d] text-white p-0 shrink-0 shadow-sm disabled:opacity-30"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="escolas" className="space-y-2.5 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="relative">
                <Input
                  placeholder="Buscar escola..."
                  value={searchEscolas}
                  onChange={(e) => setSearchEscolas(e.target.value)}
                  className="h-9 text-xs rounded-lg bg-slate-50/50 pr-8"
                />
                {searchEscolas && (
                  <button
                    type="button"
                    onClick={() => setSearchEscolas("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {filteredEscolas.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-4">Nenhuma escola ativa encontrada.</p>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {filteredEscolas.map((e) => {
                    return (
                      <div
                        key={e.id}
                        className="bg-slate-50/60 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors hover:bg-slate-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1a3a5c]">{e.nome}</p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAddEscola(e.id)}
                          title="Adicionar escola"
                          className="h-8 w-8 rounded-lg bg-[#1a3a5c] hover:bg-[#11263d] text-white p-0 shrink-0 shadow-sm active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </BaseDialog.Body>
      </BaseDialog>

      {/* Diálogo para cadastrar endereço inline */}
      {editingInlinePassageiroId && (
        <PassageiroEnderecoFormDialog
          passageiroId={editingInlinePassageiroId}
          nomePassageiro={passageirosList.find(p => p.id === editingInlinePassageiroId)?.nome || ""}
          isOpen={!!editingInlinePassageiroId}
          showRouteNotice={shouldAutoAddPassageiro}
          onSuccess={async () => {
            const { data: updatedData } = await refetchPassageiros();

            if (shouldAutoAddPassageiro) {
              const freshPass = updatedData?.list?.find(p => p.id === editingInlinePassageiroId);
              if (freshPass) {
                const sentidoInicial = getInitialSentido(itinerario, insertTarget);
                const newItem: ItineraryItem = {
                  id: `no-pass-${freshPass.id}-${Date.now()}`,
                  tipo_no: RouteNodeType.PASSAGEIRO,
                  passageiro_id: freshPass.id,
                  nome: freshPass.nome,
                  detalhe: freshPass.escola?.nome ? `Escola: ${freshPass.escola.nome}` : undefined,
                  temEndereco: true,
                  responsaveisAdicionais: (freshPass as any).responsaveis || [],
                  passageiro: freshPass,
                  sentido: sentidoInicial
                };
                setItinerario(prev => insertItemIntoItinerario(prev, newItem, insertTarget));
                setIsDialogOpen(false);
                toast.success(`Endereço salvo e ${formatShortName(freshPass.nome, true)} adicionado(a) à rota!`);
              }
            } else {
              toast.success("Endereço atualizado com sucesso!");
            }

            setEditingInlinePassageiroId(null);
            setShouldAutoAddPassageiro(false);
          }}
          onClose={() => {
            setEditingInlinePassageiroId(null);
            setShouldAutoAddPassageiro(false);
          }}
        />
      )}

    </PullToRefreshWrapper>
  );
}
