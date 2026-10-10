import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
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
      <div className={cn(
        "bg-white p-3.5 pr-8 rounded-[20px] border border-[#e5e5e5] shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition-all",
        !veiculo.ativo && "opacity-60 bg-[#fafafa]/80"
      )}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-10 h-10 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0",
            !veiculo.ativo && "text-[#737373] opacity-60"
          )}>
            <Car className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-semibold text-sm truncate leading-tight uppercase tracking-tight",
              veiculo.ativo ? "text-[#0a0a0a]" : "text-[#737373]"
            )}>
              {formatarPlacaExibicao(veiculo.placa)}
            </p>
            {veiculo.marca && (
              <p className="text-xs text-[#737373] font-normal truncate mt-0.5">
                {veiculo.marca} {veiculo.modelo}
              </p>
            )}
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
        mobileContainerClassName="space-y-2.5"
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
        <div className="rounded-[24px] overflow-hidden bg-white border border-[#e5e5e5] shadow-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Placa / Veículo
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Alunos Ativos
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {veiculos.map((veiculo) => (
                <tr
                  key={veiculo.id}
                  onClick={() => setOpenedVeiculo(veiculo)}
                  className={cn(
                    "group transition-colors cursor-pointer",
                    veiculo.ativo 
                      ? "hover:bg-[#fafafa]/80" 
                      : "opacity-60 hover:opacity-90 bg-[#fafafa]/40"
                  )}
                >
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0">
                        <Car className="w-4 h-4 text-[#0a0a0a]" />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-[#0a0a0a] text-sm uppercase tracking-tight">
                          {formatarPlacaExibicao(veiculo.placa)}
                        </p>
                        <p className="text-xs text-[#737373] font-normal">
                          {veiculo.marca} {veiculo.modelo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-[#737373]" />
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-[#0a0a0a]">
                          {veiculo.passageiros_ativos_count ?? 0}
                        </span>
                        <span className="text-xs font-normal text-[#737373]">
                          {(veiculo.passageiros_ativos_count ?? 0) === 1 ? "aluno" : "alunos"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={veiculo.ativo} />
                  </td>
                  <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
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
          onOpenChange={(open) => !open && safeCloseDialog(() => setOpenedVeiculo(null))}
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
  onDelete,
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
    onDelete,
  });

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      actions={actions.map((a) => ({
        ...a,
        onClick: () => {
          onOpenChange(false);
          a.onClick();
        },
      }))}
    >
      <VeiculoSummary veiculo={veiculo} />
    </ActionSheet>
  );
}
