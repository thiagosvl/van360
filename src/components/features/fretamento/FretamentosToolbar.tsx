import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NativeSelect } from "@/components/ui/native-select";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Plus, ListFilter, RotateCcw, Check } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import type { FretamentoTipoFiltro, FretamentoStatusFiltro } from "@/hooks/ui/useFretamentoViewModel";

interface FretamentosToolbarProps {
  totalItens: number;
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
  totalItens,
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
  const [isOpen, setIsOpen] = useState(false);
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

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(tempFilters);
    } else {
      onTipoChange(tempFilters.tipo);
      onStatusChange(tempFilters.status);
      onVeiculoChange(tempFilters.veiculo);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    const limpos = {
      tipo: FilterDefaults.TODOS as FretamentoTipoFiltro,
      status: FilterDefaults.TODOS as FretamentoStatusFiltro,
      veiculo: FilterDefaults.TODOS,
    };
    setTempFilters(limpos);
    if (onClearFilters) {
      onClearFilters();
    } else {
      onTipoChange(limpos.tipo);
      onStatusChange(limpos.status);
      onVeiculoChange(limpos.veiculo);
    }
    setIsOpen(false);
  };

  const hasActiveFilters = hasActiveFiltersProp !== undefined ? hasActiveFiltersProp :
    (tipoFilter !== FilterDefaults.TODOS || statusFilter !== FilterDefaults.TODOS || veiculoFilter !== FilterDefaults.TODOS);

  const filterFormContent = (
    <div className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] block">
          Modalidade
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.tipo : tipoFilter}
          onChange={(e) => {
            const next = e.target.value as FretamentoTipoFiltro;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, tipo: next }));
            } else {
              onTipoChange(next);
            }
          }}
        >
          <option value={FilterDefaults.TODOS}>Todas as viagens</option>
          <option value="fretamento">Fretamentos</option>
          <option value="passeio">Passeios</option>
        </NativeSelect>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] block">
          Status da Viagem
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.status : statusFilter}
          onChange={(e) => {
            const next = e.target.value as FretamentoStatusFiltro;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, status: next }));
            } else {
              onStatusChange(next);
            }
          }}
        >
          <option value={FilterDefaults.TODOS}>Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="concluido">Concluído</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </NativeSelect>
      </div>

      {veiculos.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#0a0a0a] block">
            Veículo
          </label>
          <NativeSelect
            value={isMobile ? tempFilters.veiculo : veiculoFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (isMobile) {
                setTempFilters((prev) => ({ ...prev, veiculo: val }));
              } else {
                onVeiculoChange(val);
              }
            }}
          >
            <option value={FilterDefaults.TODOS}>Todas as vans</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {formatarPlacaExibicao(v.placa)} {v.modelo ? `(${v.modelo})` : ""}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
    </div>
  );

  const filterTriggerButton = (
    <Button
      variant="outline"
      disabled={disabled}
      className={`h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-sm font-medium gap-2 px-3.5 transition-all shadow-none flex-1 sm:flex-initial justify-center cursor-pointer ${
        hasActiveFilters ? "border-[#0a0a0a]" : ""
      }`}
    >
      <ListFilter className="h-4 w-4 text-[#737373]" />
      <span>Filtros</span>
      {hasActiveFilters && (
        <span className="h-2 w-2 rounded-full bg-primary -mr-0.5" />
      )}
    </Button>
  );

  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
      <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em] self-end sm:self-auto text-right">
        {totalItens}{" "}
        {hasActiveFilters
          ? (totalItens === 1 ? "ENCONTRADA" : "ENCONTRADAS")
          : (totalItens === 1 ? "VIAGEM" : "VIAGENS")}
      </span>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {isMobile ? (
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>{filterTriggerButton}</DrawerTrigger>
            <DrawerContent className="h-auto max-h-[90vh] rounded-t-[28px] flex flex-col px-0 bg-white border-t border-[#e5e5e5] shadow-lg pb-[calc(2rem+var(--safe-area-bottom))]">
              <DrawerHeader className="text-left mb-2 px-6 pt-5">
                <DrawerTitle className="font-semibold text-[#0a0a0a] text-lg tracking-tight">
                  Filtrar Viagens
                </DrawerTitle>
                <DrawerDescription className="text-xs font-normal text-[#737373]">
                  Filtre por tipo, status ou veículo.
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-6 space-y-4">
                {filterFormContent}

                <div className="flex items-center gap-2.5 pt-3 border-t border-[#e5e5e5]">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={handleClear}
                      className="flex-1 h-11 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] text-sm font-medium gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Limpar</span>
                    </Button>
                  )}
                  <Button
                    onClick={handleApply}
                    className="flex-1 h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-white text-sm font-medium gap-1.5 border-none shadow-xs cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Aplicar</span>
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{filterTriggerButton}</PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[280px] p-4 rounded-[24px] border border-[#e5e5e5] bg-white shadow-lg space-y-3.5"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between pb-1 border-b border-[#e5e5e5]">
                <span className="text-xs font-semibold text-[#0a0a0a]">
                  Filtros
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleClear}
                    className="text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {filterFormContent}
            </PopoverContent>
          </Popover>
        )}

        <Button
          onClick={onNovoRegistro}
          disabled={disabled}
          className="flex-1 sm:flex-initial h-10 sm:h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium gap-1.5 px-4 border-none shadow-xs transition-all active:scale-[0.98] justify-center cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Nova Viagem</span>
        </Button>
      </div>
    </div>
  );
});
