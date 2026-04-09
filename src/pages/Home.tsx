import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";
import { KPICard } from "@/components/common/KPICard";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { TrialBanner } from "@/components/features/subscription/TrialBanner";
import { ROUTES } from "@/constants/routes";
import { useDashboardViewModel } from "@/hooks";
import { SubscriptionStatus, SubscriptionIdentifer } from "@/types/enums";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { getMesNome } from "@/utils/formatters";
import {
  Copy,
  CopyCheck,
  CreditCard,
  FileText,
  Plus,
  TrendingDown,
  UserCheck,
  Users,
} from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { KPICardVariant, PassageiroTab } from "@/types/enums";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";
import { getNowBR } from "@/utils/dateUtils";

const Home = () => {
  const {
    profile,
    subscription,
    plans,
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
    openSaaSCheckoutDialog,
    navigateTo,
  } = useDashboardViewModel();

  if (isLoading) {
    return <HomeSkeleton />;
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
                ? `${financeiro.countAtrasos} mensalidades em atraso`
                : "Tudo em dia por aqui!"}
            </p>
          </div>

          {/* Banner de Trial (SaaS) */}
          {subscription?.status === SubscriptionStatus.TRIAL && subscription.trialDaysLeft !== undefined && (
            <TrialBanner
              daysLeft={subscription.trialDaysLeft}
              onSubscribe={() => {
                if (plans && plans.length > 0) {
                  const defaultPlan = plans.find(p => p.identificador === SubscriptionIdentifer.YEARLY) ?? plans[0];
                  openSaaSCheckoutDialog({
                    plans,
                    initialPlanId: defaultPlan.id
                  });
                } else {
                  navigateTo(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION);
                }
              }}
            />
          )}

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

          {/* Notificação de Mensalidades pendentes */}
          {!onboarding.showOnboarding && financeiro.countAtrasos > 0 && (
            <section>
              <DashboardStatusCard
                type="pending"
                title="Mensalidades em Atraso"
                description={`Você tem ${formatCurrency(
                  financeiro.totalEmAtraso,
                )} em atraso de ${financeiro.countAtrasos} passageiro${financeiro.countAtrasos != 1 ? "s" : ""
                  } referente ao mês de ${getMesNome(getNowBR().getMonth() + 1)}.`}
                actionLabel="Ver Mensalidades"
                onAction={() => navigateTo(ROUTES.PRIVATE.MOTORISTA.BILLING)}
              />
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
                  label={`A receber em ${getMesNome(getNowBR().getMonth() + 1)}`}
                  value={formatCurrency(financeiro.aReceber)}
                  variant={KPICardVariant.PRIMARY}
                  loading={isLoading}
                />
                <KPICard
                  label={`Recebido em ${getMesNome(getNowBR().getMonth() + 1)}`}
                  value={formatCurrency(financeiro.recebido)}
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
                variant="blue"
              />
              <ShortcutCard
                onClick={handleOpenGastoDialog}
                icon={Plus}
                label="Registrar Gasto"
                variant="rose"
              />
              <ShortcutCard
                onClick={handleCopyLink}
                icon={Copy}
                activeIcon={CopyCheck}
                label={isCopied ? "Copiado!" : "Link de Cadastro"}
                isActive={isCopied}
                variant="violet"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.PASSENGERS}
                icon={Users}
                label="Passageiros"
                variant="indigo"
              />
              <ShortcutCard
                to={`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`}
                icon={UserCheck}
                label="Solicitações"
                variant="emerald"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.EXPENSES}
                icon={TrendingDown}
                label="Gastos"
                variant="orange"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.REPORTS}
                icon={FileText}
                label="Relatórios"
                variant="amber"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.BILLING}
                icon={CreditCard}
                label="Mensalidades"
                variant="emerald"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.CONTRACTS}
                icon={FileText}
                label="Contratos"
                variant="sky"
              />
            </div>
          </section>
        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Home;
