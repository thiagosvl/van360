import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface GastoCategoriaFormProps {
  onSubmit: (data: { nome: string; cor?: string }) => Promise<void>;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
  className?: string;
  initialValues?: { nome: string; cor?: string };
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

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await onSubmit({ nome: name.trim(), cor: initialValues?.cor || "slate" });
      if (!initialValues) {
        setName("");
      }
    } catch {
      return;
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
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <label className="text-[#0a0a0a] font-medium text-xs">
          Nome da Categoria <span className="text-[#e7000b]">*</span>
        </label>
        <input
          type="text"
          autoFocus={autoFocus}
          className="w-full h-10 sm:h-11 px-3.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] focus:outline-none transition-all"
          placeholder="Ex: Pedágio, Internet, Limpeza..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] text-xs font-medium px-3.5 shadow-none transition-all active:scale-[0.98] cursor-pointer"
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
          className="h-9 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium px-4 border-none shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          {isPending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
