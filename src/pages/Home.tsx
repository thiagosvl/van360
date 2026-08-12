import { VideoCommerce } from "@/components/features/VideoCommerce";
import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { AcessoRapido } from "@/components/features/home/AcessoRapido";
import confetti from "canvas-confetti";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { SecondaryKPICard } from "@/components/features/home/SecondaryKPICard";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { TrialBanner } from "@/components/features/subscription/TrialBanner";
import { PastDueBanner } from "@/components/features/subscription/PastDueBanner";
import { ReferAndEarnCard } from "@/components/features/subscription/ReferAndEarnCard";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { AniversariantesWidget } from "@/components/features/home/AniversariantesWidget";
import { ROUTES } from "@/constants/routes";
import { useDashboardViewModel } from "@/hooks";
import { SubscriptionStatus, SubscriptionIdentifer } from "@/types/enums";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { getMesNome, formatFirstName } from "@/utils/formatters";
import {
  FileText,
  Plus,
  TrendingDown,
  Route,
  GraduationCap,
  Car,
  Rocket,
  Settings,
} from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { PassageiroTab } from "@/types/enums";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";
import { getNowBR, differenceInCalendarDaysBR } from "@/utils/dateUtils";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";

import { usePermissions } from "@/hooks/business/usePermissions";

