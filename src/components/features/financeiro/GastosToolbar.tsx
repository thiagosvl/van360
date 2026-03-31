import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Plus, Layers, Car } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { DataTableToolbar } from "../common/DataTableToolbar";
import { DataTableFilterSelect } from "../common/DataTableFilterSelect";

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
  searchTerm: string;
  onSearchChange: (value: string) => void;
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
  searchTerm,
  onSearchChange,
  hasActiveFilters: hasActiveFiltersProp,
  onClearFilters,
}: GastosToolbarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    categoria: categoriaFilter || FilterDefaults.TODAS,
    veiculo: veiculoFilter || FilterDefaults.TODOS,
  });

  useEffect(() => {
    if (isSheetOpen) {
      setTempFilters({
        categoria: categoriaFilter || FilterDefaults.TODAS,
        veiculo: veiculoFilter || FilterDefaults.TODOS,
      });
    }
  }, [isSheetOpen, categoriaFilter, veiculoFilter]);

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        categoria: tempFilters.categoria,
        veiculo: tempFilters.veiculo,
      });
    } else {
      onCategoriaChange(tempFilters.categoria);
      onVeiculoChange(tempFilters.veiculo);
    }
    setIsSheetOpen(false);
  };

  const handleClearMobileFilters = () => {
    setTempFilters({
      categoria: FilterDefaults.TODAS,
      veiculo: FilterDefaults.TODOS,
    });
  };

  const hasActiveFilters = 
    hasActiveFiltersProp ?? 
    (categoriaFilter !== FilterDefaults.TODAS || veiculoFilter !== FilterDefaults.TODOS || !!searchTerm);

  const filterChildren = (
    <>
      <DataTableFilterSelect
        label="Categoria"
        placeholder="Todas"
        value={isSheetOpen ? tempFilters.categoria : categoriaFilter}
        onValueChange={(val) => {
          if (isSheetOpen) {
            setTempFilters((prev) => ({ ...prev, categoria: val }));
          } else {
            onCategoriaChange(val);
          }
        }}
        icon={<Layers className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todas Categorias", value: FilterDefaults.TODAS },
          ...categorias.map((cat) => ({ label: cat, value: cat })),
        ]}
      />

      <DataTableFilterSelect
        label="Veículo"
        placeholder="Veículo"
        value={isSheetOpen ? tempFilters.veiculo : veiculoFilter}
        onValueChange={(val) => {
          if (isSheetOpen) {
            setTempFilters((prev) => ({ ...prev, veiculo: val }));
          } else {
            onVeiculoChange(val);
          }
        }}
        icon={<Car className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todos Veículos", value: FilterDefaults.TODOS },
          { label: "Não Especificado", value: "unspecified" },
          ...veiculos.map((v) => ({ label: formatarPlacaExibicao(v.placa), value: v.id })),
        ]}
      />
    </>
  );

  return (
    <DataTableToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por descrição..."
      disabled={disabled}
      filterConfig={{
        title: "Filtrar Gastos",
        description: "Refine sua busca para encontrar gastos específicos.",
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
          onClick={onRegistrarGasto}
          disabled={disabled}
          className="flex-1 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 md:px-6 shadow-md transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Registrar Gasto</span>
          <span className="md:hidden">Registrar</span>
        </Button>
      }
    />
  );
});
