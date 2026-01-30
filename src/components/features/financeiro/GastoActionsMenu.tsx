import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useGastoActions } from "@/hooks/ui/useGastoActions";
import { Gasto } from "@/types/gasto";
import { memo } from "react";

interface GastoActionsMenuProps {
  gasto: Gasto;
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
}

export const GastoActionsMenu = memo(function GastoActionsMenu({
  gasto,
  onEdit,
  onDelete,
}: GastoActionsMenuProps) {
  const actions = useGastoActions({ gasto, onEdit, onDelete });
  return <ActionsDropdown actions={actions} />;
});
