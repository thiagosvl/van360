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
import { Plus } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { DataTableToolbar } from "../common/DataTableToolbar";

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
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Categoria</Label>
        <Select 
          value={isSheetOpen ? tempFilters.categoria : categoriaFilter} 
          onValueChange={(val) => {
            if (isSheetOpen) {
              setTempFilters(prev => ({ ...prev, categoria: val }));
            } else {
              onCategoriaChange(val);
            }
          }}
        >
          <SelectTrigger className="w-full h-11 md:h-14 rounded-lg md:rounded-2xl bg-gray-50 border-gray-100 font-medium md:font-semibold text-[#1a3a5c]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value={FilterDefaults.TODAS}>Todas Categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Veículo</Label>
        <Select 
          value={isSheetOpen ? tempFilters.veiculo : veiculoFilter} 
          onValueChange={(val) => {
            if (isSheetOpen) {
              setTempFilters(prev => ({ ...prev, veiculo: val }));
            } else {
              onVeiculoChange(val);
            }
          }}
        >
          <SelectTrigger className="w-full h-11 md:h-14 rounded-lg md:rounded-2xl bg-gray-50 border-gray-100 font-medium md:font-semibold text-[#1a3a5c]">
            <SelectValue placeholder="Veículo" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value={FilterDefaults.TODOS}>Todos Veículos</SelectItem>
            <SelectItem value="unspecified">Não Especificado</SelectItem>
            {veiculos.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {formatarPlacaExibicao(v.placa)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
