import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { useGastoActions } from "@/hooks/ui/useGastoActions";
import { Gasto } from "@/types/gasto";
import { formatarPlacaExibicao } from "@/utils/domain";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import {
  Bus,
  Calendar,
  ClipboardCheck,
  Cog,
  Ellipsis,
  Eye,
  FileText,
  Fuel,
  HelpCircle,
  Wallet,
  Wrench,
} from "lucide-react";
import { memo } from "react";
import { GastoActionsMenu } from "./GastoActionsMenu";

interface GastosListProps {
  gastos: Gasto[];
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
  veiculos?: { id: string; placa: string }[];
}

const getCategoryConfig = (categoria: string) => {
  switch (categoria) {
    case "Combustível":
      return { icon: Fuel };
    case "Manutenção":
      return { icon: Wrench };
    case "Salário":
      return { icon: Wallet };
    case "Vistorias":
      return { icon: ClipboardCheck };
    case "Documentação":
      return { icon: FileText };
    case "Administrativa":
      return { icon: Cog };
    case "Outro":
      return { icon: Ellipsis };
    default:
      return { icon: HelpCircle };
  }
};

const GastoMobileCard = memo(function GastoMobileCard({
  gasto,
  index,
  onEdit,
  onDelete,
  veiculos,
}: { gasto: Gasto; index: number } & GastosListProps) {
  const { icon: Icon } = getCategoryConfig(gasto.categoria);

  const getVeiculoPlaca = (veiculoId?: string | null) => {
    if (!veiculoId) return null;
    return veiculos?.find((v) => v.id === veiculoId)?.placa || null;
  };
  const placa = getVeiculoPlaca(gasto.veiculo_id);

  const actions = useGastoActions({ gasto, onEdit, onDelete });

  return (
    <MobileActionItem actions={actions as any} showHint={index === 0} className="bg-transparent">
      <div
        onClick={() => onEdit(gasto)}
        className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border border-slate-100 bg-slate-50/50">
          <Icon className="h-5 w-5 text-[#1a3a5c] opacity-60" />
        </div>

        <div className="flex-grow min-w-0 pr-24">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
            {gasto.categoria}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {gasto.descricao || "Sem descrição"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
          <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
            {formatCurrency(gasto.valor)}
          </p>
          <div className="flex items-center gap-1.5 grayscale opacity-50">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap leading-none">
              {formatDateToBR(gasto.data)}
            </span>
          </div>
        </div>
      </div>
    </MobileActionItem>
  );
});

export function GastosList({
  gastos,
  onEdit,
  onDelete,
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
          veiculos={veiculos}
          gastos={gastos} // Props requirement satisfaction
        />
      )}
    >
      <div className="rounded-[28px] overflow-hidden bg-white shadow-diff-shadow border-none">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100/80">
              <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Categoria
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Veículo
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Descrição
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Data
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Valor
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gastos.map((gasto) => {
              const { icon: Icon } = getCategoryConfig(gasto.categoria);
              const placa = getVeiculoPlaca(gasto.veiculo_id);

              return (
                <tr
                  key={gasto.id}
                  onClick={() => onEdit(gasto)}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center border border-slate-100 bg-slate-50/50">
                        <Icon className="h-5 w-5 text-[#1a3a5c] opacity-60" />
                      </div>
                      <span className="font-headline font-bold text-[#1a3a5c] text-sm">
                        {gasto.categoria}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    {placa ? (
                      <span className="text-xs font-semibold text-gray-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                        {formatarPlacaExibicao(placa)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-50">
                        N/A
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <span className="text-sm text-slate-500 max-w-[180px] block truncate">
                      {gasto.descricao || "-"}
                    </span>
                  </td>
                  <td className="px-8 py-5 align-middle text-sm font-medium text-slate-600">
                    {formatDateToBR(gasto.data)}
                  </td>
                  <td className="px-8 py-5 text-right align-middle">
                    <span className="font-headline font-black text-[#1a3a5c] text-sm">
                      {formatCurrency(gasto.valor)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <GastoActionsMenu
                      gasto={gasto}
                      onEdit={onEdit}
                      onDelete={onDelete}
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
