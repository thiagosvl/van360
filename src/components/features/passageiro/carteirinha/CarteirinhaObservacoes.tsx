import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/business/usePermissions";
import { cn } from "@/lib/utils";
import { Pencil, FileText } from "lucide-react";
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
  canManageOverride?: boolean;
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
  canManageOverride,
}: CarteirinhaObservacoesProps) => {
  const { can } = usePermissions();
  const canManage = canManageOverride !== undefined ? canManageOverride : can("passageiros.gerenciar");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
    }
  }, [isEditing, obsText]);

  return (
    <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs overflow-hidden group">
      <div className="px-5 py-3.5 border-b border-[#e5e5e5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0a0a0a]" />
          <h3 className="text-sm font-semibold text-[#0a0a0a]">Observações</h3>
        </div>

        {!isEditing && canManage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStartEdit}
            className="h-7 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-2.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer"
          >
            <Pencil className="h-3 w-3 text-[#737373]" />
            <span>Editar</span>
          </Button>
        )}
      </div>

      <div className="px-6 py-5">
        {isEditing && canManage ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={obsText}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="Escreva suas observações sobre o aluno..."
              className="w-full resize-none rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white px-4 py-3 text-sm font-normal text-[#0a0a0a] placeholder:text-[#737373] outline-none transition-all"
              style={{ minHeight: 80 }}
            />
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={onCancelEdit}
                disabled={isSaving}
                className="flex-1 h-10 sm:h-11 rounded-[18px] font-medium text-sm bg-white border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] shadow-xs active:scale-95"
              >
                Cancelar
              </Button>
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 h-10 sm:h-11 rounded-[18px] font-medium text-sm bg-primary hover:bg-primary-hover text-white shadow-xs active:scale-95 border-none"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : "Salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={canManage ? onStartEdit : undefined}
            className={cn(
              "-mx-2 px-2 py-1 rounded-[12px] transition-colors",
              canManage && "cursor-pointer group/obs hover:bg-[#f5f5f5]"
            )}
          >
            {observacoes ? (
              <p className="text-xs font-normal text-[#737373] leading-relaxed italic border-l-2 border-amber-300 pl-3 py-1">
                {observacoes}
              </p>
            ) : (
              <p className="text-[11px] text-[#a3a3a3] italic py-2">
                {canManage ? "Toque para adicionar observações..." : "Nenhuma observação cadastrada."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
