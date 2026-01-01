import {
  Check,
  CreditCard,
  DollarSign,
  FileText,
  HandCoins,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";
import PassageiroFormDialog from "@/components/dialogs/PassageiroFormDialog";
import VeiculoFormDialog from "@/components/dialogs/VeiculoFormDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Button } from "@/components/ui/button";

import { useLayout } from "@/contexts/LayoutContext";
import { useCobrancas } from "@/hooks/api/useCobrancas";
import { useEscolas } from "@/hooks/api/useEscolas";
import { usePassageiros } from "@/hooks/api/usePassageiros";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useSession } from "@/hooks/business/useSession";

import GastoFormDialog from "@/components/dialogs/GastoFormDialog";
import {
  FEATURE_GASTOS,
  FEATURE_LIMITE_PASSAGEIROS,
  PASSAGEIRO_COBRANCA_STATUS_PAGO,
  PLANO_ESSENCIAL,
} from "@/constants";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { formatCurrency } from "@/utils/formatters/currency";
import { toast } from "@/utils/notifications/toast";

// New Component Imports
import { LimitHealthBar } from "@/components/common/LimitHealthBar";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { MiniKPI } from "@/components/features/home/MiniKPI";
import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { useUpsellContent } from "@/hooks/business/useUpsellContent";

// --- Main Component ---

