import {
  Check,
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

import { useLayout } from "@/contexts/LayoutContext";
import { useCobrancas } from "@/hooks/api/useCobrancas";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useSession } from "@/hooks/business/useSession";

import {
  FEATURE_GASTOS,
  FEATURE_LIMITE_PASSAGEIROS,
  PASSAGEIRO_COBRANCA_STATUS_PAGO,
  PLANO_ESSENCIAL,
} from "@/constants";
import { cn } from "@/lib/utils";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { formatCurrency } from "@/utils/formatters/currency";
import { toast } from "@/utils/notifications/toast";

// New Component Imports
import { LimitHealthBar } from "@/components/common/LimitHealthBar";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { MiniKPI } from "@/components/features/home/MiniKPI";
import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { useUpsellContent } from "@/hooks/business/useUpsellContent";

// --- Main Component ---

const Home = () => {
  const {
    setPageTitle,
    openPlanUpgradeDialog,
    openPixKeyDialog,
    openEscolaFormDialog,
    openVeiculoFormDialog,
    openPassageiroFormDialog,
    openGastoFormDialog,
  } = useLayout();
  const { user, loading: isSessionLoading } = useSession();

  // Use Access Control Hook
  const {
    profile,
    isLoading: isProfileLoading,
    plano,
    isFreePlan,
    isProfissional,
    canViewModuleGastos,
  } = usePermissions();

  const { limits: planLimits } = usePlanLimits();
  const { data: systemSummary } = useUsuarioResumo(); // New Unified Hook

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

  const [novaEscolaId, setNovaEscolaId] = useState<string | null>(null);
  const [novoVeiculoId, setNovoVeiculoId] = useState<string | null>(null);

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // Queries
  const {
    data: cobrancasData,
    refetch: refetchCobrancas,
    isLoading: isLoadingCobrancas,
  } = useCobrancas(
    { usuarioId: profile?.id, mes: mesAtual, ano: anoAtual },
    { enabled: !!profile?.id }
  );

  // Escolas e Veículos: Usamos apenas para o create/refresh. As contagens vêm do systemSummary
  // Podemos manter os refetchs, mas não precisamos das datas para o render principal

  // Estado de loading unificado
  const isInitialLoading = useMemo(() => {
    if (!profile?.id) return true;
    return isLoadingCobrancas || !systemSummary;
  }, [profile?.id, isLoadingCobrancas, systemSummary]);

  // Derived Data
  const cobrancas = cobrancasData?.all || [];

  const escolasCount = systemSummary?.contadores.escolas.total ?? 0;
  const veiculosCount = systemSummary?.contadores.veiculos.total ?? 0;

  // Mantemos a lista de passageiros pois ela tem flags (ativo) que podem não estar sincadas
  // ou usamos o contador do resumo, MAS o Home.tsx usa para filtrar 'passageirosAtivosCount'
  // O resumo JÁ TEM passageiros ativos.
  const passageirosCount = systemSummary?.contadores.passageiros.total ?? 0;
  const passageirosAtivosCount =
    systemSummary?.contadores.passageiros.ativos ?? 0;

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

  // Onboarding Logic
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

  const { refetch: refetchSummary } = useUsuarioResumo();
  const queryClient = useQueryClient();

  const handlePullToRefresh = async () => {
    await Promise.all([refetchCobrancas(), refetchSummary()]);
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

  // Dialog Handlers
  const handleSuccessFormPassageiro = useCallback(() => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    refetchSummary();
  }, [refetchSummary]);

  const handleOpenPassageiroDialog = useCallback(() => {
    if (
      permissions.isFreePlan &&
      hasPassengerLimit &&
      passageirosCount >= limits.passageiros
    ) {
      openPlanUpgradeDialog({
        feature: FEATURE_LIMITE_PASSAGEIROS,
        defaultTab: PLANO_ESSENCIAL,
        targetPassengerCount: passageirosAtivosCount,
        onSuccess: () =>
          openPassageiroFormDialog({
            mode: "create",
            onSuccess: handleSuccessFormPassageiro,
          }),
      });
      return;
    }
    openPassageiroFormDialog({
      mode: "create",
      onSuccess: handleSuccessFormPassageiro,
    });
  }, [
    permissions.isFreePlan,
    limits.passageiros,
    passageirosCount,
    openPassageiroFormDialog,
    handleSuccessFormPassageiro,
    hasPassengerLimit,
    openPlanUpgradeDialog,
    passageirosAtivosCount,
  ]);

  const handleOpenGastoDialog = useCallback(() => {
    const triggerGasto = () => {
      openGastoFormDialog({
        onSuccess: () => {
          toast.success("Gasto registrado com sucesso!");
          refetchCobrancas();
        },
      });
    };

    if (!permissions.canViewGastos) {
      openPlanUpgradeDialog({
        feature: FEATURE_GASTOS,
        defaultTab: PLANO_ESSENCIAL,
        onSuccess: triggerGasto,
      });
      return;
    }

    triggerGasto();
  }, [
    permissions.canViewGastos,
    openPlanUpgradeDialog,
    openGastoFormDialog,
    refetchCobrancas,
  ]);

  const handleEscolaCreated = useCallback(
    (novaEscola: any, keepOpen?: boolean) => {
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      refetchSummary();
      if (keepOpen) return;
      setNovaEscolaId(novaEscola.id);
    },
    [queryClient, refetchSummary]
  );

  const handleVeiculoCreated = useCallback(
    (novoVeiculo: any, keepOpen?: boolean) => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      refetchSummary();
      if (keepOpen) return;
      setNovoVeiculoId(novoVeiculo.id);
    },
    [queryClient, refetchSummary]
  );

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
                onOpenVeiculoDialog={() =>
                  openVeiculoFormDialog({
                    allowBatchCreation: true,
                    onSuccess: handleVeiculoCreated,
                  })
                }
                onOpenEscolaDialog={() =>
                  openEscolaFormDialog({
                    allowBatchCreation: true,
                    onSuccess: handleEscolaCreated,
                  })
                }
                onOpenPassageiroDialog={() =>
                  openPassageiroFormDialog({
                    mode: "create",
                    onSuccess: handleSuccessFormPassageiro,
                  })
                }
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
                      onSuccess: () =>
                        openPassageiroFormDialog({
                          mode: "create",
                          onSuccess: handleSuccessFormPassageiro,
                        }),
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

          {/* Status Operacional & Alertas System Summary */}
          {/* WhatsApp Disconnected Alert */}
          {systemSummary?.usuario.flags.whatsapp_status === "DISCONNECTED" && (
            <section className="mb-4">
              <DashboardStatusCard
                type="pending"
                title="WhatsApp Desconectado"
                description="Seu WhatsApp não está enviando mensagens. Reconecte agora."
                actionLabel="Reconectar"
                onAction={() => {
                  /* TODO: Open WhatsApp Dialog via URL or context */
                }}
              />
            </section>
          )}

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
                to="/passageiros?tab=solicitacoes"
                icon={UserCheck}
                label="Solicitações"
                colorClass="text-pink-600"
                bgClass="bg-pink-50"
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
    </>
  );
};

export default Home;
