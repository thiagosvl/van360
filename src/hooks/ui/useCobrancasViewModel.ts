import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLayout } from "@/contexts/LayoutContext";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useCobrancas, useDeleteCobranca, useFilters, usePassageiros } from "@/hooks";
import { CobrancaOrigem, CobrancaStatus, CobrancaTab } from "@/types/enums";
import { Cobranca } from "@/types/cobranca";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/utils/notifications/toast";

import { getNowBR } from "@/utils/dateUtils";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import { isPassageiroIncompleto, shouldGeneratePassengerProjection } from "@/utils/domain";

export function useCobrancasViewModel() {
  const {
    setPageTitle,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    openManualPaymentDialog,
    openReceiptDialog,
  } = useLayout();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const deleteCobranca = useDeleteCobranca();
  const isActionLoading = deleteCobranca.isPending;

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", value);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === CobrancaTab.ARECEBER || tabParam === CobrancaTab.RECEBIDAS) {
      return tabParam as CobrancaTab;
    }
    return CobrancaTab.ARECEBER;
  }, [searchParams]);

  const {
    selectedMes: mesFilter = getNowBR().getMonth() + 1,
    setSelectedMes: setMesFilter,
    selectedAno: anoFilter = getNowBR().getFullYear(),
    setSelectedAno: setAnoFilter,
    searchTerm: commonSearch,
    setSearchTerm: setCommonSearch,
    setFilters
  } = useFilters({
    mesParam: "mes",
    anoParam: "ano",
    searchParam: "search",
  });

  const buscaAReceber = commonSearch;
  const setBuscaAReceber = setCommonSearch;
  const buscaRecebidos = commonSearch;
  const setBuscaRecebidos = setCommonSearch;

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const handleNavigation = useCallback((newMes: number, newAno: number) => {
    setFilters({ mes: newMes, ano: newAno });
  }, [setFilters]);

  useEffect(() => {
    const term = activeTab === CobrancaTab.ARECEBER ? buscaAReceber : buscaRecebidos;
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, 500);
    return () => clearTimeout(handler);
  }, [buscaAReceber, buscaRecebidos, activeTab]);

  useEffect(() => {
    setBuscaAReceber("");
    setBuscaRecebidos("");
  }, [mesFilter, anoFilter]);

  const now = getNowBR();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const isFutureMonth = useMemo(
    () => anoFilter > currentYear || (anoFilter === currentYear && mesFilter > currentMonth),
    [anoFilter, mesFilter, currentYear, currentMonth]
  );

  const isCurrentMonth = useMemo(
    () => anoFilter === currentYear && mesFilter === currentMonth,
    [anoFilter, mesFilter, currentYear, currentMonth]
  );

  const isPastMonth = useMemo(
    () => anoFilter < currentYear || (anoFilter === currentYear && mesFilter < currentMonth),
    [anoFilter, mesFilter, currentYear, currentMonth]
  );

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
      onError: () => {
        toast.error("cobranca.erro.carregar");
      },
    }
  );

  const { data: passageirosData } = usePassageiros(
    { usuarioId: profile?.id, status: "true" },
    { enabled: !!profile?.id }
  );

  const activePassageiros = useMemo(() => {
    if (!passageirosData) return [];
    return Array.isArray(passageirosData) ? passageirosData : passageirosData.list;
  }, [passageirosData]);

  const cobrancasAReceber = useMemo(() => {
    const realList = cobrancasData?.areceber ?? [];
    const realRecebidos = cobrancasData?.recebidos ?? [];

    if (isPastMonth) {
      return [...realList].reverse();
    }

    const passageirosComCobranca = new Set([
      ...realList.map((c) => c.passageiro_id),
      ...realRecebidos.map((c) => c.passageiro_id),
    ]);

    const driverCreatedAt = profile?.created_at;

    const projList: Cobranca[] = activePassageiros
      .filter((p) => {
        if (!p.id || passageirosComCobranca.has(p.id)) return false;
        if (isPassageiroIncompleto(p)) return false;
        return shouldGeneratePassengerProjection({
          passageiro: p,
          driverCreatedAt,
          targetMonth: mesFilter,
          targetYear: anoFilter,
        });
      })
      .map((p) => {
        const diaVenc = p.dia_vencimento ? String(p.dia_vencimento).padStart(2, "0") : "10";
        const mesStr = String(mesFilter).padStart(2, "0");
        const dataVenc = `${anoFilter}-${mesStr}-${diaVenc}`;

        return {
          id: `proj_${p.id}_${mesFilter}_${anoFilter}`,
          passageiro_id: p.id!,
          mes: mesFilter,
          ano: anoFilter,
          valor: Number(p.valor_cobranca),
          status: CobrancaStatus.PENDENTE,
          data_vencimento: dataVenc,
          origem: CobrancaOrigem.AUTOMATICA,
          isProjection: true,
          passageiro: p,
        };
      });

    const combined = [...realList, ...projList];

    combined.sort((a, b) => {
      const timeA = a.data_vencimento ? new Date(a.data_vencimento).getTime() : 0;
      const timeB = b.data_vencimento ? new Date(b.data_vencimento).getTime() : 0;
      return timeA - timeB;
    });

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      return combined.filter(
        (c) =>
          c.passageiro?.nome?.toLowerCase().includes(term) ||
          c.passageiro?.nome_responsavel?.toLowerCase().includes(term)
      );
    }

    return combined;
  }, [cobrancasData, activePassageiros, isPastMonth, mesFilter, anoFilter, debouncedSearchTerm]);

  const cobrancasRecebidas = useMemo(() => cobrancasData?.recebidos ?? [], [cobrancasData]);
  const isInitialLoading = isCobrancasLoading;

  useEffect(() => {
    setPageTitle("Parcelas");
  }, [setPageTitle]);

  const totalAReceber = useMemo(
    () => cobrancasAReceber.reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasAReceber]
  );

  const totalRecebido = useMemo(
    () => cobrancasRecebidas.reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasRecebidas]
  );

  const totalAtrasado = useMemo(
    () => cobrancasAReceber
      .filter((c) => !c.isProjection && checkCobrancaEmAtraso(c.data_vencimento))
      .reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasAReceber]
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
        onPaymentRecorded: (updatedCobranca) => {
          refetchCobrancas();
          if (updatedCobranca?.recibo_url) {
            openReceiptDialog({
              receiptUrl: updatedCobranca.recibo_url,
              cobrancaDescricao: `Recibo de ${cobranca.mes}/${cobranca.ano} - ${cobranca.passageiro?.nome || ""}`,
            });
          }
        },
      });
    },
    [openManualPaymentDialog, openReceiptDialog, refetchCobrancas]
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

  const pullToRefreshReload = useCallback(async () => {
    await refetchCobrancas();
  }, [refetchCobrancas]);

  return {
    profile,
    isProfileLoading: isSessionLoading || isProfileLoading,
    mesFilter,
    anoFilter,
    handleNavigation,
    totalAReceber,
    totalRecebido,
    totalAtrasado,
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
    isFutureMonth,
    isPastMonth,
    isCurrentMonth,
    totalPassageirosCount: activePassageiros.length,
    // Actions
    pullToRefreshReload,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
  };
}
