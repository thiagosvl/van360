import { usePermissions } from "@/hooks/business/usePermissions";
import { ActionItem } from "@/types/actions";
import { ContratoStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { openBrowserLink } from "@/utils/browser";
import {
  Bot,
  BotOff,
  CreditCard,
  FileCheck,
  FilePlus,
  FileText,
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
  onGenerateContract?: (passageiro: Passageiro) => void;
}

export function usePassageiroActions({
  passageiro,
  onToggleStatus,
  onEdit,
  onHistorico,
  onToggleCobrancaAutomatica,
  onDelete,
  onOpenUpgradeDialog,
  onGenerateContract,
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
      hasSeparatorAfter: true
    },
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => onEdit(passageiro),
      swipeColor: "bg-blue-500",
      hasSeparatorAfter: true
    },
    {
      label: "Carteirinha",
      icon: <CreditCard className="h-4 w-4" />,
      onClick: () => onHistorico(passageiro),
      hasSeparatorAfter: true
    },
  ];

  if (passageiro.enviar_cobranca_automatica) {
    if (hasCobrancaAutomaticaAccess) {
      actions.push({
        label: "Pausar Cobrança Automática",
        icon: <BotOff className="h-4 w-4" />,
        onClick: () => onToggleCobrancaAutomatica(passageiro),
        swipeColor: "bg-slate-500",
        hasSeparatorAfter: true
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
      hasSeparatorAfter: true
    });
  }

  // Contract Actions - Conditional Logic
  if (passageiro.status_contrato === ContratoStatus.ASSINADO) {
    // Contract is signed - show link to final document
    const finalUrl = passageiro.contrato_final_url || passageiro.contrato_url;
    if (finalUrl) {
      actions.push({
        label: "Ver Contrato Assinado",
        icon: <FileCheck className="h-4 w-4" />,
        onClick: () => openBrowserLink(finalUrl),
        swipeColor: "bg-green-600",
        hasSeparatorAfter: true
      });
    }
  } else if (passageiro.status_contrato === ContratoStatus.PENDENTE && passageiro.contrato_url) {
    // Contract is pending signature - show link to signing page
    actions.push({
      label: "Ver Contrato (Pendente)",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => openBrowserLink(passageiro.contrato_url),
      swipeColor: "bg-amber-600",
      hasSeparatorAfter: true
    });
  } else if (onGenerateContract) {
    // No contract - show generate option
    actions.push({
      label: "Gerar Contrato",
      icon: <FilePlus className="h-4 w-4" />,
      onClick: () => onGenerateContract(passageiro),
      swipeColor: "bg-blue-600",
      hasSeparatorAfter: true
    });
  }


  // Ação de Excluir (sempre por último)
  actions.push({
    label: "Excluir",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: () => onDelete(passageiro),
    isDestructive: true,
    swipeColor: "bg-red-500",
    className: "text-red-600"
  });

  return actions;
}