const Home = () => {
  const { setPageTitle, openPlanUpgradeDialog, openPixKeyDialog } = useLayout();
  const { user, loading: isSessionLoading } = useSession();

  // Use Access Control Hook
  // Use Access Control Hook
  const {
    profile,
    isLoading: isProfileLoading,
    plano,
    isFreePlan,
    isProfissional,
    canViewModuleGastos,
  } = usePermissions();

  const { limits: planLimits } = usePlanLimits({ profile, plano });

  const upsellContent = useUpsellContent(plano);

  const permissions = {
    isFreePlan,
    canViewGastos: canViewModuleGastos,
  };

  const limits = {
    passageiros: planLimits.passengers.limit,
    hasPassengerLimit: planLimits.passengers.hasLimit,
  };

  const navigate = useNavigate();

  // Dialog states
  const [isPassageiroDialogOpen, setIsPassageiroDialogOpen] = useState(false);
  const [editingPassageiro, setEditingPassageiro] = useState<Passageiro | null>(
    null
  );
  const [novaEscolaId, setNovaEscolaId] = useState<string | null>(null);
  const [novoVeiculoId, setNovoVeiculoId] = useState<string | null>(null);
  const [isCreatingEscola, setIsCreatingEscola] = useState(false);
  const [isCreatingVeiculo, setIsCreatingVeiculo] = useState(false);
  const [isGastoDialogOpen, setIsGastoDialogOpen] = useState(false);

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();



  // Queries
  const {
    data: cobrancasData,
    refetch: refetchCobrancas,
    isLoading: isLoadingCobrancas,
    isFetching: isFetchingCobrancas,
  } = useCobrancas(
    { usuarioId: profile?.id, mes: mesAtual, ano: anoAtual },
    { enabled: !!profile?.id }
  );

  const {
    data: passageirosData,
    refetch: refetchPassageiros,
    isLoading: isLoadingPassageiros,
    isFetching: isFetchingPassageiros,
  } = usePassageiros({ usuarioId: profile?.id }, { enabled: !!profile?.id });

  const {
    data: escolasData,
    refetch: refetchEscolas,
    isLoading: isLoadingEscolas,
    isFetching: isFetchingEscolas,
  } = useEscolas(profile?.id, {
    enabled: !!profile?.id,
  });

  const {
    data: veiculosData,
    refetch: refetchVeiculos,
    isLoading: isLoadingVeiculos,
    isFetching: isFetchingVeiculos,
  } = useVeiculos(profile?.id, {
    enabled: !!profile?.id,
  });

  // Estado de loading unificado - só renderiza conteúdo quando todas as queries terminarem
  const isInitialLoading = useMemo(() => {
    // Se não tem profile ainda, está carregando
    if (!profile?.id) return true;

    // Verifica se alguma query ainda está carregando pela primeira vez
    return (
      isLoadingCobrancas ||
      isLoadingPassageiros ||
      isLoadingEscolas ||
      isLoadingVeiculos
    );
  }, [
    profile?.id,
    isLoadingCobrancas,
    isLoadingPassageiros,
    isLoadingEscolas,
    isLoadingVeiculos,
  ]);

  // Derived Data
  const cobrancas = cobrancasData?.all || [];
  const passageirosList = passageirosData?.list || [];

  const escolasCount =
    (escolasData as { total?: number } | undefined)?.total ?? 0;
  const veiculosCount =
    (veiculosData as { total?: number } | undefined)?.total ?? 0;
  const passageirosCount = passageirosList.length;
  const passageirosAtivosCount = passageirosList.filter((p) => p.ativo).length;

  // Passenger Limit Logic
  const limitePassageiros = limits.passageiros;
  const hasPassengerLimit = limits.hasPassengerLimit;

  // Financial KPIs
  const receitaPrevista = cobrancas.reduce(
    (acc, c) => acc + Number(c.valor || 0),
    0
  );



  const cobrancasPendentes = cobrancas.filter(
    (c) => c.status !== PASSAGEIRO_COBRANCA_STATUS_PAGO
  );

  const aReceber = cobrancasPendentes.reduce(
    (acc, c) => acc + Number(c.valor || 0),
    0
  );

  // Status Logic
  const latePayments = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return cobrancas.filter((c) => {
      if (c.status === PASSAGEIRO_COBRANCA_STATUS_PAGO) return false;
      const vencimento = new Date(c.data_vencimento);
      return vencimento < hoje;
    });
  }, [cobrancas]);

  const totalEmAtraso = latePayments.reduce(
    (acc, c) => acc + Number(c.valor || 0),
    0
  );



  // Onboarding Logic (Layout Control)
  const hasPixKey = !!profile?.chave_pix;

  const completedSteps = [
    veiculosCount > 0,
    escolasCount > 0,
    passageirosCount > 0,
    isProfissional ? hasPixKey : null, // Only count PIX if professional
  ].filter((step) => step === true).length;

  const totalSteps = isProfissional ? 4 : 3;
  const showOnboarding = completedSteps < totalSteps;

  // Date Context
  const dateContext = useMemo(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return now.toLocaleDateString("pt-BR", options);
  }, []);

  // Effects
  useEffect(() => {
    if (profile?.apelido) {
      setPageTitle(`Olá, ${profile.apelido}`);
    } else {
      setPageTitle("Olá, Motorista");
    }
  }, [profile?.apelido, setPageTitle]);

  const handlePullToRefresh = async () => {
    await Promise.all([
      refetchCobrancas(),
      refetchPassageiros(),
      refetchEscolas(),
      refetchVeiculos(),
    ]);
  };

  // Copy Link Logic
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    if (!profile?.id) return;

    try {
      navigator.clipboard.writeText(buildPrepassageiroLink(profile?.id));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  };

  // Passageiro Dialog Handlers
  const handleOpenPassageiroDialog = useCallback(() => {
    // Validação de limite para plano gratuito
    if (permissions.isFreePlan) {
      const limite = Number(limits.passageiros || 0);
      if (passageirosCount >= limite) {
        // Para plano gratuito, o "upgrade" é trocar de plano (Contextual)
        // Callback: Ao sucesso, abrir o dialog de passageiro diretamente (bypass check)
        openPlanUpgradeDialog({
          feature: FEATURE_LIMITE_PASSAGEIROS,
          defaultTab: PLANO_ESSENCIAL,
          onSuccess: () => setIsPassageiroDialogOpen(true),
        });
        return;
      }
    }

    setEditingPassageiro(null);
    setIsPassageiroDialogOpen(true);
  }, [permissions.isFreePlan, limits.passageiros, passageirosCount]);

  const handleOpenGastoDialog = useCallback(() => {
    if (!permissions.canViewGastos) {
      // Callback: Ao sucesso, abrir o dialog de gastos diretamente
      openPlanUpgradeDialog({
        feature: FEATURE_GASTOS,
        defaultTab: PLANO_ESSENCIAL,
        onSuccess: () => setIsGastoDialogOpen(true),
      });
      return;
    }

    setIsGastoDialogOpen(true);
  }, [permissions.canViewGastos]);

  const handleClosePassageiroDialog = useCallback(() => {
    safeCloseDialog(() => {
      setNovoVeiculoId(null);
      setNovaEscolaId(null);
      setIsPassageiroDialogOpen(false);
    });
  }, []);

  // Quick Actions (Memoized)
  const quickActions = useMemo(
    () => [
      {
        icon: UserPlus,
        label: "Novo Passageiro",
        onClick: handleOpenPassageiroDialog,
        disabled: hasPassengerLimit && passageirosAtivosCount >= limitePassageiros,
        tooltip:
          hasPassengerLimit && passageirosAtivosCount >= limitePassageiros
            ? "Limite de passageiros atingido. Faça um upgrade para adicionar mais."
            : undefined,
        variant: "primary",
      },
      {
        icon: HandCoins,
        label: "Novo Gasto",
        onClick: () => setIsGastoDialogOpen(true),
        variant: "secondary",
      },
      {
        icon: FileText,
        label: null, // "Relatórios" removed as per request
        onClick: () => {}, // TODO
        disabled: true,
        variant: "ghost",
      },
    ],
    [
      handleOpenPassageiroDialog,
      hasPassengerLimit,
      passageirosAtivosCount,
      limitePassageiros,
    ]
  );

  const handleSuccessFormPassageiro = useCallback(() => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    // Invalidação feita automaticamente pelos hooks de mutation
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

  const handleEscolaCreated = useCallback(
    (novaEscola: any, keepOpen?: boolean) => {
      if (keepOpen) return;

      safeCloseDialog(() => {
        setIsCreatingEscola(false);
        setNovaEscolaId(novaEscola.id);
      });
    },
    []
  );

  const handleVeiculoCreated = useCallback((novoVeiculo: any) => {
    safeCloseDialog(() => {
      setIsCreatingVeiculo(false);
      setNovoVeiculoId(novoVeiculo.id);
    });
  }, []);

  if (isSessionLoading || isProfileLoading || isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
        <div className="space-y-6 pb-20">
          {/* Header Contextual */}
          <div className="px-1">
            <p className="text-sm text-gray-500 capitalize font-medium">
              {dateContext}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {latePayments.length > 0
                ? `${latePayments.length} cobrança${
                    latePayments.length != 1 ? "s" : ""
                  } em atraso`
                : "Nenhuma pendência hoje"}
            </p>
          </div>

          {/* Onboarding - Primeiros Passos */}
          {showOnboarding && (
            <section>
              <QuickStartCard
                onOpenVeiculoDialog={() => setIsCreatingVeiculo(true)}
                onOpenEscolaDialog={() => setIsCreatingEscola(true)}
                onOpenPassageiroDialog={() => setIsPassageiroDialogOpen(true)}
                onOpenPixKeyDialog={() => openPixKeyDialog()}
              />
            </section>
          )}

          {/* Mini KPIs */}
          <div
            className={cn(
              "grid gap-4",
              showOnboarding
                ? "grid-cols-1 sm:grid-cols-1"
                : "grid-cols-1 sm:grid-cols-3"
            )}
          >
            {!showOnboarding && (
              <>
                <MiniKPI
                  label="Receita Prevista"
                  value={formatCurrency(receitaPrevista)}
                  subtext={`${cobrancas.length} cobrança${
                    cobrancas.length !== 1 ? "s" : ""
                  }`}
                  icon={DollarSign}
                  colorClass="text-emerald-600"
                  bgClass="bg-emerald-50"
                  loading={isProfileLoading}
                />
                <MiniKPI
                  label="A Receber"
                  value={formatCurrency(aReceber)}
                  subtext={`${cobrancasPendentes.length} pendente${
                    cobrancasPendentes.length !== 1 ? "s" : ""
                  }`}
                  icon={Wallet}
                  colorClass={
                    aReceber > 0 ? "text-orange-600" : "text-gray-400"
                  }
                  bgClass={aReceber > 0 ? "bg-orange-50" : "bg-gray-50"}
                  loading={isProfileLoading}
                />
              </>
            )}
            {hasPassengerLimit ? (
              <div className="sm:col-span-1">
                <LimitHealthBar
                  current={passageirosCount}
                  max={Number(limitePassageiros)}
                  description={
                    Number(limitePassageiros) - passageirosCount <= 0
                      ? "Limite atingido."
                      : `${Number(limitePassageiros) - passageirosCount} ${
                          Number(limitePassageiros) - passageirosCount === 1
                            ? "vaga restante"
                            : "vagas restantes"
                        }.`
                  }
                  onIncreaseLimit={() =>
                    openPlanUpgradeDialog({
                      feature: FEATURE_LIMITE_PASSAGEIROS,
                      defaultTab: PLANO_ESSENCIAL,
                      targetPassengerCount: passageirosAtivosCount,
                      onSuccess: () => setIsPassageiroDialogOpen(true), // Retornar ao fluxo de cadastro
                    })
                  }
                  label="Passageiros Ativos"
                  className="mb-0"
                />
              </div>
            ) : (
              <MiniKPI
                className="border-none shadow-sm bg-white rounded-2xl overflow-hidden relative"
                label="Passageiros Ativos"
                value={passageirosAtivosCount}
                icon={Users}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
                loading={isProfileLoading}
              />
            )}
          </div>

          {/* Status Operacional */}
          {!showOnboarding && cobrancas.length > 0 && (
            <section>
              {latePayments.length > 0 ? (
                <DashboardStatusCard
                  type="pending"
                  title="Atenção às Cobranças"
                  description={`Você tem ${formatCurrency(
                    totalEmAtraso
                  )} em atraso de ${latePayments.length} passageiro${
                    latePayments.length != 1 ? "s" : ""
                  }.`}
                  actionLabel="Ver Cobranças"
                  onAction={() => navigate("/cobrancas")}
                />
              ) : (
                <DashboardStatusCard
                  type="success"
                  title="Tudo em dia!"
                  description={`Parabéns! Todas as cobranças vencidas foram pagas. Receita prevista: ${formatCurrency(
                    receitaPrevista
                  )}.`}
                />
              )}
            </section>
          )}

          {/* Acessos Rápidos */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
              <ShortcutCard
                onClick={handleOpenPassageiroDialog}
                icon={Plus}
                label="Cadastrar Passageiro"
                colorClass="text-indigo-600"
                bgClass="bg-indigo-50"
              />
              <ShortcutCard
                onClick={handleOpenGastoDialog}
                icon={TrendingDown}
                label="Registrar Gasto"
                colorClass="text-red-600"
                bgClass="bg-red-50"
              />
              <div
                onClick={handleCopyLink}
                className={cn(
                  "cursor-pointer group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md h-24 w-full",
                  isCopied && "border-green-200 bg-green-50"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300",
                    isCopied
                      ? "bg-green-100 text-green-600 scale-110"
                      : "bg-blue-50 text-blue-600 group-hover:scale-110"
                  )}
                >
                  {isCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold text-center leading-tight transition-colors duration-200",
                    isCopied
                      ? "text-green-700"
                      : "text-gray-700 group-hover:text-blue-700"
                  )}
                >
                  {isCopied ? "Copiado!" : "Link de Cadastro"}
                </span>
              </div>
              <ShortcutCard
                to="/passageiros"
                icon={Users}
                label="Passageiros"
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
              />
              <ShortcutCard
                to="/gastos"
                icon={TrendingUp}
                label="Gastos"
                colorClass="text-red-600"
                bgClass="bg-red-50"
              />
              <ShortcutCard
                to="/relatorios"
                icon={FileText}
                label="Relatórios"
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
              />
              <ShortcutCard
                to="/cobrancas"
                icon={CreditCard}
                label="Cobranças"
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <ShortcutCard
                to="/assinatura"
                icon={Receipt}
                label="Minha Assinatura"
                colorClass="text-yellow-600"
                bgClass="bg-yellow-50"
              />
            </div>
          </section>

          {/* Marketing / Upsell (Discreto) */}
          <section className="pt-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-24 w-24" />
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">{upsellContent.title}</h3>
                  <p className="text-indigo-100 text-sm mt-1 max-w-md">
                    {upsellContent.description}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none shadow-sm shrink-0"
                  onClick={upsellContent.action}
                >
                  {upsellContent.buttonText}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </PullToRefreshWrapper>

      {/* Dialogs */}
      {isPassageiroDialogOpen && (
        <PassageiroFormDialog
          isOpen={isPassageiroDialogOpen}
          onClose={handleClosePassageiroDialog}
          onSuccess={handleSuccessFormPassageiro}
          editingPassageiro={editingPassageiro}
          mode="create"
          profile={profile}
          plano={plano}
        />
      )}

      {isCreatingEscola && (
        <EscolaFormDialog
          isOpen={isCreatingEscola}
          onClose={handleCloseEscolaFormDialog}
          onSuccess={handleEscolaCreated}
          profile={profile}
          allowBatchCreation
        />
      )}

      {isCreatingVeiculo && (
        <VeiculoFormDialog
          isOpen={isCreatingVeiculo}
          onClose={handleCloseVeiculoFormDialog}
          onSuccess={handleVeiculoCreated}
          profile={profile}
        />
      )}

      {isGastoDialogOpen && (
        <GastoFormDialog
          isOpen={isGastoDialogOpen}
          onOpenChange={setIsGastoDialogOpen}
          veiculos={veiculosData?.list || []}
          usuarioId={profile?.id}
          onSuccess={() => {
            toast.success("Gasto registrado com sucesso!");
          }}
        />
      )}

    </>
  );
};

export default Home;
