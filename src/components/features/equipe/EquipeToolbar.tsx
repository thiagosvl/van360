import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface EquipeToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNovoRegistro: () => void;
  tipoLabel: string;
  disabled?: boolean;
}

export const EquipeToolbar = memo(function EquipeToolbar({
  searchTerm,
  onSearchChange,
  onNovoRegistro,
  tipoLabel,
  disabled = false,
}: EquipeToolbarProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative group flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a]" />
        <Input
          type="text"
          inputMode="search"
          placeholder={`Buscar ${tipoLabel.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 text-sm font-normal transition-all shadow-xs [&::-webkit-search-cancel-button]:hidden",
            searchTerm ? "pr-10" : "pr-4"
          )}
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

      <Button
        onClick={onNovoRegistro}
        disabled={disabled}
        className="border-none bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-sm h-10 sm:h-11 rounded-[18px] px-3.5 sm:px-5 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
      >
        <Plus className="h-4 w-4 shrink-0" />
        <span>Cadastrar</span>
      </Button>
    </div>
  );
});
