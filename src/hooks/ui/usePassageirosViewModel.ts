import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import {
  safeCloseDialog,
  useCreateContrato,
  useCreateEscola,
  useCreatePassageiro,
  useCreateVeiculo,
  useDeletePassageiro,
  useEscolas,
  useFilters,
  usePassageiros,
  useDeleteContrato,
  useReenviarContrato,
  useSubstituirContrato,
  useToggleAtivoPassageiro,
  useUpdatePassageiro,
  useVeiculos,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { ContratoStatus, FilterDefaults, PassageiroFormModes, PassageiroTab } from "@/types/enums";
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
  const createEscola = useCreateEscola();
  const createVeiculo = useCreateVeiculo();
  const updatePassageiro = useUpdatePassageiro();
  const deletePassageiro = useDeletePassageiro();
  const toggleAtivoPassageiro = useToggleAtivoPassageiro();
  const createContratoMutation = useCreateContrato();
  const deleteContratoMutation = useDeleteContrato();
  const reenviarContratoMutation = useReenviarContrato();
  const substituirContratoMutation = useSubstituirContrato();

  const isActionLoading =
    updatePassageiro.isPending ||
    deletePassageiro.isPending ||
    toggleAtivoPassageiro.isPending ||
    createContratoMutation.isPending ||
    deleteContratoMutation.isPending ||
    reenviarContratoMutation.isPending ||
    substituirContratoMutation.isPending;

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
        onSuccess: (data: any, meta: any) => {
          refetchPassageiros();

          const hasChanges = meta?.hasCriticalContractChanges;
          const usarContratos = profile?.config_contrato?.usar_contratos;
          
          if (hasChanges === true && usarContratos) {
             const updatedPassageiro = data?.id ? data : (data?.passageiro || passageiro);
             
             setTimeout(() => {
                const hasActiveContract = updatedPassageiro.status_contrato === ContratoStatus.ASSINADO || 
                                          updatedPassageiro.status_contrato === ContratoStatus.PENDENTE;

                const firstName = updatedPassageiro.nome?.split(' ')[0] || '';

                openConfirmationDialog({
                  title: hasActiveContract ? "Substituir contrato?" : "Gerar contrato?",
                  description: hasActiveContract
                    ? `Deseja substituir o contrato atual por um novo para ${firstName}? O responsável receberá por WhatsApp.`
                    : `Deseja gerar o contrato oficial para ${firstName}? O responsável receberá por WhatsApp.`,
                  confirmText: hasActiveContract ? "Substituir" : "Gerar",
                  onConfirm: async () => {
                    try {
                      if (updatedPassageiro.contrato_id) {
                        await substituirContratoMutation.mutateAsync(updatedPassageiro.contrato_id);
                      } else {
                        await createContratoMutation.mutateAsync({ passageiroId: updatedPassageiro.id! });
                      }
                      refetchPassageiros();
                      safeCloseDialog(closeConfirmationDialog);
                    } catch {
                      safeCloseDialog(closeConfirmationDialog);
                    }
                  },
                });
             }, 400);
          }
        },
      });
    },
    [openPassageiroFormDialog, refetchPassageiros, openConfirmationDialog, closeConfirmationDialog, createContratoMutation, substituirContratoMutation, profile?.config_contrato?.usar_contratos],
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

  const handleGenerateContract = useCallback(
    (passageiro: Passageiro) => {
      const usarContratos = profile?.config_contrato?.usar_contratos;
      if (!usarContratos) return;

      const hasActiveContract = passageiro.status_contrato === ContratoStatus.ASSINADO || 
                               passageiro.status_contrato === ContratoStatus.PENDENTE;

      const firstName = passageiro.nome?.split(' ')[0] || '';

      openConfirmationDialog({
        title: hasActiveContract ? "Substituir contrato?" : "Gerar contrato?",
        description: hasActiveContract
          ? `Deseja substituir o contrato atual por um novo para ${firstName}? O responsável receberá por WhatsApp.`
          : `Deseja gerar o contrato oficial para ${firstName}? O responsável receberá por WhatsApp.`,
        confirmText: hasActiveContract ? "Substituir" : "Gerar",
        onConfirm: async () => {
          try {
            if (passageiro.contrato_id) {
              await substituirContratoMutation.mutateAsync(passageiro.contrato_id);
            } else {
              await createContratoMutation.mutateAsync({ passageiroId: passageiro.id! });
            }
            refetchPassageiros();
            safeCloseDialog(closeConfirmationDialog);
          } catch {
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [profile?.config_contrato?.usar_contratos, openConfirmationDialog, closeConfirmationDialog, createContratoMutation, substituirContratoMutation, refetchPassageiros],
  );

  const handleSubstituirContrato = useCallback((passageiro: Passageiro) => {
    if (!passageiro.contrato_id) return;
    openConfirmationDialog({
      title: "Substituir Contrato?",
      description: "O contrato atual será marcado como substituído e um novo será gerado com os dados atuais do passageiro. Deseja continuar?",
      confirmText: "Continuar",
      onConfirm: async () => {
        await substituirContratoMutation.mutateAsync(passageiro.contrato_id!);
        refetchPassageiros();
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  }, [openConfirmationDialog, substituirContratoMutation, closeConfirmationDialog, refetchPassageiros]);

  const handleExcluirContrato = useCallback((passageiro: Passageiro) => {
    if (!passageiro.contrato_id) return;
    openConfirmationDialog({
      title: "Excluir Contrato?",
      description: "Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deleteContratoMutation.mutateAsync(passageiro.contrato_id!);
        refetchPassageiros();
        safeCloseDialog(closeConfirmationDialog);
      }
    });
  }, [openConfirmationDialog, deleteContratoMutation, closeConfirmationDialog, refetchPassageiros]);

  const handleReenviarNotificacaoContrato = useCallback((passageiro: Passageiro) => {
    if (!passageiro.contrato_id) return;
    reenviarContratoMutation.mutate(passageiro.contrato_id);
  }, [reenviarContratoMutation]);

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
    handleGenerateContract,
    handleSubstituirContrato,
    handleExcluirContrato,
    handleReenviarNotificacaoContrato,
    pullToRefreshReload,
    hasActiveFilters,
  };
}
