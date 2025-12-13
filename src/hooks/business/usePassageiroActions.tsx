import { ActionItem } from "@/types/actions";
import { Passageiro } from "@/types/passageiro";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { Bot, BotOff, CreditCard, Eye, Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface UsePassageiroActionsProps {
  passageiro: Passageiro;
  plano: any; // Using any for compatibility with accessRules utils
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleCobrancaAutomatica: (passageiro: Passageiro) => void;
  onToggleStatus: (passageiro: Passageiro) => void;
  onDelete: (passageiro: Passageiro) => void;
  onOpenUpgradeDialog?: (passageiroId?: string) => void;
}

export function usePassageiroActions({
  passageiro,
  plano,
  onHistorico,
  onEdit,
  onToggleCobrancaAutomatica,
  onToggleStatus,
  onDelete,
  onOpenUpgradeDialog,
}: UsePassageiroActionsProps): ActionItem[] {
  const hasCobrancaAutomaticaAccess = canUseCobrancaAutomatica(plano as any);

  return [
    {
      label: passageiro.ativo ? "Desativar" : "Reativar",
      icon: passageiro.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
      onClick: () => onToggleStatus(passageiro),
      color: passageiro.ativo ? "bg-amber-500" : "bg-green-500",
    },
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => onEdit(passageiro),
      swipeColor: "bg-blue-500",
    },
    {
      label: "Carteirinha",
      icon: <CreditCard className="h-4 w-4" />,
      onClick: () => onHistorico(passageiro),
    },
    {
      label: passageiro.enviar_cobranca_automatica
        ? "Pausar Cobrança"
        : (!hasCobrancaAutomaticaAccess ? "Ativar Cobrança Automática" : "Ativar Cobrança"),
      icon: passageiro.enviar_cobranca_automatica ? (
        <BotOff className="h-4 w-4" />
      ) : (
        <Bot className="h-4 w-4" />
      ),
      onClick: () => {
         if (hasCobrancaAutomaticaAccess) {
             onToggleCobrancaAutomatica(passageiro);
         } else {
             onOpenUpgradeDialog?.(passageiro.id);
         }
      },
      color: passageiro.enviar_cobranca_automatica ? "bg-slate-500" : "bg-indigo-600",
    },
    {
        label: "Ver Histórico",
        icon: <Eye className="h-4 w-4"/>,
        onClick: () => onHistorico(passageiro), // Assuming Historico is Carteirinha/Details
    },
    {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(passageiro),
      isDestructive: true,
      swipeColor: "bg-red-600",
    },
  // Deduping: "Carteirinha" and "Ver Histórico" map to same callback in List. Kept both as per original list structure if exists, or merging.
  // Viewing PassageirosList original code: It has "Ver Carteirinha" (CreditCard) and "Excluir".
  // Wait, let me check the original file again to ensure exact parity.
  // Original had: Carteirinha, Edit, AutoBilling Toggle, Toggle Status, Delete.
  // I will stick to that set.
  ].filter(action => {
      // Logic to filter if needed. For now returning all.
      // Wait, duplicates? "Carteirinha" and "Ver Histórico". I'll keep just "Ver Carteirinha" as typically primary.
      // Actually let's remove "Ver Histórico" if it's redundant.
      return action.label !== "Ver Histórico";
  });
}
