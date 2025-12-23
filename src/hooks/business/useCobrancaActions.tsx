import {
  FEATURE_COBRANCA_AUTOMATICA,
  FEATURE_NOTIFICACOES,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useDeleteCobranca,
  useDesfazerPagamento,
  useEnviarNotificacaoCobranca,
  useToggleNotificacoesCobranca,
} from "@/hooks";
import { ActionItem } from "@/types/actions";
import { Cobranca } from "@/types/cobranca";
import {
  disableDesfazerPagamento,
  disableEditarCobranca,
  disableExcluirCobranca,
  disableRegistrarPagamento,
  seForPago,
} from "@/utils/domain/cobranca/disableActions";
import {
  canUseNotificacoes,
} from "@/utils/domain/plano/accessRules";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  DollarSign,
  FilePen,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useMemo } from "react";

export interface UseCobrancaOperationsProps {
  cobranca: Cobranca;
  plano?: any;
  onActionSuccess?: () => void;
  onUpgrade?: (feature: string) => void;
}

export function useCobrancaOperations({
  cobranca,
  plano,
  onActionSuccess,
  onUpgrade,
}: UseCobrancaOperationsProps) {
  const {
    openConfirmationDialog,
    openPlanUpgradeDialog,
    closeConfirmationDialog,
  } = useLayout();

  // Mutations
  const toggleNotificacoes = useToggleNotificacoesCobranca();
  const enviarNotificacao = useEnviarNotificacaoCobranca();
  const desfazerPagamento = useDesfazerPagamento();
  const deleteCobranca = useDeleteCobranca();

  const handleUpgrade = useCallback(
    (feature: string) => {
      openPlanUpgradeDialog({
        feature,
      });
    },
    [openPlanUpgradeDialog]
  );

  const handleToggleLembretes = useCallback(async () => {
    const hasAccess = canUseNotificacoes(plano);
    if (!hasAccess) {
      handleUpgrade(FEATURE_NOTIFICACOES);
      return;
    }
    try {
      await toggleNotificacoes.mutateAsync({
        cobrancaId: cobranca.id,
        desativar: !cobranca.desativar_lembretes,
      });
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error(error);
    }
  }, [toggleNotificacoes, plano, handleUpgrade, onActionSuccess, cobranca]);

  const handleEnviarNotificacao = useCallback(async () => {
    const hasAccess = canUseNotificacoes(plano);
    if (!hasAccess) {
      handleUpgrade(FEATURE_COBRANCA_AUTOMATICA);
      return;
    }
    openConfirmationDialog({
      title: "Enviar cobrança?",
      description:
        "A cobrança será enviada para o responsável via WhatsApp. Confirmar?",
      confirmText: "Enviar",
      onConfirm: async () => {
        try {
          await enviarNotificacao.mutateAsync(cobranca.id);
          closeConfirmationDialog();
          if (
            plano?.slug &&
            [PLANO_GRATUITO, PLANO_ESSENCIAL].includes(plano.slug)
          ) {
            handleUpgrade(FEATURE_COBRANCA_AUTOMATICA);
          }
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          closeConfirmationDialog();
          console.error(error);
        }
      },
    });
  }, [
    enviarNotificacao,
    plano,
    handleUpgrade,
    openConfirmationDialog,
    closeConfirmationDialog,
    onActionSuccess,
    cobranca,
  ]);

  const handleDesfazerPagamento = useCallback(async () => {
    openConfirmationDialog({
      title: "Desfazer pagamento?",
      description:
        "O pagamento será removido e a cobrança voltará a ficar pendente. Confirmar?",
      variant: "warning",
      confirmText: "Desfazer",
      onConfirm: async () => {
        try {
          await desfazerPagamento.mutateAsync(cobranca.id);
          closeConfirmationDialog();
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          closeConfirmationDialog();
          console.error(error);
        }
      },
    });
  }, [
    desfazerPagamento,
    openConfirmationDialog,
    closeConfirmationDialog,
    onActionSuccess,
    cobranca,
  ]);

  const handleDeleteCobranca = useCallback(async () => {
    openConfirmationDialog({
      title: "Excluir cobrança?",
      description:
        "Tem certeza que deseja excluir esta cobrança? Essa ação não poderá ser desfeita.",
      variant: "destructive",
      confirmText: "Excluir",
      onConfirm: async () => {
        try {
          await deleteCobranca.mutateAsync(cobranca.id);
          closeConfirmationDialog();
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          closeConfirmationDialog();
          console.error(error);
        }
      },
    });
  }, [
    deleteCobranca,
    openConfirmationDialog,
    closeConfirmationDialog,
    onActionSuccess,
    cobranca,
  ]);

  const isActionLoading =
    toggleNotificacoes.isPending ||
    enviarNotificacao.isPending ||
    desfazerPagamento.isPending ||
    deleteCobranca.isPending;

  return {
    handleToggleLembretes,
    handleEnviarNotificacao,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    handleUpgrade,
    isActionLoading,
  };
}