const Home = () => {
  const { isSubConta, can } = usePermissions();
  const {
    profile,
    subscription,
    plans,
    isLoading,
    financeiro,
    contadores,
    onboarding,
    dateContext,
    handlePullToRefresh,
    handleOpenPassageiroDialog,
    handleOpenGastoDialog,
    handleOpenVeiculoDialog,
    handleOpenEscolaDialog,
    openSaaSCheckoutDialog,
    navigateTo,
  } = useDashboardViewModel();

  const { openAcquisitionChannelDialog } = useLayout();

  const daysSinceCreation = profile?.created_at ? differenceInCalendarDaysBR(getNowBR(), profile.created_at) : 0;

  useEffect(() => {
    if (sessionStorage.getItem("van360_just_registered") === "true") {
      sessionStorage.removeItem("van360_just_registered");

      const duration = 0.4 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#1a3a5c", "#f59e0b", "#10b981"],
          zIndex: 9999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#1a3a5c", "#f59e0b", "#10b981"],
          zIndex: 9999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, []);

  useEffect(() => {
    if (isLoading || !profile) return;

    const shouldAskChannel = !profile.canal_aquisicao && daysSinceCreation >= 3;

    if (shouldAskChannel) {
      openAcquisitionChannelDialog();
    }
  }, [
    isLoading,
    profile,
    openAcquisitionChannelDialog
  ]);

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
        <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-24">
          {/* Header Contextual */}
          {!isSubConta && !onboarding.showOnboarding && (
            <div className="px-1 space-y-0.5">
              <p className="text-xs font-medium text-slate-500 capitalize">
                {dateContext}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    (financeiro?.countAtrasos || 0) > 0 ? "bg-rose-500" : "bg-emerald-500"
                  )}
                />
                <h1 className="font-headline font-bold text-[#1a3a5c] text-lg tracking-tight">
                  {
                    (financeiro?.countAtrasos || 0) > 0
                      ? `${financeiro.countAtrasos} ${financeiro.countAtrasos === 1 ? "parcela" : "parcelas"} em atraso`
                      : "Parcelas do mês em dia!"
                  }
                </h1>
              </div>
            </div>
          )}

          {isSubConta && (
            <div className="px-1 space-y-0.5">
              <p className="text-xs font-medium text-slate-500 capitalize">
                {dateContext}
              </p>
              <h1 className="font-headline font-bold text-[#1a3a5c] text-lg tracking-tight">
                Olá, {profile?.apelido || formatFirstName(profile?.nome) || "bem-vindo(a)"}!
              </h1>
            </div>
          )}

          {/* Banner de Carência (SaaS) */}
          {!isSubConta && subscription?.status === SubscriptionStatus.PAST_DUE && (
            <PastDueBanner
              onRegularize={() => {
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
          {!isSubConta && contadores.passageirosSolicitacoes > 0 && (
            <section className="mb-4">
              <DashboardStatusCard
                type="info"
                title={`${contadores.passageirosSolicitacoes} ${contadores.passageirosSolicitacoes === 1 ? "Cadastro Pendente" : "Cadastros Pendentes"}`}
                description={`Revise ${contadores.passageirosSolicitacoes === 1 ? "o cadastro enviado por um responsável" : "os cadastros enviados pelos responsáveis"} antes de ${contadores.passageirosSolicitacoes === 1 ? "adicioná-lo" : "adicioná-los"} à sua lista de passageiros.`}
                actionLabel={contadores.passageirosSolicitacoes === 1 ? "Revisar Cadastro" : "Revisar Cadastros"}
                onAction={() =>
                  navigateTo(
                    `${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`,
                  )
                }
              />
            </section>
          )}

          {/* Onboarding - Primeiros Passos */}
          {!isSubConta && onboarding.showOnboarding && (
            <section>
              <QuickStartCard
                onOpenVeiculoDialog={handleOpenVeiculoDialog}
                onOpenEscolaDialog={handleOpenEscolaDialog}
                onOpenPassageiroDialog={handleOpenPassageiroDialog}
              />
            </section>
          )}

          {/* Notificação de Parcelas pendentes */}
          {!isSubConta && !onboarding.showOnboarding && (financeiro?.countAtrasos || 0) > 0 && (
            <section>
              <DashboardStatusCard
                type="pending"
                title={`${financeiro.countAtrasos} ${financeiro.countAtrasos === 1 ? "Parcela em Atraso" : "Parcelas em Atraso"}`}
                description={`Você possui ${financeiro.countAtrasos} ${financeiro.countAtrasos === 1 ? "parcela vencida" : "parcelas vencidas"}, totalizando ${formatCurrency(financeiro.totalEmAtraso)}, referentes ao mês de ${getMesNome(getNowBR().getMonth() + 1)}.`}
                actionLabel="Ver Parcelas"
                onAction={() => navigateTo(ROUTES.PRIVATE.MOTORISTA.BILLING)}
              />
            </section>
          )}

          <div className="px-1 mb-4 relative">
            <div className={cn("transition-all duration-300 space-y-4", !isSubConta && onboarding.showOnboarding && "opacity-40 blur-[2px] pointer-events-none")}>
              {!isSubConta && financeiro && (
                <FinancialDashboardCard
                  totalEsperado={financeiro.aReceber + financeiro.recebido}
                  recebido={financeiro.recebido}
                  pendente={financeiro.aReceber}
                  atrasado={financeiro.totalEmAtraso}
                  loading={isLoading}
                />
              )}

              {!isSubConta && (
                <div className="grid gap-4 grid-cols-2">
                  {(contadores.passageirosAtivos > 0 || onboarding.showOnboarding) && (
                    <SecondaryKPICard
                      label="Passageiros Ativos"
                      value={contadores.passageirosAtivos}
                      loading={isLoading}
                    />
                  )}
                  {(contadores.escolasAtivas > 0 || onboarding.showOnboarding) && (
                    <SecondaryKPICard
                      label="Escolas Ativas"
                      value={contadores.escolasAtivas}
                      loading={isLoading}
                    />
                  )}
                </div>
              )}
            </div>
            {!isSubConta && onboarding.showOnboarding && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm border border-slate-200/60 max-w-[280px]">
                  <p className="text-[12px] font-bold text-slate-700">
                    Complete os primeiros passos para liberar seu painel financeiro e indicadores.
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isSubConta && !onboarding.showOnboarding && contadores.passageirosAtivos < 10 && (
            <div className="px-1 mt-6 mb-2">
              <QuickRegistrationLink profile={profile} pendingCount={contadores.passageirosSolicitacoes} />
            </div>
          )}

          {/* Banner de Trial (SaaS) - Oculto nos primeiros 5 dias */}
          {!isSubConta && subscription?.status === SubscriptionStatus.TRIAL && subscription.trialDaysLeft !== undefined && daysSinceCreation >= 5 && (
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

          {/* Acessos Rápidos */}
          <AcessoRapido
            onCadastrarPassageiro={handleOpenPassageiroDialog}
            onRegistrarGasto={handleOpenGastoDialog}
          />

          {/* Aniversariantes */}
          <section className="pt-3">
            <AniversariantesWidget />
          </section>

          {/* Indique e Ganhe Banner */}
          {!isSubConta && (
            <section className="pt-2">
              <h2 className="text-[17px] font-bold text-slate-800 mb-4 px-1">
                Indique e Ganhe
              </h2>
              <ReferAndEarnCard />
            </section>
          )}
        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Home;
