import { useLayout } from "@/contexts/LayoutContext";
import {
  useDeleteCobranca,
  useDesfazerPagamento,
  useToggleNotificacoesCobranca,
  safeCloseDialog,
} from "@/hooks";
import { ActionItem } from "@/types/actions";
import { Cobranca } from "@/types/cobranca";
import {
  canViewReceipt,
  disableEditarCobranca,
  disableExcluirCobranca,
  disableRegistrarPagamento,
  seForPago
} from "@/utils/domain/cobranca/disableActions";
import { formatShortName } from "@/utils/formatters";
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

  const toggleNotificacoes = useToggleNotificacoesCobranca();
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

  const handleDesfazerPagamento = useCallback(async () => {
    openConfirmationDialog({
      title: "Desfazer pagamento?",
      description: "O pagamento será removido e a mensalidade voltará a ficar pendente. Confirmar?",
      variant: "warning",
      confirmText: "Desfazer",
      onConfirm: async () => {
        try {
          await desfazerPagamento.mutateAsync(cobranca.id);
          safeCloseDialog(closeConfirmationDialog);
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          safeCloseDialog(closeConfirmationDialog);
          console.error(error);
        }
      },
    });
  }, [desfazerPagamento, openConfirmationDialog, closeConfirmationDialog, onActionSuccess, cobranca]);

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
  }, [deleteCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog, onActionSuccess, cobranca]);

  const handleShowHistory = useCallback((cobranca: Cobranca) => {
    openCobrancaHistoryDialog({
      cobrancaId: cobranca.id,
      passageiroNome: formatShortName(cobranca.passageiro?.nome, true) || "Passageiro",
    });
  }, [openCobrancaHistoryDialog]);

  const isActionLoading =
    toggleNotificacoes.isPending ||
    desfazerPagamento.isPending ||
    deleteCobranca.isPending;

  return {
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    handleShowHistory,
    isActionLoading,
    isTogglingNotificacoes: toggleNotificacoes.isPending,
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
  showHistory?: boolean;
}

export function useCobrancaActions(props: UseCobrancaActionsProps): ActionItem[] {
  const {
    cobranca,
    onVerCarteirinha,
    onEditarCobranca,
    onRegistrarPagamento,
    onPagarPix,
    showHistory = false,
  } = props;

  const {
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    handleShowHistory,
    isActionLoading,
    isTogglingNotificacoes,
    isDesfazendoPagamento,
    isDeleting
  } = useCobrancaOperations(props);

  return useMemo(() => {
    const isPago = seForPago(cobranca);
    const actions: ActionItem[] = [];

    if (props.onVerRecibo) {
      actions.push({
        label: "Ver Recibo",
        icon: <Receipt className="h-4 w-4" />,
        onClick: props.onVerRecibo,
        disabled: !canViewReceipt(cobranca) || isActionLoading,
        swipeColor: "bg-blue-600",
        hasSeparatorAfter: true,
      });
    }

    if (cobranca.pagamento_manual) {
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
        disabled: !isPago || isActionLoading,
        swipeColor: "bg-amber-500",
        isLoading: isDesfazendoPagamento,
        hasSeparatorAfter: true,
      });
    }

    if (onEditarCobranca) {
      actions.push({
        label: "Editar",
        icon: <FilePen className="h-4 w-4" />,
        onClick: () => {
          document.body.click();
          setTimeout(() => onEditarCobranca(), 10);
        },
        disabled: disableEditarCobranca(cobranca) || isActionLoading,
        swipeColor: "bg-blue-600",
        hasSeparatorAfter: true,
      });
    }

    if (onRegistrarPagamento) {
      actions.push({
        label: "Registrar Pagamento",
        icon: <CheckCircle2 className="h-4 w-4" />,
        onClick: () => {
          document.body.click();
          setTimeout(() => onRegistrarPagamento(), 10);
        },
        disabled: disableRegistrarPagamento(cobranca) || isActionLoading,
        swipeColor: "bg-emerald-500",
        hasSeparatorAfter: true,
      });
    }

    if (onPagarPix) {
      actions.push({
        label: "Pagar via PIX",
        icon: <QrCode className="h-4 w-4" />,
        onClick: () => {
          document.body.click();
          setTimeout(() => onPagarPix(), 10);
        },
        disabled: isPago || isActionLoading,
        swipeColor: "bg-emerald-600",
        hasSeparatorAfter: true,
      });
    }

    actions.push({
      label: cobranca.desativar_lembretes ? "Ativar Lembretes" : "Pausar Lembretes",
      icon: cobranca.desativar_lembretes ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />,
      onClick: handleToggleLembretes,
      disabled: isPago || isActionLoading,
      swipeColor: "bg-amber-600",
      isLoading: isTogglingNotificacoes,
      hasSeparatorAfter: true,
    });

    if (onVerCarteirinha) {
      actions.push({
        label: "Ver Carteirinha",
        icon: <User className="h-4 w-4" />,
        onClick: onVerCarteirinha,
        swipeColor: "bg-indigo-600",
        hasSeparatorAfter: true,
      });
    }

    if (showHistory) {
      actions.push({
        label: "Histórico de Alterações",
        icon: <History className="h-4 w-4" />,
        onClick: () => handleShowHistory(cobranca),
        swipeColor: "bg-slate-600",
        hasSeparatorAfter: true,
      });
    }

    actions.push({
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: props.onExcluirCobranca || handleDeleteCobranca,
      disabled: disableExcluirCobranca(cobranca) || isActionLoading,
      isDestructive: true,
      swipeColor: "bg-red-600",
      className: "text-red-600 font-bold",
      isLoading: isDeleting,
    });

    return actions;
  }, [
    cobranca,
    onVerCarteirinha,
    onRegistrarPagamento,
    onEditarCobranca,
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    handleShowHistory,
    isActionLoading,
    isTogglingNotificacoes,
    isDesfazendoPagamento,
    isDeleting,
    onPagarPix,
    showHistory,
    props.onVerRecibo,
    props.onExcluirCobranca,
    props.onDesfazerPagamento,
  ]);
}
