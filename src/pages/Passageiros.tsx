// Imports updated

import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FEATURE_COBRANCA_AUTOMATICA
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
    useCreateEscola,
    useCreatePassageiro,
    useCreateVeiculo,
    useDeletePassageiro,
    useEscolas,
    useFilters,
    usePassageiros,
    usePermissions,
    useToggleAtivoPassageiro,
    useUpdatePassageiro,
    useVeiculos,
} from "@/hooks";
import { useFranchiseGate } from "@/hooks/business/useFranchiseGate";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { cn } from "@/lib/utils";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";

import { ROUTES } from "@/constants/routes";
import { PassageiroFormModes } from "@/types/enums";
import { convertDateBrToISO } from "@/utils/formatters/date";
import { moneyToNumber, phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Users2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Passageiros() {
  const {
    setPageTitle,
    openPlanUpgradeDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFormDialog,
    openFirstChargeDialog,
  } = useLayout();

  const {
    canUseAutomatedCharges: canUseCobrancaAutomatica,
    is_read_only,
    profile,
    isLoading: isProfileLoading,
    plano,
    summary: resumo,
  } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state from URL
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["passageiros", "solicitacoes"];
    if (tabParam && validTabs.includes(tabParam)) {
      return tabParam;
    }
    return "passageiros"; // Default
  }, [searchParams]);

  // Sync tab to URL on mount if not present
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (!currentTab || !["passageiros", "solicitacoes"].includes(currentTab)) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", "passageiros");
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
  } = useFilters({
    escolaParam: "escola",
    veiculoParam: "veiculo",
    periodoParam: "periodo",
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const navigate = useNavigate();

  const createPassageiro = useCreatePassageiro();
  const createEscola = useCreateEscola();
  const createVeiculo = useCreateVeiculo();
  const updatePassageiro = useUpdatePassageiro();
  const deletePassageiro = useDeletePassageiro();
  const toggleAtivoPassageiro = useToggleAtivoPassageiro();

  const isActionLoading =
    createPassageiro.isPending ||
    updatePassageiro.isPending ||
    deletePassageiro.isPending ||
    deletePassageiro.isPending ||
    toggleAtivoPassageiro.isPending;

  const passageiroFilters = {
    usuarioId: profile?.id,
    search: debouncedSearchTerm,
    escola: selectedEscola === "todas" ? undefined : selectedEscola,
    veiculo: selectedVeiculo === "todos" ? undefined : selectedVeiculo,
    status: selectedStatus === "todos" ? undefined : selectedStatus,
    periodo: selectedPeriodo === "todos" ? undefined : selectedPeriodo,
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

  const countPrePassageiros =
    resumo?.contadores.passageiros.solicitacoes_pendentes ?? 0;

  const totalPassageirosResumo = resumo?.contadores.passageiros.ativos;

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
    () =>
      (
        passageirosData as
          | { list?: Passageiro[]; total?: number; ativos?: number }
          | undefined
      )?.list ?? ([] as Passageiro[]),
    [passageirosData],
  );
  const countPassageiros =
    totalPassageirosResumo ??
    (
      passageirosData as
        | { list?: Passageiro[]; total?: number; ativos?: number }
        | undefined
    )?.total ??
    null;
  const escolas = useMemo(
    () =>
      (
        escolasData as
          | {
              list?: (Escola & { passageiros_ativos_count?: number })[];
              total?: number;
              ativas?: number;
            }
          | undefined
      )?.list ?? ([] as (Escola & { passageiros_ativos_count?: number })[]),
    [escolasData],
  );
  const veiculos = useMemo(
    () =>
      (
        veiculosData as
          | {
              list?: (Veiculo & { passageiros_ativos_count?: number })[];
              total?: number;
              ativos?: number;
            }
          | undefined
      )?.list ?? ([] as (Veiculo & { passageiros_ativos_count?: number })[]),
    [veiculosData],
  );

  const { limits } = usePlanLimits();

  const validacaoFranquiaGeral = {
    franquiaContratada: limits.franchise.limit,
    cobrancasEmUso: limits.franchise.used,
    podeAtivar: limits.franchise.canEnable,
  };

  const handleOpenUpgradeDialog = useCallback(() => {
    openPlanUpgradeDialog({
      feature: FEATURE_COBRANCA_AUTOMATICA,
    });
  }, [openPlanUpgradeDialog]);


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  useEffect(() => {
    setPageTitle("Passageiros");
  }, [setPageTitle]);

  // Check for openModal param on mount
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
      if (is_read_only) {
        openPlanUpgradeDialog({ feature: "READ_ONLY" });
        return;
      }
      openConfirmationDialog({
        title: "Excluir passageiro?",
        description:
          "Tem certeza que deseja excluir este passageiro? Essa ação não poderá ser desfeita.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deletePassageiro.mutateAsync(passageiro.id);
            closeConfirmationDialog();
          } catch (error) {
            closeConfirmationDialog();
          }
        },
      });
    },
    [deletePassageiro, closeConfirmationDialog, openConfirmationDialog],
  );

  /* 
   * NEW HOOK USAGE
   */
  const { validateActivation, validateAutomationToggle } = useFranchiseGate();

  const handleToggleClick = useCallback(
    (passageiro: Passageiro) => {
      if (is_read_only) {
        openPlanUpgradeDialog({ feature: "READ_ONLY" });
        return;
      }
      const action = passageiro.ativo ? "desativar" : "ativar";

      openConfirmationDialog({
        title:
          action === "ativar"
            ? "Reativar passageiro?"
            : "Desativar passageiro?",
        description:
          action === "ativar"
            ? "O passageiro voltará a aparecer nas listagens ativas e a geração de mensalidades será retomada."
            : "O passageiro ficará inativo e a geração de mensalidades será pausada. Você poderá reativá-lo depois.",
        confirmText: action === "ativar" ? "Reativar" : "Desativar",
        variant: action === "ativar" ? "success" : "warning",
        onConfirm: async () => {
          // Use centralized validation
          validateActivation(
            passageiro, 
            async () => {
               // Success Callback (Execute Action)
               try {
                  await toggleAtivoPassageiro.mutateAsync({ id: passageiro.id, novoStatus: !passageiro.ativo });
                  closeConfirmationDialog();
               } catch (error) {
                  console.error(error);
                  closeConfirmationDialog();
               }
            },
            async () => {
              // Cancel/Fallback Callback (Reativar sem automação)
              try {
                await updatePassageiro.mutateAsync({
                  id: passageiro.id,
                  data: {
                    ativo: true,
                    enviar_cobranca_automatica: false,
                  },
                });
                closeConfirmationDialog();
              } catch(e) { console.error(e); closeConfirmationDialog(); }
            }
          );
        },
      });
    },
    [
      openConfirmationDialog,
      closeConfirmationDialog,
      toggleAtivoPassageiro,
      openPlanUpgradeDialog,
      updatePassageiro,
      validateActivation, 
      is_read_only
    ],
  );

  const handleToggleCobrancaAutomatica = useCallback(
    async (passageiro: Passageiro) => {
      if (!profile?.id) return;

      const novoValor = !passageiro.enviar_cobranca_automatica;

      validateAutomationToggle(passageiro, novoValor, () => {
          updatePassageiro.mutate({
            id: passageiro.id,
            data: { enviar_cobranca_automatica: novoValor },
          });
      });
    },
    [
      profile?.id,
      updatePassageiro,
      validateAutomationToggle,
      refetchPassageiros
    ],
  );

  const handleEdit = useCallback(
    (passageiro: Passageiro) => {
      if (is_read_only) {
        openPlanUpgradeDialog({ feature: "READ_ONLY" });
        return;
      }
      openPassageiroFormDialog({
        mode: PassageiroFormModes.EDIT,
        editingPassageiro: passageiro,
      });
    },
    [openPassageiroFormDialog],
  );

  const handleOpenNewDialog = useCallback(() => {
    if (is_read_only) {
      openPlanUpgradeDialog({ feature: "READ_ONLY" });
      return;
    }
    openPassageiroFormDialog({
      mode: PassageiroFormModes.CREATE,
      onSuccess: (passageiro) => {
        refetchPassageiros();
        if (passageiro) {
          openFirstChargeDialog({ passageiro: passageiro });
        }
      },
    });
  }, [
    openPassageiroFormDialog,
    openFirstChargeDialog,
    refetchPassageiros,
    is_read_only,
    openPlanUpgradeDialog,
  ]);

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
        const suffix = Math.floor(Math.random() * 100)
          .toString()
          .padStart(2, "0");
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
      console.error("Erro ao criar dependências fake", e);
      toast.error("Erro ao gerar dependências automáticas.");
      return;
    }

    // Double check if we have IDs now
    if (!escolaId || !veiculoId) {
      toast.error(
        "Não foi possível obter escola/veículo para criação automática.",
      );
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

    let enviarCobrancaAutomatica = false;
    if (canUseCobrancaAutomatica) {
      enviarCobrancaAutomatica = limits.franchise.checkAvailability(false);
    }

    createPassageiro.mutate(
      {
        ...fakeData,
        usuario_id: profile.id,
        enviar_cobranca_automatica: enviarCobrancaAutomatica,
      },
      {
        onError: () => {},
      },
    );
  }, [
    profile?.id,
    escolas,
    veiculos,
    createPassageiro,
    createEscola,
    createVeiculo,
  ]);

  const handleHistorico = useCallback(
    (passageiro: Passageiro) => {
      navigate(
        ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
          ":passageiro_id",
          passageiro.id,
        ),
      );
    },
    [navigate],
  );

  const pullToRefreshReload = useCallback(async () => {
    await Promise.all([
      refetchPassageiros(),
      refetchEscolas(),
      refetchVeiculos(),
    ]);
  }, [refetchPassageiros, refetchEscolas, refetchVeiculos]);

  if (isProfileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  const hasActiveFilters =
    selectedStatus !== "todos" ||
    selectedEscola !== "todas" ||
    selectedVeiculo !== "todos" ||
    selectedPeriodo !== "todos";

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl h-10 md:h-12 w-full md:w-auto self-start">
                <TabsTrigger
                  value="passageiros"
                  className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
                >
                  Passageiros
                  {countPassageiros != null && countPassageiros > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
                    >
                      {countPassageiros}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="solicitacoes"
                  className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
                >
                  Solicitações
                  {countPrePassageiros > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
                    >
                      {countPrePassageiros}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="passageiros"
              className={cn("space-y-6 mt-0", "space-y-6 mt-0")}
            >
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0">
                  <div className="flex justify-end mb-4 md:hidden">
                    <Button
                      onClick={handleCadastrarRapido}
                      variant="outline"
                      className="gap-2 text-uppercase w-full"
                    >
                      GERAR PASSAGEIRO FAKE
                    </Button>
                  </div>
                  <div className="hidden md:flex justify-end mb-4">
                    <Button
                      onClick={handleCadastrarRapido}
                      variant="outline"
                      className="gap-2 text-uppercase"
                    >
                      GERAR PASSAGEIRO FAKE
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="px-0">
                  <div className="mb-6">
                    <PassageirosToolbar
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      selectedStatus={selectedStatus}
                      onStatusChange={setSelectedStatus}
                      selectedEscola={selectedEscola}
                      onEscolaChange={setSelectedEscola}
                      selectedVeiculo={selectedVeiculo}
                      onVeiculoChange={setSelectedVeiculo}
                      selectedPeriodo={selectedPeriodo}
                      onPeriodoChange={setSelectedPeriodo}
                      escolas={escolas}
                      veiculos={veiculos}
                      onClearFilters={clearFilters}
                      hasActiveFilters={hasActiveFilters}
                      onApplyFilters={setFilters}
                      onRegister={handleOpenNewDialog}
                    />
                  </div>

                  {isPassageirosLoading ? (
                    <ListSkeleton count={5} />
                  ) : passageiros.length === 0 ? (
                    <UnifiedEmptyState
                      icon={Users2}
                      title="Nenhum passageiro encontrado"
                      description={
                        searchTerm.length > 0
                          ? "Não encontramos passageiros com os filtros selecionados."
                          : "Comece cadastrando seu primeiro passageiro para gerenciar o transporte."
                      }
                      action={
                        searchTerm.length === 0
                          ? {
                              label: "Cadastrar Passageiro",
                              onClick: handleOpenNewDialog,
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <PassageirosList
                      passageiros={passageiros}
                      plano={plano}
                      onHistorico={handleHistorico}
                      onEdit={handleEdit}
                      onToggleCobrancaAutomatica={
                        handleToggleCobrancaAutomatica
                      }
                      onToggleClick={handleToggleClick}
                      onDeleteClick={handleDeleteClick}
                      onOpenUpgradeDialog={handleOpenUpgradeDialog}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solicitacoes" className={cn("mt-0")}>
              <PrePassageiros
                onFinalizeNewPrePassageiro={async () => {}}
                profile={profile}
                plano={plano}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
