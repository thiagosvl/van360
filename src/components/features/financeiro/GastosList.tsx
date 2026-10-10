import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useGastoActions } from "@/hooks/ui/useGastoActions";
import { Gasto } from "@/types/gasto";
import { formatarPlacaExibicao, getCategoriaMetadata, obterDescricaoFormatadaGasto } from "@/utils/domain";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { memo, useState } from "react";
import { GastoActionsMenu } from "./GastoActionsMenu";
import { GastoSummary } from "./GastoSummary";
import { useGastoCategorias } from "@/hooks";

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
  const { data: categoriasData } = useGastoCategorias();

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
    const day = dateStr.split("/")[0];
    return day.padStart(2, "0").substring(0, 2);
  };

  const gastoDia = getGastoDia(gasto.data);

  const renderHeader = () => <GastoSummary gasto={gasto} veiculoPlaca={placa} />;

  return (
    <MobileActionItem
      actions={actions}
      showHint={index === 0}
      className="bg-transparent"
      renderHeader={renderHeader}
    >
      <div className="bg-white p-3.5 pr-10 rounded-[20px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-start gap-3 active:scale-[0.99] transition-all">
        <div className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center mt-0.5 text-[#0a0a0a]">
          <span className="font-semibold text-xs leading-none">
            {gastoDia}
          </span>
        </div>

        <div className="flex-grow min-w-0">
          <p className="font-semibold text-[#0a0a0a] text-sm truncate leading-tight capitalize">
            {getCategoriaMetadata(gasto.categoria, categoriasData).label}
          </p>
          <p className="text-xs text-[#737373] truncate leading-relaxed mt-0.5">
            {obterDescricaoFormatadaGasto(gasto)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5 min-w-[70px]">
          <p className="font-semibold text-[#0a0a0a] text-sm leading-none">
            {formatCurrency(gasto.valor)}
          </p>
          {placa && (
            <span className="text-[10px] font-medium text-[#737373] uppercase tracking-wider mt-0.5">
              {formatarPlacaExibicao(placa)}
            </span>
          )}
        </div>
      </div>
    </MobileActionItem>
  );
});

export const GastosList = memo(function GastosList({
  gastos,
  onEdit,
  onDelete,
  veiculos = [],
}: GastosListProps) {
  const [openedGasto, setOpenedGasto] = useState<Gasto | null>(null);
  const { data: categoriasData } = useGastoCategorias();

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
            gastos={gastos}
          />
        )}
      >
        <div className="rounded-[24px] overflow-hidden bg-white border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <th className="px-6 py-3.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Categoria
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Descrição
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Veículo
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Data
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Valor
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
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
                    className="group hover:bg-[#fafafa]/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-[10px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a]">
                          <span className="font-semibold text-xs leading-none">
                            {gastoDia}
                          </span>
                        </div>
                        <span className="font-medium text-[#0a0a0a] text-sm capitalize">
                          {getCategoriaMetadata(gasto.categoria, categoriasData).label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className="text-sm text-[#737373] max-w-[200px] block truncate">
                        {obterDescricaoFormatadaGasto(gasto)}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {placa ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                          {formatarPlacaExibicao(placa)}
                        </span>
                      ) : (
                        <span className="text-xs text-[#737373]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle text-xs font-medium text-[#737373]">
                      {formatDateToBR(gasto.data)}
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <span className="font-semibold text-[#0a0a0a] text-sm">
                        {formatCurrency(gasto.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
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

      {openedGasto && (
        <ActionSheetWrapper
          gasto={openedGasto}
          veiculoPlaca={getVeiculoPlaca(openedGasto.veiculo_id)}
          open={!!openedGasto}
          onOpenChange={(open) => !open && safeCloseDialog(() => setOpenedGasto(null))}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
});

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
} & Record<string, unknown>) {
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
        ...a,
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
