import { ROUTES } from "@/constants/routes";
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
  useUpdatePassageiro,
  useVeiculos,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { buildContratoWhatsAppUrl } from "@/utils/whatsapp";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function usePassageirosViewModel() {
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFormDialog,
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
    return PassageiroTab.PASSAGEIROS;
  }, [searchParams]);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (!currentTab || !Object.values(PassageiroTab).includes(currentTab as PassageiroTab)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", PassageiroTab.PASSAGEIROS);
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const createPassageiro = useCreatePassageiro();
  const createContrato = useCreateContrato();
  const deleteContrato = useDeleteContrato();
  const substituirContrato = useSubstituirContrato();
  const createEscola = useCreateEscola();
  const createVeiculo = useCreateVeiculo();
  const updatePassageiro = useUpdatePassageiro();
  const deletePassageiro = useDeletePassageiro();
  const toggleAtivoPassageiro = useToggleAtivoPassageiro();

  const isActionLoading =
    deletePassageiro.isPending ||
    toggleAtivoPassageiro.isPending;

  const passageiroFilters = {
    usuarioId: profile?.id,
    search: debouncedSearchTerm,
    escola: selectedEscola === FilterDefaults.TODAS ? undefined : selectedEscola,
    veiculo: selectedVeiculo === FilterDefaults.TODOS ? undefined : selectedVeiculo,
    status: selectedStatus === FilterDefaults.TODOS ? undefined : selectedStatus,
    periodo: selectedPeriodo === FilterDefaults.TODOS ? undefined : selectedPeriodo,
  };

  const {
    data: passageirosData,
    isLoading: isPassageirosLoading,
    refetch: refetchPassageiros,
  } = usePassageiros(passageiroFilters, {
    enabled: !!profile?.id,
    onError: () =>
      toast.error("passageiro.erro.excluir", {
        description: "passageiro.erro.carregarDetalhe",
      }),
  });

  const countPrePassageiros = resumo?.contadores.passageiros.solicitacoes_pendentes ?? 0;
  const totalPassageirosResumo = resumo?.contadores.passageiros.total;

  const { data: escolasData, refetch: refetchEscolas } = useEscolas(
    { usuarioId: profile?.id },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("escola.erro.carregar"),
    },
  );

  const { data: veiculosData, refetch: refetchVeiculos } = useVeiculos(
    { usuarioId: profile?.id },
    {
      enabled: !!profile?.id,
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
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPageTitle("Passageiros");
  }, [setPageTitle]);

  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      openPassageiroFormDialog({
        mode: PassageiroFormModes.CREATE,
        onSuccess: () => {
          refetchPassageiros();
        },
      });
    }
  }, [searchParams, refetchPassageiros, openPassageiroFormDialog]);

  const handleDeleteClick = useCallback(
    (passageiro: Passageiro) => {
      openConfirmationDialog({
        title: "Excluir passageiro?",
        description: "Tem certeza que deseja excluir este passageiro? Essa ação não poderá ser desfeita.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deletePassageiro.mutateAsync(passageiro.id);
            refetchPassageiros();
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [deletePassageiro, closeConfirmationDialog, openConfirmationDialog, refetchPassageiros],
  );

  const handleToggleClick = useCallback(
    (passageiro: Passageiro) => {
      const action = passageiro.ativo ? "desativar" : "ativar";

      openConfirmationDialog({
        title: action === "ativar" ? "Reativar passageiro?" : "Desativar passageiro?",
        description: action === "ativar"
          ? "O passageiro voltará a aparecer nas listagens de passageiros ativos e as mensalidades dele voltarão a ser geradas automaticamente."
          : "O passageiro ficará inativo e as mensalidades dele não serão mais geradas automaticamente. Você poderá reativá-lo depois.",
        confirmText: action === "ativar" ? "Reativar" : "Desativar",
        variant: action === "ativar" ? "success" : "warning",
        onConfirm: async () => {
          try {
            await toggleAtivoPassageiro.mutateAsync({ id: passageiro.id, novoStatus: !passageiro.ativo });
            refetchPassageiros();
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [openConfirmationDialog, closeConfirmationDialog, toggleAtivoPassageiro, refetchPassageiros],
  );

  const handleEdit = useCallback(
    (passageiro: Passageiro) => {
      openPassageiroFormDialog({
        mode: PassageiroFormModes.EDIT,
        editingPassageiro: passageiro,
        onSuccess: () => {
          refetchPassageiros();
        },
      });
    },
    [openPassageiroFormDialog, refetchPassageiros],
  );

  const handleOpenNewDialog = useCallback(() => {
    openPassageiroFormDialog({
      mode: PassageiroFormModes.CREATE,
      onSuccess: (passageiro) => {
        refetchPassageiros();
        if (passageiro) {
          openFirstChargeDialog({ passageiro: passageiro });
        }
      },
    });
  }, [openPassageiroFormDialog, openFirstChargeDialog, refetchPassageiros]);

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
        if (novaEscola && (novaEscola as any).id) {
          escolaId = (novaEscola as any).id;
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
        if (novoVeiculo && (novoVeiculo as any).id) {
          veiculoId = (novoVeiculo as any).id;
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
      telefone_responsavel: phoneMask(mockPassenger.telefone_responsavel),
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
        refetchPassageiros();
      } catch (error) {
        // Erro já tratado no hook
      }
    },
    [createContrato, refetchPassageiros]
  );

  const handleExcluirContrato = useCallback(
    async (passageiro: Passageiro) => {
      if (!passageiro.contrato_id) return;

      openConfirmationDialog({
        title: "Excluir contrato?",
        description: "Tem certeza que deseja excluir o contrato deste passageiro? O passageiro voltará para o status pendente.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteContrato.mutateAsync(passageiro.contrato_id!);
            refetchPassageiros();
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [deleteContrato, closeConfirmationDialog, openConfirmationDialog, refetchPassageiros]
  );

  const handleSubstituirContrato = useCallback(
    (passageiro: Passageiro) => {
      openConfirmationDialog({
        title: "Substituir contrato?",
        description: "Ao confirmar, o contrato atual será cancelado e um novo será gerado com os dados atuais do passageiro.",
        confirmText: "Substituir",
        variant: "warning",
        onConfirm: async () => {
          try {
            await substituirContrato.mutateAsync(passageiro.contrato_id!);
            refetchPassageiros();
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [substituirContrato, closeConfirmationDialog, openConfirmationDialog, refetchPassageiros]
  );

  const isMobile = useIsMobile();
  const handleEnviarWhatsApp = useCallback((passageiro: Passageiro) => {
    // Para contratos pendentes, sempre usamos o link do portal de assinatura
    const token = passageiro.token_acesso || passageiro.id;
    const finalLink = `${window.location.origin}/assinar/${token}`;

    if (!isMobile) {
      navigator.clipboard.writeText(finalLink);
      toast.success("Link para assinatura copiado!");
      return;
    }

    const telefone =
      passageiro.telefone_responsavel ||
      (passageiro as any).dados_contrato?.telefone_responsavel;

    if (!telefone) {
      toast.error("Telefone do responsável não informado.");
      return;
    }

    openConfirmationDialog({
      title: "Reenviar via WhatsApp?",
      description: `O responsável do passageiro receberá o link para assinatura diretamente no WhatsApp.`,
      confirmText: "Enviar",
      variant: "default",
      onConfirm: () => {
        const url = buildContratoWhatsAppUrl({
          telefoneResponsavel: telefone,
          nomeResponsavel: passageiro.nome_responsavel || "",
          nomePassageiro: passageiro.nome || "",
          link: finalLink,
        });

        openBrowserLink(url);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  }, [isMobile, openConfirmationDialog, closeConfirmationDialog]);

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
  };
}
