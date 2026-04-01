import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ActionItem } from "@/types/actions";
import { ContratoStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  Copy,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User,
} from "lucide-react";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { useMemo } from "react";

interface UsePassageiroActionsProps {
  passageiro: Passageiro;
  onToggleStatus: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onHistorico: (passageiro: Passageiro) => void;
  onDelete: (passageiro: Passageiro) => void;
  onEnviarWhatsApp?: (passageiro: Passageiro) => void;
  usarContratos?: boolean;
  isDesativado?: boolean;
}

export function usePassageiroActions({
  passageiro,
  onToggleStatus,
  onEdit,
  onHistorico,
  onDelete,
  onEnviarWhatsApp,
  usarContratos = true,
  isDesativado = false,
}: UsePassageiroActionsProps): ActionItem[] {
  const isMobile = useIsMobile();

  return useMemo(() => {
    const statusContrato = passageiro.status_contrato?.toString().toLowerCase();
    const isPendente = 
      statusContrato === ContratoStatus.PENDENTE || 
      statusContrato === 'pendente' || 
      statusContrato === '1' ||
      (!!passageiro.contrato_id && !passageiro.status_contrato);
      
    const isAssinado = statusContrato === ContratoStatus.ASSINADO || statusContrato === 'assinado' || statusContrato === '2';
    const hasContract = isPendente || isAssinado || !!(passageiro.contrato_id);

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

    if (isPendente && onEnviarWhatsApp) {
      if (isMobile) {
        actions.push({
          label: "Reenviar Contrato",
          icon: <WhatsAppIcon className="h-4 w-4" />,
          onClick: () => onEnviarWhatsApp(passageiro),
          disabled: isFeatureDisabled,
          swipeColor: "bg-[#1a3a5c]",
          hasSeparatorAfter: true
        });
      } else {
        actions.push({
          label: "Copiar Link para Assinatura",
          icon: <Copy className="h-4 w-4" />,
          onClick: () => onEnviarWhatsApp(passageiro),
          disabled: isFeatureDisabled,
          swipeColor: "bg-[#1a3a5c]",
          hasSeparatorAfter: true
        });
      }
    }

    actions.push({
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(passageiro),
      isDestructive: true,
      swipeColor: "bg-red-500",
      className: "text-red-600"
    });

    return actions;
  }, [passageiro, onToggleStatus, onEdit, onHistorico, onDelete, onEnviarWhatsApp, usarContratos, isDesativado, isMobile]);
}
