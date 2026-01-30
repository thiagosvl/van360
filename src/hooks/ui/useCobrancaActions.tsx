import {
    FEATURE_COBRANCA_AUTOMATICA,
    FEATURE_NOTIFICACOES
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
    useDeleteCobranca,
    useDesfazerPagamento,
    useEnviarNotificacaoCobranca,
    usePermissions,
    useToggleNotificacoesCobranca
} from "@/hooks";
import { ActionItem } from "@/types/actions";
import { Cobranca } from "@/types/cobranca";
import {
    canSendNotification,
    canViewReceipt,
    disableEditarCobranca,
    disableExcluirCobranca,
    disableRegistrarPagamento,
    seForPago
} from "@/utils/domain/cobranca/disableActions";
import {
    Bell,
    BellOff,
    CheckCircle2,
    DollarSign,
    FilePen,
    QrCode,
    Receipt,
    RotateCcw,
    Send,
    Trash2,
    User
} from "lucide-react";
import { useCallback, useMemo } from "react";

export interface UseCobrancaOperationsProps {
  cobranca: Cobranca;
  plano?: any;
  onActionSuccess?: () => void;
  onUpgrade?: (feature: string, description?: string, title?: string) => void;
  onExcluirCobranca?: () => void;
}

export function useCobrancaOperations({
  cobranca,
  plano,
  onActionSuccess,
  onUpgrade,
  onExcluirCobranca,
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
    (feature: string, description?: string, title?: string) => {
      openPlanUpgradeDialog({
        feature,
        description,
        title,
      });
    },
    [openPlanUpgradeDialog]
  );

  const { 
    canUseNotifications: hasNotificacoesAccess,
    canUseAutomatedCharges
  } = usePermissions();

  const handleToggleLembretes = useCallback(async () => {
    if (!hasNotificacoesAccess) {
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
  }, [toggleNotificacoes, hasNotificacoesAccess, handleUpgrade, onActionSuccess, cobranca]);

  const handleEnviarNotificacao = useCallback(async () => {
    if (!hasNotificacoesAccess) {
      handleUpgrade(FEATURE_COBRANCA_AUTOMATICA);
      return;
    }
    openConfirmationDialog({
      title: "Cobrar via WhatsApp",
      description:
        "A cobrança será enviada para o responsável via WhatsApp. Confirmar?",
      confirmText: "Confirmar",
      onConfirm: async () => {
        try {
          await enviarNotificacao.mutateAsync(cobranca.id);
          closeConfirmationDialog();
          if (!canUseAutomatedCharges) {
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
    hasNotificacoesAccess
  ]);

  const handleDesfazerPagamento = useCallback(async () => {
    openConfirmationDialog({
      title: "Desfazer pagamento?",
      description:
        "O pagamento será removido e a mensalidade voltará a ficar pendente. Confirmar?",
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
      title: "Excluir mensalidade?",
      description:
        "Tem certeza que deseja excluir esta mensalidade? Essa ação não poderá ser desfeita.",
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
  onVerRecibo?: () => void;
  onVerCobranca?: () => void;
  onVerCarteirinha?: () => void;
  onEditarCobranca?: () => void;
  onRegistrarPagamento?: () => void;
  onPagarPix?: () => void;
  onDesfazerPagamento?: () => void;
}

export function useCobrancaActions(props: UseCobrancaActionsProps): ActionItem[] {
  const {
    cobranca,
    plano,
    onVerCobranca,
    onVerCarteirinha,
    onEditarCobranca,
    onRegistrarPagamento,
    onPagarPix,
  } = props;
  
  const {
    handleToggleLembretes,
    handleEnviarNotificacao,
    handleDesfazerPagamento,
    handleDeleteCobranca,
  } = useCobrancaOperations(props);

  // usePermissions Hook outside useMemo
  const { canUseNotifications: hasNotificacoesAccess } = usePermissions();

  return useMemo(() => {
    // const hasNotificacoesAccess = canUseNotificacoes(plano); // REMOVED
    const isPago = seForPago(cobranca);
    const actions: ActionItem[] = [];

    // 0. Ver Recibo (Se pago e com URL)
    if (canViewReceipt(cobranca) && props.onVerRecibo) {
      actions.push({
        label: "Ver Recibo",
        icon: <Receipt className="h-4 w-4" />,
        onClick: props.onVerRecibo,
        swipeColor: "bg-blue-600",
      });
    }

    // 0.1 Desfazer Pagamento (Se pago e manual)
    if (isPago && cobranca.pagamento_manual) {
      actions.push({
        label: "Desfazer Pagamento",
        icon: <RotateCcw className="h-4 w-4" />,
        onClick: props.onDesfazerPagamento || handleDesfazerPagamento,
        swipeColor: "bg-amber-500",
      });
    }

    // 1. Ver Carteirinha
    if (onVerCarteirinha) {
      actions.push({
        label: "Ver Carteirinha",
        icon: <User className="h-4 w-4" />,
        onClick: onVerCarteirinha,
        swipeColor: "bg-indigo-600",
        hasSeparatorAfter: true,
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

    if (!isPago && cobranca.gateway_txid && cobranca.qr_code_payload && onPagarPix) {
      actions.push({
        label: "Ver PIX",
        icon: <QrCode className="h-4 w-4" />,
        onClick: () => {
          document.body.click(); // Close menus
          setTimeout(() => onPagarPix(), 10);
        },
        swipeColor: "bg-blue-600",
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

    // 4. Enviar Mensalidade
    const canSend = canSendNotification(cobranca);
    if (canSend) {
      actions.push({
        label: "Cobrar via WhatsApp",
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
      
      // ... (icon logic same)
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

    // 7. Excluir (Usando regra de disable)
    if (!disableExcluirCobranca(cobranca)) {
      actions.push({
        label: "Excluir",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: props.onExcluirCobranca || handleDeleteCobranca,
        isDestructive: true,
        swipeColor: "bg-red-600",
        className: "text-red-600"
      });
    }

    // Final pass to ensure EVERY item except the last has a separator
    // This creates the standard "separated list" look requested by the user
    if (actions.length > 1) {
      for (let i = 0; i < actions.length - 1; i++) {
        actions[i].hasSeparatorAfter = true;
      }
    }

    return actions;
  }, [
    cobranca,
    // plano, // Removed
    hasNotificacoesAccess, // Added
    onVerCarteirinha,
    onRegistrarPagamento,
    onVerCobranca,
    onEditarCobranca,
    handleEnviarNotificacao,
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    props.onVerRecibo,
    props.onExcluirCobranca,
    props.onDesfazerPagamento
  ]);
}
