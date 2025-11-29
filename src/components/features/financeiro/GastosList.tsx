import { BlurredValue } from "@/components/common/BlurredValue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Gasto } from "@/types/gasto";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { formatDateToBR } from "@/utils/formatters";
import {
  Calendar,
  ClipboardCheck,
  Edit,
  FileText,
  Fuel,
  HelpCircle,
  MoreVertical,
  Trash2,
  Wallet,
  Wrench,
} from "lucide-react";

interface GastosListProps {
  gastos: Gasto[];
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
  isRestricted?: boolean;
}

interface GastoActionsDropdownProps {
  gasto: Gasto;
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
  triggerClassName?: string;
  triggerSize?: "sm" | "icon";
  disabled?: boolean;
}

function GastoActionsDropdown({
  gasto,
  onEdit,
  onDelete,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
  disabled = false,
}: GastoActionsDropdownProps) {
  if (disabled) {
    return (
      <Button
        variant="ghost"
        size={triggerSize}
        className={triggerClassName}
        disabled
      >
        <MoreVertical className="h-8 w-8 text-gray-300" />
      </Button>
    );
  }

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
            safeCloseDialog(() => onEdit(gasto));
          }}
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(gasto.id);
          }}
          className="text-red-600 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getCategoryConfig = (categoria: string) => {
  switch (categoria) {
    case "Combustível":
      return { icon: Fuel, color: "text-orange-600", bg: "bg-orange-100" };
    case "Manutenção":
      return { icon: Wrench, color: "text-blue-600", bg: "bg-blue-100" };
    case "Salário":
      return { icon: Wallet, color: "text-green-600", bg: "bg-green-100" };
    case "Vistorias":
      return {
        icon: ClipboardCheck,
        color: "text-purple-600",
        bg: "bg-purple-100",
      };
    case "Documentação":
      return { icon: FileText, color: "text-yellow-600", bg: "bg-yellow-100" };
    default:
      return {
        icon: HelpCircle,
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
  }
};

export function GastosList({
  gastos,
  onEdit,
  onDelete,
  isRestricted = false,
}: GastosListProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl md:rounded-[28px] border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="w-[300px] py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gastos.map((gasto) => {
              const {
                icon: Icon,
                color,
                bg,
              } = getCategoryConfig(gasto.categoria);
              return (
                <tr
                  key={gasto.id}
                  onClick={() => !isRestricted && onEdit(gasto)}
                  className={cn(
                    "border-b border-gray-50 last:border-0 transition-colors",
                    isRestricted
                      ? "cursor-default"
                      : "hover:bg-gray-50/80 cursor-pointer"
                  )}
                >
                  <td className="py-4 pl-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${bg} ${color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-gray-900 text-sm">
                        {gasto.categoria}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-sm text-gray-500 max-w-[200px] block">
                      {gasto.descricao || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-sm text-gray-600 font-medium">
                      {formatDateToBR(gasto.data)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <span className="font-bold text-gray-900 text-sm">
                      <BlurredValue
                        value={gasto.valor}
                        visible={!isRestricted}
                        type="currency"
                      />
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <GastoActionsDropdown
                      gasto={gasto}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      disabled={isRestricted}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {gastos.map((gasto) => {
          const { icon: Icon, color, bg } = getCategoryConfig(gasto.categoria);
          return (
            <div
              key={gasto.id}
              onClick={() => !isRestricted && onEdit(gasto)}
              className={cn(
                "bg-white rounded-xl shadow-sm border border-gray-100 pt-3 pb-2 px-4 transition-transform",
                isRestricted ? "" : "active:scale-[0.99]"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${bg} ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {gasto.categoria}
                  </p>
                </div>
                <div className="-mr-2 -mt-2">
                  <GastoActionsDropdown
                    gasto={gasto}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    triggerSize="icon"
                    disabled={isRestricted}
                  />
                </div>
              </div>

              <div className="flex justify-between items-end mb-3">
                <p className="text-xs text-muted-foreground max-w-[60%]">
                  {gasto.descricao || "Sem descrição"}
                </p>
                <p className="font-bold text-gray-900 text-base">
                  <BlurredValue
                    value={gasto.valor}
                    visible={!isRestricted}
                    type="currency"
                  />
                </p>
              </div>

              <div className="flex items-center pt-2 border-t border-gray-50 text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1.5" />
                {formatDateToBR(gasto.data)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
