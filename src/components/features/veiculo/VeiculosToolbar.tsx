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
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VeiculosToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onApplyFilters: (filters: { status?: string }) => void;
  onRegister: () => void;
  isRegisterDisabled?: boolean;
}

export const VeiculosToolbar = memo(function VeiculosToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
  onApplyFilters,
  onRegister,
  isRegisterDisabled,
}: VeiculosToolbarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || "todos",
  });

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
            placeholder="Buscar por placa, marca ou modelo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-100/50 h-12 pl-11 pr-4 rounded-xl shadow-diff-shadow font-medium text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all"
          />
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-[#1a3a5c]/10 text-[#1a3a5c] font-black uppercase text-[10px] tracking-widest gap-2 h-12 rounded-xl px-5 shadow-diff-shadow hover:bg-gray-50"
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
                    <button onClick={onClearFilters} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Limpar</button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</Label>
                    <Select value={selectedStatus} onValueChange={onStatusChange}>
                      <SelectTrigger className="w-full h-11 rounded-lg bg-gray-50 border-gray-100 font-medium">
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
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={onRegister}
            disabled={isRegisterDisabled}
            className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-6 shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
        </div>

        {/* Mobile Buttons */}
        <div className="md:hidden flex gap-3">
          <Drawer open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 bg-white border border-[#1a3a5c]/10 text-[#1a3a5c] font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 shadow-diff-shadow"
              >
                <Filter className={cn("h-4 w-4 mr-2", hasActiveFilters && "text-amber-500")} />
                Filtros
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl pb-8">
              <DrawerHeader className="text-left mb-2 px-8 pt-6">
                <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">Filtrar Veículos</DrawerTitle>
                <DrawerDescription className="text-xs font-medium text-gray-400">
                  Refine sua busca para encontrar veículos específicos.
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-8">
                <div className="grid grid-cols-1 gap-5 mt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</Label>
                    <Select
                      value={tempFilters.status}
                      onValueChange={(val) =>
                        setTempFilters((prev) => ({ ...prev, status: val }))
                      }
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-semibold text-[#1a3a5c]">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Desativado</SelectItem>
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
            onClick={onRegister}
            disabled={isRegisterDisabled}
            className="flex-1 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>
    </div>
  );
});
