import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RotaOption {
  id: string;
  nome: string;
}

export interface RotaMultiSelectProps {
  rotas: RotaOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
}

export const RotaMultiSelect: React.FC<RotaMultiSelectProps> = ({
  rotas = [],
  selectedIds = [],
  onChange,
  disabled = false,
  placeholder = "Selecione a(s) rota(s)",
  hasError = false,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const toggleRota = (rotaId: string) => {
    if (selectedIds.includes(rotaId)) {
      onChange(selectedIds.filter((id) => id !== rotaId));
    } else {
      onChange([...selectedIds, rotaId]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === rotas.length) {
      onChange([]);
    } else {
      onChange(rotas.map((r) => r.id));
    }
  };

  const getTriggerText = () => {
    if (rotas.length === 0) {
      return "Nenhuma rota disponível";
    }
    if (selectedIds.length === 0) {
      return placeholder;
    }
    if (selectedIds.length === 1) {
      const found = rotas.find((r) => r.id === selectedIds[0]);
      return found?.nome || "1 rota selecionada";
    }
    if (selectedIds.length === rotas.length && rotas.length > 1) {
      return `Todas as rotas (${rotas.length})`;
    }
    return `${selectedIds.length} rotas selecionadas`;
  };

  const isAllSelected = rotas.length > 0 && selectedIds.length === rotas.length;

  return (
    <Popover open={open && !disabled && rotas.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || rotas.length === 0}
          className={cn(
            "h-12 w-full rounded-lg bg-slate-50 border border-slate-200 px-3.5 text-base text-left font-medium flex items-center justify-between transition-colors shadow-none cursor-pointer focus:outline-none focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c]",
            selectedIds.length === 0 && "text-slate-400 font-normal",
            selectedIds.length > 0 && "text-slate-800 font-medium",
            hasError && "border-red-500",
            (disabled || rotas.length === 0) && "opacity-80 bg-slate-100 font-medium text-slate-500 cursor-not-allowed",
            className
          )}
        >
          <span className="truncate pr-2">{getTriggerText()}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] space-y-1"
      >
        {rotas.length > 1 && (
          <div className="pb-1 mb-1 border-b border-slate-100 flex items-center justify-between px-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500">
              {selectedIds.length} de {rotas.length} selecionada(s)
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-bold text-[#1a3a5c] hover:underline cursor-pointer"
            >
              {isAllSelected ? "Desmarcar todas" : "Marcar todas"}
            </button>
          </div>
        )}

        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {rotas.map((rota) => {
            const isChecked = selectedIds.includes(rota.id);
            return (
              <div
                key={rota.id}
                onClick={() => toggleRota(rota.id)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs font-semibold text-slate-700 hover:bg-slate-50 select-none",
                  isChecked && "bg-slate-50 text-[#1a3a5c]"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0",
                    isChecked
                      ? "bg-[#1a3a5c] border-[#1a3a5c] text-white"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  )}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate flex-1">{rota.nome}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-7 px-3 text-xs bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-semibold rounded-md transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
