import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { BlurredValue } from "@/components/common/BlurredValue";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { useGastoActions } from "@/hooks/business/useGastoActions";
import { cn } from "@/lib/utils";
import { Gasto } from "@/types/gasto";
import { formatDateToBR } from "@/utils/formatters";
import {
    Bus,
    Calendar,
    ClipboardCheck,
    Cog,
    Ellipsis,
    FileText,
    Fuel,
    HelpCircle,
    Wallet,
    Wrench,
} from "lucide-react";
import { memo } from "react";

interface GastosListProps {
  gastos: Gasto[];
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
  isRestricted?: boolean;
  veiculos?: { id: string; placa: string }[];
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
    case "Administrativa":
      return {
        icon: Cog,
        color: "text-purple-600",
        bg: "bg-purple-100",
      };
    case "Outro":
      return {
        icon: Ellipsis,
        color: "text-red-600",
        bg: "bg-red-100",
      };
    default:
      return {
        icon: HelpCircle,
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
  }
};

const GastoActionsMenu = memo(function GastoActionsMenu({
  gasto,
  onEdit,
  onDelete,
  isRestricted,
}: { gasto: Gasto } & Pick<
  GastosListProps,
  "onEdit" | "onDelete" | "isRestricted"
>) {
  const actions = useGastoActions({ gasto, onEdit, onDelete, isRestricted });
  return <ActionsDropdown actions={actions} disabled={isRestricted} />;
});

const GastoMobileCard = memo(function GastoMobileCard({
  gasto,
  index,
  onEdit,
  onDelete,
  isRestricted,
  veiculos,
}: { gasto: Gasto; index: number } & GastosListProps) {
  const { icon: Icon, color, bg } = getCategoryConfig(gasto.categoria);

  const getVeiculoPlaca = (veiculoId?: string | null) => {
    if (!veiculoId) return null;
    return veiculos?.find((v) => v.id === veiculoId)?.placa || null;
  };
  const placa = getVeiculoPlaca(gasto.veiculo_id);

  const actions = useGastoActions({ gasto, onEdit, onDelete, isRestricted });

  return (
    <MobileActionItem actions={actions as any} showHint={index === 0}>
      <div
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
            <div className="flex flex-col">
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {gasto.categoria}
              </p>
              {placa && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Bus className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-medium text-gray-500">
                    {placa}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-3">
          <p className="text-xs text-muted-foreground max-w-[60%] line-clamp-2">
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
          {!isRestricted ? formatDateToBR(gasto.data) : "Dia, mês e ano"}
        </div>
      </div>
    </MobileActionItem>
  );
});

export function GastosList({
  gastos,
  onEdit,
  onDelete,
  isRestricted = false,
  veiculos = [],
}: GastosListProps) {
  const getVeiculoPlaca = (veiculoId?: string | null) => {
    if (!veiculoId) return null;
    return veiculos.find((v) => v.id === veiculoId)?.placa || null;
  };

  return (
    <ResponsiveDataList
      data={gastos}
      mobileItemRenderer={(gasto, index) => (
        <GastoMobileCard
          key={gasto.id}
          gasto={gasto}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          isRestricted={isRestricted}
          veiculos={veiculos}
          gastos={gastos} // Props requirement satisfaction
        />
      )}
    >
      <div className="rounded-2xl md:rounded-[28px] border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="w-[250px] py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Veículo
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
              const placa = getVeiculoPlaca(gasto.veiculo_id);

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
                    {placa ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          {placa}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-sm text-gray-500 max-w-[200px] block truncate">
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
                    <GastoActionsMenu
                      gasto={gasto}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isRestricted={isRestricted}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>
  );
}
