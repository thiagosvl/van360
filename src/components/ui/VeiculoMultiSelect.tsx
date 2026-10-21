import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Check, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarPlacaExibicao } from "@/utils/domain";

export interface VeiculoOption {
  id: string;
  placa: string;
  modelo?: string | null;
}

export interface VeiculoMultiSelectProps {
  veiculos: VeiculoOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
}

export const VeiculoMultiSelect: React.FC<VeiculoMultiSelectProps> = ({
  veiculos = [],
  selectedIds = [],
  onChange,
  disabled = false,
  placeholder = "Selecionar vans (opcional)",
  hasError = false,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const toggleVeiculo = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === veiculos.length) {
      onChange([]);
    } else {
      onChange(veiculos.map((v) => v.id));
    }
  };

  const getTriggerText = () => {
    if (veiculos.length === 0) {
      return "Nenhuma van cadastrada";
    }
    if (selectedIds.length === 0) {
      return placeholder;
    }
    if (selectedIds.length === 1) {
      const found = veiculos.find((v) => v.id === selectedIds[0]);
      if (!found) return "1 van selecionada";
      return `${formatarPlacaExibicao(found.placa)}${found.modelo ? ` - ${found.modelo}` : ""}`;
    }
    if (selectedIds.length === veiculos.length && veiculos.length > 1) {
      return `Todas as vans (${veiculos.length})`;
    }
    return `${selectedIds.length} vans selecionadas`;
  };

  const isAllSelected = veiculos.length > 0 && selectedIds.length === veiculos.length;

  return (
    <Popover open={open && !disabled && veiculos.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || veiculos.length === 0}
          className={cn(
            "h-10 w-full rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] px-3.5 text-sm text-left font-medium flex items-center justify-between transition-colors shadow-none cursor-pointer focus:outline-none focus:bg-white focus:border-[#0a0a0a]",
            selectedIds.length === 0 && "text-[#737373] font-normal",
            selectedIds.length > 0 && "text-[#0a0a0a] font-medium",
            hasError && "border-[#e7000b]",
            (disabled || veiculos.length === 0) && "opacity-80 bg-[#f5f5f5] font-medium text-[#737373] cursor-not-allowed",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <Car className="h-4 w-4 text-[#737373] shrink-0" />
            <span className="truncate">{getTriggerText()}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-2.5 bg-white border border-[#e5e5e5] rounded-[20px] shadow-xl z-[9999] space-y-1.5"
      >
        {veiculos.length > 1 && (
          <div className="pb-1.5 mb-1 border-b border-[#e5e5e5] flex items-center justify-between px-2 pt-0.5">
            <span className="text-[11px] font-normal text-[#737373]">
              {selectedIds.length} de {veiculos.length} selecionada(s)
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
            >
              {isAllSelected ? "Desmarcar todas" : "Marcar todas"}
            </button>
          </div>
        )}

        <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
          {veiculos.map((veiculo) => {
            const isChecked = selectedIds.includes(veiculo.id);
            return (
              <div
                key={veiculo.id}
                onClick={() => toggleVeiculo(veiculo.id)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-[14px] cursor-pointer transition-colors text-xs font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] select-none",
                  isChecked && "bg-primary/5 text-primary"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-[6px] border flex items-center justify-center transition-colors shrink-0",
                    isChecked
                      ? "bg-primary border-primary text-white"
                      : "border-[#e5e5e5] bg-white hover:border-[#737373]"
                  )}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="truncate flex-1">
                  <span className="font-semibold text-[#0a0a0a]">{formatarPlacaExibicao(veiculo.placa)}</span>
                  {veiculo.modelo && <span className="text-[#737373] ml-1">({veiculo.modelo})</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-[#e5e5e5] flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-8 px-3.5 text-xs bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-[18px] transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            Concluir
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
