import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { periodos } from "@/utils/formatters/periodo";
import { DataTableToolbar } from "../common/DataTableToolbar";

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
  searchPlaceholder = "Buscar por nome do passageiro...",
}: PassageirosToolbarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || FilterDefaults.TODOS,
    escola: selectedEscola || FilterDefaults.TODAS,
    veiculo: selectedVeiculo || FilterDefaults.TODOS,
    periodo: selectedPeriodo || FilterDefaults.TODOS,
  });

  useEffect(() => {
    if (isSheetOpen) {
      setTempFilters({
        status: selectedStatus || FilterDefaults.TODOS,
        escola: selectedEscola || FilterDefaults.TODAS,
        veiculo: selectedVeiculo || FilterDefaults.TODOS,
        periodo: selectedPeriodo || FilterDefaults.TODOS,
      });
    }
  }, [isSheetOpen, selectedStatus, selectedEscola, selectedVeiculo, selectedPeriodo]);

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
      status: FilterDefaults.TODOS,
      escola: FilterDefaults.TODAS,
      veiculo: FilterDefaults.TODOS,
      periodo: FilterDefaults.TODOS,
    });
  };

  const filterChildren = (
    <div className="space-y-4">
      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</Label>
        <Select
          value={isSheetOpen ? tempFilters.status : selectedStatus}
          onValueChange={(val) => {
            if (isSheetOpen) {
              setTempFilters((prev) => ({ ...prev, status: val }));
            } else {
              onStatusChange(val);
            }
          }}
        >
          <SelectTrigger className="w-full h-11 md:h-14 rounded-lg md:rounded-2xl bg-gray-50 border-gray-100 font-medium md:font-semibold text-[#1a3a5c]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value={FilterDefaults.TODOS}>Todos Status</SelectItem>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Desativado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Escola</Label>
        <Select
          value={isSheetOpen ? tempFilters.escola : selectedEscola}
          onValueChange={(val) => {
            if (isSheetOpen) {
              setTempFilters((prev) => ({ ...prev, escola: val }));
            } else {
              onEscolaChange(val);
            }
          }}
        >
          <SelectTrigger className="w-full h-11 md:h-14 rounded-lg md:rounded-2xl bg-gray-50 border-gray-100 font-medium md:font-semibold text-[#1a3a5c]">
            <SelectValue placeholder="Escola" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value={FilterDefaults.TODAS}>Todas Escolas</SelectItem>
            {escolas.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Veículo</Label>
        <Select
          value={isSheetOpen ? tempFilters.veiculo : selectedVeiculo}
          onValueChange={(val) => {
            if (isSheetOpen) {
              setTempFilters((prev) => ({ ...prev, veiculo: val }));
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
            {veiculos.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.modelo} - {v.placa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Período</Label>
        <Select
          value={isSheetOpen ? tempFilters.periodo : selectedPeriodo}
          onValueChange={(val) => {
            if (isSheetOpen) {
              setTempFilters((prev) => ({ ...prev, periodo: val }));
            } else {
              onPeriodoChange(val);
            }
          }}
        >
          <SelectTrigger className="w-full h-11 md:h-14 rounded-lg md:rounded-2xl bg-gray-50 border-gray-100 font-medium md:font-semibold text-[#1a3a5c]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value={FilterDefaults.TODOS}>Todos Períodos</SelectItem>
            {periodos.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <DataTableToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      filterConfig={showAdvancedFilters ? {
        title: "Filtrar Passageiros",
        description: "Refine sua busca para encontrar passageiros específicos.",
        hasActiveFilters,
        onClear: onClearFilters,
        onApply: handleApplyFilters,
        onClearTemp: handleClearMobileFilters,
        isOpen: isSheetOpen,
        onOpenChange: setIsSheetOpen,
      } : undefined}
      filterChildren={showAdvancedFilters ? filterChildren : undefined}
      actions={showRegister ? (
        <Button
          onClick={onRegister}
          disabled={isRegisterDisabled}
          className="flex-1 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 md:px-6 shadow-md transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Novo</span>
          <span className="md:hidden">Novo</span>
        </Button>
      ) : undefined}
    />
  );
});
