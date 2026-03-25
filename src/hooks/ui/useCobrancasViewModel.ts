import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLayout } from "@/contexts/LayoutContext";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useCobrancas, useDeleteCobranca } from "@/hooks";
import { CobrancaTab } from "@/types/enums";
import { Cobranca } from "@/types/cobranca";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/utils/notifications/toast";

export function useCobrancasViewModel() {
  const {
    setPageTitle,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    openManualPaymentDialog,
  } = useLayout();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  
  const deleteCobranca = useDeleteCobranca();
  const isActionLoading = deleteCobranca.isPending;

  // Tabs Management
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === CobrancaTab.ARECEBER || tabParam === CobrancaTab.RECEBIDOS) {
      return tabParam as CobrancaTab;
    }
    return CobrancaTab.ARECEBER;
  }, [searchParams]);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (!currentTab || !Object.values(CobrancaTab).includes(currentTab as CobrancaTab)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", CobrancaTab.ARECEBER);
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

  // Filters
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [buscaAReceber, setBuscaAReceber] = useState("");
  const [buscaRecebidos, setBuscaRecebidos] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const handleNavigation = useCallback((newMes: number, newAno: number) => {
    setMesFilter(newMes);
    setAnoFilter(newAno);
  }, []);

  // Search Debounce
  useEffect(() => {
    const term = activeTab === CobrancaTab.ARECEBER ? buscaAReceber : buscaRecebidos;
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, 500);
    return () => clearTimeout(handler);
  }, [buscaAReceber, buscaRecebidos, activeTab]);

  // Reset search when date changes
  useEffect(() => {
    setBuscaAReceber("");
    setBuscaRecebidos("");
  }, [mesFilter, anoFilter]);

  // Data Fetching
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

  const cobrancasAReceber = useMemo(() => cobrancasData?.areceber ?? [], [cobrancasData]);
  const cobrancasRecebidas = useMemo(() => cobrancasData?.recebidos ?? [], [cobrancasData]);
  const isInitialLoading = isCobrancasLoading && !cobrancasData;

  // Page Title
  useEffect(() => {
    setPageTitle("Mensalidades");
  }, [setPageTitle]);

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

  // Handlers
  const handleEditCobrancaClick = useCallback(
    (cobranca: Cobranca) => {
      openCobrancaEditDialog({
        cobranca,
        onSuccess: () => refetchCobrancas(),
      });
    },
    [openCobrancaEditDialog, refetchCobrancas]
  );

  const handleDeleteCobrancaClick = useCallback(
    (cobranca: Cobranca) => {
      openCobrancaDeleteDialog({
        onConfirm: async () => {
          try {
            await deleteCobranca.mutateAsync(cobranca.id);
            refetchCobrancas();
          } catch (error) {
            throw error;
          }
        },
        onEdit: () => {
          openCobrancaEditDialog({
            cobranca,
            onSuccess: () => refetchCobrancas(),
          });
        }
      });
    },
    [deleteCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog, refetchCobrancas]
  );

  const openPaymentDialog = useCallback(
    (cobranca: Cobranca) => {
      openManualPaymentDialog({
        cobrancaId: cobranca.id,
        passageiroNome: cobranca.passageiro.nome,
        responsavelNome: cobranca.passageiro.nome_responsavel,
        valorOriginal: Number(cobranca.valor),
        status: cobranca.status,
        dataVencimento: cobranca.data_vencimento,
        onPaymentRecorded: () => {
          refetchCobrancas();
        },
      });
    },
    [openManualPaymentDialog, refetchCobrancas]
  );


  const navigateToPassageiro = useCallback(
    (passageiroId: string) => {
      navigate(
        ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
          ":passageiro_id",
          passageiroId
        )
      );
    },
    [navigate]
  );

  const pullToRefreshReload = async () => {
    await refetchCobrancas();
  };

  return {
    profile,
    isProfileLoading: isSessionLoading || isProfileLoading,
    mesFilter,
    anoFilter,
    handleNavigation,
    totalAReceber,
    totalRecebido,
    totalPrevisto,
    countAReceber: cobrancasAReceber.length,
    countRecebidos: cobrancasRecebidas.length,
    activeTab,
    handleTabChange,
    buscaAReceber,
    setBuscaAReceber,
    buscaRecebidos,
    setBuscaRecebidos,
    cobrancasAReceber,
    cobrancasRecebidas,
    isInitialLoading,
    isActionLoading,
    pullToRefreshReload,
    // Actions
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
  };
}
