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
import { DataTableToolbar } from "../common/DataTableToolbar";

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

export const EscolasToolbar = memo(function EscolasToolbar({
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: selectedStatus || FilterDefaults.TODOS,
  });

  useEffect(() => {
    if (isSheetOpen) {
      setTempFilters({
        status: selectedStatus || FilterDefaults.TODOS,
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
      status: FilterDefaults.TODOS,
    });
  };

  const filterChildren = (
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
  );

  return (
    <DataTableToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar escolas..."
      filterConfig={{
        title: "Filtrar Escolas",
        description: "Refine sua busca para encontrar escolas específicas.",
        hasActiveFilters,
        onClear: onClearFilters,
        onApply: handleApplyFilters,
        onClearTemp: handleClearMobileFilters,
        isOpen: isSheetOpen,
        onOpenChange: setIsSheetOpen,
      }}
      filterChildren={filterChildren}
      actions={
        <Button
          onClick={onRegister}
          disabled={isRegisterDisabled}
          className="flex-1 bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl px-5 md:px-6 shadow-md transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Nova Escola</span>
          <span className="md:hidden">Nova</span>
        </Button>
      }
    />
  );
});
