import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useEscolaActions } from "@/hooks/ui/useEscolaActions";
import { Escola } from "@/types/escola";
import { memo } from "react";
import { NavigateFunction } from "react-router-dom";

interface EscolaActionsMenuProps {
  escola: Escola;
  navigate: NavigateFunction;
  onEdit: (escola: Escola) => void;
  onToggleAtivo: (escola: Escola) => void;
  onDelete: (escola: Escola) => void;
}

export const EscolaActionsMenu = memo(function EscolaActionsMenu({
  escola,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: EscolaActionsMenuProps) {
  const actions = useEscolaActions({
    escola,
    navigate,
    onEdit,
    onToggleAtivo,
    onDelete,
  });

  return <ActionsDropdown actions={actions} />;
});
