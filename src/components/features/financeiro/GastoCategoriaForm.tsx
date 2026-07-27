import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORIA_COLOR_PALETTE } from "@/utils/domain";
import { useState } from "react";

interface GastoCategoriaFormProps {
  onSubmit: (data: { nome: string; cor: string }) => Promise<void>;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
  className?: string;
  initialValues?: { nome: string; cor: string };
  autoFocus?: boolean;
}

export function GastoCategoriaForm({
  onSubmit,
  onCancel,
  isPending = false,
  submitLabel = "Adicionar",
  className,
  initialValues,
  autoFocus,
}: GastoCategoriaFormProps) {
  const [name, setName] = useState(initialValues?.nome || "");
  const [color, setColor] = useState(initialValues?.cor || "slate");

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await onSubmit({ nome: name.trim(), cor: color });
      if (!initialValues) {
        setName("");
        setColor("slate");
      }
    } catch (err) {
      // Erro tratado pela mutation externa
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 ml-1">Nome da Categoria <span className="text-red-500">*</span></label>
        <input
          type="text"
          autoFocus={autoFocus}
          className="w-full h-11 px-4 rounded-xl bg-white-100 border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
          placeholder="Ex: Pedágio, Internet, Limpeza..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 ml-1">Cor</label>
        <div className="flex flex-wrap gap-2.5 px-1 py-1">
          {Object.keys(CATEGORIA_COLOR_PALETTE).map((colorKey) => {
            const active = color === colorKey;
            const colorObj = CATEGORIA_COLOR_PALETTE[colorKey];
            return (
              <button
                key={colorKey}
                type="button"
                className={cn(
                  "w-7 h-7 rounded-full border transition-all duration-150 active:scale-95 cursor-pointer",
                  colorObj.bg,
                  active
                    ? "border-slate-800 ring-4 ring-slate-800/10 scale-110 shadow-sm"
                    : "border-slate-200 hover:scale-105 hover:border-slate-300"
                )}
                onClick={() => setColor(colorKey)}
                title={colorKey}
                disabled={isPending}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-semibold text-xs px-4 shadow-sm transition-all active:scale-95"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          disabled={isPending || !name.trim()}
          onClick={handleSave}
          className="h-9 bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white font-semibold text-xs px-4 shadow-md transition-all active:scale-95"
        >
          {isPending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
