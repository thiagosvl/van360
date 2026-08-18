import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLayout } from "@/contexts/LayoutContext";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useCobrancas, useDeleteCobranca, useFilters } from "@/hooks";
import { CobrancaTab } from "@/types/enums";
import { Cobranca } from "@/types/cobranca";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/utils/notifications/toast";

import { getNowBR } from "@/utils/dateUtils";
import { checkCobrancaEmAtraso, getCobrancaValorExibicao } from "@/utils/formatters/cobranca";

export function useCobrancasViewModel() {
  const { can, isSubConta } = usePermissions();
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

  const cobrancaFilters = useMemo(
    () => ({
      usuarioId: profile?.id,
      mes: mesFilter,
      ano: anoFilter,
      veiculoId: isSubConta && profile?.veiculo_id ? profile.veiculo_id : undefined,
      search: debouncedSearchTerm,
    }),
    [profile?.id, profile?.veiculo_id, mesFilter, anoFilter, debouncedSearchTerm, isSubConta]
  );

  const {
    data: cobrancasData,
    isLoading: isCobrancasLoading,
    refetch: refetchCobrancas,
  } = useCobrancas(cobrancaFilters, {
    enabled: !!profile?.id && (can("cobrancas.gerenciar") || can("financeiro.visualizar")),
    onError: () => {
      toast.error("cobranca.erro.carregar");
    },
  });

  const cobrancasAReceber = useMemo(() => {
    const list = cobrancasData?.areceber ?? [];

    const sorted = [...list].sort((a, b) => {
      const isAtrasadoA = checkCobrancaEmAtraso(a.data_vencimento);
      const isAtrasadoB = checkCobrancaEmAtraso(b.data_vencimento);

      if (isAtrasadoA && !isAtrasadoB) return -1;
      if (!isAtrasadoA && isAtrasadoB) return 1;

      const timeA = a.data_vencimento ? new Date(a.data_vencimento).getTime() : 0;
      const timeB = b.data_vencimento ? new Date(b.data_vencimento).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;

      const nomeA = a.passageiro?.nome || "";
      const nomeB = b.passageiro?.nome || "";
      return nomeA.localeCompare(nomeB, "pt-BR");
    });

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      return sorted.filter(
        (c) =>
          c.passageiro?.nome?.toLowerCase().includes(term) ||
          c.passageiro?.responsavel_principal?.nome?.toLowerCase().includes(term)
      );
    }

    return isPastMonth ? sorted.reverse() : sorted;
  }, [cobrancasData, isPastMonth, debouncedSearchTerm]);

  const cobrancasRecebidas = useMemo(() => {
    const list = cobrancasData?.recebidos ?? [];

    const sorted = [...list].sort((a, b) => {
      const timeA = a.data_pagamento
        ? new Date(a.data_pagamento).getTime()
        : (a.data_vencimento ? new Date(a.data_vencimento).getTime() : 0);
      const timeB = b.data_pagamento
        ? new Date(b.data_pagamento).getTime()
        : (b.data_vencimento ? new Date(b.data_vencimento).getTime() : 0);

      if (timeA !== timeB) return timeB - timeA;

      const nomeA = a.passageiro?.nome || "";
      const nomeB = b.passageiro?.nome || "";
      return nomeA.localeCompare(nomeB, "pt-BR");
    });

    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      return sorted.filter(
        (c) =>
          c.passageiro?.nome?.toLowerCase().includes(term) ||
          c.passageiro?.responsavel_principal?.nome?.toLowerCase().includes(term)
      );
    }

    return sorted;
  }, [cobrancasData, debouncedSearchTerm]);

  const isInitialLoading = isCobrancasLoading || isProfileLoading || !cobrancasData;

  useEffect(() => {
    setPageTitle("Parcelas");
  }, [setPageTitle]);

  const totalAReceber = useMemo(
    () => cobrancasAReceber.reduce((acc, curr) => acc + Number(curr.valor), 0),
    [cobrancasAReceber]
  );

  const totalRecebido = useMemo(
    () => cobrancasRecebidas.reduce((acc, curr) => acc + getCobrancaValorExibicao(curr), 0),
    [cobrancasRecebidas]
  );

  const totalAtrasado = useMemo(
    () => cobrancasAReceber
      .filter((c) => checkCobrancaEmAtraso(c.data_vencimento))
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
          await deleteCobranca.mutateAsync(cobranca.id);
          refetchCobrancas();
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
        responsavelNome: cobranca.passageiro.responsavel_principal?.nome || "",
        valorOriginal: Number(cobranca.valor),
        status: cobranca.status,
        dataVencimento: cobranca.data_vencimento,
        onPaymentRecorded: (updatedCobranca, dataSent) => {
          refetchCobrancas();
          if (dataSent?.enviar_recibo_whatsapp === false && updatedCobranca?.recibo_url) {
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
    pullToRefreshReload,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
  };
}
