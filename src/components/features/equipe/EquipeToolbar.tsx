import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { memo } from "react";

interface EquipeToolbarProps {
  totalItens: number;
  totalFiltrados: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNovoRegistro: () => void;
  tipoLabel: string;
  disabled?: boolean;
}

export const EquipeToolbar = memo(function EquipeToolbar({
  totalItens,
  totalFiltrados,
  searchTerm,
  onSearchChange,
  onNovoRegistro,
  tipoLabel,
  disabled = false,
}: EquipeToolbarProps) {
  const isFiltering = searchTerm.trim().length > 0;

  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
      <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em] self-end sm:self-auto text-right">
        {isFiltering ? (
          <>
            {totalFiltrados} {totalFiltrados === 1 ? "ENCONTRADO" : "ENCONTRADOS"}
          </>
        ) : (
          <>
            {totalItens} {totalItens === 1 ? tipoLabel.toUpperCase() : `${tipoLabel.toUpperCase()}S`}
          </>
        )}
      </span>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative group flex-1 sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a]" />
          <Input
            type="search"
            placeholder={`Buscar ${tipoLabel.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-xs"
          />
        </div>

        <Button
          onClick={onNovoRegistro}
          disabled={disabled}
          className="border-none bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-sm h-10 sm:h-11 rounded-[18px] px-3.5 sm:px-5 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Novo {tipoLabel}</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
    </div>
  );
});
