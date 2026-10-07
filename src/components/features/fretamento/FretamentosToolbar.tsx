import { Button } from "@/components/ui/button";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Plus, Compass, CheckCircle2, Car, Layers } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { DataTableToolbar } from "../common/DataTableToolbar";
import { DataTableFilterSelect } from "../common/DataTableFilterSelect";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import type { FretamentoTipoFiltro, FretamentoStatusFiltro } from "@/hooks/ui/useFretamentoViewModel";

interface FretamentosToolbarProps {
  tipoFilter: FretamentoTipoFiltro;
  onTipoChange: (value: FretamentoTipoFiltro) => void;
  statusFilter: FretamentoStatusFiltro;
  onStatusChange: (value: FretamentoStatusFiltro) => void;
  veiculoFilter: string;
  onVeiculoChange: (value: string) => void;
  onNovoRegistro: () => void;
  veiculos: Array<{ id: string; placa: string; modelo?: string | null }>;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onApplyFilters?: (filters: { tipo: FretamentoTipoFiltro; status: FretamentoStatusFiltro; veiculo: string }) => void;
  disabled?: boolean;
}

export const FretamentosToolbar = memo(function FretamentosToolbar({
  tipoFilter,
  onTipoChange,
  statusFilter,
  onStatusChange,
  veiculoFilter,
  onVeiculoChange,
  onNovoRegistro,
  veiculos,
  hasActiveFilters: hasActiveFiltersProp,
  onClearFilters,
  onApplyFilters,
  disabled,
}: FretamentosToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<{
    tipo: FretamentoTipoFiltro;
    status: FretamentoStatusFiltro;
    veiculo: string;
  }>({
    tipo: tipoFilter || FilterDefaults.TODOS,
    status: statusFilter || FilterDefaults.TODOS,
    veiculo: veiculoFilter || FilterDefaults.TODOS,
  });

  useEffect(() => {
    setTempFilters({
      tipo: tipoFilter || FilterDefaults.TODOS,
      status: statusFilter || FilterDefaults.TODOS,
      veiculo: veiculoFilter || FilterDefaults.TODOS,
    });
  }, [tipoFilter, statusFilter, veiculoFilter]);

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(tempFilters);
    } else {
      onTipoChange(tempFilters.tipo);
      onStatusChange(tempFilters.status);
      onVeiculoChange(tempFilters.veiculo);
    }
    setIsSheetOpen(false);
  };

  const handleClearMobileFilters = () => {
    setTempFilters({
      tipo: FilterDefaults.TODOS,
      status: FilterDefaults.TODOS,
      veiculo: FilterDefaults.TODOS,
    });
  };

  const hasActiveFilters = hasActiveFiltersProp !== undefined ? hasActiveFiltersProp :
    (tipoFilter !== FilterDefaults.TODOS || statusFilter !== FilterDefaults.TODOS || veiculoFilter !== FilterDefaults.TODOS);

  const filterChildren = (
    <>
      <DataTableFilterSelect
        label="Modalidade"
        placeholder="Todos os Tipos"
        value={isMobile ? tempFilters.tipo : tipoFilter}
        onValueChange={(val) => {
          const next = val as FretamentoTipoFiltro;
          if (isMobile) {
            setTempFilters((prev) => ({ ...prev, tipo: next }));
          } else {
            onTipoChange(next);
          }
        }}
        icon={<Compass className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todos os Tipos", value: FilterDefaults.TODOS },
          { label: "Fretamentos", value: "fretamento" },
          { label: "Passeios", value: "passeio" },
        ]}
      />

      <DataTableFilterSelect
        label="Status"
        placeholder="Todos os Status"
        value={isMobile ? tempFilters.status : statusFilter}
        onValueChange={(val) => {
          const next = val as FretamentoStatusFiltro;
          if (isMobile) {
            setTempFilters((prev) => ({ ...prev, status: next }));
          } else {
            onStatusChange(next);
          }
        }}
        icon={<CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todos os Status", value: FilterDefaults.TODOS },
          { label: "Confirmado", value: "confirmado" },
          { label: "Concluído", value: "concluido" },
          { label: "Pendente", value: "pendente" },
          { label: "Cancelado", value: "cancelado" },
        ]}
      />

      {veiculos.length > 0 && (
        <DataTableFilterSelect
          label="Veículo"
          placeholder="Todas as Vans"
          value={isMobile ? tempFilters.veiculo : veiculoFilter}
          onValueChange={(val) => {
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, veiculo: val }));
            } else {
              onVeiculoChange(val);
            }
          }}
          icon={<Car className="w-3.5 h-3.5 shrink-0" />}
          options={[
            { label: "Todas as Vans", value: FilterDefaults.TODOS },
            ...veiculos.map((v) => ({
              label: formatarPlacaExibicao(v.placa),
              value: v.id,
            })),
          ]}
        />
      )}
    </>
  );

  return (
    <DataTableToolbar
      disabled={disabled}
      filterConfig={{
        title: "Filtrar Fretamentos e Passeios",
        description: "Refine sua busca para encontrar fretamentos ou passeios específicos.",
        hasActiveFilters,
        onClear: onClearFilters || (() => {}),
        onApply: handleApplyFilters,
        onClearTemp: handleClearMobileFilters,
        isOpen: isSheetOpen,
        onOpenChange: setIsSheetOpen,
      }}
      filterChildren={filterChildren}
      actions={
        <Button
          onClick={onNovoRegistro}
          disabled={disabled}
          className="flex-1 md:flex-initial bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-sm h-12 md:h-14 rounded-2xl px-4 md:px-6 shadow-md transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-1.5 md:mr-2" />
          <span>Novo Registro</span>
        </Button>
      }
    />
  );
});
