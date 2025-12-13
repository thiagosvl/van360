import { ActionItem } from "@/types/actions";
import { Veiculo } from "@/types/veiculo";
import { Pencil, ToggleLeft, ToggleRight, Trash2, Users } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface UseVeiculoActionsProps {
  veiculo: Veiculo;
  navigate: NavigateFunction;
  onEdit: (veiculo: Veiculo) => void;
  onToggleAtivo: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}

export function useVeiculoActions({
  veiculo,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: UseVeiculoActionsProps): ActionItem[] {
  return [
    {
      label: veiculo.ativo ? "Desativar" : "Reativar",
      icon: veiculo.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
      onClick: () => onToggleAtivo(veiculo),
      swipeColor: veiculo.ativo ? "bg-amber-500" : "bg-green-500",
    },
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => onEdit(veiculo),
      swipeColor: "bg-blue-600",
    },
    {
      label: "Ver Passageiros",
      icon: <Users className="h-4 w-4" />,
      onClick: () => navigate(`/passageiros?veiculo=${veiculo.id}`),
      disabled: !veiculo.passageiros_ativos_count,
      swipeColor: "bg-purple-600",
    },
    {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(veiculo),
      isDestructive: true,
      swipeColor: "bg-red-600",
    },
  ];
}
