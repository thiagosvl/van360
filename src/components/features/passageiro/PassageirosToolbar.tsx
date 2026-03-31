import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, School, Car, Clock, CheckCircle2 } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { periodos } from "@/utils/formatters/periodo";
import { DataTableToolbar } from "../common/DataTableToolbar";
import { DataTableFilterSelect } from "../common/DataTableFilterSelect";

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
    <>
      <DataTableFilterSelect
        label="Status"
        placeholder="Status"
        value={isSheetOpen ? tempFilters.status : selectedStatus}
        onValueChange={(val) => {
          if (isSheetOpen) {
            setTempFilters((prev) => ({ ...prev, status: val }));
          } else {
            onStatusChange(val);
          }
        }}
        icon={<CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todos Status", value: FilterDefaults.TODOS },
          { label: "Ativo", value: "true" },
          { label: "Desativado", value: "false" },
        ]}
      />

      <DataTableFilterSelect
        label="Escola"
        placeholder="Escola"
        value={isSheetOpen ? tempFilters.escola : selectedEscola}
        onValueChange={(val) => {
          if (isSheetOpen) {
            setTempFilters((prev) => ({ ...prev, escola: val }));
          } else {
            onEscolaChange(val);
          }
        }}
        icon={<School className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todas Escolas", value: FilterDefaults.TODAS },
          ...(escolas?.map((e) => ({ label: e.nome, value: e.id })) || []),
        ]}
      />

      <DataTableFilterSelect
        label="Veículo"
        placeholder="Veículo"
        value={isSheetOpen ? tempFilters.veiculo : selectedVeiculo}
        onValueChange={(val) => {
          if (isSheetOpen) {
            setTempFilters((prev) => ({ ...prev, veiculo: val }));
          } else {
            onVeiculoChange(val);
          }
        }}
        icon={<Car className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todos Veículos", value: FilterDefaults.TODOS },
          ...(veiculos?.map((v) => ({ label: `${v.modelo} - ${v.placa}`, value: v.id })) || []),
        ]}
      />

      <DataTableFilterSelect
        label="Período"
        placeholder="Período"
        value={isSheetOpen ? tempFilters.periodo : selectedPeriodo}
        onValueChange={(val) => {
          if (isSheetOpen) {
            setTempFilters((prev) => ({ ...prev, periodo: val }));
          } else {
            onPeriodoChange(val);
          }
        }}
        icon={<Clock className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todos Períodos", value: FilterDefaults.TODOS },
          ...(periodos?.map((p) => ({ label: p.label, value: p.value })) || []),
        ]}
      />
    </>
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
