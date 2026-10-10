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
import { formatarPlacaExibicao, getCategoriaMetadata } from "@/utils/domain";
import { Plus, ListFilter, RotateCcw, Check, Tag } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { useGastoCategorias, useLayout } from "@/hooks";

interface GastosToolbarProps {
  categoriaFilter: string;
  onCategoriaChange: (value: string) => void;
  veiculoFilter: string;
  onVeiculoChange: (value: string) => void;
  onRegistrarGasto: () => void;
  onApplyFilters?: (filters: { categoria: string; veiculo: string }) => void;
  categorias: string[];
  veiculos: { id: string; placa: string }[];
  disabled?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export const GastosToolbar = memo(function GastosToolbar({
  categoriaFilter,
  onCategoriaChange,
  veiculoFilter,
  onVeiculoChange,
  onRegistrarGasto,
  onApplyFilters,
  categorias,
  veiculos,
  disabled,
  hasActiveFilters: hasActiveFiltersProp,
  onClearFilters,
}: GastosToolbarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<{
    categoria: string;
    veiculo: string;
  }>({
    categoria: categoriaFilter || FilterDefaults.TODAS,
    veiculo: veiculoFilter || FilterDefaults.TODOS,
  });

  const { data: categoriasData } = useGastoCategorias();
  const { openGerenciarCategoriasDialog } = useLayout();

  useEffect(() => {
    setTempFilters({
      categoria: categoriaFilter || FilterDefaults.TODAS,
      veiculo: veiculoFilter || FilterDefaults.TODOS,
    });
  }, [categoriaFilter, veiculoFilter]);

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(tempFilters);
    } else {
      onCategoriaChange(tempFilters.categoria);
      onVeiculoChange(tempFilters.veiculo);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    const limpos = {
      categoria: FilterDefaults.TODAS,
      veiculo: FilterDefaults.TODOS,
    };
    setTempFilters(limpos);
    if (onClearFilters) {
      onClearFilters();
    } else {
      onCategoriaChange(limpos.categoria);
      onVeiculoChange(limpos.veiculo);
    }
    setIsOpen(false);
  };

  const hasActiveFilters = hasActiveFiltersProp !== undefined
    ? hasActiveFiltersProp
    : (categoriaFilter !== FilterDefaults.TODAS || veiculoFilter !== FilterDefaults.TODOS);

  const filterFormContent = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] block">
          Categoria
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.categoria : categoriaFilter}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, categoria: val }));
            } else {
              onCategoriaChange(val);
            }
          }}
        >
          <option value={FilterDefaults.TODAS}>Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {getCategoriaMetadata(cat, categoriasData).label}
            </option>
          ))}
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
            <option value={FilterDefaults.TODOS}>Todos os veículos</option>
            <option value="unspecified">Não Especificado</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {formatarPlacaExibicao(v.placa)}
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
    <div className="flex items-center justify-end gap-2 w-full">
        {isMobile ? (
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>{filterTriggerButton}</DrawerTrigger>
            <DrawerContent className="h-auto max-h-[90vh] rounded-t-[28px] flex flex-col px-0 bg-white border-t border-[#e5e5e5] shadow-lg pb-[calc(2rem+var(--safe-area-bottom))]">
              <DrawerHeader className="text-left mb-2 px-6 pt-5">
                <DrawerTitle className="font-semibold text-[#0a0a0a] text-lg tracking-tight">
                  Filtrar Gastos
                </DrawerTitle>
                <DrawerDescription className="text-xs font-normal text-[#737373]">
                  Refine sua busca por categoria ou veículo.
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
                    className="flex-1 h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium gap-1.5 border-none shadow-xs cursor-pointer"
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
          type="button"
          variant="outline"
          onClick={() => openGerenciarCategoriasDialog()}
          disabled={disabled}
          className="w-10 sm:w-auto h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-sm font-medium gap-1.5 px-0 sm:px-3.5 transition-all shadow-none flex items-center justify-center shrink-0 cursor-pointer"
          title="Gerenciar Categorias"
        >
          <Tag className="h-4 w-4 text-[#737373]" />
          <span className="hidden sm:inline">Categorias</span>
        </Button>

        <Button
          onClick={onRegistrarGasto}
          disabled={disabled}
          className="flex-1 sm:flex-initial h-10 sm:h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium gap-1.5 px-4 border-none shadow-xs transition-all active:scale-[0.98] justify-center cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Novo Gasto</span>
        </Button>
    </div>
  );
});