export interface UseCobrancaActionsProps extends UseCobrancaOperationsProps {
  onVerCobranca?: () => void;
  onVerCarteirinha?: () => void;
  onEditarCobranca?: () => void;
  onRegistrarPagamento?: () => void;
}

export function useCobrancaActions(props: UseCobrancaActionsProps): ActionItem[] {
  const {
    cobranca,
    plano,
    onVerCobranca,
    onVerCarteirinha,
    onEditarCobranca,
    onRegistrarPagamento,
  } = props;
  
  const {
    handleToggleLembretes,
    handleEnviarNotificacao,
    handleDesfazerPagamento,
    handleDeleteCobranca,
  } = useCobrancaOperations(props);

  return useMemo(() => {
    const hasNotificacoesAccess = canUseNotificacoes(plano);
    const isPago = seForPago(cobranca);
    const actions: ActionItem[] = [];

    // 1. Ver Carteirinha
    if (onVerCarteirinha) {
      actions.push({
        label: "Ver Carteirinha",
        icon: <User className="h-4 w-4" />,
        onClick: onVerCarteirinha,
        swipeColor: "bg-indigo-600",
      });
    }

    // 2. Registrar Pagamento
    if (!disableRegistrarPagamento(cobranca) && onRegistrarPagamento) {
      actions.push({
        label: "Registrar Pagamento",
        icon: <CheckCircle2 className="h-4 w-4" />,
        onClick: () => {
          document.body.click(); // Close menus
          setTimeout(() => onRegistrarPagamento(), 10);
        },
        swipeColor: "bg-emerald-500",
      });
    }

    // 3. Ver Detalhes
    if (onVerCobranca) {
      actions.push({
        label: "Ver Detalhes",
        icon: <DollarSign className="h-4 w-4" />,
        onClick: onVerCobranca,
        swipeColor: "bg-slate-600",
      });
    }

    // 4. Enviar Cobrança
    if (!isPago) {
      // const canSend = hasNotificacoesAccess;
      actions.push({
        label: "Enviar Cobrança",
        icon: <Send className="h-4 w-4" />,
        onClick: handleEnviarNotificacao,
        swipeColor: "bg-emerald-500",
      });
    }

    // 5. Editar
    if (onEditarCobranca) {
      actions.push({
        label: "Editar",
        icon: <FilePen className="h-4 w-4" />,
        onClick: () => {
          document.body.click(); // Close menus/swipes
          setTimeout(() => onEditarCobranca(), 10);
        },
        disabled: disableEditarCobranca(cobranca),
        swipeColor: "bg-blue-600",
      });
    }

    // 6. Notificações
    if (!isPago) {
      const label =
        !hasNotificacoesAccess || cobranca.desativar_lembretes
          ? "Ativar Lembretes"
          : "Pausar Lembretes";
      const icon =
        !hasNotificacoesAccess || cobranca.desativar_lembretes ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        );

      actions.push({
        label,
        icon,
        onClick: handleToggleLembretes,
        swipeColor: !hasNotificacoesAccess || cobranca.desativar_lembretes ? "bg-emerald-500" : "bg-amber-500",
      });
    }

    // 7. Desfazer Pagamento
    if (!disableDesfazerPagamento(cobranca)) {
      actions.push({
        label: "Desfazer Pagamento",
        icon: <ArrowLeft className="h-4 w-4" />,
        onClick: handleDesfazerPagamento,
        swipeColor: "bg-amber-500",
      });
    }

    // 8. Excluir
    actions.push({
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteCobranca,
      isDestructive: true,
      disabled: disableExcluirCobranca(cobranca),
      swipeColor: "bg-red-500",
    });

    return actions;
  }, [
    cobranca,
    plano,
    onVerCarteirinha,
    onRegistrarPagamento,
    onVerCobranca,
    onEditarCobranca,
    handleEnviarNotificacao,
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
  ]);
}
