import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Pencil, StickyNote, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface CarteirinhaObservacoesProps {
  observacoes?: string;
  isEditing: boolean;
  obsText: string;
  isSaving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onChangeText: (text: string) => void;
  onSave: () => void;
}

export const CarteirinhaObservacoes = ({
  observacoes,
  isEditing,
  obsText,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onChangeText,
  onSave,
}: CarteirinhaObservacoesProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
    }
  }, [isEditing, obsText]);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow overflow-hidden group">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
            <StickyNote className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-headline font-black text-[#1a3a5c]">
            Observações
          </h3>
        </div>

        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStartEdit}
            className="h-8 w-8 rounded-xl text-slate-300 hover:text-[#1a3a5c] hover:bg-slate-50 transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="px-6 py-5">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={obsText}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="Escreva suas observações sobre o passageiro..."
              className="w-full resize-none rounded-xl bg-slate-50 border border-slate-200 focus:border-[#1a3a5c]/30 focus:ring-1 focus:ring-[#1a3a5c]/20 px-4 py-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all"
              style={{ minHeight: 80 }}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelEdit}
                disabled={isSaving}
                className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 px-3"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-8 rounded-xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white text-[10px] font-black uppercase tracking-wider px-4"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={onStartEdit}
            className="cursor-pointer group/obs rounded-xl transition-colors hover:bg-slate-50 -mx-2 px-2 py-1"
          >
            {observacoes ? (
              <p className="text-xs font-medium text-slate-500 leading-relaxed italic border-l-2 border-amber-200 pl-3 py-1">
                {observacoes}
              </p>
            ) : (
              <p className="text-[11px] text-slate-300 italic py-2">
                Toque para adicionar observações...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
