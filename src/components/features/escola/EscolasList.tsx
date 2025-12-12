import { MobileAction, MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Escola } from "@/types/escola";
import {
    MoreVertical,
    Pencil,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Users,
    Users2,
} from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface EscolasListProps {
  escolas: (Escola & { passageiros_ativos_count?: number })[];
  navigate: NavigateFunction;
  onEdit: (escola: Escola) => void;
  onToggleAtivo: (escola: Escola) => void;
  onDelete: (escola: Escola) => void;
}

interface EscolaActionsDropdownProps {
  escola: Escola & { passageiros_ativos_count?: number };
  navigate: NavigateFunction;
  onEdit: (escola: Escola) => void;
  onToggleAtivo: (escola: Escola) => void;
  onDelete: (escola: Escola) => void;
  triggerClassName?: string;
  triggerSize?: "sm" | "icon";
}

function EscolaActionsDropdown({
  escola,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
}: EscolaActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={triggerSize}
          className={triggerClassName}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-8 w-8 text-gray-400 hover:text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(escola);
          }}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAtivo(escola);
          }}
        >
          {escola.ativo ? (
            <>
              <ToggleLeft className="w-4 h-4 mr-2" />
              Desativar
            </>
          ) : (
            <>
              <ToggleRight className="w-4 h-4 mr-2" />
              Reativar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={escola.passageiros_ativos_count === 0}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/passageiros?escola=${escola.id}`);
          }}
        >
          <Users className="w-4 h-4 mr-2" />
          Ver Passageiros
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(escola);
          }}
          className="cursor-pointer text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EscolasList({
  escolas,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: EscolasListProps) {
  return (
    <ResponsiveDataList
      data={escolas}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(escola) => {
        const actions: MobileAction[] = [
          {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => onEdit(escola),
            swipeColor: "bg-blue-600",
          },
          {
            label: escola.ativo ? "Desativar" : "Reativar",
            icon: escola.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
            onClick: () => onToggleAtivo(escola),
            swipeColor: escola.ativo ? "bg-orange-500" : "bg-green-600",
          },
          {
            label: "Ver Passageiros",
            icon: <Users className="h-4 w-4" />,
            onClick: () => navigate(`/passageiros?escola=${escola.id}`),
            swipeColor: "bg-violet-600",
            disabled: !escola.passageiros_ativos_count, // Disable if 0 or undefined
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDelete(escola),
            isDestructive: true,
          }
        ];

        return (
          <MobileActionItem
            key={escola.id}
            actions={actions}
          >
            <div
              onClick={() => onEdit(escola)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 pt-3 pb-2 px-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-bold text-gray-900 text-sm">{escola.nome}</p>
                {/* Visual hint for swipe is handled by MobileActionItem, no need for extra icons here */}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="shrink-0"><StatusBadge status={escola.ativo} trueLabel="Ativa" falseLabel="Desativada" /></div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Passageiros
                  </span>
                  <p className="text-xs text-gray-600 font-medium flex gap-1">
                    <Users className="w-4 h-4" />
                    {escola.passageiros_ativos_count ?? 0} ativos
                  </p>
                </div>
              </div>
            </div>
          </MobileActionItem>
        );
      }}
    >
      <div className="rounded-2xl md:rounded-[28px] border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="w-[300px] py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Passageiros Ativos
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {escolas.map((escola) => (
              <tr
                key={escola.id}
                onClick={() => onEdit(escola)}
                className="hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
              >
                <td className="py-4 pl-6 align-middle">
                  <p className="font-bold text-gray-900 text-sm">
                    {escola.nome}
                  </p>
                </td>
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users2 className="w-4 h-4" />
                    {escola.passageiros_ativos_count}
                  </div>
                </td>
                <td className="px-6 py-4 align-middle">
                  <StatusBadge status={escola.ativo} trueLabel="Ativa" falseLabel="Desativada" />
                </td>
                <td className="px-6 py-4 text-right align-middle">
                  <EscolaActionsDropdown
                    escola={escola}
                    navigate={navigate}
                    onEdit={onEdit}
                    onToggleAtivo={onToggleAtivo}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>
  );
}
