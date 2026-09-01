import { useLayout } from "@/contexts/LayoutContext";
import {
  useDeleteCobranca,
  useDesfazerPagamento,
  useToggleNotificacoesCobranca,
  useCreateCobranca,
  useSession,
  safeCloseDialog,
} from "@/hooks";
import { CobrancaStatus } from "@/types/enums";
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
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { isMobilePlatform } from "@/utils/detectPlatform";
import { shareReceiptFile } from "@/utils/domain/cobranca/shareReceipt";
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
  } = useLayout();

  const toggleNotificacoes = useToggleNotificacoesCobranca();
  const desfazerPagamento = useDesfazerPagamento();
  const deleteCobranca = useDeleteCobranca();
  const createCobranca = useCreateCobranca();
  const { user } = useSession();

  const handleToggleLembretes = useCallback(async () => {
    const desativar = !cobranca.desativar_lembretes;
    openConfirmationDialog({
      title: desativar ? "Desativar lembretes?" : "Ativar lembretes?",
      description: desativar
        ? "O responsável não receberá lembretes automáticos para esta parcela específica."
        : "O responsável voltará a receber lembretes automáticos para esta parcela específica.",
      confirmText: desativar ? "Desativar" : "Ativar",
      variant: desativar ? "warning" : "default",
      onConfirm: async () => {
        try {
          if (cobranca.isProjection) {
            await createCobranca.mutateAsync({
              usuario_id: cobranca.passageiro?.usuario_id || cobranca.usuario_id || user?.id || "",
              passageiro_id: cobranca.passageiro_id,
              valor: Number(cobranca.valor),
              data_vencimento: cobranca.data_vencimento,
              mes: cobranca.mes,
              ano: cobranca.ano,
              status: CobrancaStatus.PENDENTE,
              desativar_lembretes: desativar,
            });
          } else {
            await toggleNotificacoes.mutateAsync({
              cobrancaId: cobranca.id,
              desativar: desativar,
            });
          }
          safeCloseDialog(closeConfirmationDialog);
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          safeCloseDialog(closeConfirmationDialog);
          console.error(error);
        }
      },
    });
  }, [toggleNotificacoes, createCobranca, onActionSuccess, cobranca, user?.id, openConfirmationDialog, closeConfirmationDialog]);

  const handleDesfazerPagamento = useCallback(async () => {
    openConfirmationDialog({
      title: "Desfazer pagamento?",
      description: "O pagamento será removido e a parcela voltará a ficar pendente. Confirmar?",
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
          if (cobranca.isProjection) {
            await createCobranca.mutateAsync({
              passageiro_id: cobranca.passageiro_id,
              usuario_id: cobranca.usuario_id || cobranca.passageiro?.usuario_id || user?.id,
              mes: Number(cobranca.mes),
              ano: Number(cobranca.ano),
              valor: Number(cobranca.valor),
              data_vencimento: cobranca.data_vencimento,
              status: CobrancaStatus.CANCELADA,
            });
          } else {
            await deleteCobranca.mutateAsync(cobranca.id);
          }
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      onEdit: cobranca.isProjection ? undefined : () => {
        openCobrancaEditDialog({
          cobranca,
          onSuccess: onActionSuccess,
        });
      }
    });
  }, [cobranca, createCobranca, deleteCobranca, openCobrancaDeleteDialog, openCobrancaEditDialog, onActionSuccess, user?.id]);

  const isActionLoading =
    toggleNotificacoes.isPending ||
    desfazerPagamento.isPending ||
    deleteCobranca.isPending ||
    createCobranca.isPending;

  return {
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    isActionLoading,
    isTogglingNotificacoes: toggleNotificacoes.isPending || createCobranca.isPending,
    isDesfazendoPagamento: desfazerPagamento.isPending,
    isDeleting: deleteCobranca.isPending || createCobranca.isPending
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
  onEnviarCobranca?: () => void;
  showHistory?: boolean;
}

