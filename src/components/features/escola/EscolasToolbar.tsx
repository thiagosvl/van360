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
import { FilterDefaults } from "@/types/enums";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { usePermissions } from "@/hooks/business/usePermissions";
import { Plus, ListFilter, RotateCcw, Check, Search } from "lucide-react";
import { memo, useEffect, useState } from "react";

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
  const isMobile = useIsMobile();
  const { can } = usePermissions();
  const canManage = can("escolas.gerenciar");
  const [isOpen, setIsOpen] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>(
    selectedStatus || FilterDefaults.TODOS
  );

  useEffect(() => {
    setTempStatus(selectedStatus || FilterDefaults.TODOS);
  }, [selectedStatus]);

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({ status: tempStatus });
    } else {
      onStatusChange(tempStatus);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStatus(FilterDefaults.TODOS);
    if (onClearFilters) {
      onClearFilters();
    } else {
      onStatusChange(FilterDefaults.TODOS);
    }
    setIsOpen(false);
  };

  const filterFormContent = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] block">
          Status da Escola
        </label>
        <NativeSelect
          value={isMobile ? tempStatus : selectedStatus}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempStatus(val);
            } else {
              onStatusChange(val);
            }
          }}
        >
          <option value={FilterDefaults.TODOS}>Todos os status</option>
          <option value="true">Ativa</option>
          <option value="false">Desativada</option>
        </NativeSelect>
      </div>
    </div>
  );

  const filterTriggerButton = (
    <Button
      variant="outline"
      className={`h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-sm font-medium gap-2 px-3.5 transition-all shadow-none flex-1 sm:flex-initial justify-center cursor-pointer ${
        hasActiveFilters ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]" : ""
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
      <div className="relative group flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a]" />
        <Input
          type="search"
          placeholder="Buscar escolas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
        />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isMobile ? (
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>{filterTriggerButton}</DrawerTrigger>
            <DrawerContent className="h-auto max-h-[90vh] rounded-t-[28px] flex flex-col px-0 bg-white border-t border-[#e5e5e5] shadow-lg pb-[calc(2rem+var(--safe-area-bottom))]">
              <DrawerHeader className="text-left mb-2 px-6 pt-5">
                <DrawerTitle className="font-semibold text-[#0a0a0a] text-lg tracking-tight">
                  Filtrar Escolas
                </DrawerTitle>
                <DrawerDescription className="text-xs font-normal text-[#737373]">
                  Refine sua busca por status da escola.
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-6 py-2 flex-1 overflow-y-auto">
                {filterFormContent}
              </div>

              <div className="p-6 pt-4 border-t border-[#e5e5e5] flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 h-11 rounded-[18px] border-[#e5e5e5] text-sm font-medium text-[#0a0a0a]"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-[#737373]" />
                  Limpar
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1 h-11 rounded-[18px] bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-medium"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Aplicar
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{filterTriggerButton}</PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 p-4 rounded-[22px] border border-[#e5e5e5] bg-white shadow-xl space-y-3"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="space-y-0.5">
                <h4 className="font-semibold text-[#0a0a0a] text-sm tracking-tight">
                  Filtrar Escolas
                </h4>
                <p className="text-xs text-[#737373]">
                  Refine sua busca por status.
                </p>
              </div>

              {filterFormContent}
            </PopoverContent>
          </Popover>
        )}

        {canManage && (
          <Button
            onClick={onRegister}
            disabled={isRegisterDisabled}
            className="h-10 sm:h-11 rounded-[18px] bg-primary hover:bg-primary/90 text-white font-medium text-sm px-3.5 sm:px-4 gap-1.5 sm:gap-2 transition-all active:scale-[0.98] shadow-none cursor-pointer flex-1 sm:flex-initial justify-center"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Cadastrar Escola</span>
            <span className="sm:hidden">Nova Escola</span>
          </Button>
        )}
      </div>
    </div>
  );
});
