import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile, useSession } from "@/hooks";
import { PassageiroFormModes } from "@/types/enums";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import { formatFirstName } from "@/utils/formatters";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  } = useLayout();

  const { loading: isSessionLoading } = useSession();
  const {
    profile,
    isLoading: isProfileLoading,
    summary: systemSummary,
  } = useProfile();

  const [isCopied, setIsCopied] = useState(false);

  // Financial metrics from summary
  const financeiro = useMemo(() => ({
    recebido: systemSummary?.financeiro?.receita?.realizada ?? 0,
    aReceber: systemSummary?.financeiro?.receita?.pendente ?? 0,
    totalEmAtraso: systemSummary?.financeiro?.atrasos?.valor ?? 0,
    countAtrasos: systemSummary?.financeiro?.atrasos?.count ?? 0,
  }), [systemSummary]);

  // Counters from summary
  const contadores = useMemo(() => ({
    escolas: systemSummary?.contadores?.escolas?.total ?? 0,
    veiculos: systemSummary?.contadores?.veiculos?.total ?? 0,
    passageiros: systemSummary?.contadores?.passageiros?.total ?? 0,
    passageirosAtivos: systemSummary?.contadores?.passageiros?.ativos ?? 0,
    passageirosInativos: systemSummary?.contadores?.passageiros?.inativos ?? 0,
    passageirosSolicitacoes: systemSummary?.contadores?.passageiros?.solicitacoes_pendentes ?? 0,
  }), [systemSummary]);

  // Onboarding logic
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

  // Date context
  const dateContext = useMemo(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return now.toLocaleDateString("pt-BR", options);
  }, []);

  // Sync page title
  useEffect(() => {
    if (profile?.nome) {
      setPageTitle(`Olá, ${formatFirstName(profile.nome)}`);
    } else {
      setPageTitle("home.info.saudacaoPadrao");
    }
  }, [profile?.nome, setPageTitle]);

  // Handlers
  const handlePullToRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
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
    navigateTo,
  };
}
