import { useLayout } from "@/contexts/LayoutContext";
import { useProfile, useSession } from "@/hooks";
import { useSubscriptionStatus, useSubscriptionPlans } from "@/hooks/api/useSubscription";
import { PassageiroFormModes } from "@/types/enums";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { formatFirstName } from "@/utils/formatters";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getNowBR, differenceInCalendarDaysBR } from "@/utils/dateUtils";

export function useDashboardViewModel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    setPageTitle,
    openEscolaFormDialog,
    openVeiculoFormDialog,
    openPassageiroFormDialog,
    openGastoFormDialog,
    openFirstChargeDialog,
    openSaaSCheckoutDialog,
  } = useLayout();

  const { loading: isSessionLoading } = useSession();
  const {
    profile,
    isLoading: isProfileLoading,
    summary: systemSummary,
  } = useProfile();

  const { subscription } = useSubscriptionStatus(profile?.id);
  const { plans } = useSubscriptionPlans();

  const [isCopied, setIsCopied] = useState(false);

  const financeiro = useMemo(() => ({
    recebido: systemSummary?.financeiro?.receita?.realizada ?? 0,
    aReceber: systemSummary?.financeiro?.receita?.pendente ?? 0,
    totalEmAtraso: systemSummary?.financeiro?.atrasos?.valor ?? 0,
    countAtrasos: systemSummary?.financeiro?.atrasos?.count ?? 0,
  }), [systemSummary]);

  const contadores = useMemo(() => ({
    escolas: systemSummary?.contadores?.escolas?.total ?? 0,
    veiculos: systemSummary?.contadores?.veiculos?.total ?? 0,
    passageiros: systemSummary?.contadores?.passageiros?.total ?? 0,
    passageirosAtivos: systemSummary?.contadores?.passageiros?.ativos ?? 0,
    passageirosInativos: systemSummary?.contadores?.passageiros?.inativos ?? 0,
    passageirosSolicitacoes: systemSummary?.contadores?.passageiros?.solicitacoes_pendentes ?? 0,
  }), [systemSummary]);

  const onboarding = useMemo(() => {
    const completedStepsCount = [
      contadores.veiculos > 0,
      contadores.escolas > 0,
      contadores.passageiros > 0,
    ].filter(Boolean).length;

    return {
      completedSteps: completedStepsCount,
      totalSteps: 3,
      showOnboarding: completedStepsCount < 3,
    };
  }, [contadores]);

  const subscriptionView = useMemo(() => {
    if (!subscription) return undefined;

    const trialDaysLeft = subscription.trial_ends_at
      ? Math.max(0, differenceInCalendarDaysBR(subscription.trial_ends_at, getNowBR()))
      : undefined;

    return { ...subscription, trialDaysLeft };
  }, [subscription]);

  const dateContext = useMemo(() => {
    const now = getNowBR();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return now.toLocaleDateString("pt-BR", options);
  }, []);

  useEffect(() => {
    if (profile?.nome) {
      setPageTitle(`Olá, ${formatFirstName(profile.nome)}`);
    } else {
      setPageTitle("home.info.saudacaoPadrao");
    }
  }, [profile?.nome, setPageTitle]);

  const handlePullToRefresh = async () => {
    if (!profile?.id) return;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] }),
      queryClient.invalidateQueries({ queryKey: ["subscription", profile.id] }),
    ]);
  };

  const handleCopyLink = useCallback(() => {
    if (!profile?.id) return;

    try {
      navigator.clipboard.writeText(buildPrepassageiroLink(profile.id));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  }, [profile?.id]);

  const handleSuccessFormPassageiro = useCallback((passageiro?: any) => {
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      },
    });
  }, [openGastoFormDialog, queryClient]);

  const handleOpenVeiculoDialog = useCallback(() => {
    openVeiculoFormDialog({
      allowBatchCreation: true,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["veiculos"] });
        queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      },
    });
  }, [openVeiculoFormDialog, queryClient]);

  const handleOpenEscolaDialog = useCallback(() => {
    openEscolaFormDialog({
      allowBatchCreation: true,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["escolas"] });
        queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      },
    });
  }, [openEscolaFormDialog, queryClient]);

  const navigateTo = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  return {
    profile,
    subscription: subscriptionView,
    plans,
    isLoading: isSessionLoading || isProfileLoading,
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
  };
}
