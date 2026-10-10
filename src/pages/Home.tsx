import { AcessoRapido } from "@/components/features/home/AcessoRapido";
import confetti from "canvas-confetti";
import { FinancialDashboardCard } from "@/components/common/FinancialDashboardCard";
import { SecondaryKPICard } from "@/components/features/home/SecondaryKPICard";
import { QuickStartCard } from "@/components/features/quickstart/QuickStartCard";
import { SmartAppBanner } from "@/components/features/app/SmartAppBanner";
import { TrialBanner } from "@/components/features/subscription/TrialBanner";
import { PastDueBanner } from "@/components/features/subscription/PastDueBanner";
import { ReferAndEarnCard } from "@/components/features/subscription/ReferAndEarnCard";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { AniversariantesWidget } from "@/components/features/home/AniversariantesWidget";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants";
import { useDashboardViewModel } from "@/hooks";
import { SubscriptionIdentifer, UserType, AppPermissionStatus, PermissionRescueType } from "@/types/enums";
import { cn } from "@/lib/utils";
import { getMesNome } from "@/utils/formatters";
import {
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { PassageiroTab } from "@/types/enums";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";
import { getNowBR, differenceInCalendarDaysBR } from "@/utils/dateUtils";
import { useLayout } from "@/contexts/LayoutContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { isMotoristaTitular } from "@/utils/userUtils";
import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";

import { usePermissions } from "@/hooks/business/usePermissions";
import { useAppPermissions } from "@/hooks/business/useAppPermissions";
import { PermissionRescueBanner } from "@/components/common/PermissionRescueBanner";

const Home = () => {
  const { isSubConta } = usePermissions();
  const { pushStatus, locationStatus, requestPushPermission, requestLocationPermission } = useAppPermissions();
  const { hideValues, toggleHideValues, formatPrivateNumber } = usePrivacy();
  const {
    profile,
    isPastDue,
    isTrial,
    trialDaysLeft,
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

  const [isDismissedQuickReg, setIsDismissedQuickReg] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.DISMISS_QUICK_REGISTRATION_HOME) === "true";
  });

  const handleDismissQuickReg = () => {
    setIsDismissedQuickReg(true);
    localStorage.setItem(STORAGE_KEYS.DISMISS_QUICK_REGISTRATION_HOME, "true");
  };

  const daysSinceCreation = profile?.created_at ? differenceInCalendarDaysBR(getNowBR(), profile.created_at) : 0;

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEYS.JUST_REGISTERED) === "true") {
      sessionStorage.removeItem(STORAGE_KEYS.JUST_REGISTERED);

      const duration = 0.4 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#0b1a2e", "#2563eb", "#f59e0b", "#10b981"],
          zIndex: 9999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#0b1a2e", "#2563eb", "#f59e0b", "#10b981"],
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

    let isDismissedToday = false;
    try {
      const dismissedDate = localStorage.getItem(STORAGE_KEYS.ACQUISITION_CHANNEL_DISMISSED_DATE);
      const today = new Date().toISOString().slice(0, 10);
      isDismissedToday = dismissedDate === today;
    } catch {
      // noop
    }

    const shouldAskChannel = isMotoristaTitular(profile) && !profile.canal_aquisicao && daysSinceCreation >= 3 && !isDismissedToday;

    if (shouldAskChannel) {
      openAcquisitionChannelDialog();
    }
  }, [
    isLoading,
    profile,
    daysSinceCreation,
    openAcquisitionChannelDialog
  ]);

  useEffect(() => {
    if (isLoading || !profile) return;

    const checkAndRequest = async () => {
      if (pushStatus === AppPermissionStatus.PROMPT) {
        await requestPushPermission();
      }
      if ((profile as any)?.rastreamento_ativo !== false && locationStatus === AppPermissionStatus.PROMPT) {
        await requestLocationPermission();
      }
    };

    checkAndRequest();
  }, [isLoading, profile, pushStatus, locationStatus, requestPushPermission, requestLocationPermission]);

  if (isLoading) {
    return <HomeSkeleton />;
  }

  const isTrackingAllowed = (profile as any)?.rastreamento_ativo !== false;
  const showBothDenied =
    pushStatus === AppPermissionStatus.DENIED &&
    locationStatus === AppPermissionStatus.DENIED &&
    isTrackingAllowed;
  const showPushDenied = pushStatus === AppPermissionStatus.DENIED && !showBothDenied;
  const showLocationDenied =
    locationStatus === AppPermissionStatus.DENIED &&
    isTrackingAllowed &&
    !showBothDenied;

  return (
    <>
      <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
        <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-9 pb-24 pt-1 sm:pt-2">
          {showBothDenied && <PermissionRescueBanner type={PermissionRescueType.BOTH} />}
          {showPushDenied && <PermissionRescueBanner type={PermissionRescueType.PUSH} />}
          {showLocationDenied && <PermissionRescueBanner type={PermissionRescueType.LOCATION} />}

          {/* Bloco Superior: Header, Alertas e KPIs Financeiros */}
          <div className="space-y-3.5 sm:space-y-4">
            {!onboarding.showOnboarding && (
              <div className="px-1 flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-[#737373] capitalize">
                  {dateContext}
                </p>

                {!isSubConta && (
                  <button
                    type="button"
                    onClick={toggleHideValues}
                    className="p-1.5 text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5]/50 transition-colors rounded-[12px] focus:outline-hidden active:scale-95 cursor-pointer shrink-0"
                    title={hideValues ? "Mostrar valores" : "Ocultar valores"}
                    aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}
                  >
                    {hideValues ? <EyeOff className="w-4 h-4 text-[#737373]" /> : <Eye className="w-4 h-4 text-[#737373]" />}
                  </button>
                )}
              </div>
            )}

            {!isSubConta && isPastDue && (
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

            {!isSubConta && contadores.passageirosSolicitacoes > 0 && (
              <section className="px-1">
                <Banner
                  variant="info"
                  icon={<UserPlus className="w-5 h-5" />}
                  title={`${contadores.passageirosSolicitacoes} ${contadores.passageirosSolicitacoes === 1 ? "Solicitação Pendente" : "Solicitações Pendentes"}`}
                  description={
                    contadores.passageirosSolicitacoes === 1
                      ? "Clique para ver e revisar a solicitação agora."
                      : "Clique para ver e revisar as solicitações agora."
                  }
                  onClick={() =>
                    navigateTo(
                      `${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}?tab=${PassageiroTab.SOLICITACOES}`,
                    )
                  }
                />
              </section>
            )}

            {!isSubConta && onboarding.showOnboarding && (
              <section className="px-1">
                <QuickStartCard
                  onOpenVeiculoDialog={handleOpenVeiculoDialog}
                  onOpenEscolaDialog={handleOpenEscolaDialog}
                  onOpenPassageiroDialog={handleOpenPassageiroDialog}
                />
              </section>
            )}

            {!isSubConta && !onboarding.showOnboarding && (financeiro?.countAtrasos || 0) > 0 && (
              <section className="px-1">
                <Banner
                  variant="danger"
                  title={`${formatPrivateNumber(financeiro.countAtrasos)} ${financeiro.countAtrasos === 1 ? "parcela em atraso" : "parcelas em atraso"}`}
                  description={`Referente ao mês de ${getMesNome(getNowBR().getMonth() + 1)}. Clique para ver agora.`}
                  onClick={() => navigateTo(ROUTES.PRIVATE.MOTORISTA.BILLING)}
                />
              </section>
            )}

            <div className="px-1 relative">
              <div
                className={cn(
                  "transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch",
                  !isSubConta && onboarding.showOnboarding && "opacity-40 blur-[2px] pointer-events-none"
                )}
              >
                {!isSubConta && financeiro && (
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                    <FinancialDashboardCard
                      totalEsperado={financeiro.aReceber + financeiro.recebido}
                      recebido={financeiro.recebido}
                      pendente={financeiro.aReceber}
                      atrasado={financeiro.totalEmAtraso}
                      loading={isLoading}
                      showPrivacyToggle={false}
                    />
                  </div>
                )}

                {!isSubConta && (
                  <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 h-full">
                    {(contadores.passageirosAtivos > 0 || onboarding.showOnboarding) && (
                      <SecondaryKPICard
                        label="Alunos"
                        value={contadores.passageirosAtivos}
                        icon={Users}
                        loading={isLoading}
                      />
                    )}
                    {(contadores.escolasAtivas > 0 || onboarding.showOnboarding) && (
                      <SecondaryKPICard
                        label="Escolas"
                        value={contadores.escolasAtivas}
                        icon={GraduationCap}
                        loading={isLoading}
                      />
                    )}
                  </div>
                )}
              </div>
              {!isSubConta && onboarding.showOnboarding && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
                  <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-[18px] shadow-sm border border-[#e5e5e5] max-w-[280px]">
                    <p className="text-xs font-semibold text-[#0a0a0a]">
                      Complete os primeiros passos para liberar seu painel financeiro e indicadores.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isSubConta && <SmartAppBanner />}

          {!isSubConta && !onboarding.showOnboarding && !isDismissedQuickReg && (
            <section className="px-1">
              <QuickRegistrationLink
                profile={profile}
                pendingCount={contadores.passageirosSolicitacoes}
                onDismiss={handleDismissQuickReg}
                className="mb-0"
              />
            </section>
          )}


          {/* Acessos Rápidos */}
          <AcessoRapido
            onCadastrarPassageiro={handleOpenPassageiroDialog}
            onRegistrarGasto={handleOpenGastoDialog}
          />

          {!isSubConta && !onboarding.showOnboarding && isTrial && trialDaysLeft !== null && daysSinceCreation >= 2 && (
            <section className="px-1">
              <h2 className="text-lg font-semibold text-[#0a0a0a] tracking-tight mb-3.5 px-1">
                Assinatura do Van360
              </h2>
              <TrialBanner
                daysLeft={trialDaysLeft}
                onSubscribe={() => navigateTo(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION)}
              />
            </section>
          )}

          {/* Aniversariantes */}
          <AniversariantesWidget />

          {!isSubConta && (
            <section className="px-1">
              <h2 className="text-lg font-semibold text-[#0a0a0a] tracking-tight mb-3.5 px-1">
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
