import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { Cobranca } from "@/types/cobranca";

interface CobrancaActionsMenuProps {
  cobranca: Cobranca;
  variant?: "default" | "mobile";
  onVerCobranca?: () => void;
  onEditarCobranca?: () => void;
  onRegistrarPagamento?: () => void;
  onPagarPix?: () => void;
  onEnviarNotificacao?: () => void;
  onToggleLembretes?: () => void;
  onDesfazerPagamento?: () => void;
  onExcluirCobranca?: () => void;
  onVerCarteirinha?: () => void;
  onVerRecibo?: () => void;
  onActionSuccess?: () => void;
}

export const CobrancaActionsMenu = ({
  cobranca,
  variant = "default",
  onVerCobranca,
  onEditarCobranca,
  onRegistrarPagamento,
  onPagarPix,
  onVerRecibo,
  onActionSuccess,
  onExcluirCobranca,
  onVerCarteirinha,
  onDesfazerPagamento,
}: CobrancaActionsMenuProps) => {
  const actions = useCobrancaActions({
    cobranca,
    onVerCobranca,
    onVerCarteirinha,
    onEditarCobranca,
    onRegistrarPagamento,
    onPagarPix,
    onVerRecibo,
    onActionSuccess,
    onExcluirCobranca,
    onDesfazerPagamento,
  });
  const triggerClassName = variant === "mobile" ? "h-8 w-8 shrink-0 -mr-2 -mt-1" : "h-8 w-8 p-0";

  return (
    <ActionsDropdown
      actions={actions}
      triggerClassName={triggerClassName}
      triggerSize={variant === "mobile" ? "icon" : "sm"}
    />
  );
};
