import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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

  // Unified temporary state for mobile drawer
  const [tempFilters, setTempFilters] = useState({
    categoria: categoriaFilter || "todas",
    veiculo: veiculoFilter || "todos",
  });

  // Sync temp filters only when drawer opens
  useEffect(() => {
    if (isSheetOpen) {
      setTempFilters({
        categoria: categoriaFilter || "todas",
        veiculo: veiculoFilter || "todos",
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
      categoria: "todas",
      veiculo: "todos",
    });
  };

  const hasActiveFilters = 
    hasActiveFiltersProp ?? 
    (categoriaFilter !== "todas" || veiculoFilter !== "todos" || !!searchTerm);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search Bar */}
        <div className="relative group flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className={cn(
              "h-4 w-4 transition-colors",
              searchTerm ? "text-amber-500" : "text-gray-400 group-focus-within:text-[#1a3a5c]"
            )} />
          </div>
          <Input
            type="search"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-100/50 h-12 pl-11 pr-4 rounded-xl shadow-diff-shadow font-medium text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all border-none"
            disabled={disabled}
          />
        </div>

        {/* Buttons Section (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-[#1a3a5c]/10 text-[#1a3a5c] font-black uppercase text-[10px] tracking-widest gap-2 h-12 rounded-xl px-5 shadow-diff-shadow hover:bg-gray-50"
                disabled={disabled}
              >
                <ListFilter className={cn("h-4 w-4", hasActiveFilters && "text-amber-500")} />
                Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[320px] p-6 rounded-2xl shadow-xl border-none ring-1 ring-gray-100" 
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="font-headline font-black text-[#1a3a5c] text-sm uppercase tracking-wider">Filtragem Avançada</h4>
                    {hasActiveFilters && (
                        <button 
                          onClick={onClearFilters} 
                          className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                        >
                          Limpar
                        </button>
                    )}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Categoria</Label>
                    <Select value={categoriaFilter} onValueChange={onCategoriaChange}>
                      <SelectTrigger className="w-full h-11 rounded-lg bg-gray-50 border-gray-100 font-medium">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="todas">Todas Categorias</SelectItem>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Veículo</Label>
                    <Select value={veiculoFilter} onValueChange={onVeiculoChange}>
                      <SelectTrigger className="w-full h-11 rounded-lg bg-gray-50 border-gray-100 font-medium">
                        <SelectValue placeholder="Veículo" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="todos">Todos Veículos</SelectItem>
                        <SelectItem value="unspecified">Não Especificado</SelectItem>
                        {veiculos.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {formatarPlacaExibicao(v.placa)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={onRegistrarGasto}
            disabled={disabled}
            className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-6 shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Gasto
          </Button>
        </div>

        {/* Buttons Section (Mobile) */}
        <div className="md:hidden flex gap-3">
          <Drawer open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 bg-white border border-[#1a3a5c]/10 text-[#1a3a5c] font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 shadow-diff-shadow"
                disabled={disabled}
              >
                <Filter className={cn("h-4 w-4 mr-2", hasActiveFilters && "text-amber-500")} />
                Filtros
              </Button>
            </DrawerTrigger>
            <DrawerContent
                className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl"
            >
                <DrawerHeader className="text-left mb-2 px-8 pt-6">
                <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">Filtrar Gastos</DrawerTitle>
                <DrawerDescription className="text-xs font-medium text-gray-400">
                    Refine sua busca para encontrar gastos específicos.
                </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-8">
                <div className="grid grid-cols-2 gap-5 mt-4">
                    <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Categoria</Label>
                    <Select
                        value={tempFilters.categoria}
                        onValueChange={(val) =>
                        setTempFilters((prev) => ({ ...prev, categoria: val }))
                        }
                    >
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-semibold text-[#1a3a5c]">
                        <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                        <SelectItem value="todas">Todas</SelectItem>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Veículo</Label>
                    <Select
                        value={tempFilters.veiculo}
                        onValueChange={(val) =>
                        setTempFilters((prev) => ({ ...prev, veiculo: val }))
                        }
                    >
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-semibold text-[#1a3a5c]">
                        <SelectValue placeholder="Veículo" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="unspecified">Não Especificado</SelectItem>
                        {veiculos.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                            {formatarPlacaExibicao(v.placa)}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>
                </div>

                <div className="pt-10 flex flex-col gap-3">
                    <Button 
                    className="w-full h-14 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase tracking-widest text-xs shadow-lg" 
                    onClick={handleApplyFilters}
                    >
                    Aplicar Filtros
                    </Button>
                    <Button
                    variant="ghost"
                    className="w-full h-12 rounded-xl text-gray-400 font-bold uppercase tracking-widest text-[10px]"
                    onClick={handleClearMobileFilters}
                    >
                    Limpar Filtros
                    </Button>
                </div>
                </div>
            </DrawerContent>
          </Drawer>

          <Button
            onClick={onRegistrarGasto}
            disabled={disabled}
            className="flex-1 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </div>
      </div>
    </div>
  );
});
