import { memo, useEffect, useState } from "react";
import { School, Clock, SlidersHorizontal } from "lucide-react";
import { FilterDefaults } from "@/types/enums";
import { periodos } from "@/utils/formatters/periodo";
import { DataTableToolbar } from "../common/DataTableToolbar";
import { DataTableFilterSelect } from "../common/DataTableFilterSelect";
import { useIsMobile } from "@/hooks/ui/useIsMobile";
import { Escola } from "@/types/escola";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface RenovacaoToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  escolaFilter: string;
  onEscolaChange: (value: string) => void;
  periodoFilter: string;
  onPeriodoChange: (value: string) => void;
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
  escolas,
  onOpenAjustesLote,
  onOpenReajusteLote,
  onNotificarLote,
  isNotificandoLote,
  pendentesCount,
}: RenovacaoToolbarProps) {
  const handleOpenLote = onOpenAjustesLote || onOpenReajusteLote;
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
    <div className="space-y-2">
      <DataTableToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por aluno ou responsável..."
        filterConfig={{
          title: "Filtrar Alunos",
          description: "Refine sua busca para encontrar alunos específicos.",
          hasActiveFilters,
          onClear: handleClearFilters,
          onApply: handleApplyFilters,
          onClearTemp: handleClearMobileFilters,
          isOpen: isSheetOpen,
          onOpenChange: setIsSheetOpen,
        }}
        filterChildren={filterChildren}
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            {handleOpenLote && (
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenLote}
                className="flex-1 md:flex-initial bg-white border border-[#e5e5e5] hover:bg-[#fafafa] text-[#0a0a0a] font-medium text-xs sm:text-sm gap-2 h-10 sm:h-11 rounded-[18px] px-3.5 sm:px-4 shadow-none shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#737373] shrink-0" />
                <span>Ajustes em Lote</span>
              </Button>
            )}

            {onNotificarLote && (
              <Button
                type="button"
                onClick={onNotificarLote}
                disabled={isNotificandoLote}
                className="hidden md:inline-flex bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-medium text-xs sm:text-sm gap-2 h-10 sm:h-11 rounded-[18px] px-4 shadow-xs shrink-0 cursor-pointer disabled:opacity-40 transition-all"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current text-white shrink-0" />
                <span>
                  {isNotificandoLote
                    ? "Enviando..."
                    : pendentesCount !== undefined && pendentesCount > 0
                    ? `Disparar WhatsApp (${pendentesCount})`
                    : "Disparar WhatsApp"}
                </span>
              </Button>
            )}
          </div>
        }
      />

      {onNotificarLote && (
        <div className="block md:hidden">
          <Button
            type="button"
            onClick={onNotificarLote}
            disabled={isNotificandoLote}
            className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-medium text-xs sm:text-sm gap-2 h-10 rounded-[18px] shadow-xs cursor-pointer disabled:opacity-40 transition-all"
          >
            <WhatsAppIcon className="h-4 w-4 fill-current text-white shrink-0" />
            <span>
              {isNotificandoLote
                ? "Enviando notificações..."
                : pendentesCount !== undefined && pendentesCount > 0
                ? `Disparar WhatsApp para ${pendentesCount} ${pendentesCount === 1 ? "aluno" : "alunos"}`
                : "Disparar WhatsApp"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
});
