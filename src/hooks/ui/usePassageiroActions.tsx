import { usePermissions } from "@/hooks/business/usePermissions";
import { ActionItem } from "@/types/actions";
import { Passageiro } from "@/types/passageiro";
import {
  Bot,
  BotOff,
  CreditCard,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2
} from "lucide-react";

interface UsePassageiroActionsProps {
  passageiro: Passageiro;
  onToggleStatus: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onHistorico: (passageiro: Passageiro) => void;
  onToggleCobrancaAutomatica: (passageiro: Passageiro) => void;
  onDelete: (passageiro: Passageiro) => void;
  onOpenUpgradeDialog?: (featureOrId?: string) => void;
}

export function usePassageiroActions({
  passageiro,
  onToggleStatus,
  onEdit,
  onHistorico,
  onToggleCobrancaAutomatica,
  onDelete,
  onOpenUpgradeDialog,
}: UsePassageiroActionsProps): ActionItem[] {
  const { canUseAutomatedCharges: hasCobrancaAutomaticaAccess } = usePermissions();

  const actions: ActionItem[] = [
    {
      label: passageiro.ativo ? "Desativar" : "Reativar",
      icon: passageiro.ativo ? (
        <ToggleLeft className="h-4 w-4" />
      ) : (
        <ToggleRight className="h-4 w-4" />
      ),
      onClick: () => onToggleStatus(passageiro),
      swipeColor: passageiro.ativo ? "bg-amber-500" : "bg-emerald-500",
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
  ];

  // Lógica de Cobrança Automática
  if (passageiro.enviar_cobranca_automatica) {
    if (hasCobrancaAutomaticaAccess) {
      actions.push({
        label: "Pausar Cobrança Automática",
        icon: <BotOff className="h-4 w-4" />,
        onClick: () => onToggleCobrancaAutomatica(passageiro),
        swipeColor: "bg-slate-500",
      });
    }
  } else {
    actions.push({
      label: "Ativar Cobrança Automática",
      icon: <Bot className="h-4 w-4" />,
      onClick: () => {
        if (hasCobrancaAutomaticaAccess) {
          onToggleCobrancaAutomatica(passageiro);
        } else {
          onOpenUpgradeDialog?.(passageiro.id);
        }
      },
      swipeColor: "bg-indigo-600",
    });
  }

  // Ação de Excluir (sempre por último)
  actions.push({
    label: "Excluir",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: () => onDelete(passageiro),
    isDestructive: true,
    swipeColor: "bg-red-500",
  });

  return actions;
}
