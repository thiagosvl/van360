import { ROUTES } from "@/constants/routes";
import { BASE_DOMAIN } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  safeCloseDialog,
  useCreateEscola,
  useCreatePassageiro,
  useCreateVeiculo,
  useCreateContrato,
  useDeletePassageiro,
  useDeleteContrato,
  useSubstituirContrato,
  useEscolas,
  useFilters,
  usePassageiros,
  useToggleAtivoPassageiro,
  useVeiculos,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { buildContratoWhatsAppUrl } from "@/utils/evolution";
import { openBrowserLink } from "@/utils/browser";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { FilterDefaults, PassageiroFormModes, PassageiroTab } from "@/types/enums";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { convertDateBrToISO } from "@/utils/formatters/date";
import { moneyToNumber, phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "../business/usePermissions";
import { getNowBR } from "@/utils/dateUtils";
import { shouldGeneratePassengerProjection } from "@/utils/domain/cobrancaProjection";

export function usePassageirosViewModel() {
  const { can, isSubConta } = usePermissions();
  const hasInitializedSubContaVeiculo = useRef(false);
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFormDialog,
    openQuickStartPassageiroDialog,
    openFirstChargeDialog,
  } = useLayout();

  const { user } = useSession();
  const {
    profile,
    isLoading: isProfileLoading,
    summary: resumo,
    refreshProfile,
  } = useProfile(user?.id);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab") as PassageiroTab;
    const validTabs = Object.values(PassageiroTab);
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return PassageiroTab.ALUNOS;
  }, [searchParams]);

  useEffect(() => {
    const currentTab = searchParams.get("tab") as PassageiroTab;
    if (isSubConta && currentTab === PassageiroTab.SOLICITACOES) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", PassageiroTab.ALUNOS);
      setSearchParams(newParams, { replace: true });
      return;
    }
    if (!currentTab || !Object.values(PassageiroTab).includes(currentTab)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", PassageiroTab.ALUNOS);
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, isSubConta]);

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", value);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedEscola,
    setSelectedEscola,
    selectedVeiculo,
    setSelectedVeiculo,
    selectedPeriodo,
    setSelectedPeriodo,
    clearFilters,
    setFilters,
    hasActiveFilters,
  } = useFilters({
    escolaParam: "escola",
    veiculoParam: "veiculo",
    periodoParam: "periodo",
  });

  const createPassageiro = useCreatePassageiro();
  const createContrato = useCreateContrato();
  const deleteContrato = useDeleteContrato();
  const substituirContrato = useSubstituirContrato();
  const createEscola = useCreateEscola();
  const createVeiculo = useCreateVeiculo();
  const deletePassageiro = useDeletePassageiro();
  const toggleAtivoPassageiro = useToggleAtivoPassageiro();

  const isActionLoading =
    deletePassageiro.isPending ||
    toggleAtivoPassageiro.isPending;

  useEffect(() => {
    if (isSubConta && profile?.veiculo_id && !hasInitializedSubContaVeiculo.current) {
      hasInitializedSubContaVeiculo.current = true;
      if (!searchParams.has("veiculo") && setSelectedVeiculo) {
        setSelectedVeiculo(profile.veiculo_id);
      }
    }
  }, [isSubConta, profile?.veiculo_id, searchParams, setSelectedVeiculo]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedEscola, selectedVeiculo, selectedStatus, selectedPeriodo]);

  const passageiroFilters = useMemo(
    () => ({
      usuarioId: profile?.id,
      search: debouncedSearchTerm,
      escola: selectedEscola === FilterDefaults.TODAS ? undefined : selectedEscola,
      veiculo:
        selectedVeiculo === FilterDefaults.TODOS
          ? isSubConta && profile?.veiculo_id
            ? profile.veiculo_id
            : isSubConta
              ? "all"
              : undefined
          : selectedVeiculo,
      status: selectedStatus === FilterDefaults.TODOS ? undefined : selectedStatus,
      periodo: selectedPeriodo === FilterDefaults.TODOS ? undefined : selectedPeriodo,
      page,
      limit,
    }),
    [
      profile?.id,
      profile?.veiculo_id,
      debouncedSearchTerm,
      selectedEscola,
      selectedVeiculo,
      selectedStatus,
      selectedPeriodo,
      isSubConta,
      page,
      limit,
    ]
  );

  const isSubContaInitializingVeiculo = Boolean(
    isSubConta &&
      profile?.veiculo_id &&
      !hasInitializedSubContaVeiculo.current &&
      !searchParams.has("veiculo")
  );

  const {
    data: passageirosData,
    isLoading: isPassageirosLoading,
    refetch: refetchPassageiros,
  } = usePassageiros(passageiroFilters, {
    enabled:
      !!profile?.id &&
      !isSubContaInitializingVeiculo &&
      (can("passageiros.visualizar") || can("passageiros.gerenciar")),
    onError: () =>
      toast.error("passageiro.erro.carregar", {
        description: "passageiro.erro.carregarDetalhe",
      }),
  });

  const countPrePassageiros = resumo?.contadores.passageiros.solicitacoes_pendentes ?? 0;
  const totalPassageirosResumo = resumo?.contadores.passageiros.total;

  const userQueryFilters = useMemo(
    () => ({ usuarioId: profile?.id }),
    [profile?.id]
  );

  const { data: escolasData, refetch: refetchEscolas } = useEscolas(
    userQueryFilters,
    {
      enabled: !!profile?.id && (can("escolas.visualizar") || can("escolas.gerenciar")),
      onError: () => toast.error("escola.erro.carregar"),
    },
  );

  const { data: veiculosData, refetch: refetchVeiculos } = useVeiculos(
    userQueryFilters,
    {
      enabled: !!profile?.id && (can("veiculos.gerenciar") || can("passageiros.visualizar")),
      onError: () => toast.error("veiculo.erro.carregar"),
    },
  );

  const passageiros = useMemo(
    () => passageirosData?.list ?? ([] as Passageiro[]),
    [passageirosData],
  );

  const countPassageiros = totalPassageirosResumo ?? passageirosData?.total ?? null;

  const escolas = useMemo(
    () => escolasData?.list ?? ([] as Escola[]),
    [escolasData],
  );

  const veiculos = useMemo(
    () => veiculosData?.list ?? ([] as Veiculo[]),
    [veiculosData],
  );

  useEffect(() => {
    setPageTitle("Alunos");
  }, [setPageTitle]);

  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      openPassageiroFormDialog({
        mode: PassageiroFormModes.CREATE,
      });
    }
  }, [searchParams, refetchPassageiros, openPassageiroFormDialog]);

  const handleDeleteClick = useCallback(
    (passageiro: Passageiro) => {
      openConfirmationDialog({
        title: "Excluir aluno?",
        description:
          "Tem certeza que deseja excluir este aluno? Esta ação excluirá permanentemente o cadastro e todos os dados associados (cobranças, contratos, rotas e históricos). Essa ação não poderá ser desfeita.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deletePassageiro.mutateAsync(passageiro.id);
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [deletePassageiro, closeConfirmationDialog, openConfirmationDialog],
  );

  const handleToggleClick = useCallback(
    (passageiro: Passageiro) => {
      const action = passageiro.ativo ? "desativar" : "ativar";

      openConfirmationDialog({
        title: action === "ativar" ? "Reativar aluno?" : "Desativar aluno?",
        description: action === "ativar"
          ? "O aluno voltará a aparecer nas listas de alunos ativos e novas parcelas serão geradas automaticamente conforme as condições do contrato."
          : "O aluno será desativado e novas parcelas deixarão de ser geradas automaticamente. Você poderá reativá-lo a qualquer momento.",
        confirmText: action === "ativar" ? "Reativar" : "Desativar",
        variant: action === "ativar" ? "success" : "warning",
        onConfirm: async () => {
          try {
            await toggleAtivoPassageiro.mutateAsync({ id: passageiro.id, novoStatus: !passageiro.ativo });
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [openConfirmationDialog, closeConfirmationDialog, toggleAtivoPassageiro],
  );

  const handleEdit = useCallback(
    (passageiro: Passageiro) => {
      openPassageiroFormDialog({
        mode: PassageiroFormModes.EDIT,
        editingPassageiro: passageiro,
      });
    },
    [openPassageiroFormDialog],
  );

  const handleOpenNewDialog = useCallback(() => {
    const isFirstPassageiro = (countPassageiros || 0) === 0;
    openQuickStartPassageiroDialog({
      isOnboarding: isFirstPassageiro,
      onSuccess: (passageiro) => {
        if (passageiro && isFirstPassageiro) {
          navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", passageiro.id));
        } else if (passageiro && !isFirstPassageiro) {
          const hasContractConfig = !!profile?.config_contrato?.usar_contratos;
          const now = getNowBR();
          const hasPayment = !passageiro.isento && shouldGeneratePassengerProjection({
            passageiro,
            targetMonth: now.getMonth() + 1,
            targetYear: now.getFullYear(),
          });
          if (hasPayment || hasContractConfig) {
            openFirstChargeDialog({ passageiro });
          } else {
            navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", passageiro.id));
          }
        }
      },
    });
  }, [countPassageiros, openQuickStartPassageiroDialog, openFirstChargeDialog, navigate, profile?.config_contrato?.usar_contratos]);

  const handleCadastrarRapido = useCallback(async () => {
    if (!profile?.id) return;

    let escolaId = escolas?.[0]?.id;
    let veiculoId = veiculos?.[0]?.id;

    try {
      if (!escolaId) {
        const fakeEscola = { ...mockGenerator.escola() };
        const novaEscola = await createEscola.mutateAsync({
          usuarioId: profile.id,
          data: { ...fakeEscola, ativo: true },
        });
        if (novaEscola && (novaEscola as { id?: string }).id) {
          escolaId = (novaEscola as { id: string }).id;
        }
      }

      if (!veiculoId) {
        const fakeVeiculo = { ...mockGenerator.veiculo() };
        const oldPlate = fakeVeiculo.placa;
        const suffix = Math.floor(Math.random() * 100).toString().padStart(2, "0");
        fakeVeiculo.placa = oldPlate.substring(0, oldPlate.length - 2) + suffix;

        const novoVeiculo = await createVeiculo.mutateAsync({
          usuarioId: profile.id,
          data: { ...fakeVeiculo, ativo: true },
        });
        if (novoVeiculo && (novoVeiculo as { id?: string }).id) {
          veiculoId = (novoVeiculo as { id: string }).id;
        }
      }
    } catch (e) {
      toast.error("sistema.erro.gerarDependencias");
      return;
    }

    if (!escolaId || !veiculoId) {
      toast.error("sistema.erro.gerarCadastroAutomatico");
      return;
    }

    const mockPassenger = mockGenerator.passenger();
    const mockEndereco = mockGenerator.address();

    const fakeData = {
      ...mockPassenger,
      ...mockEndereco,
      escola_id: escolaId,
      veiculo_id: veiculoId,
      data_nascimento: convertDateBrToISO(mockPassenger.data_nascimento),
      data_inicio_transporte: convertDateBrToISO(mockPassenger.data_inicio_transporte),
      valor_cobranca: moneyToNumber(mockPassenger.valor_cobranca),
      dia_vencimento: parseInt(mockPassenger.dia_vencimento),
    };

    createPassageiro.mutate({
      ...fakeData,
      usuario_id: profile.id,
    });
  }, [profile?.id, escolas, veiculos, createPassageiro, createEscola, createVeiculo]);

  const handleHistorico = useCallback(
    (passageiro: Passageiro) => {
      navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", passageiro.id));
    },
    [navigate],
  );



  const handleGerarContrato = useCallback(
    async (passageiro: Passageiro) => {
      try {
        await createContrato.mutateAsync({
          passageiroId: passageiro.id,
          valorMensal: passageiro.valor_cobranca,
          diaVencimento: passageiro.dia_vencimento
        });
      } catch (error) {
        // Erro já tratado no hook
      }
    },
    [createContrato]
  );

  const handleExcluirContrato = useCallback(
    async (passageiro: Passageiro) => {
      if (!passageiro.contrato_id) return;

      openConfirmationDialog({
        title: "Excluir contrato?",
        description: "Tem certeza que deseja excluir o contrato deste aluno? O aluno voltará para o status pendente.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteContrato.mutateAsync(passageiro.contrato_id!);
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [deleteContrato, closeConfirmationDialog, openConfirmationDialog]
  );

  const handleSubstituirContrato = useCallback(
    (passageiro: Passageiro) => {
      openConfirmationDialog({
        title: "Substituir contrato?",
        description: "Ao confirmar, o contrato atual será cancelado e um novo com os dados atualizados será gerado para o aluno. O responsável receberá o link para assinatura. Deseja continuar?",
        confirmText: "Substituir",
        cancelText: "Manter atual",
        variant: "warning",
        onConfirm: async () => {
          try {
            await substituirContrato.mutateAsync(passageiro.contrato_id!);
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [substituirContrato, closeConfirmationDialog, openConfirmationDialog]
  );

  const isMobile = useIsMobile();
  const handleEnviarWhatsApp = useCallback((passageiro: Passageiro) => {
    // Para contratos pendentes, sempre usamos o link do portal de assinatura
    const token = passageiro.token_acesso || passageiro.id;
    const finalLink = `${BASE_DOMAIN}/assinar/${token}`;

    if (!isMobile) {
      navigator.clipboard.writeText(finalLink);
      toast.success("Link para assinatura copiado!");
      return;
    }

    const telefone = passageiro.responsavel_principal?.telefone;

    if (!telefone) {
      toast.error("Telefone do responsável inválido ou não informado.");
      return;
    }

    const url = buildContratoWhatsAppUrl({
      telefoneResponsavel: telefone,
      nomeResponsavel: passageiro.responsavel_principal?.nome || "",
      nomePassageiro: passageiro.nome || "",
      link: finalLink,
    });

    openBrowserLink(url);
  }, [isMobile, openBrowserLink]);

  const pullToRefreshReload = useCallback(async () => {
    await Promise.all([
      refetchPassageiros(),
      refetchEscolas(),
      refetchVeiculos(),
      refreshProfile(),
    ]);
  }, [refetchPassageiros, refetchEscolas, refetchVeiculos, refreshProfile]);

  return {
    profile,
    isProfileLoading,
    activeTab,
    handleTabChange,
    countPassageiros,
    countPrePassageiros,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedEscola,
    setSelectedEscola,
    selectedVeiculo,
    setSelectedVeiculo,
    selectedPeriodo,
    setSelectedPeriodo,
    escolas,
    veiculos,
    clearFilters,
    setFilters,
    isPassageirosLoading,
    passageiros,
    isActionLoading,
    handleCadastrarRapido,
    handleOpenNewDialog,
    handleHistorico,
    handleEdit,
    handleToggleClick,
    handleDeleteClick,
    handleGerarContrato,
    handleExcluirContrato,
    handleSubstituirContrato,
    handleEnviarWhatsApp,
    pullToRefreshReload,
    hasActiveFilters,
    page,
    setPage,
    limit,
    setLimit,
    totalPages: passageirosData?.totalPages ?? 1,
    totalItems: passageirosData?.total ?? 0,
  };
}
