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
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { periodos } from "@/utils/formatters";
import { Filter, ListFilter, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

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
}

export function PassageirosToolbar({
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
}: PassageirosToolbarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || "todos",
    escola: selectedEscola || "todas",
    veiculo: selectedVeiculo || "todos",
    periodo: selectedPeriodo || "todos",
  });

  // Sync temp filters only when sheet opens to avoid race conditions with parent state updates
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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou responsável..."
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
            className="w-[320px] p-4" 
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="todos">Todos Status</SelectItem>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Escola
                </Label>
                <Select value={selectedEscola} onValueChange={onEscolaChange}>
                  <SelectTrigger className="w-full">
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

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Veículo
                </Label>
                <Select value={selectedVeiculo} onValueChange={onVeiculoChange}>
                  <SelectTrigger className="w-full">
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

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">
                  Período
                </Label>
                <Select value={selectedPeriodo} onValueChange={onPeriodoChange}>
                  <SelectTrigger className="w-full">
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
          </PopoverContent>
        </Popover>

        <Button
          onClick={onRegister}
          disabled={isRegisterDisabled}
          className={`bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 rounded-xl ${
            isRegisterDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Passageiro
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
            className="h-auto max-h-[90vh] rounded-t-[20px] flex flex-col px-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SheetHeader className="text-left mb-4 px-6">
              <SheetTitle>Filtrar Passageiros</SheetTitle>
              <SheetDescription>
                Refine a lista de passageiros pelas opções abaixo.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Status</Label>
                  <Select
                    value={tempFilters.status}
                    onValueChange={(val) =>
                      setTempFilters((prev) => ({ ...prev, status: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Escola</Label>
                  <Select
                    value={tempFilters.escola}
                    onValueChange={(val) =>
                      setTempFilters((prev) => ({ ...prev, escola: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a escola" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label>Veículo</Label>
                  <Select
                    value={tempFilters.veiculo}
                    onValueChange={(val) =>
                      setTempFilters((prev) => ({ ...prev, veiculo: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Veículo" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label>Período</Label>
                  <Select
                    value={tempFilters.periodo}
                    onValueChange={(val) =>
                      setTempFilters((prev) => ({ ...prev, periodo: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
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

              <div className="pt-6 pb-6 flex flex-col gap-3">
                <Button className="w-full h-12 rounded-xl" onClick={handleApplyFilters}>
                  Aplicar Filtros
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                  onClick={handleClearMobileFilters}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          onClick={onRegister}
          disabled={isRegisterDisabled}
          className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 rounded-xl ${
            isRegisterDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar
        </Button>
      </div>
    </div>
  );
}