export function useCobrancaActions(props: UseCobrancaActionsProps): ActionItem[] {
  const {
    cobranca,
    onVerCarteirinha,
    onEditarCobranca,
    onRegistrarPagamento,
    onPagarPix,
    onEnviarCobranca,
    onExcluirCobranca,
  } = props;

  const {
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    isActionLoading,
    isTogglingNotificacoes,
    isDesfazendoPagamento,
    isDeleting
  } = useCobrancaOperations(props);

  return useMemo(() => {
    if (cobranca.isProjection) {
      const projActions: ActionItem[] = [];
      if (onRegistrarPagamento) {
        projActions.push({
          label: "Registrar Pagamento",
          icon: <CheckCircle2 className="h-4 w-4" />,
          onClick: () => {
            document.body.click();
            setTimeout(() => onRegistrarPagamento(), 10);
          },
          swipeColor: "bg-emerald-500",
          hasSeparatorAfter: true,
        });
      }

      const desativar = cobranca.desativar_lembretes ?? false;
      projActions.push({
        label: desativar ? "Ativar Lembretes" : "Desativar Lembretes",
        icon: desativar ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />,
        onClick: handleToggleLembretes,
        disabled: isActionLoading,
        isLoading: isTogglingNotificacoes,
        swipeColor: desativar ? "bg-indigo-600" : "bg-slate-600",
        hasSeparatorAfter: true,
      });

      if (onVerCarteirinha) {
        projActions.push({
          label: "Ver Carteirinha",
          icon: <User className="h-4 w-4" />,
          onClick: onVerCarteirinha,
          swipeColor: "bg-indigo-600",
          hasSeparatorAfter: true,
        });
      }

      projActions.push({
        label: "Excluir Parcela",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onExcluirCobranca || handleDeleteCobranca,
        disabled: isActionLoading,
        isLoading: isDeleting,
        variant: "destructive",
        swipeColor: "bg-red-500",
      });

      return projActions;
    }

    if (cobranca.status === CobrancaStatus.CANCELADA) {
      const canceladaActions: ActionItem[] = [];
      if (onVerCarteirinha) {
        canceladaActions.push({
          label: "Ver Carteirinha",
          icon: <User className="h-4 w-4" />,
          onClick: onVerCarteirinha,
          swipeColor: "bg-indigo-600",
          hasSeparatorAfter: true,
        });
      }
      return canceladaActions;
    }

    const isPago = seForPago(cobranca);
    const actions: ActionItem[] = [];

    const handleShareDirect = async () => {
      await shareReceiptFile({
        url: cobranca.recibo_url!,
        filename: `recibo-${cobranca.mes}-${cobranca.ano}.png`.toLowerCase(),
        title: "Recibo Van360",
        text: `Recibo de ${cobranca.mes}/${cobranca.ano} - ${(cobranca as any).passageiro?.nome || ""}`,
      });
    };

    if (isPago && props.onVerRecibo && cobranca.recibo_url) {
      actions.push({
        label: "Ver Recibo",
        icon: <Receipt className="h-4 w-4" />,
        onClick: props.onVerRecibo,
        disabled: isActionLoading,
        swipeColor: "bg-blue-600",
        hasSeparatorAfter: true,
      });

      if (isMobilePlatform()) {
        actions.push({
          label: "Enviar Recibo",
          icon: <WhatsAppIcon className="h-4 w-4" />,
          onClick: handleShareDirect,
          swipeColor: "bg-[#25D366]",
          hasSeparatorAfter: true,
        });
      }
    }

    if (isPago) {
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
        disabled: isActionLoading,
        swipeColor: "bg-amber-500",
        isLoading: isDesfazendoPagamento,
        hasSeparatorAfter: true,
      });
    }

    if (!isPago && onEnviarCobranca && isMobilePlatform()) {
      actions.push({
        label: "Enviar Cobrança",
        icon: <WhatsAppIcon className="h-4 w-4" />,
        onClick: onEnviarCobranca,
        swipeColor: "bg-[#25D366]",
        hasSeparatorAfter: true,
      });
    }

    if (!isPago) {
      const desativar = cobranca.desativar_lembretes ?? false;
      actions.push({
        label: desativar ? "Ativar Lembretes" : "Desativar Lembretes",
        icon: desativar ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />,
        onClick: handleToggleLembretes,
        disabled: isActionLoading,
        isLoading: isTogglingNotificacoes,
        swipeColor: desativar ? "bg-indigo-600" : "bg-slate-600",
        hasSeparatorAfter: true,
      });
    }

    if (!isPago && onEditarCobranca) {
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

    if (!isPago && onRegistrarPagamento) {
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

    if (!isPago && onPagarPix) {
      actions.push({
        label: "Pagar via PIX",
        icon: <QrCode className="h-4 w-4" />,
        onClick: () => {
          document.body.click();
          setTimeout(() => onPagarPix(), 10);
        },
        disabled: isActionLoading,
        swipeColor: "bg-emerald-600",
        hasSeparatorAfter: true,
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

    if (props.onExcluirCobranca) {
      actions.push({
        label: "Excluir",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: props.onExcluirCobranca,
        disabled: disableExcluirCobranca(cobranca) || isActionLoading,
        isDestructive: true,
        swipeColor: "bg-red-600",
        className: "text-red-600 font-bold",
        isLoading: isDeleting,
      });
    }

    return actions;
  }, [
    cobranca,
    onVerCarteirinha,
    onRegistrarPagamento,
    onEditarCobranca,
    handleToggleLembretes,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    isActionLoading,
    isTogglingNotificacoes,
    isDesfazendoPagamento,
    isDeleting,
    onPagarPix,
    onEnviarCobranca,
    props.onVerRecibo,
    props.onExcluirCobranca,
    props.onDesfazerPagamento,
  ]);
}
