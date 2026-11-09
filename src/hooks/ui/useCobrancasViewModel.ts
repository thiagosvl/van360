import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLayout } from "@/contexts/LayoutContext";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { usePermissions } from "@/hooks/business/usePermissions";
import {
  useCobrancas,
  useCreateCobranca,
  useDeleteCobranca,
  useFilters,
  usePassageiros,
  useMotoristaFinanceiroApi,
  safeCloseDialog,
} from "@/hooks";
import { CobrancaStatus, CobrancaTab, ModoCobrancaEnum } from "@/types/enums";
import { Cobranca } from "@/types/cobranca";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/utils/notifications/toast";
import { getNowBR, getStartOfDayBR } from "@/utils/dateUtils";
import { checkCobrancaEmAtraso, getCobrancaValorExibicao } from "@/utils/formatters/cobranca";
import { normalizeSearchText } from "@/utils/string";
import { buildReciboWhatsAppMessage } from "@/utils/whatsappTemplates";
import { isPassageiroIncompleto } from "@/utils/domain";

const PASSAGEIRO_STATUS_ATIVO = "ativo" as const;

export function useCobrancasViewModel() {
  const { can, isSubConta } = usePermissions();
  const {
    setPageTitle,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    openManualPaymentDialog,
    openReceiptDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFinanceiroDialog,
    openConhecerCobrancaAutomaticaDialog,
  } = useLayout();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const { financeiro, isLoading: isFinanceiroLoading } = useMotoristaFinanceiroApi();

  const createCobranca = useCreateCobranca();
  const deleteCobranca = useDeleteCobranca();

  const lembretesDesativados =
    !isFinanceiroLoading && financeiro?.modo_cobranca === ModoCobrancaEnum.DESATIVADO;

  const lembretesAtivos =
    !isFinanceiroLoading && financeiro?.modo_cobranca === ModoCobrancaEnum.LEMBRETES;

  const { data: passageirosData } = usePassageiros(
    { usuarioId: profile?.id, status: PASSAGEIRO_STATUS_ATIVO, limit: 500 },
    { enabled: Boolean(profile?.id) }
  );

  const alunosSemValorCount = useMemo(() => {
    const list = passageirosData?.list || [];
    return list.filter((p) => !p.isento && (!p.valor_cobranca || Number(p.valor_cobranca) <= 0)).length;
  }, [passageirosData?.list]);

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
    selectedAno: anoFilter = getNowBR().getFullYear(),
    searchTerm: commonSearch,
    setSearchTerm: setCommonSearch,
    setFilters,
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

  const handleNavigation = useCallback(
    (newMes: number, newAno: number) => {
      setFilters({ mes: newMes, ano: newAno });
    },
    [setFilters]
  );

  useEffect(() => {
    const term = activeTab === CobrancaTab.ARECEBER ? buscaAReceber : buscaRecebidos;
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, 500);
    return () => clearTimeout(handler);
  }, [buscaAReceber, buscaRecebidos, activeTab]);

  const [pageAReceber, setPageAReceber] = useState(1);
  const [pageRecebidas, setPageRecebidas] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setBuscaAReceber("");
    setBuscaRecebidos("");
  }, [mesFilter, anoFilter, setBuscaAReceber, setBuscaRecebidos]);

  useEffect(() => {
    setPageAReceber(1);
    setPageRecebidas(1);
  }, [debouncedSearchTerm, mesFilter, anoFilter]);

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
      const term = normalizeSearchText(debouncedSearchTerm);
      return sorted.filter(
        (c) =>
          normalizeSearchText(c.passageiro?.nome).includes(term) ||
          normalizeSearchText(c.passageiro?.responsavel_principal?.nome).includes(term)
      );
    }

    return isPastMonth ? sorted.reverse() : sorted;
  }, [cobrancasData, isPastMonth, debouncedSearchTerm]);

  const cobrancasRecebidas = useMemo(() => {
    const list = cobrancasData?.recebidos ?? [];

    const sorted = [...list].sort((a, b) => {
      const timeA = a.data_pagamento
        ? getStartOfDayBR(a.data_pagamento).getTime()
        : a.data_vencimento
          ? getStartOfDayBR(a.data_vencimento).getTime()
          : 0;
      const timeB = b.data_pagamento
        ? getStartOfDayBR(b.data_pagamento).getTime()
        : b.data_vencimento
          ? getStartOfDayBR(b.data_vencimento).getTime()
          : 0;

      if (timeA !== timeB) return timeB - timeA;

      const nomeA = a.passageiro?.nome || "";
      const nomeB = b.passageiro?.nome || "";
      return nomeA.localeCompare(nomeB, "pt-BR");
    });

    if (debouncedSearchTerm.trim()) {
      const term = normalizeSearchText(debouncedSearchTerm);
      return sorted.filter(
        (c) =>
          normalizeSearchText(c.passageiro?.nome).includes(term) ||
          normalizeSearchText(c.passageiro?.responsavel_principal?.nome).includes(term)
      );
    }

    return sorted;
  }, [cobrancasData, debouncedSearchTerm]);

  const totalPagesAReceber = Math.max(1, Math.ceil(cobrancasAReceber.length / limit));
  const totalPagesRecebidas = Math.max(1, Math.ceil(cobrancasRecebidas.length / limit));

  const paginatedCobrancasAReceber = useMemo(() => {
    const start = (pageAReceber - 1) * limit;
    return cobrancasAReceber.slice(start, start + limit);
  }, [cobrancasAReceber, pageAReceber, limit]);

  const paginatedCobrancasRecebidas = useMemo(() => {
    const start = (pageRecebidas - 1) * limit;
    return cobrancasRecebidas.slice(start, start + limit);
  }, [cobrancasRecebidas, pageRecebidas, limit]);

  const isInitialLoading = isCobrancasLoading || isProfileLoading || !cobrancasData;

  useEffect(() => {
    setPageTitle("Parcelas");
  }, [setPageTitle]);

  const saldoParcialRecebidas = useMemo(() => {
    return cobrancasRecebidas.reduce((acc, curr) => {
      const pago = Number(curr.valor_pago ?? curr.valor ?? 0);
      const total = Number(curr.valor || 0);
      return acc + (pago < total ? total - pago : 0);
    }, 0);
  }, [cobrancasRecebidas]);

  const saldoParcialAtrasadas = useMemo(() => {
    return cobrancasRecebidas.reduce((acc, curr) => {
      if (!checkCobrancaEmAtraso(curr.data_vencimento)) return acc;
      const pago = Number(curr.valor_pago ?? curr.valor ?? 0);
      const total = Number(curr.valor || 0);
      return acc + (pago < total ? total - pago : 0);
    }, 0);
  }, [cobrancasRecebidas]);

  const totalAReceber = useMemo(
    () => cobrancasAReceber.reduce((acc, curr) => acc + Number(curr.valor), 0) + saldoParcialRecebidas,
    [cobrancasAReceber, saldoParcialRecebidas]
  );

  const totalRecebido = useMemo(
    () => cobrancasRecebidas.reduce((acc, curr) => acc + getCobrancaValorExibicao(curr), 0),
    [cobrancasRecebidas]
  );

  const totalAtrasado = useMemo(
    () =>
      cobrancasAReceber
        .filter((c) => checkCobrancaEmAtraso(c.data_vencimento))
        .reduce((acc, curr) => acc + Number(curr.valor), 0) + saldoParcialAtrasadas,
    [cobrancasAReceber, saldoParcialAtrasadas]
  );

  const totalPrevisto = totalAReceber + totalRecebido;

  const handleEditCobrancaClick = useCallback(
    (cobranca: Cobranca) => {
      openCobrancaEditDialog({ cobranca });
    },
    [openCobrancaEditDialog]
  );

  const handleDeleteCobrancaClick = useCallback(
    (cobranca: Cobranca) => {
      openCobrancaDeleteDialog({
        onConfirm: async () => {
          if (cobranca.isProjection) {
            await createCobranca.mutateAsync({
              passageiro_id: cobranca.passageiro_id,
              usuario_id: profile?.id,
              mes: Number(cobranca.mes),
              ano: Number(cobranca.ano),
              valor: Number(cobranca.valor),
              data_vencimento: cobranca.data_vencimento,
              status: CobrancaStatus.CANCELADA,
              ano_letivo: cobranca.ano_letivo || Number(cobranca.ano),
            });
          } else {
            await deleteCobranca.mutateAsync(cobranca.id);
          }
        },
        onEdit: cobranca.isProjection
          ? undefined
          : () => {
              openCobrancaEditDialog({ cobranca });
            },
      });
    },
    [deleteCobranca, createCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog, profile?.id]
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
        observacao: cobranca.observacao,
      });
    },
    [openManualPaymentDialog]
  );

  const handleRegistrarPagamento = useCallback(
    (cobranca: Cobranca) => {
      if (cobranca.isProjection && isPassageiroIncompleto(cobranca.passageiro)) {
        openConfirmationDialog({
          title: "Valor das parcelas não configurado",
          description:
            "Para registrar o pagamento desta previsão, primeiro é necessário definir o valor e o vencimento da parcela. Deseja configurar agora?",
          confirmText: "Configurar agora",
          cancelText: "Fazer depois",
          onConfirm: () => {
            safeCloseDialog(closeConfirmationDialog);
            setTimeout(() => {
              if (cobranca.passageiro) {
                openPassageiroFinanceiroDialog({ passageiro: cobranca.passageiro });
              }
            }, 100);
          },
        });
        return;
      }
      openPaymentDialog(cobranca);
    },
    [openConfirmationDialog, closeConfirmationDialog, openPassageiroFinanceiroDialog, openPaymentDialog]
  );

  const handleVerRecibo = useCallback(
    (url: string, cobranca: Cobranca) => {
      openReceiptDialog({
        receiptUrl: url,
        cobrancaDescricao: buildReciboWhatsAppMessage({
          nomeResponsavel: cobranca.passageiro?.responsavel_principal?.nome,
          nomePassageiro: cobranca.passageiro?.nome || "",
          generoPassageiro: cobranca.passageiro?.genero,
          mes: cobranca.mes,
          ano: cobranca.ano,
        }),
        cobrancaId: cobranca.id,
        mes: cobranca.mes,
        ano: cobranca.ano,
        passageiroId: cobranca.passageiro_id,
        nomePassageiro: cobranca.passageiro?.nome,
        nomeResponsavel: cobranca.passageiro?.responsavel_principal?.nome,
        generoPassageiro: cobranca.passageiro?.genero,
      });
    },
    [openReceiptDialog]
  );

  const navigateToPassageiro = useCallback(
    (passageiroId: string) => {
      navigate(
        `${ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", passageiroId)}?ano=${anoFilter}`
      );
    },
    [navigate, anoFilter]
  );

  const handleNavigateConfigCobrancas = useCallback(() => {
    navigate(`${ROUTES.PRIVATE.MOTORISTA.ACCOUNT}?tab=cobrancas`);
  }, [navigate]);

  const handleNavigateAlunosSemValor = useCallback(() => {
    navigate(`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS_BATCH}?semValor=true`);
  }, [navigate]);

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
    paginatedCobrancasAReceber,
    paginatedCobrancasRecebidas,
    pageAReceber,
    setPageAReceber,
    pageRecebidas,
    setPageRecebidas,
    limit,
    setLimit,
    totalPagesAReceber,
    totalPagesRecebidas,
    isInitialLoading,
    isFutureMonth,
    isPastMonth,
    isCurrentMonth,
    lembretesDesativados,
    lembretesAtivos,
    alunosSemValorCount,
    pullToRefreshReload,
    navigateToPassageiro,
    handleEditCobrancaClick,
    handleDeleteCobrancaClick,
    openPaymentDialog,
    handleRegistrarPagamento,
    handleVerRecibo,
    handleNavigateConfigCobrancas,
    handleNavigateAlunosSemValor,
    handleOpenConhecerCobrancaAutomatica: openConhecerCobrancaAutomaticaDialog,
  };
}
