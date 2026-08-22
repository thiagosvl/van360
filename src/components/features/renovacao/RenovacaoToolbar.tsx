import { memo, useEffect, useState } from "react";
import { School, Clock, SlidersHorizontal } from "lucide-react";
import { FilterDefaults } from "@/types/enums";
import { periodos } from "@/utils/formatters/periodo";
import { DataTableToolbar } from "../common/DataTableToolbar";
import { DataTableFilterSelect } from "../common/DataTableFilterSelect";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { Escola } from "@/types/escola";
import { Button } from "@/components/ui/button";

interface RenovacaoToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  escolaFilter: string;
  onEscolaChange: (value: string) => void;
  periodoFilter: string;
  onPeriodoChange: (value: string) => void;
  escolas: Escola[];
  onOpenAjustesLote?: () => void;
}

export const RenovacaoToolbar = memo(function RenovacaoToolbar({
  searchTerm,
  onSearchChange,
  escolaFilter,
  onEscolaChange,
  periodoFilter,
  onPeriodoChange,
  escolas,
  onOpenAjustesLote,
}: RenovacaoToolbarProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [tempFilters, setTempFilters] = useState({
    escola: (!escolaFilter || escolaFilter === "all") ? FilterDefaults.TODAS : escolaFilter,
    periodo: (!periodoFilter || periodoFilter === "all") ? FilterDefaults.TODOS : periodoFilter,
  });

  useEffect(() => {
    if (isSheetOpen) {
      setTempFilters({
        escola: (!escolaFilter || escolaFilter === "all") ? FilterDefaults.TODAS : escolaFilter,
        periodo: (!periodoFilter || periodoFilter === "all") ? FilterDefaults.TODOS : periodoFilter,
      });
    }
  }, [isSheetOpen, escolaFilter, periodoFilter]);

  const hasActiveFilters =
    (escolaFilter && escolaFilter !== FilterDefaults.TODAS && escolaFilter !== "all") ||
    (periodoFilter && periodoFilter !== FilterDefaults.TODOS && periodoFilter !== "all");

  const handleApplyFilters = () => {
    const finalEscola = tempFilters.escola === FilterDefaults.TODAS ? "all" : tempFilters.escola;
    const finalPeriodo = tempFilters.periodo === FilterDefaults.TODOS ? "all" : tempFilters.periodo;
    onEscolaChange(finalEscola);
    onPeriodoChange(finalPeriodo);
    setIsSheetOpen(false);
  };

  const handleClearFilters = () => {
    onEscolaChange("all");
    onPeriodoChange("all");
    setIsSheetOpen(false);
  };

  const handleClearMobileFilters = () => {
    setTempFilters({
      escola: FilterDefaults.TODAS,
      periodo: FilterDefaults.TODOS,
    });
  };

  const currentDesktopEscola = (!escolaFilter || escolaFilter === "all") ? FilterDefaults.TODAS : escolaFilter;
  const currentDesktopPeriodo = (!periodoFilter || periodoFilter === "all") ? FilterDefaults.TODOS : periodoFilter;

  const filterChildren = (
    <>
      <DataTableFilterSelect
        label="Escola"
        placeholder="Todas Escolas"
        value={isMobile ? tempFilters.escola : currentDesktopEscola}
        onValueChange={(val) => {
          if (isMobile) {
            setTempFilters((prev) => ({ ...prev, escola: val }));
          } else {
            onEscolaChange(val === FilterDefaults.TODAS ? "all" : val);
          }
        }}
        icon={<School className="w-3.5 h-3.5 shrink-0" />}
        options={[
          { label: "Todas Escolas", value: FilterDefaults.TODAS },
          ...(escolas?.map((e) => ({ label: e.nome, value: e.id })) || []),
        ]}
      />

      <DataTableFilterSelect
        label="Período"
        placeholder="Todos Períodos"
        value={isMobile ? tempFilters.periodo : currentDesktopPeriodo}
        onValueChange={(val) => {
          if (isMobile) {
            setTempFilters((prev) => ({ ...prev, periodo: val }));
          } else {
            onPeriodoChange(val === FilterDefaults.TODOS ? "all" : val);
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
      searchPlaceholder="Buscar por passageiro ou responsável..."
      filterConfig={{
        title: "Filtrar Passageiros",
        description: "Refine sua busca para encontrar passageiros específicos.",
        hasActiveFilters,
        onClear: handleClearFilters,
        onApply: handleApplyFilters,
        onClearTemp: handleClearMobileFilters,
        isOpen: isSheetOpen,
        onOpenChange: setIsSheetOpen,
      }}
      filterChildren={filterChildren}
      actions={
        onOpenAjustesLote ? (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenAjustesLote}
            className="flex-1 md:flex-initial bg-white border-slate-100 text-[#1a3a5c] font-bold text-xs sm:text-sm gap-1.5 sm:gap-2 h-12 md:h-14 rounded-2xl px-3.5 sm:px-5 shadow-sm hover:bg-gray-50 shrink-0 active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span>Ajustes em Lote</span>
          </Button>
        ) : undefined
      }
    />
  );
});
