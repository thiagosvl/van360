import { ActionItem } from "@/types/actions";
import { Escola } from "@/types/escola";
import { Pencil, ToggleLeft, ToggleRight, Trash2, Users } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface UseEscolaActionsProps {
  escola: Escola;
  navigate: NavigateFunction;
  onEdit: (escola: Escola) => void;
  onToggleAtivo: (escola: Escola) => void;
  onDelete: (escola: Escola) => void;
}

export function useEscolaActions({
  escola,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: UseEscolaActionsProps): ActionItem[] {
  return [
    {
      label: escola.ativo ? "Desativar" : "Reativar",
      icon: escola.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
      onClick: () => onToggleAtivo(escola),
      swipeColor: escola.ativo ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      label: "Editar",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => onEdit(escola),
      swipeColor: "bg-blue-600",
    },
    {
      label: "Ver Passageiros",
      icon: <Users className="h-4 w-4" />,
      onClick: () => navigate(`/passageiros?escola=${escola.id}`),
      disabled: !escola.passageiros_ativos_count,
      swipeColor: "bg-purple-600",
    },
    {
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(escola),
      isDestructive: true,
      swipeColor: "bg-red-500",
    },
  ];
}
