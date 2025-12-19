import { ActionItem } from "@/types/actions";
import { Gasto } from "@/types/gasto";
import { Edit, Trash2 } from "lucide-react";

interface UseGastoActionsProps {
  gasto: Gasto;
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
  isRestricted?: boolean;
}

export function useGastoActions({
  gasto,
  onEdit,
  onDelete,
  isRestricted = false,
}: UseGastoActionsProps): ActionItem[] {
  if (isRestricted) return [];

  return [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(gasto),
      swipeColor: "bg-blue-600",
    },
    {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(gasto.id),
      isDestructive: true,
      swipeColor: "bg-red-500",
    },
  ];
}
