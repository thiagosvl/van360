// React
import { useCallback, useEffect, useMemo, useState } from "react";

// React Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Components - Common
import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
// Components - Alerts
import { AutomaticChargesPrompt } from "@/components/alerts/AutomaticChargesPrompt";

// Components - Dialogs
import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";

// Components - Empty & Skeletons
import { ListSkeleton } from "@/components/skeletons";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCobrancas,
  useDesfazerPagamento,
  useEnviarNotificacaoCobranca,
  useToggleNotificacoesCobranca,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Utils
import { safeCloseDialog } from "@/utils/dialogUtils";
import {
  disableDesfazerPagamento,
  disableRegistrarPagamento,
  podeEnviarNotificacao,
} from "@/utils/domain/cobranca/disableActions";
import {
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText,
  meses,
} from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";

// Types
import { Cobranca } from "@/types/cobranca";

// Constants
import {
  PASSAGEIRO_COBRANCA_STATUS_PAGO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";

// Icons
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  DollarSign,
  FilePen,
  MoreVertical,
  Search,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { NavigateFunction } from "react-router-dom";

// --- Internal Components ---

// 3. Dropdown Actions (Refactored for cleaner look)
interface CobrancaActionsProps {
  cobranca: Cobranca;
  navigate: NavigateFunction;
  plano?: any;
  onNavigateToDetails: (cobranca: Cobranca) => void;
  onEditCobranca: (cobranca: Cobranca) => void;
  onOpenPaymentDialog?: (cobranca: Cobranca) => void;
  onSetConfirmDialogEnvioNotificacao?: (cobranca: Cobranca) => void;
  onToggleLembretes?: (cobranca: Cobranca) => void;
  onSetConfirmDialogDesfazer?: (cobrancaId: string) => void;
  isPaga?: boolean;
}

const CobrancaActions = ({
  cobranca,
  navigate,
  plano,
  onNavigateToDetails,
  onEditCobranca,
  onOpenPaymentDialog,
  onSetConfirmDialogEnvioNotificacao,
  onToggleLembretes,
  onSetConfirmDialogDesfazer,
  isPaga = false,
}: CobrancaActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/passageiros/${cobranca.passageiro_id}`);
          }}
        >
          <User className="mr-2 h-4 w-4" /> Ver Carteirinha
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToDetails(cobranca);
          }}
        >
          <DollarSign className="mr-2 h-4 w-4" /> Ver Cobrança
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onEditCobranca(cobranca);
          }}
        >
          <FilePen className="mr-2 h-4 w-4" /> Editar
        </DropdownMenuItem>

        {!isPaga &&
          !disableRegistrarPagamento(cobranca) &&
          onOpenPaymentDialog && (
            <DropdownMenuItem
              className="cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPaymentDialog(cobranca);
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Registrar Pagamento
            </DropdownMenuItem>
          )}

        {podeEnviarNotificacao(cobranca, plano) && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSetConfirmDialogEnvioNotificacao(cobranca);
            }}
          >
            <Bell className="mr-2 h-4 w-4" /> Enviar Lembrete
          </DropdownMenuItem>
        )}

        {podeEnviarNotificacao(cobranca, plano) && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLembretes(cobranca);
            }}
          >
            {cobranca.desativar_lembretes ? (
              <Bell className="mr-2 h-4 w-4" />
            ) : (
              <BellOff className="mr-2 h-4 w-4" />
            )}
            {cobranca.desativar_lembretes
              ? "Reativar Lembretes"
              : "Pausar Lembretes"}
          </DropdownMenuItem>
        )}

        {isPaga &&
          !disableDesfazerPagamento(cobranca) &&
          onSetConfirmDialogDesfazer && (
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onSetConfirmDialogDesfazer(cobranca.id);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Desfazer Pagamento
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- Main Component ---

const Cobrancas = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cobrancaToEdit, setCobrancaToEdit] = useState<Cobranca | null>(null);
  const { setPageTitle } = useLayout();
  const [searchParams, setSearchParams] = useSearchParams();

  // Date State
  const [mesFilter, setMesFilter] = useState(() => {
    const mesParam = searchParams.get("mes");
    return mesParam ? Number(mesParam) : new Date().getMonth() + 1;
  });
  const [anoFilter, setAnoFilter] = useState(() => {
    const anoParam = searchParams.get("ano");
    return anoParam ? Number(anoParam) : new Date().getFullYear();
  });

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );

  // Dialog States
  const [confirmDialogEnvioNotificacao, setConfirmDialogEnvioNotificacao] =
    useState<{ open: boolean; cobranca: Cobranca | null }>({
      open: false,
      cobranca: null,
    });
  const [confirmDialogDesfazer, setConfirmDialogDesfazer] = useState({
    open: false,
    cobrancaId: "",
  });

  const { user, loading: isSessionLoading } = useSession();
  const { profile, plano, isLoading: isProfileLoading } = useProfile(user?.id);

  const toggleNotificacoes = useToggleNotificacoesCobranca();
  const enviarNotificacao = useEnviarNotificacaoCobranca();
  const desfazerPagamento = useDesfazerPagamento();

  const isActionLoading =
    toggleNotificacoes.isPending ||
    enviarNotificacao.isPending ||
    desfazerPagamento.isPending;

  const [buscaAbertas, setBuscaAbertas] = useState("");
  const [buscaPagas, setBuscaPagas] = useState("");

  const {
    data: cobrancasData,
    isLoading: isCobrancasLoading,
    isFetching: isCobrancasFetching,
    refetch: refetchCobrancas,
  } = useCobrancas(
    {
      usuarioId: profile?.id,
      mes: mesFilter,
      ano: anoFilter,
    },
    {
      enabled: !!profile?.id,
      onError: (error) => {toast.error("cobranca.erro.carregar"); console.error(error);},
    }
  );

  const cobrancasAbertas = useMemo(
    () => cobrancasData?.abertas ?? [],
    [cobrancasData]
  );
  const cobrancasPagas = useMemo(
    () => cobrancasData?.pagas ?? [],
    [cobrancasData]
  );
  const isInitialLoading = isCobrancasLoading && !cobrancasData;

  const navigate = useNavigate();

  // Handlers
  const handleEditCobrancaClick = useCallback((cobranca: Cobranca) => {
    safeCloseDialog(() => {
      setCobrancaToEdit(cobranca);
      setEditDialogOpen(true);
    });
  }, []);

  const handleNavigation = useCallback(
    (newMes: number, newAno: number) => {
      setMesFilter(newMes);
      setAnoFilter(newAno);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("mes", newMes.toString());
        newParams.set("ano", newAno.toString());
        return newParams;
      });
    },
    [setSearchParams]
  );

  const handleCobrancaUpdated = () => {
    // Auto invalidation
  };

  const handleToggleLembretes = useCallback(
    async (cobranca: Cobranca) => {
      toggleNotificacoes.mutate({
        cobrancaId: cobranca.id,
        desativar: !cobranca.desativar_lembretes,
      });
    },
    [toggleNotificacoes]
  );

  const enviarNotificacaoCobranca = useCallback(async () => {
    if (!confirmDialogEnvioNotificacao.cobranca) return;
    enviarNotificacao.mutate(confirmDialogEnvioNotificacao.cobranca.id, {
      onSuccess: () => {
        setConfirmDialogEnvioNotificacao({
          open: false,
          cobranca: null,
        });
      },
    });
  }, [confirmDialogEnvioNotificacao.cobranca, enviarNotificacao]);

  const handleDesfazerPagamento = useCallback(async () => {
    desfazerPagamento.mutate(confirmDialogDesfazer.cobrancaId, {
      onSuccess: async () => {
        setConfirmDialogDesfazer({ open: false, cobrancaId: "" });
        // Refetch explícito para garantir que os KPIs sejam atualizados
        await refetchCobrancas();
      },
    });
  }, [confirmDialogDesfazer.cobrancaId, desfazerPagamento, refetchCobrancas]);

  const openPaymentDialog = useCallback((cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  }, []);

  const navigateToDetails = useCallback(
    (cobranca: Cobranca) => {
      navigate(`/cobrancas/${cobranca.id}`);
    },
    [navigate]
  );

  // Effects
  useEffect(() => {
    setPageTitle("Cobranças");
  }, [setPageTitle]);

  useEffect(() => {
    const mesParam = searchParams.get("mes");
    const anoParam = searchParams.get("ano");
    if (mesParam && Number(mesParam) !== mesFilter) {
      setMesFilter(Number(mesParam));
    }
    if (anoParam && Number(anoParam) !== anoFilter) {
      setAnoFilter(Number(anoParam));
    }
  }, [searchParams, mesFilter, anoFilter]);

  useEffect(() => {
    if (mesFilter || anoFilter) {
      setBuscaAbertas("");
      setBuscaPagas("");
    }
  }, [mesFilter, anoFilter]);

  // Filtering
  const cobrancasAbertasFiltradas = useMemo(() => {
    if (!buscaAbertas) return cobrancasAbertas;
    const searchTerm = buscaAbertas.toLowerCase();
    return cobrancasAbertas.filter(
      (c) =>
        c.passageiros.nome.toLowerCase().includes(searchTerm) ||
        c.passageiros.nome_responsavel?.toLowerCase().includes(searchTerm)
    );
  }, [cobrancasAbertas, buscaAbertas]);

  const cobrancasPagasFiltradas = useMemo(() => {
    if (!buscaPagas) return cobrancasPagas;
    const searchTerm = buscaPagas.toLowerCase();
    return cobrancasPagas.filter(
      (c) =>
        c.passageiros.nome.toLowerCase().includes(searchTerm) ||
        c.passageiros.nome_responsavel?.toLowerCase().includes(searchTerm)
    );
  }, [cobrancasPagas, buscaPagas]);

  // KPI Calculations
  const totalAReceber = useMemo(
    () => cobrancasAbertas.reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasAbertas]
  );

  const totalRecebido = useMemo(
    () => cobrancasPagas.reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasPagas]
  );

  const totalPrevisto = totalAReceber + totalRecebido;

  const pullToRefreshReload = async () => {
    await refetchCobrancas();
  };

  if (isSessionLoading || isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6 md:space-y-8">
          {/* 1. Header & Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <DateNavigation
              mes={mesFilter}
              ano={anoFilter}
              onNavigate={handleNavigation}
            />
          </div>

          {/* 2. KPIs - Grid Otimizado Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <KPICard
              title="A Receber"
              value={totalAReceber}
              count={cobrancasAbertas.length}
              icon={Wallet}
              bgClass="bg-orange-50"
              colorClass="text-orange-600"
            />
            <KPICard
              title="Recebido"
              value={totalRecebido}
              count={cobrancasPagas.length}
              icon={CheckCircle2}
              bgClass="bg-green-50"
              colorClass="text-green-600"
            />
            <KPICard
              title="Total Previsto"
              value={totalPrevisto}
              count={cobrancasAbertas.length + cobrancasPagas.length}
              icon={TrendingUp}
              bgClass="bg-blue-50"
              colorClass="text-blue-600"
              className="col-span-2 md:col-span-1"
            />
          </div>

          {/* Alerta Automático */}
          {plano?.slug &&
            [PLANO_GRATUITO, PLANO_ESSENCIAL].includes(plano.slug) && (
              <div className="hidden sm:block">
                <AutomaticChargesPrompt variant="full" />
              </div>
            )}

          {/* 3. Main Content (Tabs & List) */}
          <Tabs defaultValue="pendentes" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
              {/* Segmented Control */}
              <TabsList className="bg-gray-100/80 p-1 rounded-xl h-10 md:h-12 w-full md:w-auto self-start">
                <TabsTrigger
                  value="pendentes"
                  className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
                >
                  Pendentes
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
                  >
                    {cobrancasAbertas.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="pagas"
                  className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
                >
                  Pagas
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
                  >
                    {cobrancasPagas.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar passageiro..."
                  className="pl-10 h-10 md:h-11 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm sm:text-base"
                  value={buscaAbertas}
                  onChange={(e) => {
                    setBuscaAbertas(e.target.value);
                    setBuscaPagas(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Content: Pendentes */}
            <TabsContent value="pendentes" className="mt-0">
              {isInitialLoading ? (
                <ListSkeleton />
              ) : cobrancasAbertasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-[28px] border border-dashed border-gray-200">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Tudo em dia!
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Não há cobranças pendentes para {meses[mesFilter - 1]}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block bg-white rounded-2xl md:rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Passageiro
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Vencimento
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {cobrancasAbertasFiltradas.map((cobranca) => (
                            <tr
                              key={cobranca.id}
                              onClick={() => navigateToDetails(cobranca)}
                              className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm ${getStatusColor(
                                      cobranca.status,
                                      cobranca.data_vencimento
                                    )}`}
                                  >
                                    {cobranca.passageiros.nome.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">
                                      {cobranca.passageiros.nome}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {cobranca.passageiros.nome_responsavel ||
                                        "Responsável não inf."}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-bold text-gray-900 text-sm">
                                  {Number(cobranca.valor).toLocaleString(
                                    "pt-BR",
                                    { style: "currency", currency: "BRL" }
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-600 font-medium">
                                  {formatDateToBR(cobranca.data_vencimento)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={cn(
                                      "shadow-none border font-semibold",
                                      getStatusColor(
                                        cobranca.status,
                                        cobranca.data_vencimento
                                      )
                                    )}
                                  >
                                    {getStatusText(
                                      cobranca.status,
                                      cobranca.data_vencimento
                                    )}
                                  </Badge>
                                  {cobranca.desativar_lembretes &&
                                    cobranca.status !==
                                      PASSAGEIRO_COBRANCA_STATUS_PAGO && (
                                      <span title="Envio de notificações desativado">
                                        <BellOff className="w-3.5 h-3.5 text-orange-700" />
                                      </span>
                                    )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <CobrancaActions
                                  cobranca={cobranca}
                                  navigate={navigate}
                                  plano={plano}
                                  onNavigateToDetails={navigateToDetails}
                                  onEditCobranca={handleEditCobrancaClick}
                                  onOpenPaymentDialog={openPaymentDialog}
                                  onSetConfirmDialogEnvioNotificacao={(c) =>
                                    setConfirmDialogEnvioNotificacao({
                                      open: true,
                                      cobranca: c,
                                    })
                                  }
                                  onToggleLembretes={handleToggleLembretes}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Mobile List - Ultra Compact Mode (Pendentes) */}
                  <div className="md:hidden space-y-3">
                    {cobrancasAbertasFiltradas.map((cobranca) => (
                      <div
                        key={cobranca.id}
                        onClick={() => navigateToDetails(cobranca)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform duration-100"
                      >
                        {/* Linha 1: Nome + Ações (Botão isolado no topo direito) */}
                        <div className="flex justify-between items-start mb-1 relative">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm ${getStatusColor(
                                cobranca.status,
                                cobranca.data_vencimento
                              )}`}
                            >
                              {cobranca.passageiros.nome.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {cobranca.passageiros.nome}
                              </p>
                              <p className="text-xs text-gray-500">
                                {cobranca.passageiros.nome_responsavel ||
                                  "Não inf."}{" "}
                                •{" "}
                                <span className="text-sm font-bold text-gray-900 tracking-tight">
                                  {Number(cobranca.valor).toLocaleString(
                                    "pt-BR",
                                    {
                                      style: "currency",
                                      currency: "BRL",
                                    }
                                  )}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <CobrancaActions
                              cobranca={cobranca}
                              navigate={navigate}
                              plano={plano}
                              onNavigateToDetails={navigateToDetails}
                              onEditCobranca={handleEditCobrancaClick}
                              onOpenPaymentDialog={openPaymentDialog}
                              onSetConfirmDialogEnvioNotificacao={(c) =>
                                setConfirmDialogEnvioNotificacao({
                                  open: true,
                                  cobranca: c,
                                })
                              }
                              onToggleLembretes={handleToggleLembretes}
                            />
                          </div>
                        </div>

                        {/* Linha 3: Data + Status (Rodapé) */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "shadow-none border font-semibold h-6",
                                getStatusColor(
                                  cobranca.status,
                                  cobranca.data_vencimento
                                )
                              )}
                            >
                              {getStatusText(
                                cobranca.status,
                                cobranca.data_vencimento
                              )}
                            </Badge>
                            {cobranca.desativar_lembretes && (
                              <BellOff className="w-3 h-3 text-orange-700" />
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              PAGO EM
                            </span>
                            <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                              {cobranca.data_vencimento
                                ? formatDateToBR(cobranca.data_vencimento)
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Content: Pagas */}
            <TabsContent value="pagas" className="mt-0">
              {isInitialLoading ? (
                <ListSkeleton />
              ) : cobrancasPagasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-[28px] border border-dashed border-gray-200">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Nenhum pagamento
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Não há cobranças pagas registradas em {meses[mesFilter - 1]}
                    .
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block bg-white rounded-2xl md:rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Passageiro
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Data Pagamento
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Forma
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {cobrancasPagasFiltradas.map((cobranca) => (
                            <tr
                              key={cobranca.id}
                              onClick={() => navigateToDetails(cobranca)}
                              className="hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm ${getStatusColor(
                                      cobranca.status,
                                      cobranca.data_vencimento
                                    )}`}
                                  >
                                    {cobranca.passageiros.nome.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">
                                      {cobranca.passageiros.nome}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {cobranca.passageiros.nome_responsavel ||
                                        "Responsável não inf."}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-bold text-gray-900 text-sm">
                                  {Number(cobranca.valor).toLocaleString(
                                    "pt-BR",
                                    { style: "currency", currency: "BRL" }
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-600 font-medium">
                                  {cobranca.data_pagamento
                                    ? formatDateToBR(cobranca.data_pagamento)
                                    : "-"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-700 font-medium">
                                    {formatPaymentType(cobranca.tipo_pagamento)}
                                  </span>
                                  {cobranca.pagamento_manual && (
                                    <span className="text-[10px] text-gray-400">
                                      Manual
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <CobrancaActions
                                  cobranca={cobranca}
                                  navigate={navigate}
                                  onNavigateToDetails={navigateToDetails}
                                  onEditCobranca={handleEditCobrancaClick}
                                  onSetConfirmDialogDesfazer={(id) =>
                                    setConfirmDialogDesfazer({
                                      open: true,
                                      cobrancaId: id,
                                    })
                                  }
                                  isPaga={true}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile List - Ultra Compact Mode (Pagas) */}
                  <div className="md:hidden space-y-3">
                    {cobrancasPagasFiltradas.map((cobranca) => (
                      <div
                        key={cobranca.id}
                        onClick={() => navigateToDetails(cobranca)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform duration-100"
                      >
                        {/* Linha 1: Avatar + Informações Principais + Ações */}
                        <div className="flex justify-between items-start mb-1 relative">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm ${getStatusColor(
                                cobranca.status,
                                cobranca.data_vencimento
                              )}`}
                            >
                              {cobranca.passageiros.nome.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {cobranca.passageiros.nome}
                              </p>
                              <p className="text-xs text-gray-500">
                                {cobranca.passageiros.nome_responsavel ||
                                  "Não inf."}{" "}
                                •{" "}
                                <span className="text-sm font-bold text-gray-900 tracking-tight">
                                  {Number(cobranca.valor).toLocaleString(
                                    "pt-BR",
                                    {
                                      style: "currency",
                                      currency: "BRL",
                                    }
                                  )}
                                </span>
                              </p>
                            </div>
                          </div>
                          {/* Botão de Ações */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <CobrancaActions
                              cobranca={cobranca}
                              navigate={navigate}
                              onNavigateToDetails={navigateToDetails}
                              onEditCobranca={handleEditCobrancaClick}
                              onSetConfirmDialogDesfazer={(id) =>
                                setConfirmDialogDesfazer({
                                  open: true,
                                  cobrancaId: id,
                                })
                              }
                              isPaga={true}
                            />
                          </div>
                        </div>

                        {/* Linha 2: Rodapé com Metadados (Separador) */}

                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              FORMA DE PAGAMENTO
                            </span>
                            {/* Esquerda: Forma de Pagamento (Badge Cinza Elegante) */}
                            <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                              {formatPaymentType(cobranca.tipo_pagamento)}
                            </p>
                          </div>

                          {/* Direita: Data de Pagamento (Label + Data) */}
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              PAGO EM
                            </span>
                            <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                              {cobranca.data_pagamento
                                ? formatDateToBR(cobranca.data_pagamento)
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          {paymentDialogOpen && selectedCobranca && (
            <ManualPaymentDialog
              isOpen={paymentDialogOpen}
              onClose={() => safeCloseDialog(() => setPaymentDialogOpen(false))}
              cobrancaId={selectedCobranca.id}
              passageiroNome={selectedCobranca.passageiros.nome}
              responsavelNome={selectedCobranca.passageiros.nome_responsavel}
              valorOriginal={Number(selectedCobranca.valor)}
              onPaymentRecorded={async () => {
                setPaymentDialogOpen(false);
                // Refetch explícito para garantir que os KPIs sejam atualizados
                await refetchCobrancas();
              }}
            />
          )}

          <ConfirmationDialog
            open={confirmDialogEnvioNotificacao.open}
            onOpenChange={(open) =>
              setConfirmDialogEnvioNotificacao({
                open,
                cobranca: null,
              })
            }
            title="Enviar Lembrete"
            description="Deseja enviar esta notificação para o responsável?"
            onConfirm={enviarNotificacaoCobranca}
            isLoading={enviarNotificacao.isPending}
          />
          <ConfirmationDialog
            open={confirmDialogDesfazer.open}
            onOpenChange={(open) =>
              setConfirmDialogDesfazer({ open, cobrancaId: "" })
            }
            title="Desfazer Pagamento"
            description="Deseja realmente desfazer o pagamento desta cobrança?"
            onConfirm={handleDesfazerPagamento}
            variant="destructive"
            confirmText="Confirmar"
            isLoading={desfazerPagamento.isPending}
          />

          {cobrancaToEdit && (
            <CobrancaEditDialog
              isOpen={editDialogOpen}
              onClose={() => safeCloseDialog(() => setEditDialogOpen(false))}
              cobranca={cobrancaToEdit}
              onCobrancaUpdated={handleCobrancaUpdated}
            />
          )}
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
    </>
  );
};

export default Cobrancas;
