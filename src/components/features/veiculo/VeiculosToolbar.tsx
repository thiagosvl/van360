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
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface VeiculosToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onApplyFilters: (filters: { status?: string }) => void;
  onRegister: () => void;
}

export function VeiculosToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
  onApplyFilters,
  onRegister,
}: VeiculosToolbarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || "todos",
  });

  // Sync temp filters only when sheet opens
  useEffect(() => {
    if (isSheetOpen) {
      setTempFilters({
        status: selectedStatus || "todos",
      });
    }
  }, [isSheetOpen, selectedStatus]);

  const handleApplyFilters = () => {
    onApplyFilters({
      status: tempFilters.status,
    });
    setIsSheetOpen(false);
  };

  const handleClearMobileFilters = () => {
    setTempFilters({
      status: "todos",
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por placa, marca ou modelo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl"
        />
      </div>

      {/* Desktop Filters (Popover) & Register */}
      <div className="hidden md:flex items-center gap-3">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}

        <Popover modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-white border-gray-200 gap-2 h-11 rounded-xl"
            >
              <ListFilter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[280px] p-4" 
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          onClick={onRegister}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Veículo
        </Button>
      </div>

      {/* Mobile Filters Trigger (Sheet) & Register */}
      <div className="md:hidden flex gap-3">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 bg-white border-gray-200 h-11 rounded-xl"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1.5 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0 bg-gray-50"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SheetHeader className="text-left mb-4 px-6">
              <SheetTitle>Filtrar Veículos</SheetTitle>
              <SheetDescription>
                Refine a lista de veículos pelas opções abaixo.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={tempFilters.status}
                    onValueChange={(val) =>
                      setTempFilters((prev) => ({ ...prev, status: val }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Desativado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 pb-6 flex gap-3">
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
            </div>
          </SheetContent>
        </Sheet>

        <Button
          onClick={onRegister}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar
        </Button>
      </div>
    </div>
  );
}
