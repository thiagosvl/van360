// React
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

// React Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Components - Common
import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
// Components - Alerts
import { AutomaticChargesPrompt } from "@/components/alerts/AutomaticChargesPrompt";

// Components - Features
import { CobrancaActionsMenu } from "@/components/features/cobranca/CobrancaActionsMenu";

// Components - Dialogs
import CobrancaEditDialog from "@/components/dialogs/CobrancaEditDialog";


import ManualPaymentDialog from "@/components/dialogs/ManualPaymentDialog";

// Components - Empty & Skeletons
import { CobrancasFilters } from "@/components/features/cobranca/CobrancasFilters";
import { ListSkeleton } from "@/components/skeletons";
import {
  useCobrancas
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";

// Utils
import { safeCloseDialog } from "@/utils/dialogUtils";
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
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Badge } from "@/components/ui/badge";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  PASSAGEIRO_COBRANCA_STATUS_PAGO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { cn } from "@/lib/utils";
import { BellOff, CheckCircle2, DollarSign, TrendingUp, Wallet } from "lucide-react";

// --- Internal Components ---



// --- Main Component ---

const Cobrancas = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cobrancaToEdit, setCobrancaToEdit] = useState<Cobranca | null>(null);

  const { setPageTitle, openLimiteFranquiaDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state from URL
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["pendentes", "pagas"];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "pendentes"; // Default
  }, [searchParams]);

  // Sync tab to URL on mount if not present
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (!currentTab || !["pendentes", "pagas"].includes(currentTab)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", "pendentes");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", value);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Date State
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );

  // Dialog States



  
  const { user, loading: isSessionLoading } = useSession();
  const { profile, plano, isLoading: isProfileLoading } = useProfile(user?.id);

  const { 
    handleToggleLembretes, 
    handleEnviarNotificacao, 
    handleDesfazerPagamento,
    handleDeleteCobranca,
    handleUpgrade,
    isActionLoading
  } = useCobrancaActions({
     plano: plano,
     onActionSuccess: () => {
         // Optionally refetch actions
     }
  });



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

  const handleCobrancaUpdated = useCallback(() => {
    refetchCobrancas();
    setEditDialogOpen(false);
  }, [refetchCobrancas]);

  const handleNavigation = useCallback((newMes: number, newAno: number) => {
    setMesFilter(newMes);
    setAnoFilter(newAno);
  }, []);



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

          {/* Alerta Automático (Desktop Slim) */}
          {plano?.slug &&
            [PLANO_GRATUITO, PLANO_ESSENCIAL].includes(plano.slug) && (
              <div>
                <AutomaticChargesPrompt 
                  variant="slim-desktop" 
                  onUpgrade={() => handleUpgrade(
                    "Cobranças Automáticas",
                    "Automatize o envio de cobranças e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
                  )}
                />
              </div>
            )}

          {/* 3. Main Content (Tabs & List) */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <CobrancasFilters 
               onUpgrade={handleUpgrade}
               plano={plano}
               buscaAbertas={buscaAbertas}
               setBuscaAbertas={setBuscaAbertas}
               buscaPagas={buscaPagas}
               setBuscaPagas={setBuscaPagas}
               countAbertas={cobrancasAbertas.length}
               countPagas={cobrancasPagas.length}
            />

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
                                <CobrancaActionsMenu
                                  cobranca={cobranca}
                                  plano={plano}
                                  onVerCarteirinha={() =>
                                    navigate(`/passageiros/${cobranca.passageiro_id}`)
                                  }
                                  onVerCobranca={() => navigateToDetails(cobranca)}
                                  onEditarCobranca={() => handleEditCobrancaClick(cobranca)}
                                  onRegistrarPagamento={() => openPaymentDialog(cobranca)}
                                  onEnviarNotificacao={() => handleEnviarNotificacao(cobranca)}
                                  onToggleLembretes={() => handleToggleLembretes(cobranca)}
                                  onDesfazerPagamento={() => handleDesfazerPagamento(cobranca)}
                                  onExcluirCobranca={() => handleDeleteCobranca(cobranca)}
                                  onUpgrade={handleUpgrade}
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
                    {cobrancasAbertasFiltradas.map((cobranca, index) => (
                      <Fragment key={cobranca.id}>
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
                            <CobrancaActionsMenu
                              cobranca={cobranca}
                              variant="mobile"
                              plano={plano}
                              onVerCarteirinha={() =>
                                navigate(`/passageiros/${cobranca.passageiro_id}`)
                              }
                              onVerCobranca={() => navigateToDetails(cobranca)}
                              onEditarCobranca={() => handleEditCobrancaClick(cobranca)}
                              onRegistrarPagamento={() => openPaymentDialog(cobranca)}
                              onEnviarNotificacao={() => handleEnviarNotificacao(cobranca)}
                              onToggleLembretes={() => handleToggleLembretes(cobranca)}
                              onDesfazerPagamento={() => handleDesfazerPagamento(cobranca)}
                              onExcluirCobranca={() => handleDeleteCobranca(cobranca)}
                              onUpgrade={handleUpgrade}
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
                              VENCIMENTO
                            </span>
                            <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                              {cobranca.data_vencimento
                                ? formatDateToBR(cobranca.data_vencimento)
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inline Prompt Mobile (Após o 3º item) */}
                      {index === 2 && plano?.slug && [PLANO_GRATUITO, PLANO_ESSENCIAL].includes(plano.slug) && (
                        <AutomaticChargesPrompt 
                          variant="inline-mobile"
                          onUpgrade={() => handleUpgrade(
                            "Cobranças Automáticas",
                            "Automatize o envio de cobranças e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
                          )}
                        />
                      )}
                      </Fragment>
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
                                      Pagamento Registrado Manualmente
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <CobrancaActionsMenu
                                  cobranca={cobranca}
                                  plano={plano}
                                  onVerCarteirinha={() =>
                                    navigate(`/passageiros/${cobranca.passageiro_id}`)
                                  }
                                  onVerCobranca={() => navigateToDetails(cobranca)}
                                  onEditarCobranca={() => handleEditCobrancaClick(cobranca)}
                                  onRegistrarPagamento={() => openPaymentDialog(cobranca)}
                                  onEnviarNotificacao={() => handleEnviarNotificacao(cobranca)}
                                  onToggleLembretes={() => handleToggleLembretes(cobranca)}
                                  onDesfazerPagamento={() => handleDesfazerPagamento(cobranca)}
                                  onExcluirCobranca={() => handleDeleteCobranca(cobranca)}
                                  onUpgrade={handleUpgrade}
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
                            <CobrancaActionsMenu
                              cobranca={cobranca}
                              variant="mobile"
                              plano={plano}
                              onVerCarteirinha={() =>
                                navigate(`/passageiros/${cobranca.passageiro_id}`)
                              }
                              onVerCobranca={() => navigateToDetails(cobranca)}
                              onEditarCobranca={() => handleEditCobrancaClick(cobranca)}
                              onRegistrarPagamento={() => openPaymentDialog(cobranca)}
                              onEnviarNotificacao={() => handleEnviarNotificacao(cobranca)}
                              onToggleLembretes={() => handleToggleLembretes(cobranca)}
                              onDesfazerPagamento={() => handleDesfazerPagamento(cobranca)}
                              onExcluirCobranca={() => handleDeleteCobranca(cobranca)}
                              onUpgrade={handleUpgrade}
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
              status={selectedCobranca.status}
              dataVencimento={selectedCobranca.data_vencimento}
              onPaymentRecorded={() => {
                setPaymentDialogOpen(false);
                if (plano?.slug && [PLANO_GRATUITO, PLANO_ESSENCIAL].includes(plano.slug)) {
                  handleUpgrade("Cobranças Automáticas", "Pagamento registrado! Sabia que o sistema pode dar baixa automática para você?");
                }
              }}
            />
          )}



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
