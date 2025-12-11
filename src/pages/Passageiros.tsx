// Imports updated
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { DialogExcessoFranquia } from "@/components/dialogs/DialogExcessoFranquia";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import LimiteFranquiaDialog from "@/components/dialogs/LimiteFranquiaDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
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
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCreatePassageiro,
  useDeletePassageiro,
  useEscolas,
  useFilters,
  usePassageiros,
  usePrePassageiros,
  useToggleAtivoPassageiro,
  useUpdatePassageiro,
  useValidarFranquia,
  useVeiculos,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import { mockGenerator } from "@/utils/mockDataGenerator";
import { toast } from "@/utils/notifications/toast";
import { Users2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Passageiros() {
  const [novaEscolaId, setNovaEscolaId] = useState<string | null>(null);
  const [novoVeiculoId, setNovoVeiculoId] = useState<string | null>(null);
  const [isCreatingEscola, setIsCreatingEscola] = useState(false);
  const [isCreatingVeiculo, setIsCreatingVeiculo] = useState(false);
  const { setPageTitle } = useLayout();

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

  const [isDialogOpen, setIsDialogOpen] = useState(() => {
    const openModal = searchParams.get("openModal");
    return openModal === "true";
  });
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(
    null
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

  const [modePassageiroFormDialog, setModePassageiroFormDialog] = useState<
    "create" | "edit" | "finalize"
  >("create");
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

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    passageiroId: string;
  }>({ open: false, passageiroId: "" });
  const [confirmToggleDialog, setConfirmToggleDialog] = useState({
    open: false,
    passageiro: null as Passageiro | null,
    action: "" as "ativar" | "desativar" | "",
  });
  const [limiteFranquiaDialog, setLimiteFranquiaDialog] = useState<{
    open: boolean;
    franquiaContratada: number;
    cobrancasEmUso: number;
    title?: string;
    description?: string;
    hideLimitInfo?: boolean;
  }>({
    open: false,
    franquiaContratada: 0,
    cobrancasEmUso: 0,
  });
  
  const [dialogExcessoFranquia, setDialogExcessoFranquia] = useState<{
    open: boolean;
    limiteAtual: number;
    limiteApos: number;
    passageiro: Passageiro | null;
  }>({
    open: false,
    limiteAtual: 0,
    limiteApos: 0,
    passageiro: null,
  });
  const [pendingActionPassageiro, setPendingActionPassageiro] = useState<Passageiro | null>(null);

  const { validacao: validacaoFranquiaGeral } = useValidarFranquia(
    user?.id,
    undefined,
    profile
  );

  const handleOpenUpgradeDialog = useCallback(() => {
    setLimiteFranquiaDialog({
      open: true,
      franquiaContratada: validacaoFranquiaGeral.franquiaContratada,
      cobrancasEmUso: validacaoFranquiaGeral.cobrancasEmUso,
      title: "Cobrança Automática",
      description: "A Cobrança Automática envia as faturas e lembretes sozinha. Automatize sua rotina com o Plano Completo.",
      hideLimitInfo: true,
    });
  }, [validacaoFranquiaGeral]);

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
        description: "Não foi possível obter os dados no momento.",
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPageTitle("Passageiros");
  }, [countPassageirosAtivos, setPageTitle]);

  const handleSuccessFormPassageiro = useCallback(() => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    // Invalidação feita automaticamente pelos hooks de mutation
    // Não é necessário fazer refetch manual - o React Query já refaz as queries invalidadas
  }, []);

  const handleClosePassageiroFormDialog = useCallback(() => {
    safeCloseDialog(() => {
      setNovoVeiculoId(null);
      setNovaEscolaId(null);
      setIsDialogOpen(false);
    });
  }, []);

  const handleCloseEscolaFormDialog = useCallback(() => {
    safeCloseDialog(() => {
      setIsCreatingEscola(false);
    });
  }, []);

  const handleCloseVeiculoFormDialog = useCallback(() => {
    safeCloseDialog(() => {
      setIsCreatingVeiculo(false);
    });
  }, []);

  const handleEscolaCreated = useCallback((novaEscola: any) => {
    safeCloseDialog(() => {
      setIsCreatingEscola(false);
      setNovaEscolaId(novaEscola.id);
    });
  }, []);

  const handleVeiculoCreated = useCallback((novoVeiculo: any) => {
    safeCloseDialog(() => {
      setIsCreatingVeiculo(false);
      setNovoVeiculoId(novoVeiculo.id);
    });
  }, []);

  const handleFinalizeNewPrePassageiro = useCallback(async () => {
    // Invalidação feita automaticamente pelos hooks de mutation
  }, []);

  const handleDelete = useCallback(async () => {
    deletePassageiro.mutate(deleteDialog.passageiroId, {
      onSuccess: () => {
        setDeleteDialog({ open: false, passageiroId: "" });
      },
    });
  }, [deleteDialog.passageiroId, deletePassageiro]);

  const handleToggleClick = useCallback((passageiro: Passageiro) => {
    const action = passageiro.ativo ? "desativar" : "ativar";
    setConfirmToggleDialog({ open: true, passageiro, action });
  }, []);

  const handleToggleConfirm = useCallback(async () => {
    const p = confirmToggleDialog.passageiro;
    if (!p) return;

    const novoStatus = !p.ativo;

    if (novoStatus && canUseCobrancaAutomatica(plano) && p.enviar_cobranca_automatica) {
      const franquiaContratada = validacaoFranquiaGeral.franquiaContratada;
      const cobrancasEmUso = validacaoFranquiaGeral.cobrancasEmUso;

      const limiteApos = cobrancasEmUso + 1;

      if (limiteApos > franquiaContratada) {
        setDialogExcessoFranquia({
          open: true,
          limiteAtual: franquiaContratada,
          limiteApos,
          passageiro: p,
        });
        setConfirmToggleDialog({ open: false, passageiro: null, action: "" });
        return;
      }
    }

    toggleAtivoPassageiro.mutate(
      { id: p.id, novoStatus },
      {
        onSuccess: () => {
          setConfirmToggleDialog({ open: false, passageiro: null, action: "" });
        },
      }
    );
  }, [
    confirmToggleDialog.passageiro,
    toggleAtivoPassageiro,
    plano,
    validacaoFranquiaGeral,
  ]);

  const handleToggleCobrancaAutomatica = useCallback(
    async (passageiro: Passageiro) => {
      if (!profile?.id) return;

      const novoValor = !passageiro.enviar_cobranca_automatica;

      if (novoValor && canUseCobrancaAutomatica(plano)) {
        const franquiaContratada = validacaoFranquiaGeral.franquiaContratada;
        let cobrancasEmUso = validacaoFranquiaGeral.cobrancasEmUso;

        if (passageiro.enviar_cobranca_automatica === true) {
          cobrancasEmUso = Math.max(0, cobrancasEmUso - 1);
        }

        const restante = Math.max(0, franquiaContratada - cobrancasEmUso);
        const podeAtivar = restante > 0;

        if (!podeAtivar) {
          setLimiteFranquiaDialog({
            open: true,
            franquiaContratada,
            cobrancasEmUso,
            // Reset custom props if needed, but for "limit reached" they are not used
            title: undefined,
            description: undefined,
            hideLimitInfo: false,
          });
          setPendingActionPassageiro(passageiro);
          return;
        }
      }

      updatePassageiro.mutate({
        id: passageiro.id,
        data: { enviar_cobranca_automatica: novoValor },
      });
    },
    [
      profile?.id,
      plano,
      updatePassageiro,
      validacaoFranquiaGeral,
    ]
  );

  const handleUpgradeSuccess = useCallback(() => {
    // Backend activates passenger via webhook (using targetPassengerId passed to dialog).
    // Just refresh the list to reflect status.
    refetchPassageiros();
    setPendingActionPassageiro(null);
  }, [refetchPassageiros]);

  const handleEdit = useCallback((passageiro: Passageiro) => {
    safeCloseDialog(() => {
      setEditingPassageiro(passageiro);
      setModePassageiroFormDialog("edit");
      setIsDialogOpen(true);
    });
  }, []);

  const handleOpenNewDialog = useCallback(() => {
    safeCloseDialog(() => {
      setEditingPassageiro(null);
      setModePassageiroFormDialog("create");
      setIsDialogOpen(true);
    });
  }, []);

  const handleCadastrarRapido = useCallback(async () => {
    if (!profile?.id) return;

    if (!escolas || escolas.length === 0) {
      toast.error("erro.operacao", {
        description:
          "Cadastre pelo menos uma escola ativa antes de usar o Cadastro FAKE.",
      });
      return;
    }
    if (!veiculos || veiculos.length === 0) {
      toast.error("erro.operacao", {
        description:
          "Cadastre pelo menos um veículo ativo antes de usar o Cadastro FAKE.",
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
        emitir_cobranca_mes_atual: true,
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

  const limitePassageiros =
    profile?.assinaturas_usuarios?.[0]?.planos?.limite_passageiros ?? null;
  const restantePassageiros =
    isActionLoading || isPassageirosLoading || countPassageiros == null
      ? null
      : limitePassageiros == null
      ? null
      : Number(limitePassageiros) - countPassageiros;
  const isLimitedUser = !!plano && plano.isFreePlan;
  const isLimitReached =
    typeof restantePassageiros === "number" && restantePassageiros <= 0;

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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
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

            <TabsContent value="passageiros" className="space-y-6 mt-0">
              {isLimitedUser && limitePassageiros != null && (
                <PassengerLimitHealthBar
                  current={countPassageiros || 0}
                  max={limitePassageiros}
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
                      isRegisterDisabled={isLimitedUser && isLimitReached}
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
                      onSetDeleteDialog={(id) =>
                        setDeleteDialog({ open: true, passageiroId: id })
                      }
                      onOpenUpgradeDialog={handleOpenUpgradeDialog}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solicitacoes">
              <PrePassageiros
                onFinalizeNewPrePassageiro={handleFinalizeNewPrePassageiro}
                refreshKey={refreshKey}
                profile={profile}
                plano={plano}
              />
            </TabsContent>
          </Tabs>

          <PassageiroFormDialog
            isOpen={isDialogOpen}
            onClose={handleClosePassageiroFormDialog}
            onSuccess={handleSuccessFormPassageiro}
            editingPassageiro={editingPassageiro}
            onCreateEscola={() => setIsCreatingEscola(true)}
            onCreateVeiculo={() => setIsCreatingVeiculo(true)}
            mode={modePassageiroFormDialog}
            novaEscolaId={novaEscolaId}
            novoVeiculoId={novoVeiculoId}
            profile={profile}
            plano={plano}
          />

          <EscolaFormDialog
            isOpen={isCreatingEscola}
            onClose={handleCloseEscolaFormDialog}
            onSuccess={handleEscolaCreated}
            profile={profile}
          />

          <VeiculoFormDialog
            isOpen={isCreatingVeiculo}
            onClose={handleCloseVeiculoFormDialog}
            onSuccess={handleVeiculoCreated}
            profile={profile}
          />

          <ConfirmationDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog({ open, passageiroId: "" })}
            title="Excluir Passageiro"
            description="Deseja excluir permanentemente este passageiro? Essa ação não pode ser desfeita."
            onConfirm={handleDelete}
            confirmText="Excluir Passageiro"
            variant="destructive"
            isLoading={deletePassageiro.isPending}
          />

          <ConfirmationDialog
            open={confirmToggleDialog.open}
            onOpenChange={(open) =>
              setConfirmToggleDialog({
                open,
                passageiro: null,
                action: "",
              })
            }
            title={
              confirmToggleDialog.action === "ativar"
                ? "Reativar Passageiro"
                : "Desativar Passageiro"
            }
            description={
              confirmToggleDialog.action === "ativar"
                ? "Deseja realmente reativar este passageiro? Esta ação pode afetar a geração de cobranças."
                : "Deseja realmente desativar este passageiro? Esta ação pode afetar a geração de cobranças."

            }
            onConfirm={handleToggleConfirm}
            confirmText="Confirmar"
            variant={
              confirmToggleDialog.action === "ativar"
                ? "default"
                : "destructive"
            }
            isLoading={toggleAtivoPassageiro.isPending}
          />

          <LimiteFranquiaDialog
            open={limiteFranquiaDialog.open}
            onOpenChange={(open) =>
              setLimiteFranquiaDialog((prev) => ({ ...prev, open }))
            }
            franquiaContratada={limiteFranquiaDialog.franquiaContratada}
            cobrancasEmUso={limiteFranquiaDialog.cobrancasEmUso}
            usuarioId={profile?.id}
            totalPassageiros={countPassageiros || 0}
            onUpgradeSuccess={handleUpgradeSuccess}
            dataVencimento={
              profile?.assinaturas_usuarios?.[0]?.vigencia_fim ??
              profile?.assinaturas_usuarios?.[0]?.anchor_date
            }
            valorAtualMensal={
              profile?.assinaturas_usuarios?.[0]?.preco_aplicado ??
              profile?.assinaturas_usuarios?.[0]?.planos?.preco
            }
            targetPassengerId={pendingActionPassageiro?.id}
            title={limiteFranquiaDialog.title}
            description={limiteFranquiaDialog.description}
            hideLimitInfo={limiteFranquiaDialog.hideLimitInfo}
          />

          <DialogExcessoFranquia
            isOpen={dialogExcessoFranquia.open}
            onClose={() =>
              setDialogExcessoFranquia((prev) => ({ ...prev, open: false }))
            }
            limiteAtual={dialogExcessoFranquia.limiteAtual}
            limiteApos={dialogExcessoFranquia.limiteApos}
            contexto="reativacao"
            onVerPlanos={() => {
              setDialogExcessoFranquia((prev) => ({ ...prev, open: false }));
              navigate("/planos");
            }}
            onContinuarSemAtivar={() => {
              setDialogExcessoFranquia((prev) => ({ ...prev, open: false }));
              if (dialogExcessoFranquia.passageiro) {
                updatePassageiro.mutate({
                  id: dialogExcessoFranquia.passageiro.id,
                  data: {
                    ativo: true,
                    enviar_cobranca_automatica: false
                  }
                });
              }
            }}
          />
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
