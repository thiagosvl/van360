import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { MiniKPI } from "@/components/features/home/MiniKPI";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { ROUTES } from "@/constants/routes";
import { useDashboardViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { getMesNome } from "@/utils/formatters";
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
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { PassageiroTab } from "@/types/enums";

const Home = () => {
  const {
    profile,
    isLoading,
    financeiro,
    contadores,
    onboarding,
    dateContext,
    isCopied,
    handlePullToRefresh,
    handleCopyLink,
    handleOpenPassageiroDialog,
    handleOpenGastoDialog,
    handleOpenVeiculoDialog,
    handleOpenEscolaDialog,
    navigateTo,
  } = useDashboardViewModel();

  if (isLoading) {
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
              {financeiro.countAtrasos > 0
                ? `${financeiro.countAtrasos} passageiros em atraso`
                : "Tudo em dia por aqui!"}
            </p>
          </div>

          {/* Notificação de Solicitações Pendentes */}
          {contadores.passageirosSolicitacoes > 0 && (
            <section className="mb-4">
              <DashboardStatusCard
                type="info"
                title="Solicitações Pendentes"
                description={
                  contadores.passageirosSolicitacoes === 1
                    ? "Você tem 1 solicitação de novo passageiro aguardando aprovação."
                    : `Você tem ${contadores.passageirosSolicitacoes} solicitações de novos passageiros aguardando aprovação.`
                }
                actionLabel="Ver Solicitações"
                onAction={() =>
                  navigateTo(
                    `${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`,
                  )
                }
              />
            </section>
          )}

          {/* Onboarding - Primeiros Passos */}
          {onboarding.showOnboarding && (
            <section>
              <QuickStartCard
                onOpenVeiculoDialog={handleOpenVeiculoDialog}
                onOpenEscolaDialog={handleOpenEscolaDialog}
                onOpenPassageiroDialog={handleOpenPassageiroDialog}
              />
            </section>
          )}

          {/* Notificação de Mensalidades pendentes / em dia */}
          {!onboarding.showOnboarding && financeiro.recebido > 0 && (
            <section>
              {financeiro.countAtrasos > 0 ? (
                <DashboardStatusCard
                  type="pending"
                  title="Passageiros em Atraso"
                  description={`Você tem ${formatCurrency(
                    financeiro.totalEmAtraso,
                  )} em atraso de ${financeiro.countAtrasos} passageiro${
                    financeiro.countAtrasos != 1 ? "s" : ""
                  } referente ao mês de ${getMesNome(new Date().getMonth() + 1)}.`}
                  actionLabel="Ver Mensalidades"
                  onAction={() => navigateTo(ROUTES.PRIVATE.MOTORISTA.BILLING)}
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
              onboarding.showOnboarding
                ? "grid-cols-1 sm:grid-cols-1"
                : "grid-cols-1 sm:grid-cols-3",
            )}
          >
            {!onboarding.showOnboarding && (
              <>
                <MiniKPI
                  label="Recebido"
                  value={formatCurrency(financeiro.recebido)}
                  icon={DollarSign}
                  colorClass="text-emerald-600"
                  bgClass="bg-emerald-50"
                />
                <MiniKPI
                  label="A receber"
                  value={formatCurrency(financeiro.aReceber)}
                  icon={Wallet}
                  colorClass={
                    financeiro.aReceber > 0 ? "text-orange-600" : "text-gray-400"
                  }
                  bgClass={financeiro.aReceber > 0 ? "bg-orange-50" : "bg-gray-50"}
                />
              </>
            )}

            <MiniKPI
              className="border-none shadow-sm bg-white rounded-2xl overflow-hidden relative"
              label="Passageiros Ativos"
              value={contadores.passageirosAtivos}
              icon={Users}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
              subtext={`${contadores.passageirosInativos} inativo${
                contadores.passageirosInativos !== 1 ? "s" : ""
              }`}
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
                to={`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`}
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
