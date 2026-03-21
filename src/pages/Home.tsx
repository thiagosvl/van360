import { ROUTES } from "@/constants/routes";
import {
    Copy,
    CopyCheck,
    CreditCard,
    DollarSign,
    FileText,
    Plus,
    TrendingDown,
    UserCheck,
    Users,
    Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { useQueryClient } from "@tanstack/react-query";

import { getMessage } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import {
    useProfile,
    useSession,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { formatCurrency } from "@/utils/formatters/currency";

import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { MiniKPI } from "@/components/features/home/MiniKPI";
import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import {
    PassageiroFormModes
} from "@/types/enums";
import { getMesNome } from "@/utils/formatters";

const Home = () => {
  const {
    setPageTitle,
    openEscolaFormDialog,
    openVeiculoFormDialog,
    openPassageiroFormDialog,
    openGastoFormDialog,
    openFirstChargeDialog,
  } = useLayout();
  const { loading: isSessionLoading } = useSession();

  const {
    profile,
    isLoading: isProfileLoading,
    summary: systemSummary,
  } = useProfile();

  const navigate = useNavigate();

  const [/* novaEscolaId */, setNovaEscolaId] = useState<string | null>(null);
  const [/* novoVeiculoId */, setNovoVeiculoId] = useState<string | null>(null);

  // Financial metrics from summary
  const recebido = systemSummary?.financeiro?.receita?.realizada ?? 0;
  const aReceber = systemSummary?.financeiro?.receita?.pendente ?? 0;
  const totalEmAtraso = systemSummary?.financeiro?.atrasos?.valor ?? 0;
  const countAtrasos = systemSummary?.financeiro?.atrasos?.count ?? 0;

  // Counters from summary
  const escolasCount = systemSummary?.contadores?.escolas?.total ?? 0;
  const veiculosCount = systemSummary?.contadores?.veiculos?.total ?? 0;
  const passageirosCount = systemSummary?.contadores?.passageiros?.total ?? 0;
  const passageirosAtivosCount = systemSummary?.contadores?.passageiros?.ativos ?? 0;
  const passageirosInativosCount = systemSummary?.contadores?.passageiros?.inativos ?? 0;
  const passageirosSolicitacoesCount = systemSummary?.contadores?.passageiros?.solicitacoes_pendentes ?? 0;

  const completedSteps = [
    veiculosCount > 0,
    escolasCount > 0,
    passageirosCount > 0,
  ].filter((step) => step === true).length;

  const totalSteps = 3;
  const showOnboarding = completedSteps < totalSteps;

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
      setPageTitle("home.info.saudacaoPadrao");
    }
  }, [profile?.apelido, setPageTitle]);

  const queryClient = useQueryClient();

  const handlePullToRefresh = async () => {
    await Promise.all([queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] })]);
  };

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

  const handleSuccessFormPassageiro = useCallback((passageiro?: any) => {
    setNovoVeiculoId(null);
    setNovaEscolaId(null);
    if (passageiro) {
      openFirstChargeDialog({ passageiro });
    }
  }, [openFirstChargeDialog]);

  const handleOpenPassageiroDialog = useCallback(() => {
    openPassageiroFormDialog({
      mode: PassageiroFormModes.CREATE,
      onSuccess: handleSuccessFormPassageiro,
    });
  }, [openPassageiroFormDialog, handleSuccessFormPassageiro]);

  const handleOpenGastoDialog = useCallback(() => {
    openGastoFormDialog({
      onSuccess: () => {},
    });
  }, [openGastoFormDialog]);

  const handleEscolaCreated = useCallback(
    (novaEscola: any, keepOpen?: boolean) => {
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      if (keepOpen) return;
      setNovaEscolaId(novaEscola.id);
    },
    [queryClient],
  );

  const handleVeiculoCreated = useCallback(
    (novoVeiculo: any, keepOpen?: boolean) => {
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      if (keepOpen) return;
      setNovoVeiculoId(novoVeiculo.id);
    },
    [queryClient],
  );

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
        <div className="space-y-6">
          {/* Header Contextual */}
          <div className="px-1">
            <p className="text-sm text-gray-500 capitalize font-medium">
              {dateContext}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {countAtrasos > 0
                ? `${countAtrasos} ${getMessage("home.info.passageirosEmAtraso")}`
                : getMessage("home.info.semPendencias")}
            </p>
          </div>

          {/* Notificação de Solicitações Pendentes */}
          {passageirosSolicitacoesCount > 0 && (
            <section className="mb-4">
              <DashboardStatusCard
                type="info"
                title="Solicitações Pendentes"
                description={
                  passageirosSolicitacoesCount === 1
                    ? "Você tem 1 solicitação de novo passageiro aguardando aprovação."
                    : `Você tem ${passageirosSolicitacoesCount} solicitações de novos passageiros aguardando aprovação.`
                }
                actionLabel="Ver Solicitações"
                onAction={() =>
                  navigate(
                    `${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=solicitacoes`,
                  )
                }
              />
            </section>
          )}

          {/* Onboarding - Primeiros Passos */}
          {showOnboarding && (
            <section>
              <QuickStartCard
                onOpenVeiculoDialog={() => {
                  openVeiculoFormDialog({
                    allowBatchCreation: true,
                    onSuccess: handleVeiculoCreated,
                  });
                }}
                onOpenEscolaDialog={() => {
                  openEscolaFormDialog({
                    allowBatchCreation: true,
                    onSuccess: handleEscolaCreated,
                  });
                }}
                onOpenPassageiroDialog={() => {
                  openPassageiroFormDialog({
                    mode: PassageiroFormModes.CREATE,
                    onSuccess: (passageiro) => {
                      handleSuccessFormPassageiro(passageiro);
                    },
                  });
                }}
              />
            </section>
          )}

          {/* Notificação de Mensalidades pendentes / em dia */}
          {!showOnboarding && recebido > 0 && (
            <section>
              {countAtrasos > 0 ? (
                <DashboardStatusCard
                  type="pending"
                  title="Passageiros em Atraso"
                  description={`Você tem ${formatCurrency(
                    totalEmAtraso,
                  )} em atraso de ${countAtrasos} passageiro${
                    countAtrasos != 1 ? "s" : ""
                  } referente ao mês de ${getMesNome(new Date().getMonth() + 1)}.`}
                  actionLabel="Ver Mensalidades"
                  onAction={() => navigate(ROUTES.PRIVATE.MOTORISTA.BILLING)}
                />
              ) : (
                <DashboardStatusCard
                  type="success"
                  title={`Mensalidades de ${getMesNome(new Date().getMonth() + 1)} em dia!`}
                  description={`Todas as mensalidades vencidas do mês foram pagas.`}
                />
              )}
            </section>
          )}

          {/* Mini KPIs */}
          <div
            className={cn(
              "grid gap-4",
              showOnboarding
                ? "grid-cols-1 sm:grid-cols-1"
                : "grid-cols-1 sm:grid-cols-3",
            )}
          >
            {!showOnboarding && (
              <>
                <MiniKPI
                  label="Recebido"
                  value={formatCurrency(recebido)}
                  icon={DollarSign}
                  colorClass="text-emerald-600"
                  bgClass="bg-emerald-50"
                  loading={isProfileLoading}
                />
                <MiniKPI
                  label="A receber"
                  value={formatCurrency(aReceber)}
                  icon={Wallet}
                  colorClass={
                    aReceber > 0 ? "text-orange-600" : "text-gray-400"
                  }
                  bgClass={aReceber > 0 ? "bg-orange-50" : "bg-gray-50"}
                  loading={isProfileLoading}
                />
              </>
            )}

            <MiniKPI
              className="border-none shadow-sm bg-white rounded-2xl overflow-hidden relative"
              label="Passageiros Ativos"
              value={passageirosAtivosCount}
              icon={Users}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
              subtext={`${passageirosInativosCount} inativo${
                passageirosInativosCount !== 1 ? "s" : ""
              }`}
              loading={isProfileLoading}
            />
          </div>

          {/* Acessos Rápidos */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              <ShortcutCard
                onClick={handleOpenPassageiroDialog}
                icon={Plus}
                label="Cadastrar Passageiro"
                colorClass="text-indigo-600"
                bgClass="bg-indigo-50"
              />
              <ShortcutCard
                onClick={handleOpenGastoDialog}
                icon={Plus}
                label="Registrar Gasto"
                colorClass="text-red-600"
                bgClass="bg-red-50"
              />
              <div
                onClick={handleCopyLink}
                className={cn(
                  "cursor-pointer group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md h-24 w-full",
                  isCopied && "border-green-200 bg-green-50",
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300",
                    isCopied
                      ? "bg-green-100 text-green-600 scale-110"
                      : "bg-blue-50 text-blue-600 group-hover:scale-110",
                  )}
                >
                  {isCopied ? (
                    <CopyCheck className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold text-center leading-tight transition-colors duration-200",
                    isCopied
                      ? "text-green-700"
                      : "text-gray-700 group-hover:text-blue-700",
                  )}
                >
                  {isCopied ? "Copiado!" : "Link de Cadastro"}
                </span>
              </div>
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.PASSENGERS}
                icon={Users}
                label="Passageiros"
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
              />
              <ShortcutCard
                to={`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=solicitacoes`}
                icon={UserCheck}
                label="Solicitações"
                colorClass="text-pink-600"
                bgClass="bg-pink-50"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.EXPENSES}
                icon={TrendingDown}
                label="Controle de Gastos"
                colorClass="text-red-600"
                bgClass="bg-red-50"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.REPORTS}
                icon={FileText}
                label="Relatórios"
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.BILLING}
                icon={CreditCard}
                label="Mensalidades"
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.CONTRACTS}
                icon={FileText}
                label="Contratos"
                colorClass="text-cyan-600"
                bgClass="bg-cyan-50"
              />
            </div>
          </section>
        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Home;
