import { FEATURE_COBRANCA_AUTOMATICA, FEATURE_LIMITE_FRANQUIA } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { Passageiro } from "@/types/passageiro";
import { useCallback } from "react";

type UseFranchiseGateReturn = {
  validateActivation: (passageiro: Passageiro, onConfirm: () => void, onCancel?: () => void) => void;
  validateAutomationToggle: (passageiro: Passageiro | null | undefined, targetValue: boolean, onConfirm: () => void) => void;
};

export function useFranchiseGate(): UseFranchiseGateReturn {
  const { openConfirmationDialog, closeConfirmationDialog, openPlanUpgradeDialog } = useLayout();
  const { limits } = usePlanLimits();

  const validateActivation = useCallback(
    (passageiro: Passageiro, onConfirm: () => void, onCancel?: () => void) => {
      // If we are activating and automation is enabled, we must check limits
      // If we are desactivating, no check needed (skip to confirm)
      if (passageiro.ativo) {
         // Case: Desactivating
         // Pass through to external confirmation logic or just callback?
         // The user asked for the logic INSIDE the action, but usually confirmation dialog acts before action.
         // However, the logic in Passageiros.tsx is: Open Dialog -> On Confirm -> Check Limits -> Execute.
         // So this function receives the "onConfirm" action which IS the execution.
         onConfirm();
         return;
      }

      // Case: Activating (passageiro.ativo is false)
      // Check if we need to gate this action
      // We only care if the user wants automation
      if (passageiro.enviar_cobranca_automatica) {
         const available = limits.franchise.checkAvailability(false);
         if (!available) {
             // Block and Upsell
             openConfirmationDialog({
                title: "Limite de automação atingido",
                description: "Sua van digital está cheia no modo automático! Deseja assinar o Plano Profissional agora para manter as cobranças automatizadas ou reativar este passageiro sem a cobrança automática?",
                confirmText: "Aumentar Limite",
                cancelText: "Reativar sem cobranças",
                allowClose: true,
                onConfirm: () => {
                    closeConfirmationDialog();
                    openPlanUpgradeDialog({
                        feature: FEATURE_LIMITE_FRANQUIA,
                        targetPassengerCount: limits.franchise.used + 1,
                        onSuccess: () => onConfirm()
                    });
                },
                onCancel: () => {
                   if (onCancel) onCancel();
                   else closeConfirmationDialog();
                }
             });
             return;
         }
      }
      
      // If checks pass
      onConfirm();
    },
    [limits, openConfirmationDialog, closeConfirmationDialog, openPlanUpgradeDialog]
  );

  const validateAutomationToggle = useCallback(
    (passageiro: Passageiro | null | undefined, targetValue: boolean, onConfirm: () => void) => {
       if (!targetValue) {
           onConfirm(); // Disabling is always free
           return;
       }

       // Enabling
       const available = limits.franchise.checkAvailability(false);
       if (!available) {
               // Limit handling
               const feature = limits.franchise.limit === 0 ? FEATURE_COBRANCA_AUTOMATICA : FEATURE_LIMITE_FRANQUIA;
               
               openPlanUpgradeDialog({
                   feature,
                   targetPassengerCount: limits.franchise.used + 1,
                   onSuccess: () => onConfirm()
               });
               return;
       }
       
       onConfirm();
    },
    [limits, openPlanUpgradeDialog]
  );

  return { validateActivation, validateAutomationToggle };
}
