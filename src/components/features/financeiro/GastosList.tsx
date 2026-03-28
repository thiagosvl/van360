import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { useGastoActions } from "@/hooks/ui/useGastoActions";
import { Gasto } from "@/types/gasto";
import { formatarPlacaExibicao } from "@/utils/domain";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import {
  Bus,
  Calendar,
} from "lucide-react";
import { memo, useState } from "react";
import { GastoActionsMenu } from "./GastoActionsMenu";
import { GastoSummary } from "./GastoSummary";

interface GastosListProps {
  gastos: Gasto[];
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
  veiculos?: { id: string; placa: string }[];
}


const GastoMobileCard = memo(function GastoMobileCard({
  gasto,
  index,
  onEdit,
  onDelete,
  veiculos,
}: { gasto: Gasto; index: number } & GastosListProps) {

  const getVeiculoPlaca = (veiculoId?: string | null) => {
    if (!veiculoId) return null;
    return veiculos?.find((v) => v.id === veiculoId)?.placa || null;
  };
  const placa = getVeiculoPlaca(gasto.veiculo_id);

  const actions = useGastoActions({ gasto, onEdit, onDelete });
  
  const getGastoDia = (dateStr?: string) => {
    if (!dateStr) return "??";
    const parts = dateStr.split("-");
    if (parts.length === 3) return parts[2].substring(0, 2);
    // Fallback if it's already in BR format or something else
    const day = dateStr.split("/")[0];
    return day.padStart(2, "0").substring(0, 2);
  };

  const gastoDia = getGastoDia(gasto.data);

  const renderHeader = () => <GastoSummary gasto={gasto} veiculoPlaca={placa} />;

  return (
    <MobileActionItem 
      actions={actions as any} 
      showHint={index === 0} 
      className="bg-transparent"
      renderHeader={renderHeader}
    >
      <div
        className="bg-white p-3 pr-10 rounded-xl shadow-diff-shadow flex items-start gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
      >
        <div className="flex-shrink-0 w-9 h-9 bg-[#1a3a5c] rounded-lg flex items-center justify-center mt-0.5">
          <span className="text-white font-headline font-bold text-sm leading-none">
            {gastoDia}
          </span>
        </div>

        <div className="flex-grow min-w-0">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
            {gasto.categoria}
          </p>
          <div className="mt-1">
            <p className="text-[10px] text-gray-500 font-medium opacity-60 break-words line-clamp-2 leading-relaxed">
              {gasto.descricao || "Sem descrição"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5 min-w-[70px]">
          <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
            {formatCurrency(gasto.valor)}
          </p>
          <div className="flex flex-col items-end gap-1 opacity-50">
            {/* Data removed here as requested, since it's now in the header block */}
            {placa && (
              <span className="text-[8px] font-black text-[#1a3a5c]/70 uppercase tracking-tighter">
                {formatarPlacaExibicao(placa)}
              </span>
            )}
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
  const [openedGasto, setOpenedGasto] = useState<Gasto | null>(null);

  const getVeiculoPlaca = (veiculoId?: string | null) => {
    if (!veiculoId) return null;
    return veiculos.find((v) => v.id === veiculoId)?.placa || null;
  };

  return (
    <>
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
              const placa = getVeiculoPlaca(gasto.veiculo_id);
              
              const getGastoDia = (dateStr?: string) => {
                if (!dateStr) return "??";
                const parts = dateStr.split("-");
                if (parts.length === 3) return parts[2].substring(0, 2);
                const day = dateStr.split("/")[0];
                return day.padStart(2, "0").substring(0, 2);
              };
              const gastoDia = getGastoDia(gasto.data);

              return (
                <tr
                  key={gasto.id}
                  onClick={() => setOpenedGasto(gasto)}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#1a3a5c]">
                        <span className="text-white font-headline font-bold text-sm leading-none">
                          {gastoDia}
                        </span>
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
    {/* Desktop-triggered ActionSheet (Quick View) */}
    {openedGasto && (
      <ActionSheetWrapper
        gasto={openedGasto}
        veiculoPlaca={getVeiculoPlaca(openedGasto.veiculo_id)}
        open={!!openedGasto}
        onOpenChange={(open) => !open && setOpenedGasto(null)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )}
    </>
  );
}

// Wrapper to avoid calling useGastoActions for all rows upfront
function ActionSheetWrapper({ 
  gasto, 
  veiculoPlaca,
  open, 
  onOpenChange, 
  onEdit,
  onDelete
}: { 
  gasto: Gasto; 
  veiculoPlaca?: string | null;
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: string) => void;
}) {
  const actions = useGastoActions({
    gasto,
    onEdit,
    onDelete
  });

  return (
    <ActionSheet 
      open={open} 
      onOpenChange={onOpenChange} 
      actions={actions.map(a => ({
        ...a as any,
        onClick: () => {
          onOpenChange(false);
          a.onClick();
        }
      }))}
    >
      <GastoSummary gasto={gasto} veiculoPlaca={veiculoPlaca} />
    </ActionSheet>
  );
}
