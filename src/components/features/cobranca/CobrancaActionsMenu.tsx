import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { Cobranca } from "@/types/cobranca";

interface CobrancaActionsMenuProps {
  cobranca: Cobranca;
  plano: any;
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
  onUpgrade?: (feature: string) => void;
  onVerRecibo?: () => void;
  onActionSuccess?: () => void;
}

export const CobrancaActionsMenu = ({
  cobranca,
  plano,
  variant = "default",
  onVerCobranca,
  onEditarCobranca,
  onRegistrarPagamento,
  onPagarPix,
  onEnviarNotificacao,
  onToggleLembretes,
  onDesfazerPagamento,
  onExcluirCobranca,
  onVerCarteirinha,
  onUpgrade,
  onVerRecibo,
  onActionSuccess,
}: CobrancaActionsMenuProps) => {
  const actions = useCobrancaActions({
    cobranca,
    plano,
    onVerCobranca,
    onVerCarteirinha,
    onEditarCobranca,
    onRegistrarPagamento,
    onPagarPix,
    onUpgrade: onUpgrade ? (f, d) => onUpgrade(f) : undefined,
    onVerRecibo,
    onActionSuccess,
    onExcluirCobranca,
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
