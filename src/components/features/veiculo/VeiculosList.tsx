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
import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
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

interface VeiculosListProps {
  veiculos: (Veiculo & { passageiros_ativos_count?: number })[];
  navigate: NavigateFunction;
  onEdit: (veiculo: Veiculo) => void;
  onToggleAtivo: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}

interface VeiculoActionsDropdownProps {
  veiculo: Veiculo & { passageiros_ativos_count?: number };
  navigate: NavigateFunction;
  onEdit: (veiculo: Veiculo) => void;
  onToggleAtivo: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
  triggerClassName?: string;
  triggerSize?: "sm" | "icon";
}

function VeiculoActionsDropdown({
  veiculo,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
}: VeiculoActionsDropdownProps) {
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
            onEdit(veiculo);
          }}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAtivo(veiculo);
          }}
        >
          {veiculo.ativo ? (
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
          disabled={veiculo.passageiros_ativos_count === 0}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/passageiros?veiculo=${veiculo.id}`);
          }}
        >
          <Users className="w-4 h-4 mr-2" />
          Ver Passageiros
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(veiculo);
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

export function VeiculosList({
  veiculos,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: VeiculosListProps) {
  return (
    <ResponsiveDataList
      data={veiculos}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(veiculo) => {
        const actions: MobileAction[] = [
          {
            label: "Editar",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => onEdit(veiculo),
            swipeColor: "bg-blue-600",
          },
          {
            label: veiculo.ativo ? "Desativar" : "Reativar",
            icon: veiculo.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
            onClick: () => onToggleAtivo(veiculo),
            swipeColor: veiculo.ativo ? "bg-orange-500" : "bg-green-600",
          },
          {
            label: "Ver Passageiros",
            icon: <Users className="h-4 w-4" />,
            onClick: () => navigate(`/passageiros?veiculo=${veiculo.id}`),
            swipeColor: "bg-violet-600",
            disabled: !veiculo.passageiros_ativos_count,
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDelete(veiculo),
            isDestructive: true,
          }
        ];

        return (
          <MobileActionItem
            key={veiculo.id}
            actions={actions}
          >
            <div
              onClick={() => onEdit(veiculo)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 pt-3 pb-2 px-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm">
                    {formatarPlacaExibicao(veiculo.placa)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {veiculo.marca} {veiculo.modelo}
                    {veiculo.ano_modelo ? ` • ${veiculo.ano_modelo}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="shrink-0"><StatusBadge status={veiculo.ativo} /></div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Passageiros
                  </span>
                  <p className="text-xs text-gray-600 font-medium flex gap-1">
                    <Users className="w-4 h-4" />
                    {veiculo.passageiros_ativos_count ?? 0} ativos
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
              <th className="w-[200px] py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
                Placa
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Veículo
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
            {veiculos.map((veiculo) => (
              <tr
                key={veiculo.id}
                onClick={() => onEdit(veiculo)}
                className="hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
              >
                <td className="py-4 pl-6 align-middle">
                  <p className="font-bold text-gray-900 text-sm">
                    {formatarPlacaExibicao(veiculo.placa)}
                  </p>
                </td>
                <td className="px-6 py-4 align-middle">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-900">
                      {veiculo.marca} {veiculo.modelo}
                    </span>
                    {veiculo.ano_modelo && (
                      <span className="text-xs text-gray-500">
                        {veiculo.ano_modelo}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users2 className="w-4 h-4" />
                    {veiculo.passageiros_ativos_count}
                  </div>
                </td>
                <td className="px-6 py-4 align-middle">
                  <StatusBadge status={veiculo.ativo} />
                </td>
                <td className="px-6 py-4 text-right align-middle">
                  <VeiculoActionsDropdown
                    veiculo={veiculo}
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
