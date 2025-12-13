// Imports updated
import { UpgradeStickyFooter } from "@/components/common/UpgradeStickyFooter";

import { DialogExcessoFranquia } from "@/components/dialogs/DialogExcessoFranquia";

import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PassageirosList } from "@/components/features/passageiro/PassageirosList";
import { PassageirosToolbar } from "@/components/features/passageiro/PassageirosToolbar";
import { PassengerLimitHealthBar } from "@/components/features/passageiro/PassengerLimitHealthBar";
import PrePassageiros from "@/components/features/passageiro/PrePassageiros";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANO_ESSENCIAL } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCreatePassageiro,
  useDeletePassageiro,
  useEscolas,
  useFilters,
  usePassageiroDialogs,
  usePassageiros,
  usePrePassageiros,
  useToggleAtivoPassageiro,
  useUpdatePassageiro,
  useVeiculos,
} from "@/hooks";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cn } from "@/lib/utils";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Users2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Passageiros() {
  const {
    passageiroForm,
    excessoFranquia,
    actions: dialogActions,
  } = usePassageiroDialogs();
  const {
    setPageTitle,
    openPlanosDialog,
    openContextualUpsellDialog,
    openLimiteFranquiaDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

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
    [searchParams, setSearchParams]
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
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading, plano } = useProfile(user?.id);

  const createPassageiro = useCreatePassageiro();
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
    escola: selectedEscola,
    veiculo: selectedVeiculo,
    status: selectedStatus,
    periodo: selectedPeriodo,
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

  const { data: prePassageirosData, refetch: refetchPrePassageiros } =
    usePrePassageiros({ usuarioId: profile?.id }, { enabled: !!profile?.id });

  const countPrePassageiros = (prePassageirosData as any[])?.length || 0;

  const { data: escolasData, refetch: refetchEscolas } = useEscolas(
    profile?.id,
    {
      enabled: !!profile?.id,
      onError: () => toast.error("escola.erro.carregar"),
    }
  );

  const { data: veiculosData, refetch: refetchVeiculos } = useVeiculos(
    profile?.id,
    {
      enabled: !!profile?.id,
      onError: () => toast.error("veiculo.erro.carregar"),
    }
  );

  const passageiros = useMemo(
    () =>
      (
        passageirosData as
          | { list?: Passageiro[]; total?: number; ativos?: number }
          | undefined
      )?.list ?? ([] as Passageiro[]),
    [passageirosData]
  );
  const countPassageiros =
    (
      passageirosData as
        | { list?: Passageiro[]; total?: number; ativos?: number }
        | undefined
    )?.total ?? null;
  const countPassageirosAtivos =
    (
      passageirosData as
        | { list?: Passageiro[]; total?: number; ativos?: number }
        | undefined
    )?.ativos ?? null;
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
    [escolasData]
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
    [veiculosData]
  );

  const { limits } = usePlanLimits({
    userUid: user?.id,
    profile,
    plano,
    currentPassengerCount: countPassageiros ?? 0,
  });

  const validacaoFranquiaGeral = {
    franquiaContratada: limits.franchise.limit,
    cobrancasEmUso: limits.franchise.used,
    podeAtivar: limits.franchise.canEnable,
  };

  const handleOpenUpgradeDialog = useCallback(() => {
    openLimiteFranquiaDialog({
      title: "Cobrança Automática",
      description:
        "A Cobrança Automática envia as faturas e lembretes sozinha. Automatize sua rotina com o Plano Completo.",
      hideLimitInfo: true,
    });
  }, [openLimiteFranquiaDialog]);

  const limitePassageiros = limits.passengers.limit;
  const isLimitedUser = plano?.isFreePlan ?? false;
  const isLimitReached = limits.passengers.isReached;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPageTitle("Passageiros");
  }, [countPassageirosAtivos, setPageTitle]);

  // Check for openModal param on mount
  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      dialogActions.openNewPassageiro();
    }
  }, [searchParams, dialogActions]);

  const handleDeleteClick = useCallback(
    (passageiro: Passageiro) => {
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
    [deletePassageiro, closeConfirmationDialog, openConfirmationDialog]
  );

  const handleToggleClick = useCallback(
    (passageiro: Passageiro) => {
      const action = passageiro.ativo ? "desativar" : "ativar";

      openConfirmationDialog({
        title:
          action === "ativar" ? "Reativar passageiro?" : "Desativar passageiro?",
        description:
          action === "ativar"
            ? "O passageiro voltará a aparecer nas listagens ativas e a geração de cobranças será retomada."
            : "O passageiro ficará inativo e a geração de cobranças será pausada. Você poderá reativá-lo depois.",
        confirmText: action === "ativar" ? "Reativar" : "Desativar",
        variant: action === "ativar" ? "success" : "warning",
        onConfirm: async () => {
          // Logic from handleToggleConfirm
          const p = passageiro;
          if (!p) return;

          const novoStatus = !p.ativo;

          if (
            novoStatus &&
            canUseCobrancaAutomatica(plano) &&
            p.enviar_cobranca_automatica
          ) {
            const franquiaContratada =
              validacaoFranquiaGeral.franquiaContratada;
            const cobrancasEmUso = validacaoFranquiaGeral.cobrancasEmUso;

            const limiteApos = cobrancasEmUso + 1;

            if (limiteApos > franquiaContratada) {
              // Set pending action for resume after upgrade

              dialogActions.openExcessoFranquia(
                franquiaContratada,
                limiteApos,
                p
              );
              closeConfirmationDialog();
              return;
            }
          }

          try {
            await toggleAtivoPassageiro.mutateAsync({ id: p.id, novoStatus });
            closeConfirmationDialog();
          } catch (error) {
            console.error(error);
            closeConfirmationDialog();
          }
        },
      });
    },
    [
      openConfirmationDialog,
      closeConfirmationDialog,
      plano,
      validacaoFranquiaGeral,
      toggleAtivoPassageiro,
    ]
  );

  const handleToggleCobrancaAutomatica = useCallback(
    async (passageiro: Passageiro) => {
      if (!profile?.id) return;

      const novoValor = !passageiro.enviar_cobranca_automatica;

      if (novoValor && canUseCobrancaAutomatica(plano)) {
        // Use centralized logic from hook to check availability
        // If enabling (novoValor === true), we check availability.
        // We pass 'false' to checkAvailability because if we are enabling, it means it is NOT currently active (so we don't need to subtract from count).
        const podeAtivar = limits.franchise.checkAvailability(false);

        if (!podeAtivar) {
          // Se franquia contratada for 0, usa a mensagem de upgrade/primeira ativação
          if (validacaoFranquiaGeral.franquiaContratada === 0) {
            openLimiteFranquiaDialog({
              title: "Cobrança Automática",
              description:
                "A Cobrança Automática envia as faturas e lembretes sozinhas. Automatize sua rotina com o Plano Completo.",
              hideLimitInfo: true,
              targetPassengerId: passageiro.id,
              onUpgradeSuccess: () => {
                // Resume action: Enable auto-billing
                updatePassageiro.mutate({
                  id: passageiro.id,
                  data: { enviar_cobranca_automatica: true },
                });
                refetchPassageiros();
              },
            });
          } else {
            // Caso contrário, usa a lógica padrão de limite atingido
            openLimiteFranquiaDialog({
              hideLimitInfo: false,
              targetPassengerId: passageiro.id,
              onUpgradeSuccess: () => {
                // Resume action: Enable auto-billing
                updatePassageiro.mutate({
                  id: passageiro.id,
                  data: { enviar_cobranca_automatica: true },
                });
                refetchPassageiros();
              },
            });
          }
          return;
        }
      }

      updatePassageiro.mutate({
        id: passageiro.id,
        data: { enviar_cobranca_automatica: novoValor },
      });
    },
    [profile?.id, plano, updatePassageiro, validacaoFranquiaGeral]
  );

  const handleEdit = useCallback(
    (passageiro: Passageiro) => {
      // We can rely on the hook logic
      dialogActions.openEditPassageiro(passageiro);
    },
    [dialogActions]
  );

  const handleOpenNewDialog = useCallback(() => {
    if (isLimitedUser && isLimitReached) {
      openContextualUpsellDialog({
        feature: "passageiros",
        onSuccess: refetchPassageiros,
      });
      return;
    }

    // Use dialogActions
    dialogActions.openNewPassageiro();
  }, [
    isLimitedUser,
    isLimitReached,
    dialogActions,
    openContextualUpsellDialog,
    refetchPassageiros,
  ]);

  const handleCadastrarRapido = useCallback(async () => {
    if (!profile?.id) return;

    if (!escolas || escolas.length === 0) {
      toast.error("erro.operacao", {
        description: "passageiro.erro.escolaNecessaria",
      });
      return;
    }
    if (!veiculos || veiculos.length === 0) {
      toast.error("erro.operacao", {
        description: "passageiro.erro.veiculoNecessario",
      });
      return;
    }

    const hoje = new Date();
    const valor = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    const valorInString = `R$ ${valor},00`;

    const nomePassageiro = mockGenerator.name();
    const nomeResponsavel = mockGenerator.name();
    const emailResponsavel = mockGenerator.email(nomeResponsavel);
    const telefoneResponsavel = mockGenerator.phone();
    const cpfResponsavel = mockGenerator.cpf();
    const endereco = mockGenerator.address();

    const fakeData = {
      nome: nomePassageiro,
      nome_responsavel: nomeResponsavel,
      email_responsavel: emailResponsavel,
      telefone_responsavel: telefoneResponsavel,
      cpf_responsavel: cpfResponsavel,
      periodo: Math.random() > 0.5 ? "manha" : "tarde",
      observacoes: `Cadastro rápido gerado automaticamente`,
      valor_cobranca: valorInString,
      dia_vencimento: hoje.getDate(),
      escola_id: escolas[0].id,
      veiculo_id: veiculos[0].id,
      ativo: true,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      cep: endereco.cep,
    };

    const { restore } = updateQuickStartStepWithRollback("step_passageiros");

    createPassageiro.mutate(
      {
        ...fakeData,
        usuario_id: profile.id,
        emitir_cobranca_mes_atual: false,
      },
      {
        onError: () => {
          restore();
        },
      }
    );
  }, [profile?.id, escolas, veiculos, createPassageiro]);

  const handleHistorico = useCallback(
    (passageiro: Passageiro) => {
      navigate(`/passageiros/${passageiro.id}`);
    },
    [navigate]
  );

  const pullToRefreshReload = useCallback(async () => {
    await Promise.all([
      refetchPassageiros(),
      refetchEscolas(),
      refetchVeiculos(),
      refetchPrePassageiros(),
    ]);
    setRefreshKey((prev) => prev + 1);
  }, [
    refetchPassageiros,
    refetchEscolas,
    refetchVeiculos,
    refetchPrePassageiros,
  ]);

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
              className={cn(
                "space-y-6 mt-0",
                isLimitedUser && "pb-20 md:pb-0" // Padding extra para Mobile quando houver sticky footer
              )}
            >
              {isLimitedUser && limitePassageiros != null && (
                <PassengerLimitHealthBar
                  current={countPassageiros || 0}
                  max={limitePassageiros}
                  onIncreaseLimit={() =>
                    openContextualUpsellDialog({
                      feature: "passageiros",
                      targetPlan: PLANO_ESSENCIAL,
                    })
                  }
                  hideBelowThreshold={75} // Só exibe se uso >= 75% para evitar ansiedade prematura
                />
              )}

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

            <TabsContent 
              value="solicitacoes"
              className={cn(
                "mt-0",
                isLimitedUser && "pb-20 md:pb-0"
              )}
            >
              <PrePassageiros
                onFinalizeNewPrePassageiro={async () => Promise.resolve()}
                refreshKey={refreshKey}
                profile={profile}
                plano={plano}
              />
            </TabsContent>
          </Tabs>

          <PassageiroFormDialog
            isOpen={passageiroForm.isOpen}
            onClose={passageiroForm.onClose}
            onSuccess={passageiroForm.onSuccess}
            editingPassageiro={passageiroForm.editingPassageiro}
            mode={passageiroForm.mode}
            profile={profile}
            plano={plano}
          />

          <DialogExcessoFranquia
            isOpen={excessoFranquia.isOpen}
            onClose={excessoFranquia.onClose}
            limiteAtual={excessoFranquia.limiteAtual}
            limiteApos={excessoFranquia.limiteApos}
            contexto="reativacao"
            confirmText="Aumentar Limite"
            cancelText="Reativar sem cobrança"
            onVerPlanos={() => {
              excessoFranquia.onClose();
              // Open LimiteFranquiaDialog directly
              openLimiteFranquiaDialog({
                title: "Aumentar Limite de Cobranças",
                description:
                  "Você atingiu o limite do seu plano. Aumente sua franquia para continuar automatizando.",
                hideLimitInfo: false,
                targetPassengerId: excessoFranquia.passageiro?.id,
                onUpgradeSuccess: () => {
                  // Resume action: Reactivate passenger
                  if (excessoFranquia.passageiro) {
                    toggleAtivoPassageiro.mutate(
                      { id: excessoFranquia.passageiro.id, novoStatus: true },
                      {
                        onSuccess: () => {
                          toast.success(
                            "Passageiro reativado com sucesso com cobrança automática!"
                          );
                          refetchPassageiros();
                        },
                      }
                    );
                  }
                },
              });
            }}
            onContinuarSemAtivar={() => {
              excessoFranquia.onClose();

              if (excessoFranquia.passageiro) {
                updatePassageiro.mutate({
                  id: excessoFranquia.passageiro.id,
                  data: {
                    ativo: true,
                    enviar_cobranca_automatica: false,
                  },
                });
              }
            }}
          />
        </div>
      </PullToRefreshWrapper>
      <UpgradeStickyFooter
        visible={!!plano?.isFreePlan}
        title="Quer cadastrar todos seus passageiros?"
        description="Remova os limites do plano gratuito."
        buttonText="Ver Planos"
        onAction={() =>
          openContextualUpsellDialog({
            feature: "passageiros",
            onSuccess: refetchPassageiros,
          })
        }
      />

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
