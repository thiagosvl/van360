import { ActionItem } from "@/types/actions";
import { ContratoStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { openBrowserLink } from "@/utils/browser";
import {
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Pencil,
  RefreshCcw,
  Send,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User
} from "lucide-react";
import { useMemo } from "react";

interface UsePassageiroActionsProps {
  passageiro: Passageiro;
  onToggleStatus: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onHistorico: (passageiro: Passageiro) => void;
  onDelete: (passageiro: Passageiro) => void;
  onGenerateContract?: (passageiro: Passageiro) => void;
  onReenviarNotificacaoContrato?: (passageiro: Passageiro) => void;
  onSubstituirContrato?: (passageiro: Passageiro) => void;
  onExcluirContrato?: (passageiro: Passageiro) => void;
  onVisualizarFinal?: (url: string) => void;
  usarContratos?: boolean;
  isDesativado?: boolean;
}

export function usePassageiroActions({
  passageiro,
  onToggleStatus,
  onEdit,
  onHistorico,
  onDelete,
  onGenerateContract,
  onReenviarNotificacaoContrato,
  onSubstituirContrato,
  onExcluirContrato,
  onVisualizarFinal,
  usarContratos = true,
  isDesativado = false,
}: UsePassageiroActionsProps): ActionItem[] {

  return useMemo(() => {
    // Normalização robusta de status do contrato
    const statusContrato = passageiro.status_contrato?.toString().toLowerCase();
    const isPendente = statusContrato === ContratoStatus.PENDENTE || statusContrato === 'pendente' || statusContrato === '1';
    const isAssinado = statusContrato === ContratoStatus.ASSINADO || statusContrato === 'assinado' || statusContrato === '2';
    // Consideramos que tem contrato se o status for pendente/assinado OU se houver um id de contrato
    const hasContract = isPendente || isAssinado || !!(passageiro.contrato_id);

    // Lógica de desativação global da funcionalidade
    const isFeatureDisabled = !!(isDesativado || (usarContratos === false));

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
        label: "Ver Carteirinha",
        icon: <User className="h-4 w-4" />,
        onClick: () => onHistorico(passageiro),
        swipeColor: "bg-gray-500",
        hasSeparatorAfter: true
      },
    ];

    // --- AÇÕES DE CONTRATO ---

    // 1. Gerar Contrato - Só aparece se NÃO tem contrato
    if (onGenerateContract && !hasContract) {
      actions.push({
        label: "Gerar Contrato",
        icon: <FileText className="h-4 w-4" />,
        onClick: () => onGenerateContract(passageiro),
        disabled: isFeatureDisabled,
        swipeColor: "bg-blue-600",
        hasSeparatorAfter: true
      });
    }

    // 2. Ver Contrato - Só aparece se tem contrato
    const urlContrato = isPendente
      ? (passageiro.minuta_url || passageiro.contrato_url)
      : (passageiro.contrato_final_url || passageiro.contrato_url);

    if (hasContract) {
      actions.push({
        label: isAssinado ? "Ver Contrato Assinado" : "Ver Contrato Pendente",
        icon: isAssinado ? <Eye className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />,
        onClick: () => urlContrato && onVisualizarFinal?.(urlContrato),
        disabled: !!(!urlContrato || isFeatureDisabled),
        isLink: !!urlContrato,
        href: urlContrato || undefined,
        swipeColor: "bg-green-600",
        hasSeparatorAfter: true
      });
    }

    // 3. Reenviar Notificação - Só aparece se pendente
    if (isPendente && onReenviarNotificacaoContrato && passageiro.contrato_id) {
      actions.push({
        label: "Reenviar Contrato",
        icon: <Send className="h-4 w-4" />,
        onClick: () => onReenviarNotificacaoContrato(passageiro),
        disabled: isFeatureDisabled,
        swipeColor: "bg-blue-600",
        hasSeparatorAfter: true
      });
    }

    // 4. Substituir Contrato - Só aparece se tem contrato
    if (hasContract && onSubstituirContrato && passageiro.contrato_id) {
      actions.push({
        label: "Substituir Contrato",
        icon: <RefreshCcw className="h-4 w-4" />,
        onClick: () => onSubstituirContrato(passageiro),
        disabled: isFeatureDisabled,
        swipeColor: "bg-orange-600",
        hasSeparatorAfter: true
      });
    }

    // 5. Excluir Contrato - Só aparece se tem contrato
    if (hasContract && onExcluirContrato && passageiro.contrato_id) {
      actions.push({
        label: "Excluir Contrato",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onExcluirContrato(passageiro),
        disabled: isFeatureDisabled,
        className: "text-red-600 font-medium",
        isDestructive: true,
        swipeColor: "bg-red-600",
        hasSeparatorAfter: true
      });
    }

    // 6. Excluir Passageiro - Sempre visível
    actions.push({
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(passageiro),
      isDestructive: true,
      swipeColor: "bg-red-500",
      className: "text-red-600"
    });

    return actions;
  }, [passageiro, onToggleStatus, onEdit, onHistorico, onDelete, onGenerateContract, onReenviarNotificacaoContrato, onSubstituirContrato, onExcluirContrato, onVisualizarFinal, usarContratos, isDesativado]);
}

