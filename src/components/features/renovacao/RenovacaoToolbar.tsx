import { memo, useEffect, useState } from "react";
import { School, Clock, ListFilter, RotateCcw, Check, Search, X } from "lucide-react";
import { FilterDefaults } from "@/types/enums";
import { periodos } from "@/utils/formatters/periodo";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { Escola } from "@/types/escola";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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

interface RenovacaoToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  escolaFilter: string;
  onEscolaChange: (value: string) => void;
  periodoFilter: string;
  onPeriodoChange: (value: string) => void;
  onApplyFilters?: (filters: { escola?: string; periodo?: string }) => void;
  onClearFilters?: () => void;
  escolas: Escola[];
  onOpenAjustesLote?: () => void;
  onOpenReajusteLote?: () => void;
  onNotificarLote?: () => void;
  isNotificandoLote?: boolean;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  totalFiltrados?: number;
  pendentesCount?: number;
}

export const RenovacaoToolbar = memo(function RenovacaoToolbar({
  searchTerm,
  onSearchChange,
  escolaFilter,
  onEscolaChange,
  periodoFilter,
  onPeriodoChange,
  onApplyFilters,
  onClearFilters,
  escolas,
  onOpenAjustesLote,
  onOpenReajusteLote,
}: RenovacaoToolbarProps) {
  const handleOpenLote = onOpenAjustesLote || onOpenReajusteLote;
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const [tempFilters, setTempFilters] = useState({
    escola: (!escolaFilter || escolaFilter === "all") ? FilterDefaults.TODAS : escolaFilter,
    periodo: (!periodoFilter || periodoFilter === "all") ? FilterDefaults.TODOS : periodoFilter,
  });

  useEffect(() => {
    if (isOpen) {
      setTempFilters({
        escola: (!escolaFilter || escolaFilter === "all") ? FilterDefaults.TODAS : escolaFilter,
        periodo: (!periodoFilter || periodoFilter === "all") ? FilterDefaults.TODOS : periodoFilter,
      });
    }
  }, [isOpen, escolaFilter, periodoFilter]);

  const hasActiveFilters =
    (escolaFilter && escolaFilter !== FilterDefaults.TODAS && escolaFilter !== "all") ||
    (periodoFilter && periodoFilter !== FilterDefaults.TODOS && periodoFilter !== "all");

  const handleApply = () => {
    const finalEscola = tempFilters.escola === FilterDefaults.TODAS ? "all" : tempFilters.escola;
    const finalPeriodo = tempFilters.periodo === FilterDefaults.TODOS ? "all" : tempFilters.periodo;
    if (onApplyFilters) {
      onApplyFilters({
        escola: finalEscola,
        periodo: finalPeriodo,
      });
    } else {
      onEscolaChange(finalEscola);
      onPeriodoChange(finalPeriodo);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempFilters({
      escola: FilterDefaults.TODAS,
      periodo: FilterDefaults.TODOS,
    });
    if (onClearFilters) {
      onClearFilters();
    } else {
      onEscolaChange("all");
      onPeriodoChange("all");
    }
    setIsOpen(false);
  };

  const filterFormContent = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5">
          <School className="w-3.5 h-3.5 text-[#737373]" />
          Escola
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.escola : (escolaFilter === "all" ? FilterDefaults.TODAS : escolaFilter)}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, escola: val }));
            } else {
              onEscolaChange(val === FilterDefaults.TODAS ? "all" : val);
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
          <Clock className="w-3.5 h-3.5 text-[#737373]" />
          Período
        </label>
        <NativeSelect
          value={isMobile ? tempFilters.periodo : (periodoFilter === "all" ? FilterDefaults.TODOS : periodoFilter)}
          onChange={(e) => {
            const val = e.target.value;
            if (isMobile) {
              setTempFilters((prev) => ({ ...prev, periodo: val }));
            } else {
              onPeriodoChange(val === FilterDefaults.TODOS ? "all" : val);
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
      className={`h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-sm font-medium gap-2 px-3.5 transition-all shadow-none flex-1 sm:flex-initial justify-center cursor-pointer ${hasActiveFilters ? "border-[#0a0a0a]" : ""
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
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative group flex-1 min-w-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a] group-hover:text-[#0a0a0a]" />
        <Input
          type="text"
          inputMode="search"
          placeholder="Buscar por aluno ou responsável..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-10 text-sm font-normal transition-all shadow-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Limpar busca"
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="shrink-0">
        {isMobile ? (
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
        )}
      </div>
    </div>
  );
});
