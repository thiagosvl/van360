import { VideoCommerce } from "@/components/features/VideoCommerce";
import { ShortcutCard } from "@/components/features/home/ShortcutCard";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { SecondaryKPICard } from "@/components/features/home/SecondaryKPICard";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { TrialBanner } from "@/components/features/subscription/TrialBanner";
import { PastDueBanner } from "@/components/features/subscription/PastDueBanner";
import { ReferAndEarnCard } from "@/components/features/subscription/ReferAndEarnCard";
import { AniversariantesWidget } from "@/components/features/home/AniversariantesWidget";
import { ROUTES } from "@/constants/routes";
import { useDashboardViewModel } from "@/hooks";
import { SubscriptionStatus, SubscriptionIdentifer } from "@/types/enums";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import { getMesNome } from "@/utils/formatters";
import {
  Copy,
  CopyCheck,
  FileText,
  Plus,
  TrendingDown,
  UserCheck,
  GraduationCap,
  Car,
  Rocket,
} from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { PassageiroTab } from "@/types/enums";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";
import { getNowBR, differenceInCalendarDaysBR } from "@/utils/dateUtils";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";
import { DashboardStatusCard } from "@/components/features/home/DashboardStatusCard";

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

  const { openAcquisitionChannelDialog } = useLayout();

  useEffect(() => {
    if (isLoading || !profile) return;

    // Só aciona a partir do 4º dia de uso da conta (3 dias de diferença do cadastro original)
    const daysSinceCreation = differenceInCalendarDaysBR(getNowBR(), profile.created_at);

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
        <div className="space-y-6">
          {/* Header Contextual */}
          <div className="px-1">
            <p className="font-headline font-bold text-[#1a3a5c] text-sm capitalize">
              {dateContext}
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
              {
                financeiro.countAtrasos > 0
                  ? `${financeiro.countAtrasos} ${financeiro.countAtrasos === 1 ? "mensalidade" : "mensalidades"} em atraso`
                  : `Mensalidades do mês em dia!`
              }
            </p>
          </div>

          {/* Banner de Carência (SaaS) */}
          {subscription?.status === SubscriptionStatus.PAST_DUE && (
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

          {!onboarding.showOnboarding && (
            <div className="px-1 mb-4">
              <FinancialDashboardCard
                totalEsperado={financeiro.aReceber + financeiro.recebido}
                recebido={financeiro.recebido}
                pendente={financeiro.aReceber}
                loading={isLoading}
              />
            </div>
          )}

          <div
            className={cn(
              "grid gap-4 px-1",
              onboarding.showOnboarding ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {contadores.passageirosAtivos > 0 && (
              <SecondaryKPICard
                label="Passageiros Ativos"
                value={contadores.passageirosAtivos}
                loading={isLoading}
              />
            )}
            {!onboarding.showOnboarding && contadores.escolasAtivas > 0 && (
              <SecondaryKPICard
                label="Escolas Ativas"
                value={contadores.escolasAtivas}
                loading={isLoading}
              />
            )}
          </div>

          {/* Acessos Rápidos */}
          <section className="mt-6 px-1">
            <h2 className="text-[17px] font-bold text-slate-800 mb-4">
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
                to={`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`}
                icon={UserCheck}
                label="Solicitações"
                variant="emerald"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.EXPENSES}
                icon={TrendingDown}
                label="Gastos"
                variant="sky"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.REPORTS}
                icon={FileText}
                label="Relatórios"
                variant="slate"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.SCHOOLS}
                icon={GraduationCap}
                label="Escolas"
                variant="white"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.VEHICLES}
                icon={Car}
                label="Veículos"
                variant="amber"
              />
              <ShortcutCard
                to={ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION}
                icon={Rocket}
                label="Minha Assinatura"
                variant="orange"
              />
            </div>
          </section>

          {/* Aniversariantes */}
          <section className="pt-3">
            <AniversariantesWidget />
          </section>

          {/* Indique e Ganhe Banner */}
          <section className="pt-2">
            <h2 className="text-[17px] font-bold text-slate-800 mb-4 px-1">
              Indique e Ganhe
            </h2>
            <ReferAndEarnCard isTrial={subscription?.status === SubscriptionStatus.TRIAL} />
          </section>

          {/* Onboarding em Vídeo (Contextual) */}
          {onboarding.showOnboarding && (
            <VideoCommerce
              previewUrl="https://scxjzvblqnamfvasjaug.supabase.co/storage/v1/object/public/videos/home-preview.mp4"
              videoUrls={[
                "https://scxjzvblqnamfvasjaug.supabase.co/storage/v1/object/public/videos/home-1.mp4",
                "https://scxjzvblqnamfvasjaug.supabase.co/storage/v1/object/public/videos/home-2.mp4",
                "https://scxjzvblqnamfvasjaug.supabase.co/storage/v1/object/public/videos/home-3.mp4"
              ]}
              tooltipText="Comece por aqui"
              showCta={false}
              loop={true}
              requireScrollOnMobile={false}
              positionClasses="fixed z-50 left-4 sm:left-6 bottom-[130px] sm:bottom-10"
            />
          )}
        </div>
      </PullToRefreshWrapper>
    </>
  );
};

export default Home;
