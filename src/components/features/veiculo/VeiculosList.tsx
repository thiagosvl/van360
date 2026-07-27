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
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
          veiculo.ativo ? "bg-[#1a3a5c]" : "bg-slate-400"
        )}>
          <Car className="h-5 w-5 text-white" />
        </div>

        <div className="flex-grow min-w-0 pr-6">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight uppercase tracking-tight">
            {formatarPlacaExibicao(veiculo.placa)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {veiculo.marca} {veiculo.modelo}
            </p>
          </div>
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
                  Placa
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Qtd. Passageiros
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
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-white p-[2px] shadow-sm shrink-0 flex items-center justify-center">
                        <div className="rounded-full border border-[#132a42] flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-slate-200 border-[2px] border-white flex items-center justify-center">
                            <Car className="w-4 h-4 text-slate-400 fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-headline font-bold text-[#1a3a5c] text-sm uppercase tracking-tight">
                          {formatarPlacaExibicao(veiculo.placa)}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wider">
                          {veiculo.marca} {veiculo.modelo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-slate-400" />
                      <div className="flex items-baseline gap-1">
                        <span className="text-[13px] font-semibold text-slate-700">
                          {veiculo.passageiros_ativos_count ?? 0}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          passageiros
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <StatusBadge
                      status={veiculo.ativo}
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
