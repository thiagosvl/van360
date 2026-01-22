// React
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { ROUTES } from "@/constants/routes";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AutomaticChargesPrompt } from "@/components/alerts/AutomaticChargesPrompt";
import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";

import { CobrancasFilters } from "@/components/features/cobranca/CobrancasFilters";
import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

import { useCobrancas, useDeleteCobranca } from "@/hooks";

import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

import {
    meses,
} from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";

import { Cobranca } from "@/types/cobranca";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FEATURE_COBRANCA_AUTOMATICA } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import {
    CheckCircle2,
    TrendingUp,
    Wallet,
} from "lucide-react";


const Cobrancas = () => {
  const {
    setPageTitle,
    openPlanUpgradeDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
    openCobrancaEditDialog,
    openCobrancaPixDrawer,
    openManualPaymentDialog,
  } = useLayout();
  const [searchParams, setSearchParams] = useSearchParams();

  const deleteCobranca = useDeleteCobranca();
  const isActionLoading = deleteCobranca.isPending;

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["pendentes", "pagas"];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "pendentes";
  }, [searchParams]);

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

  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());

  const { user, loading: isSessionLoading } = useSession();
  const { profile, plano, isLoading: isProfileLoading } = useProfile(user?.id);
  const permissions = usePermissions();

  const handleUpgrade = useCallback(
    (feature: string, description?: string) => {
      openPlanUpgradeDialog({
        onSuccess: refetchCobrancas,
        feature,
        title: description ? "Cobrança Automática" : undefined,
        description,
      });
    },
    [openPlanUpgradeDialog]
  );

  const [buscaAbertas, setBuscaAbertas] = useState("");
  const [buscaPagas, setBuscaPagas] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const term = activeTab === "pendentes" ? buscaAbertas : buscaPagas;
    const handler = setTimeout(() => {
        setDebouncedSearchTerm(term);
    }, 500);
    return () => clearTimeout(handler);
  }, [buscaAbertas, buscaPagas, activeTab]);

  const {
    data: cobrancasData,
    isLoading: isCobrancasLoading,
    refetch: refetchCobrancas,
  } = useCobrancas(
    {
      usuarioId: profile?.id,
      mes: mesFilter,
      ano: anoFilter,
      search: debouncedSearchTerm,
    },
    {
      enabled: !!profile?.id,
      onError: (error) => {
        toast.error("cobranca.erro.carregar");
        console.error(error);
      },
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
  const handleEditCobrancaClick = useCallback(
    (cobranca: Cobranca) => {
      openCobrancaEditDialog({
        cobranca,
      });
    },
    [openCobrancaEditDialog]
  );

  const handleDeleteCobrancaClick = useCallback(
    (cobranca: Cobranca) => {
      openConfirmationDialog({
        title: "Excluir cobrança?",
        description:
          "Tem certeza que deseja excluir esta cobrança? Essa ação não poderá ser desfeita.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteCobranca.mutateAsync(cobranca.id);
            closeConfirmationDialog();
          } catch (error) {
            closeConfirmationDialog();
            // Error handled by hook or generic handling
          }
        },
      });
    },
    [deleteCobranca, closeConfirmationDialog, refetchCobrancas]
  );

  const handleNavigation = useCallback((newMes: number, newAno: number) => {
    setMesFilter(newMes);
    setAnoFilter(newAno);
  }, []);

  const openPaymentDialog = useCallback(
    (cobranca: Cobranca) => {
      openManualPaymentDialog({
        cobrancaId: cobranca.id,
        passageiroNome: cobranca.passageiro.nome,
        responsavelNome: cobranca.passageiro.nome_responsavel,
        valorOriginal: Number(cobranca.valor),
        status: cobranca.status,
        dataVencimento: cobranca.data_vencimento,
        onPaymentRecorded: () => {},
      });
    },
    [openManualPaymentDialog]
  );

  const handlePagarPix = useCallback(
    (cobranca: Cobranca) => {
      openCobrancaPixDrawer({
        qrCodePayload: cobranca.qr_code_payload || "",
        valor: Number(cobranca.valor),
        passageiroNome: cobranca.passageiro.nome,
        mes: cobranca.mes,
        ano: cobranca.ano,
      });
    },
    [openCobrancaPixDrawer]
  );

  const navigateToDetails = useCallback(
    (cobranca: Cobranca) => {
      navigate(
        ROUTES.PRIVATE.MOTORISTA.PASSENGER_BILLING.replace(
          ":cobranca_id",
          cobranca.id
        )
      );
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

  // Filtering (Server Side)
  const cobrancasAbertasFiltradas = cobrancasAbertas;
  const cobrancasPagasFiltradas = cobrancasPagas;

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

  // Common Action Props
  const actionProps = {
    onVerCobranca: navigateToDetails,
    onVerCarteirinha: (id: string) => navigate(`/passageiros/${id}`),
    onEditarCobranca: handleEditCobrancaClick,
    onRegistrarPagamento: openPaymentDialog,
    onPagarPix: handlePagarPix,
    onExcluirCobranca: handleDeleteCobrancaClick,
    onActionSuccess: () => {},
    onUpgrade: handleUpgrade
  };

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
          {!permissions.canUseAutomatedCharges && (
            <div>
              <AutomaticChargesPrompt
                variant="slim-desktop"
                onUpgrade={() => handleUpgrade(FEATURE_COBRANCA_AUTOMATICA)}
              />
            </div>
          )}

          {/* 3. Main Content (Tabs & List) */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
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
               <CobrancasList
                  variant="pending"
                  cobrancas={cobrancasAbertasFiltradas}
                  isLoading={isInitialLoading}
                  busca={buscaAbertas}
                  mesFilter={mesFilter}
                  meses={meses}
                  plano={plano}
                  permissions={permissions}
                  {...actionProps}
               />
            </TabsContent>

            {/* Content: Pagas */}
            <TabsContent value="pagas" className="mt-0">
                <CobrancasList
                  variant="paid"
                  cobrancas={cobrancasPagasFiltradas}
                  isLoading={isInitialLoading}
                  busca={buscaPagas}
                  mesFilter={mesFilter}
                  meses={meses}
                  plano={plano}
                  permissions={permissions}
                  {...actionProps}
               />
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
};

export default Cobrancas;
