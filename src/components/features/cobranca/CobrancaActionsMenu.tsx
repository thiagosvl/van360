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
  onEnviarCobranca?: () => void;
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
  onEnviarCobranca,
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
    onEnviarCobranca,
  });
  const triggerClassName = variant === "mobile" ? "-mr-2 -mt-1" : undefined;

  return (
    <ActionsDropdown
      actions={actions}
      triggerClassName={triggerClassName}
      triggerSize={variant === "mobile" ? "icon" : "sm"}
      header={<CobrancaSummary cobranca={cobranca} />}
    />
  );
};
