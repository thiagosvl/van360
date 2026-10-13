import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { Plus, ListFilter, RotateCcw, Check, Search, CheckCircle2, School, Car, Clock } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { periodos } from "@/utils/formatters/periodo";
import { useIsMobile } from "@/hooks/ui/useIsMobile";

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
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onApplyFilters: (filters: {
    search?: string;
    status?: string;
    escola?: string;
    veiculo?: string;
    periodo?: string;
  }) => void;
  onRegister: () => void;
  isRegisterDisabled?: boolean;
  escolas: { id: string; nome: string }[];
  veiculos: { id: string; modelo: string; placa: string }[];
  showAdvancedFilters?: boolean;
  showRegister?: boolean;
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
  onClearFilters,
  hasActiveFilters,
  onApplyFilters,
  onRegister,
  isRegisterDisabled,
  escolas,
  veiculos,
  showAdvancedFilters = true,
  showRegister = true,
  searchPlaceholder = "Buscar por nome do aluno...",
}: PassageirosToolbarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || FilterDefaults.TODOS,
    escola: selectedEscola || FilterDefaults.TODAS,
    veiculo: selectedVeiculo || FilterDefaults.TODOS,
    periodo: selectedPeriodo || FilterDefaults.TODOS,
  });

  useEffect(() => {
    setTempFilters({
      status: selectedStatus || FilterDefaults.TODOS,
      escola: selectedEscola || FilterDefaults.TODAS,
      veiculo: selectedVeiculo || FilterDefaults.TODOS,
      periodo: selectedPeriodo || FilterDefaults.TODOS,
    });
  }, [selectedStatus, selectedEscola, selectedVeiculo, selectedPeriodo]);

  const handleApply = () => {
    onApplyFilters({
      status: tempFilters.status,
      escola: tempFilters.escola,
      veiculo: tempFilters.veiculo,
      periodo: tempFilters.periodo,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    const limpos = {
      status: FilterDefaults.TODOS,
      escola: FilterDefaults.TODAS,
      veiculo: FilterDefaults.TODOS,
      periodo: FilterDefaults.TODOS,
    };
    setTempFilters(limpos);
    onClearFilters();
    setIsOpen(false);
  };

  const filterFormContent = (
    <div className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#737373]" />
          Status
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.status : selectedStatus}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, status: val }));
            } else {
              onStatusChange(val);
            }
          }}
        >
          <option value={FilterDefaults.TODOS}>Todos os status</option>
          <option value="true">Ativo</option>
          <option value="false">Desativado</option>
        </NativeSelect>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5">
          <School className="w-3.5 h-3.5 text-[#737373]" />
          Escola
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.escola : selectedEscola}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, escola: val }));
            } else {
              onEscolaChange(val);
            }
          }}
        >
          <option value={FilterDefaults.TODAS}>Todas as escolas</option>
          {escolas?.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-[#737373]" />
          Veículo
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.veiculo : selectedVeiculo}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, veiculo: val }));
            } else {
              onVeiculoChange(val);
            }
          }}
        >
          <option value={FilterDefaults.TODOS}>Todos os veículos</option>
          {veiculos?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.modelo} - {v.placa}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#737373]" />
          Período
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.periodo : selectedPeriodo}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, periodo: val }));
            } else {
              onPeriodoChange(val);
            }
          }}
        >
          <option value={FilterDefaults.TODOS}>Todos os períodos</option>
          {periodos?.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );

  const filterTriggerButton = (
    <Button
      variant="outline"
      className={`h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-sm font-medium gap-2 px-3.5 transition-all shadow-none flex-1 sm:flex-initial justify-center cursor-pointer ${
        hasActiveFilters ? "border-[#0a0a0a]" : ""
      }`}
    >
      <ListFilter className="h-4 w-4 text-[#737373]" />
      <span>Filtros</span>
      {hasActiveFilters && (
        <span className="h-2 w-2 rounded-full bg-primary -mr-0.5" />
      )}
    </Button>
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
      <div className="relative group flex-grow">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a] group-hover:text-[#0a0a0a]" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 hover:shadow-xs focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {showAdvancedFilters && (
          isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>{filterTriggerButton}</DrawerTrigger>
              <DrawerContent className="h-auto max-h-[90vh] rounded-t-[28px] flex flex-col px-0 bg-white border-t border-[#e5e5e5] shadow-lg pb-[calc(2rem+var(--safe-area-bottom))]">
                <DrawerHeader className="text-left mb-2 px-6 pt-5">
                  <DrawerTitle className="font-semibold text-[#0a0a0a] text-lg tracking-tight">
                    Filtrar Alunos
                  </DrawerTitle>
                  <DrawerDescription className="text-xs font-normal text-[#737373]">
                    Refine sua busca para encontrar alunos específicos.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-6 space-y-4">
                  {filterFormContent}

                  <div className="flex items-center gap-2.5 pt-3 border-t border-[#e5e5e5]">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        onClick={handleClear}
                        className="flex-1 h-11 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] text-sm font-medium gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Limpar</span>
                      </Button>
                    )}
                    <Button
                      onClick={handleApply}
                      className="flex-1 h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-white text-sm font-medium gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="h-4 w-4" />
                      <span>Aplicar</span>
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>{filterTriggerButton}</PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[300px] p-4 rounded-[24px] border border-[#e5e5e5] bg-white shadow-lg space-y-3.5"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="flex items-center justify-between pb-1 border-b border-[#e5e5e5]">
                  <span className="text-xs font-semibold text-[#0a0a0a]">
                    Filtros
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClear}
                      className="text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {filterFormContent}
              </PopoverContent>
            </Popover>
          )
        )}

        {showRegister && (
          <Button
            onClick={onRegister}
            disabled={isRegisterDisabled}
            className="flex-1 sm:flex-initial h-10 sm:h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium gap-1.5 px-4 border-none shadow-xs transition-all active:scale-[0.98] justify-center cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Novo Aluno</span>
          </Button>
        )}
      </div>
    </div>
  );
});
