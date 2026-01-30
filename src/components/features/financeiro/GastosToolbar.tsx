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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatarPlacaExibicao } from "@/utils/domain";
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

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
}

export function GastosToolbar({
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
}: GastosToolbarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  // Unified temporary state for mobile sheet
  const [tempFilters, setTempFilters] = useState({
    categoria: categoriaFilter,
    veiculo: veiculoFilter,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync temp filters only when sheet opens to avoid race conditions
  useEffect(() => {
    if (open) {
      setTempFilters({
        categoria: categoriaFilter,
        veiculo: veiculoFilter,
      });
    }
  }, [open, categoriaFilter, veiculoFilter]);

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        categoria: tempFilters.categoria,
        veiculo: tempFilters.veiculo,
      });
    } else {
      // Fallback
      onCategoriaChange(tempFilters.categoria);
      onVeiculoChange(tempFilters.veiculo);
    }
    setOpen(false);
  };

  const handleClearMobileFilters = () => {
    setTempFilters({
      categoria: "todas",
      veiculo: "todos",
    });
  };

  const handleClearDesktopFilters = () => {
    onCategoriaChange("todas");
    onVeiculoChange("todos");
  };

  const activeFiltersCount = (categoriaFilter !== "todas" ? 1 : 0) + (veiculoFilter !== "todos" ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select 
          value={tempFilters.categoria} 
          onValueChange={(val) => setTempFilters(prev => ({ ...prev, categoria: val }))}
        >
          <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Veículo</Label>
        <Select 
          value={tempFilters.veiculo} 
          onValueChange={(val) => setTempFilters(prev => ({ ...prev, veiculo: val }))}
        >
          <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
            <SelectValue placeholder="Todos os Veículos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Veículos</SelectItem>
            {veiculos.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {formatarPlacaExibicao(v.placa)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-sm bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl w-full"
            disabled={disabled}
          />
        </div>

        <div className="flex gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 bg-white border-gray-200 h-11 rounded-xl"
                disabled={disabled}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 flex h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="rounded-t-[28px] px-6 pb-8 bg-gray-50"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <SheetHeader className="mb-6 text-left">
                <SheetTitle>Filtrar Gastos</SheetTitle>
                <SheetDescription>
                  Selecione as opções abaixo para filtrar a lista.
                </SheetDescription>
              </SheetHeader>

              <FilterContent />

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={handleClearMobileFilters}
                >
                  Limpar
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                  onClick={handleApplyFilters}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            onClick={onRegistrarGasto}
            disabled={disabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      {/* Search Bar (Left) */}
      <div className="relative flex-1 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl"
          disabled={disabled}
        />
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center gap-3">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDesktopFilters}
            className="text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white border-gray-200 gap-2 h-11 rounded-xl"
              disabled={disabled}
            >
              <ListFilter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-4" 
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Categoria
                </Label>
                <Select
                  value={categoriaFilter}
                  onValueChange={(val) => {
                    onCategoriaChange(val);
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Todas" />
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

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Veículo
                </Label>
                <Select
                  value={veiculoFilter}
                  onValueChange={(val) => {
                    onVeiculoChange(val);
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Todos os Veículos" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="todos">Todos os Veículos</SelectItem>
                    {veiculos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {formatarPlacaExibicao(v.placa)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          onClick={onRegistrarGasto}
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Gasto
        </Button>
      </div>
    </div>
  );
}
