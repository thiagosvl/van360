import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useCobrancaActions } from "@/hooks/business/useCobrancaActions";
import { Cobranca } from "@/types/cobranca";

interface CobrancaActionsMenuProps {
  cobranca: Cobranca;
  plano: any;
  variant?: "default" | "mobile";
  onVerCobranca?: () => void;
  onEditarCobranca?: () => void;
  onRegistrarPagamento?: () => void;
  onEnviarNotificacao?: () => void; // Optional in hooks? Check hook signature
  onToggleLembretes?: () => void; 
  onDesfazerPagamento?: () => void;
  onExcluirCobranca?: () => void;
  onVerCarteirinha?: () => void;
  onUpgrade?: (featureName: string, description: string) => void;
}

export function CobrancaActionsMenu({
  variant = "default",
  ...props
}: CobrancaActionsMenuProps) {
  const actions = useCobrancaActions(props);
  const triggerClassName = variant === "mobile" ? "h-8 w-8 shrink-0 -mr-2 -mt-1" : "h-8 w-8 p-0";
  
  return (
    <ActionsDropdown
      actions={actions}
      triggerClassName={triggerClassName}
      triggerSize={variant === "mobile" ? "icon" : "sm"}
    />
  );
}
