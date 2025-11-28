import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface GastosToolbarProps {
  categoriaFilter: string;
  onCategoriaChange: (value: string) => void;
  onRegistrarGasto: () => void;
  categorias: string[];
  disabled?: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function GastosToolbar({
  categoriaFilter,
  onCategoriaChange,
  onRegistrarGasto,
  categorias,
  disabled,
  searchTerm,
  onSearchChange,
}: GastosToolbarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  // Temporary state for mobile sheet
  const [tempCategoria, setTempCategoria] = useState(categoriaFilter);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      setTempCategoria(categoriaFilter);
    }
  }, [open, categoriaFilter]);

  const handleApplyFilters = () => {
    onCategoriaChange(tempCategoria);
    setOpen(false);
  };

  const handleClearFilters = () => {
    setTempCategoria("todas");
    onCategoriaChange("todas");
    setOpen(false);
  };

  const activeFiltersCount = categoriaFilter !== "todas" ? 1 : 0;

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select value={tempCategoria} onValueChange={setTempCategoria}>
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
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 h-5 px-1.5 min-w-[20px] justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
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
                  onClick={handleClearFilters}
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
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-50 h-5 px-1.5 min-w-[20px] justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-4" 
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none">Filtros</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setTempCategoria("todas");
                      onCategoriaChange("todas");
                    }}
                  >
                    Limpar
                    <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={categoriaFilter}
                  onValueChange={(val) => {
                    setTempCategoria(val);
                    onCategoriaChange(val);
                  }}
                >
                  <SelectTrigger className="h-9 bg-gray-50 border-gray-200">
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
            </div>
          </PopoverContent>
        </Popover>

        {categoriaFilter !== "todas" && (
          <div className="flex gap-2">
            <Badge
              variant="secondary"
              className="h-8 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 gap-1 cursor-pointer"
              onClick={() => onCategoriaChange("todas")}
            >
              {categoriaFilter}
              <X className="h-3 w-3" />
            </Badge>
          </div>
        )}

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
