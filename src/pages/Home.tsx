import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { KPICard } from "@/components/common/KPICard";
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
import { KPICardVariant, PassageiroTab } from "@/types/enums";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a5c]"></div>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
        <div className="space-y-6">
          {/* Header Contextual */}
          <div className="px-1">
            <p className="font-headline font-bold text-[#1a3a5c] text-sm capitalize">
              {dateContext}
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
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
                  )} em atraso de ${financeiro.countAtrasos} passageiro${financeiro.countAtrasos != 1 ? "s" : ""
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

          <div
            className={cn(
              "grid gap-4 px-1",
              onboarding.showOnboarding
                ? "grid-cols-1"
                : "grid-cols-2 lg:grid-cols-3",
            )}
          >
            {!onboarding.showOnboarding && (
              <>
                <KPICard
                  label="Recebido"
                  value={formatCurrency(financeiro.recebido)}
                  icon={DollarSign}
                  variant={KPICardVariant.PRIMARY}
                  loading={isLoading}
                />
                <KPICard
                  label="A receber"
                  value={formatCurrency(financeiro.aReceber)}
                  icon={Wallet}
                  variant={KPICardVariant.OUTLINE}
                  loading={isLoading}
                />
              </>
            )}
            <KPICard
              className={cn(!onboarding.showOnboarding && "col-span-2 lg:col-span-1")}
              label="Passageiros Ativos"
              value={contadores.passageirosAtivos}
              icon={Users}
              variant={KPICardVariant.OUTLINE}
              loading={isLoading}
            />
          </div>

          {/* Acessos Rápidos */}
          <section>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              <ShortcutCard
                onClick={handleOpenPassageiroDialog}
                icon={Plus}
                label="Cadastrar Passageiro"
              />
              <ShortcutCard
                onClick={handleOpenGastoDialog}
                icon={Plus}
                label="Registrar Gasto"
              />
              <ShortcutCard
                onClick={handleCopyLink}
                icon={Copy}
                activeIcon={CopyCheck}
                label={isCopied ? "Copiado!" : "Link de Cadastro"}
                isActive={isCopied}
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.PASSENGERS}
                icon={Users}
                label="Passageiros"
              />
              <ShortcutCard
                to={`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`}
                icon={UserCheck}
                label="Solicitações"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.EXPENSES}
                icon={TrendingDown}
                label="Gastos"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.REPORTS}
                icon={FileText}
                label="Relatórios"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.BILLING}
                icon={CreditCard}
                label="Mensalidades"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.CONTRACTS}
                icon={FileText}
                label="Contratos"
              />
            </div>
          </section>
        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Home;
