import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
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
import { cn } from "@/lib/utils";
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface EscolasToolbarProps {
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

export function EscolasToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
  onApplyFilters,
  onRegister,
  isRegisterDisabled = false,
}: EscolasToolbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || "todos",
  });

  useEffect(() => {
    if (isDrawerOpen) {
      setTempFilters({
        status: selectedStatus || "todos",
      });
    }
  }, [isDrawerOpen, selectedStatus]);

  const handleApplyFilters = () => {
    onApplyFilters({
      status: tempFilters.status,
    });
    setIsDrawerOpen(false);
  };

  const handleClearMobileFilters = () => {
    setTempFilters({
      status: "todos",
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-1">
      <div className="relative flex-1 max-w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
        <Input
          placeholder="Buscar escolas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 pr-4 py-6 bg-white border-none shadow-diff-shadow focus-visible:ring-[#1a3a5c]/10 rounded-2xl text-sm font-medium text-slate-600 placeholder:text-slate-400/80 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-3.5 w-3.5 text-slate-400" />
          </button>
        )}
      </div>

      <div className="hidden md:flex items-center gap-3">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors h-11 px-4"
          >
            Limpar Filtros
          </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-11 px-5 rounded-2xl bg-white border-none shadow-diff-shadow hover:bg-slate-50 transition-all font-headline font-bold text-[11px] uppercase tracking-widest text-[#1a3a5c] gap-2.5",
                hasActiveFilters && "text-blue-600"
              )}
            >
              <ListFilter className={cn("h-4 w-4", hasActiveFilters ? "text-blue-600" : "text-slate-400")} />
              Filtros
              {hasActiveFilters && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-5 rounded-[24px] border-none shadow-2xl mr-4 mt-2" align="end">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <span className="font-headline font-bold text-xs uppercase tracking-widest text-[#1a3a5c]">Filtros</span>
                <ListFilter className="h-3.5 w-3.5 text-slate-300" />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</Label>
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-full h-11 rounded-2xl bg-slate-50 border-none shadow-none focus:ring-1 focus:ring-slate-200 transition-all font-medium text-slate-600">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="todos" className="rounded-xl focus:bg-slate-100">Todos Status</SelectItem>
                    <SelectItem value="true" className="rounded-xl focus:bg-slate-100 text-emerald-600 font-medium">Somente Ativas</SelectItem>
                    <SelectItem value="false" className="rounded-xl focus:bg-slate-100 text-slate-400 font-medium">Somente Desativadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          onClick={onRegister}
          disabled={isRegisterDisabled}
          className="h-11 px-6 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-lg shadow-[#1a3a5c]/20 transition-all font-headline font-bold text-[11px] uppercase tracking-widest gap-2.5"
        >
          <Plus className="h-4 w-4" />
          Nova Escola
        </Button>
      </div>

      <div className="md:hidden flex gap-3">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 h-12 rounded-2xl bg-white border-none shadow-diff-shadow hover:bg-slate-50 font-headline font-bold text-[11px] uppercase tracking-widest text-[#1a3a5c] gap-2.5",
                hasActiveFilters && "text-blue-600"
              )}
            >
              <Filter className={cn("h-4 w-4", hasActiveFilters ? "text-blue-600" : "text-slate-400")} />
              Filtros
              {hasActiveFilters && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl pb-8">
            <DrawerHeader className="text-left mb-2 px-8 pt-6">
              <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">Filtrar Escolas</DrawerTitle>
              <DrawerDescription className="text-xs font-medium text-gray-400">
                Refine sua busca para encontrar escolas específicas.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-8">
              <div className="grid grid-cols-1 gap-5 mt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status da Escola</Label>
                  <Select
                    value={tempFilters.status}
                    onValueChange={(val) => setTempFilters((prev) => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-semibold text-[#1a3a5c]">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="true">Somente Ativas</SelectItem>
                      <SelectItem value="false">Somente Desativadas</SelectItem>
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
          className="flex-1 h-12 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-lg shadow-[#1a3a5c]/20 font-headline font-bold text-[11px] uppercase tracking-widest gap-2.5"
        >
          <Plus className="h-4 w-4" />
          Nova
        </Button>
      </div>
    </div>
  );
}
