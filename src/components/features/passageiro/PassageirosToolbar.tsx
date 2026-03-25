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
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { periodos } from "@/utils/formatters";
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PassageirosToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedEscola: string;
  onEscolaChange: (value: string) => void;
  selectedVeiculo: string;
  onVeiculoChange: (value: string) => void;
  selectedPeriodo: string;
  onPeriodoChange: (value: string) => void;
  escolas: Escola[];
  veiculos: Veiculo[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onApplyFilters: (filters: {
    status?: string;
    escola?: string;
    veiculo?: string;
    periodo?: string;
  }) => void;
  onRegister: () => void;
  isRegisterDisabled?: boolean;
  showAdvancedFilters?: boolean;
  searchPlaceholder?: string;
}

export const PassageirosToolbar = memo(function PassageirosToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedEscola,
  onEscolaChange,
  selectedVeiculo,
  onVeiculoChange,
  selectedPeriodo,
  onPeriodoChange,
  escolas,
  veiculos,
  onClearFilters,
  hasActiveFilters,
  onApplyFilters,
  onRegister,
  isRegisterDisabled,
  showAdvancedFilters = true,
  searchPlaceholder = "Buscar por nome ou responsável...",
}: PassageirosToolbarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || "todos",
    escola: selectedEscola || "todas",
    veiculo: selectedVeiculo || "todos",
    periodo: selectedPeriodo || "todos",
  });

  useEffect(() => {
    if (isSheetOpen) {
      setTempFilters({
        status: selectedStatus || "todos",
        escola: selectedEscola || "todas",
        veiculo: selectedVeiculo || "todos",
        periodo: selectedPeriodo || "todos",
      });
    }
  }, [
    isSheetOpen,
    selectedStatus,
    selectedEscola,
    selectedVeiculo,
    selectedPeriodo,
  ]);

  const handleApplyFilters = () => {
    onApplyFilters({
      status: tempFilters.status,
      escola: tempFilters.escola,
      veiculo: tempFilters.veiculo,
      periodo: tempFilters.periodo,
    });
    setIsSheetOpen(false);
  };

  const handleClearMobileFilters = () => {
    setTempFilters({
      status: "todos",
      escola: "todas",
      veiculo: "todos",
      periodo: "todos",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search Bar */}
        <div className="relative group flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#1a3a5c] transition-colors" />
          </div>
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-100/50 h-12 pl-11 pr-4 rounded-xl shadow-diff-shadow font-medium text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all"
          />
        </div>

        {/* Buttons Section (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {showAdvancedFilters && (
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "bg-white border-[#1a3a5c]/10 text-[#1a3a5c] font-black uppercase text-[10px] tracking-widest gap-2 h-12 rounded-xl px-5 shadow-diff-shadow hover:bg-gray-50",
                    hasActiveFilters && "border-amber-500/50 bg-amber-50/10"
                  )}
                >
                  <ListFilter className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
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
                          <SelectItem value="false">Inativo</SelectItem>
                          </SelectContent>
                      </Select>
                      </div>
  
                      <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Escola</Label>
                      <Select value={selectedEscola} onValueChange={onEscolaChange}>
                          <SelectTrigger className="w-full h-11 rounded-lg bg-gray-50 border-gray-100 font-medium">
                          <SelectValue placeholder="Escola" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                          <SelectItem value="todas">Todas Escolas</SelectItem>
                          {escolas.map((escola) => (
                          <SelectItem key={escola.id} value={escola.id}>
                              {escola.nome}
                          </SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                      </div>
  
                      <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Veículo</Label>
                      <Select value={selectedVeiculo} onValueChange={onVeiculoChange}>
                          <SelectTrigger className="w-full h-11 rounded-lg bg-gray-50 border-gray-100 font-medium">
                          <SelectValue placeholder="Veículo" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                          <SelectItem value="todos">Todos Veículos</SelectItem>
                          {veiculos.map((veiculo) => (
                          <SelectItem key={veiculo.id} value={veiculo.id}>
                              {formatarPlacaExibicao(veiculo.placa)}
                          </SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                      </div>
  
                      <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Período</Label>
                      <Select value={selectedPeriodo} onValueChange={onPeriodoChange}>
                          <SelectTrigger className="w-full h-11 rounded-lg bg-gray-50 border-gray-100 font-medium">
                          <SelectValue placeholder="Período" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                          <SelectItem value="todos">Todos Períodos</SelectItem>
                          {periodos.map((periodo) => (
                          <SelectItem key={periodo.value} value={periodo.value}>
                              {periodo.label}
                          </SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                      </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Button
            onClick={onRegister}
            disabled={isRegisterDisabled}
            className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-6 shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Passageiro
          </Button>
        </div>

        {/* Buttons Section (Mobile) */}
        <div className="md:hidden flex gap-3">
            <Drawer open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <DrawerTrigger asChild>
              {showAdvancedFilters && (
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 bg-white border border-[#1a3a5c]/10 text-[#1a3a5c] font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 shadow-diff-shadow",
                     hasActiveFilters && "border-amber-500/50 bg-amber-50/5"
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                      <span className="ml-1.5 flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                </Button>
              )}
            </DrawerTrigger>
            <DrawerContent
                className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl pb-8"
            >
                <DrawerHeader className="text-left mb-2 px-8 pt-6">
                <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">Filtrar Passageiros</DrawerTitle>
                <DrawerDescription className="text-xs font-medium text-gray-400">
                    Refine sua busca para encontrar passageiros específicos.
                </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-8">
                <div className="grid grid-cols-2 gap-5 mt-4">
                    <div className="space-y-2 col-span-2">
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
                        <SelectItem value="false">Inativo</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Escola</Label>
                    <Select
                        value={tempFilters.escola}
                        onValueChange={(val) =>
                        setTempFilters((prev) => ({ ...prev, escola: val }))
                        }
                    >
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-semibold text-[#1a3a5c]">
                        <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                        <SelectItem value="todas">Todas</SelectItem>
                        {escolas.map((escola) => (
                            <SelectItem key={escola.id} value={escola.id}>
                            {escola.nome}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
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
                        {veiculos.map((veiculo) => (
                            <SelectItem key={veiculo.id} value={veiculo.id}>
                            {formatarPlacaExibicao(veiculo.placa)}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Período</Label>
                    <Select
                        value={tempFilters.periodo}
                        onValueChange={(val) =>
                        setTempFilters((prev) => ({ ...prev, periodo: val }))
                        }
                    >
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-semibold text-[#1a3a5c]">
                        <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                        <SelectItem value="todos">Todos</SelectItem>
                        {periodos.map((periodo) => (
                            <SelectItem key={periodo.value} value={periodo.value}>
                            {periodo.label}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>
                </div>

                <div className="pt-10 flex flex-col gap-3">
                    <Button 
                    className="w-full h-15 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase tracking-widest text-xs shadow-lg h-14" 
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
