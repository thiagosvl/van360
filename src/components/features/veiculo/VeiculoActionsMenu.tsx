import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { useVeiculoActions } from "@/hooks/ui/useVeiculoActions";
import { Veiculo } from "@/types/veiculo";
import { memo } from "react";
import { NavigateFunction } from "react-router-dom";

interface VeiculoActionsMenuProps {
  veiculo: Veiculo;
  navigate: NavigateFunction;
  onEdit: (veiculo: Veiculo) => void;
  onToggleAtivo: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}

export const VeiculoActionsMenu = memo(function VeiculoActionsMenu({
  veiculo,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: VeiculoActionsMenuProps) {
  const actions = useVeiculoActions({
    veiculo,
    navigate,
    onEdit,
    onToggleAtivo,
    onDelete,
  });

  return <ActionsDropdown actions={actions} />;
});
