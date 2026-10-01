import { memo } from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare, X, Check, ArrowRightLeft, SlidersHorizontal, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface RenovacaoStickyBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDispararWhatsApp: () => void;
  onConfirmarLote: () => void;
  onSaidaLote: () => void;
  onOpenReajuste?: () => void;
  isProcessing?: boolean;
}

export const RenovacaoStickyBar = memo(function RenovacaoStickyBar({
  selectedCount,
  onClearSelection,
  onDispararWhatsApp,
  onConfirmarLote,
  onSaidaLote,
  onOpenReajuste,
  isProcessing = false,
}: RenovacaoStickyBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+var(--safe-area-bottom))] md:bottom-6 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-40 flex flex-col gap-2 pointer-events-none transition-all duration-200 animate-in slide-in-from-bottom-3">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-blue-200 shadow-2xl rounded-2xl p-2.5 sm:p-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#1a3a5c] flex items-center justify-center font-bold text-xs shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
                <strong className="text-[#1a3a5c]">{selectedCount}</strong>{" "}
                <span className="sm:hidden">{selectedCount === 1 ? "selecionado" : "selecionados"}</span>
                <span className="hidden sm:inline">{selectedCount === 1 ? "aluno selecionado" : "alunos selecionados"}</span>
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              disabled={isProcessing}
              title="Desmarcar todos"
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl sm:hidden shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-end">
            {onOpenReajuste && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenReajuste}
                disabled={isProcessing}
                className="h-9 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-1 shadow-2xs cursor-pointer"
                title="Reajustar valores"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Reajustar</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaidaLote}
              disabled={isProcessing}
              className="h-9 px-2.5 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold gap-1 shadow-2xs cursor-pointer"
              title="Registrar saída em lote"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Saída</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConfirmarLote}
              disabled={isProcessing}
              className="h-9 px-2.5 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold gap-1 shadow-2xs cursor-pointer"
              title="Confirmar vaga em lote"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Confirmar</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onDispararWhatsApp}
              disabled={isProcessing}
              className="h-9 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer flex-1 sm:flex-initial"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-white shrink-0" />
              )}
              <span className="whitespace-nowrap">Disparar WhatsApp</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              disabled={isProcessing}
              title="Desmarcar todos"
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl hidden sm:flex shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
