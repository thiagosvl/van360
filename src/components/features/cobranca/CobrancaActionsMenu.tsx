import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { Cobranca } from "@/types/cobranca";
import { CobrancaSummary } from "./CobrancaSummary";

interface CobrancaActionsMenuProps {
  cobranca: Cobranca;
  variant?: "default" | "mobile";
  onEditarCobranca?: () => void;
  onRegistrarPagamento?: () => void;
  onPagarPix?: () => void;
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
      header={<CobrancaSummary cobranca={cobranca} />}
    />
  );
};
