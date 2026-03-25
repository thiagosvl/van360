import { useLayout } from "@/contexts/LayoutContext";
import {
    useDeleteCobranca,
    useDesfazerPagamento,
    useEnviarNotificacaoCobranca,
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
    History,
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
  onActionSuccess?: () => void;
  onExcluirCobranca?: () => void;
}

export function useCobrancaOperations({
  cobranca,
  onActionSuccess,
  onExcluirCobranca,
}: UseCobrancaOperationsProps) {
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    openCobrancaHistoryDialog,
  } = useLayout();

  // Mutations
  const toggleNotificacoes = useToggleNotificacoesCobranca();
  const enviarNotificacao = useEnviarNotificacaoCobranca();
  const desfazerPagamento = useDesfazerPagamento();
  const deleteCobranca = useDeleteCobranca();

  const handleToggleLembretes = useCallback(async () => {
    try {
      await toggleNotificacoes.mutateAsync({
        cobrancaId: cobranca.id,
        desativar: !cobranca.desativar_lembretes,
      });
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      console.error(error);
    }
  }, [toggleNotificacoes, onActionSuccess, cobranca]);

  const handleEnviarNotificacao = useCallback(async () => {
    openConfirmationDialog({
      title: "Cobrar via WhatsApp",
      description:
        "A cobrança será enviada para o responsável via WhatsApp. Confirmar?",
      confirmText: "Confirmar",
      onConfirm: async () => {
        try {
          await enviarNotificacao.mutateAsync(cobranca.id);
          closeConfirmationDialog();
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          closeConfirmationDialog();
          console.error(error);
        }
      },
    });
  }, [
    enviarNotificacao,
    openConfirmationDialog,
    closeConfirmationDialog,
    onActionSuccess,
    cobranca,
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
    openCobrancaDeleteDialog({
      onConfirm: async () => {
        try {
          await deleteCobranca.mutateAsync(cobranca.id);
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      onEdit: () => {
        openCobrancaEditDialog({
          cobranca,
          onSuccess: onActionSuccess,
        });
      }
    });
  }, [
    deleteCobranca,
    openCobrancaDeleteDialog,
    openCobrancaEditDialog,
    onActionSuccess,
    cobranca,
  ]);

  const handleShowHistory = useCallback(() => {
    openCobrancaHistoryDialog({
      cobrancaId: cobranca.id,
      passageiroNome: cobranca.passageiro?.nome || "Passageiro",
    });
  }, [openCobrancaHistoryDialog, cobranca]);

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
    handleShowHistory,
    isActionLoading,
    isTogglingNotificacoes: toggleNotificacoes.isPending,
    isSendingNotification: enviarNotificacao.isPending,
    isDesfazendoPagamento: desfazerPagamento.isPending,
    isDeleting: deleteCobranca.isPending
  };
}

export interface UseCobrancaActionsProps extends UseCobrancaOperationsProps {
  onVerRecibo?: () => void;
  onVerCobranca?: () => void;
  onVerCarteirinha?: () => void;
  onEditarCobranca?: () => void;
  onRegistrarPagamento?: () => void;
  onPagarPix?: () => void;
  onDesfazerPagamento?: (cobranca: Cobranca) => void;
}

export function useCobrancaActions(props: UseCobrancaActionsProps): ActionItem[] {
  const {
    cobranca,
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
    handleShowHistory,
    isActionLoading,
    isTogglingNotificacoes,
    isSendingNotification,
    isDesfazendoPagamento,
    isDeleting
  } = useCobrancaOperations(props);

  return useMemo(() => {
    const isPago = seForPago(cobranca);
    const actions: ActionItem[] = [];

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
        onClick: () => {
           if (props.onDesfazerPagamento) {
               props.onDesfazerPagamento(cobranca);
           } else {
               handleDesfazerPagamento();
           }
        },
        swipeColor: "bg-amber-500",
        isLoading: isDesfazendoPagamento,
        disabled: isActionLoading
      });
    }

    if (onVerCarteirinha) {
      actions.push({
        label: "Ver Carteirinha",
        icon: <User className="h-4 w-4" />,
        onClick: onVerCarteirinha,
        swipeColor: "bg-indigo-600",
        hasSeparatorAfter: true,
      });
    }

    if (!disableRegistrarPagamento(cobranca) && onRegistrarPagamento) {
      actions.push({
        label: "Registrar Pagamento",
        icon: <CheckCircle2 className="h-4 w-4" />,
        onClick: () => {
          document.body.click(); // Close menus
          setTimeout(() => onRegistrarPagamento(), 10);
        },
        swipeColor: "bg-emerald-500",
        disabled: isActionLoading
      });
    }



    actions.push({
      label: "Histórico de Alterações",
      icon: <History className="h-4 w-4" />,
      onClick: handleShowHistory,
      swipeColor: "bg-slate-600",
      hasSeparatorAfter: true,
    });

    const canSend = canSendNotification(cobranca);
    if (canSend) {
      actions.push({
        label: "Cobrar via WhatsApp",
        icon: <Send className="h-4 w-4" />,
        onClick: handleEnviarNotificacao,
        swipeColor: "bg-emerald-500",
        isLoading: isSendingNotification,
        disabled: isActionLoading
      });
    }

    if (onEditarCobranca) {
      actions.push({
        label: "Editar",
        icon: <FilePen className="h-4 w-4" />,
        onClick: () => {
          document.body.click(); // Close menus/swipes
          setTimeout(() => onEditarCobranca(), 10);
        },
        disabled: disableEditarCobranca(cobranca) || isActionLoading,
        swipeColor: "bg-blue-600",
      });
    }



    if (!disableExcluirCobranca(cobranca)) {
      actions.push({
        label: "Excluir",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: props.onExcluirCobranca || handleDeleteCobranca,
        isDestructive: true,
        swipeColor: "bg-red-600",
        className: "text-red-600",
        isLoading: isDeleting,
        disabled: isActionLoading
      });
    }

    if (actions.length > 1) {
      for (let i = 0; i < actions.length - 1; i++) {
        actions[i].hasSeparatorAfter = true;
      }
    }

    return actions;
  }, [
    cobranca,
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
    props.onDesfazerPagamento,
    isActionLoading,
    isTogglingNotificacoes,
    isSendingNotification,
    isDesfazendoPagamento,
    isDeleting,
    onPagarPix
  ]);
}
