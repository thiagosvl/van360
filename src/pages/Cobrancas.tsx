// React
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ROUTES } from "@/constants/routes";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";

import { CobrancasList } from "@/components/features/cobranca/CobrancasList";
import { CobrancasToolbar } from "@/components/features/cobranca/CobrancasToolbar";
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
import { useLayout } from "@/contexts/LayoutContext";
import {
  CheckCircle2,
  TrendingUp,
  Wallet,
} from "lucide-react";


const Cobrancas = () => {

  const {
    setPageTitle,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    openManualPaymentDialog,
  } = useLayout();
  const [searchParams, setSearchParams] = useSearchParams();

  const deleteCobranca = useDeleteCobranca();
  const isActionLoading = deleteCobranca.isPending;

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["areceber", "recebidos"];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "areceber";
  }, [searchParams]);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (!currentTab || !["areceber", "recebidos"].includes(currentTab)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", "areceber");
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
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const [buscaAReceber, setBuscaAReceber] = useState("");
  const [buscaRecebidos, setBuscaRecebidos] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const term = activeTab === "areceber" ? buscaAReceber : buscaRecebidos;
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, 500);
    return () => clearTimeout(handler);
  }, [buscaAReceber, buscaRecebidos, activeTab]);

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
        console.error("Erro ao carregar mensalidades:", error);
        toast.error("cobranca.erro.carregar");
      },
    }
  );

  const cobrancasAReceber = useMemo(
    () => cobrancasData?.areceber ?? [],
    [cobrancasData]
  );
  const cobrancasRecebidas = useMemo(
    () => cobrancasData?.recebidos ?? [],
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
      openCobrancaDeleteDialog({
        onConfirm: async () => {
          try {
            await deleteCobranca.mutateAsync(cobranca.id);
          } catch (error) {
            throw error;
          }
        },
        onEdit: () => {
          openCobrancaEditDialog({
            cobranca,
          });
        }
      });
    },
    [deleteCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog]
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
        onPaymentRecorded: () => { },
      });
    },
    [openManualPaymentDialog]
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
    setPageTitle("Mensalidades");
  }, [setPageTitle]);

  useEffect(() => {
    if (mesFilter || anoFilter) {
      setBuscaAReceber("");
      setBuscaRecebidos("");
    }
  }, [mesFilter, anoFilter]);

  // KPI Calculations
  const totalAReceber = useMemo(
    () => cobrancasAReceber.reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasAReceber]
  );

  const totalRecebido = useMemo(
    () => cobrancasRecebidas.reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasRecebidas]
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

    onExcluirCobranca: handleDeleteCobrancaClick,
    onActionSuccess: () => { },
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
              count={cobrancasAReceber.length}
              icon={Wallet}
              bgClass="bg-orange-50"
              colorClass="text-orange-600"
            />
            <KPICard
              title="Recebido"
              value={totalRecebido}
              count={cobrancasRecebidas.length}
              icon={CheckCircle2}
              bgClass="bg-green-50"
              colorClass="text-green-600"
            />
            <KPICard
              title="Total Previsto"
              value={totalPrevisto}
              count={cobrancasAReceber.length + cobrancasRecebidas.length}
              icon={TrendingUp}
              bgClass="bg-blue-50"
              colorClass="text-blue-600"
              className="col-span-2 md:col-span-1"
            />
          </div>

          {/* 3. Main Content (Tabs & List) */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <CobrancasToolbar
              buscaAReceber={buscaAReceber}
              setBuscaAReceber={setBuscaAReceber}
              buscaRecebidos={buscaRecebidos}
              setBuscaRecebidos={setBuscaRecebidos}
              countAReceber={cobrancasAReceber.length}
              countRecebidos={cobrancasRecebidas.length}
              activeTab={activeTab}
            />

            {/* Content: A Receber */}
            <TabsContent value="areceber" className="mt-0">
              <CobrancasList
                variant="pending"
                cobrancas={cobrancasAReceber}
                isLoading={isInitialLoading}
                busca={buscaAReceber}
                mesFilter={mesFilter}
                meses={meses}
                {...actionProps}
              />
            </TabsContent>

            {/* Content: Recebidos */}
            <TabsContent value="recebidos" className="mt-0">
              <CobrancasList
                variant="paid"
                cobrancas={cobrancasRecebidas}
                isLoading={isInitialLoading}
                busca={buscaRecebidos}
                mesFilter={mesFilter}
                meses={meses}
                {...actionProps}
              />
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="sistema.sucesso.processando" />
    </>
  );
};

export default Cobrancas;
