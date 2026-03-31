import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CheckCircle2 } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { FilterDefaults } from "@/types/enums";
import { DataTableToolbar } from "../common/DataTableToolbar";
import { DataTableFilterSelect } from "../common/DataTableFilterSelect";

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
    </>
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
