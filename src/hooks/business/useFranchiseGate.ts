import { FEATURE_COBRANCA_AUTOMATICA, FEATURE_LIMITE_FRANQUIA } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { Passageiro } from "@/types/passageiro";
import { useCallback } from "react";

type UseFranchiseGateReturn = {
  validateActivation: (passageiro: Passageiro, onConfirm: () => void, onCancel?: () => void) => void;
  validateAutomationToggle: (passageiro: Passageiro, targetValue: boolean, onConfirm: () => void) => void;
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
      if (passageiro.enviar_cobranca_automatica && limits.franchise.canEnable) {
        // If automation is ON, we check if we have franchise slots
        // limits.franchise.used includes ONLY active passengers
        // So activating one means used + 1
        const limitExceeded = !limits.franchise.checkAvailability(false); 

        if (limitExceeded) {
          openConfirmationDialog({
            title: "Limite de automação atingido",
            description:
              "Sua van digital está cheia no modo automático! Deseja assinar o Plano Profissional agora para manter as cobranças automatizadas ou reativar este passageiro sem a cobrança automática?",
            confirmText: "Ver Planos",
            cancelText: "Reativar sem cobranças",
            onConfirm: () => {
              closeConfirmationDialog();
              openPlanUpgradeDialog({
                feature: FEATURE_LIMITE_FRANQUIA,
                targetPassengerCount: limits.franchise.used + 1,
                onSuccess: () => {
                   // This flow is tricky: upgrade success -> retry activation?
                   // Usually onSuccess just refreshes data. 
                   // We might need to handle this externally or pass a retry callback.
                   // For now, let's keep it simple: Upgrade Dialog opens, user upgrades.
                   // The original code passed a mutation to onSuccess.
                   // We can return "false" or similar, but the hook structure requires callbacks.
                   // Let's assume the caller handles the "Retry" manually or we accept a "onUpgradeSuccess" param.
                   onConfirm(); // Try again? Or simple execute? If upgraded, limit is higher.
                },
              });
            },
            onCancel: () => {
                if (onCancel) onCancel();
                else closeConfirmationDialog();
            },
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
    (passageiro: Passageiro, targetValue: boolean, onConfirm: () => void) => {
       if (!targetValue) {
           onConfirm(); // Disabling is always free
           return;
       }

       // Enabling
       if (limits.franchise.canEnable) {
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
       }
       
       onConfirm();
    },
    [limits, openPlanUpgradeDialog]
  );

  return { validateActivation, validateAutomationToggle };
}
