import { PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
    useDeleteCobranca,
    useDesfazerPagamento,
    useEnviarNotificacaoCobranca,
    useToggleNotificacoesCobranca,
} from "@/hooks";
import { Cobranca } from "@/types/cobranca";
import { canUseNotificacoes } from "@/utils/domain/plano/accessRules";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface UseCobrancaActionsProps {
  plano: any; // Using any for simplicity as Plano structure is complex in useProfile
  onActionSuccess?: () => void;
  onUpgrade?: (feature: string, description: string) => void;
}

export function useCobrancaActions({
  plano,
  onActionSuccess,
  onUpgrade,
}: UseCobrancaActionsProps) {
  const navigate = useNavigate();
  const { openConfirmationDialog, openLimiteFranquiaDialog, closeConfirmationDialog } = useLayout();

  // Mutations
  const toggleNotificacoes = useToggleNotificacoesCobranca();
  const enviarNotificacao = useEnviarNotificacaoCobranca();
  const desfazerPagamento = useDesfazerPagamento();
  const deleteCobranca = useDeleteCobranca();

  const isActionLoading =
    toggleNotificacoes.isPending ||
    enviarNotificacao.isPending ||
    desfazerPagamento.isPending ||
    deleteCobranca.isPending;

  // --- Handlers ---

  const handleUpgrade = useCallback((featureName: string, description: string) => {
    if (onUpgrade) {
      onUpgrade(featureName, description);
      return;
    }
    // Default behavior if no custom handler provided
    openLimiteFranquiaDialog({
      title: featureName,
      description: description,
      hideLimitInfo: true,
    });
  }, [onUpgrade, openLimiteFranquiaDialog]);

  const handleToggleLembretes = useCallback(
    async (cobranca: Cobranca) => {
      // Check permissions logic if needed, or assume caller checked
      const hasAccess = canUseNotificacoes(plano);
      
      if (!hasAccess) {
        handleUpgrade(
          "Notificações Automáticas",
          "Automatize o envio de lembretes e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
        );
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
        // Error handling is likely done in mutation hook via toast
      }
    },
    [toggleNotificacoes, plano, handleUpgrade, onActionSuccess]
  );

  const handleEnviarNotificacao = useCallback(async (cobranca: Cobranca) => {
    const hasAccess = canUseNotificacoes(plano);

    if (!hasAccess) {
      handleUpgrade(
        "Envio de Cobranças",
        "Automatize o envio de cobranças e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
      );
      return;
    }

    openConfirmationDialog({
      title: "Enviar Notificação",
      description: "Deseja enviar a notificação de cobrança para o responsável via WhatsApp?",
      confirmText: "Enviar",
      onConfirm: async () => {
        try {
          await enviarNotificacao.mutateAsync(cobranca.id);
          closeConfirmationDialog();
          
          if (plano?.slug && [PLANO_GRATUITO, PLANO_ESSENCIAL].includes(plano.slug)) {
            // Upsell prompt after manual send
             handleUpgrade("Cobranças Automáticas", "Cobrança enviada! Automatize esse envio e ganhe tempo.");
          }
          
          if (onActionSuccess) onActionSuccess();
        } catch (error) {
          closeConfirmationDialog();
          console.error(error);
        }
      }
    });
  }, [enviarNotificacao, plano, handleUpgrade, openConfirmationDialog, closeConfirmationDialog, onActionSuccess]);

  const handleDesfazerPagamento = useCallback(async (cobranca: Cobranca) => {
    openConfirmationDialog({
      title: "Desfazer Pagamento",
      description: "Tem certeza que deseja desfazer este pagamento? A cobrança voltará para o status pendente.",
      variant: "destructive",
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
      }
    });
  }, [desfazerPagamento, openConfirmationDialog, closeConfirmationDialog, onActionSuccess]);

  const handleDeleteCobranca = useCallback(async (cobranca: Cobranca, options?: { redirectAfter?: boolean }) => {
    openConfirmationDialog({
      title: "Excluir Cobrança",
      description: "Tem certeza que deseja excluir esta cobrança? Esta ação não pode ser desfeita.",
      variant: "destructive",
      confirmText: "Excluir",
      onConfirm: async () => {
        try {
          await deleteCobranca.mutateAsync(cobranca.id);
          closeConfirmationDialog();
          
          if (onActionSuccess) onActionSuccess();
          
          if (options?.redirectAfter) {
             navigate(`/passageiros/${cobranca.passageiro_id}`);
          }
        } catch (error) {
           closeConfirmationDialog();
           console.error(error);
        }
      }
    });
  }, [deleteCobranca, openConfirmationDialog, closeConfirmationDialog, onActionSuccess, navigate]);

  return {
    handleToggleLembretes,
    handleEnviarNotificacao,
    handleDesfazerPagamento,
    handleDeleteCobranca,
    handleUpgrade,
    isActionLoading
  };
}
