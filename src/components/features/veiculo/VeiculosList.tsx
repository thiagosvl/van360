import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useVeiculoActions } from "@/hooks/ui/useVeiculoActions";
import { cn } from "@/lib/utils";
import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { Car, Users2 } from "lucide-react";
import { memo, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { VeiculoActionsMenu } from "./VeiculoActionsMenu";
import { VeiculoSummary } from "./VeiculoSummary";

interface VeiculosListProps {
  veiculos: (Veiculo & { passageiros_ativos_count?: number })[];
  navigate: NavigateFunction;
  onEdit: (veiculo: Veiculo) => void;
  onToggleAtivo: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}

const VeiculoMobileCard = memo(function VeiculoMobileCard({
  veiculo,
  index,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: { veiculo: Veiculo & { passageiros_ativos_count?: number }; index: number } & VeiculosListProps) {
  const actions = useVeiculoActions({
    veiculo,
    navigate,
    onEdit,
    onToggleAtivo,
    onDelete,
  });

  const renderHeader = () => <VeiculoSummary veiculo={veiculo} />;

  return (
    <MobileActionItem
      key={veiculo.id}
      actions={actions as any}
      showHint={index === 0}
      className="bg-transparent"
      renderHeader={renderHeader}
    >
      <div
        className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
      >
        <div className="flex-shrink-0 w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
          <Car className="h-5 w-5 text-[#1a3a5c]" />
        </div>

        <div className="flex-grow min-w-0 pr-10">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight uppercase tracking-tight">
            {formatarPlacaExibicao(veiculo.placa)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {veiculo.marca} {veiculo.modelo}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1">
            <Users2 className="w-3 h-3 text-[#1a3a5c]/40" />
            <span className="text-[12px] font-black text-[#1a3a5c] leading-none">
              {veiculo.passageiros_ativos_count ?? 0}
            </span>
          </div>
          <StatusBadge
            status={veiculo.ativo}
            className={cn(
              "font-bold text-[8px] h-3.5 px-1 rounded-sm border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none",
              veiculo.ativo ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
            )}
          />
        </div>
      </div>
    </MobileActionItem>
  );
});

export function VeiculosList({
  veiculos,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: VeiculosListProps) {
  const [openedVeiculo, setOpenedVeiculo] = useState<(Veiculo & { passageiros_ativos_count?: number }) | null>(null);

  return (
    <>
      <ResponsiveDataList
        data={veiculos}
        mobileContainerClassName="space-y-3"
        mobileItemRenderer={(veiculo, index) => (
          <VeiculoMobileCard
            key={veiculo.id}
            veiculo={veiculo}
            index={index}
            navigate={navigate}
            onEdit={onEdit}
            onToggleAtivo={onToggleAtivo}
            onDelete={onDelete}
            veiculos={veiculos}
          />
        )}
      >
        <div className="rounded-[28px] overflow-hidden bg-white shadow-diff-shadow border-none">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100/80">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Veículo
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Ocupação
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {veiculos.map((veiculo) => (
                <tr
                  key={veiculo.id}
                  onClick={() => setOpenedVeiculo(veiculo)}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5 align-middle">
                    <div className="flex flex-col">
                      <p className="font-headline font-bold text-[#1a3a5c] text-sm uppercase tracking-tight">
                        {formatarPlacaExibicao(veiculo.placa)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium tracking-wider">
                        {veiculo.marca} {veiculo.modelo}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50/50 border border-slate-100 w-fit group-hover:bg-white group-hover:border-slate-200 transition-all">
                      <Users2 className="w-4 h-4 text-[#1a3a5c]/40" />
                      <span className="text-sm font-semibold text-slate-700">
                        {veiculo.passageiros_ativos_count ?? 0}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Ativos
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <StatusBadge
                      status={veiculo.ativo}
                      className={cn(
                        "font-bold text-[8px] h-3.5 px-1.5 rounded-sm border-none shadow-none uppercase tracking-widest inline-flex items-center",
                        veiculo.ativo ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                      )}
                    />
                  </td>
                  <td className="px-8 py-5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <VeiculoActionsMenu
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

      {openedVeiculo && (
        <ActionSheetWrapper
          veiculo={openedVeiculo}
          open={!!openedVeiculo}
          onOpenChange={(open) => !open && setOpenedVeiculo(null)}
          navigate={navigate}
          onEdit={onEdit}
          onToggleAtivo={onToggleAtivo}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

function ActionSheetWrapper({
  veiculo,
  open,
  onOpenChange,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete
}: {
  veiculo: Veiculo & { passageiros_ativos_count?: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigate: NavigateFunction;
  onEdit: (veiculo: Veiculo) => void;
  onToggleAtivo: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}) {
  const actions = useVeiculoActions({
    veiculo,
    navigate,
    onEdit,
    onToggleAtivo,
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
      <VeiculoSummary veiculo={veiculo} />
    </ActionSheet>
  );
}
