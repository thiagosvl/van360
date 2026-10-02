import { memo } from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare, X, Check, SlidersHorizontal, Loader2 } from "lucide-react";
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
    <div className="fixed bottom-[calc(4.75rem+var(--safe-area-bottom,0px))] md:bottom-6 left-0 right-0 md:left-72 z-40 flex justify-center px-3 sm:px-4 md:px-6 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="pointer-events-auto w-full max-w-lg sm:max-w-2xl lg:max-w-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl shadow-slate-900/15 rounded-2xl sm:rounded-full p-2.5 sm:px-4 sm:py-2">
        {/* Mobile view (< sm) */}
        <div className="flex sm:hidden flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-5 h-5 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
                <CheckSquare className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                <strong className="text-[#1a3a5c]">{selectedCount}</strong>{" "}
                {selectedCount === 1 ? "aluno selecionado" : "alunos selecionados"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={isProcessing}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              Limpar seleção
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {onOpenReajuste && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenReajuste}
                disabled={isProcessing}
                className="h-8.5 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <SlidersHorizontal className="w-3 h-3 text-slate-500 shrink-0" />
                <span>Reajustar</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaidaLote}
              disabled={isProcessing}
              className="h-8.5 rounded-xl border-rose-200 text-rose-700 text-xs font-semibold gap-1 shadow-2xs cursor-pointer active:scale-95"
            >
              <X className="w-3 h-3 text-rose-600 stroke-[2.5] shrink-0" />
              <span>Saída</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConfirmarLote}
              disabled={isProcessing}
              className="h-8.5 rounded-xl border-emerald-200 text-emerald-700 text-xs font-semibold gap-1 shadow-2xs cursor-pointer active:scale-95"
            >
              <Check className="w-3 h-3 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>Confirmar</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onDispararWhatsApp}
              disabled={isProcessing}
              className="h-8.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
              ) : (
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-white shrink-0" />
              )}
              <span className="whitespace-nowrap">Disparar WhatsApp</span>
            </Button>
          </div>
        </div>

        {/* Tablet and Desktop view (>= sm) */}
        <div className="hidden sm:flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
              <strong className="text-[#1a3a5c]">{selectedCount}</strong>{" "}
              <span className="hidden lg:inline">{selectedCount === 1 ? "aluno selecionado" : "alunos selecionados"}</span>
              <span className="lg:hidden">{selectedCount === 1 ? "selecionado" : "selecionados"}</span>
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 shrink-0 mx-0.5" />

          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0">
            {onOpenReajuste && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenReajuste}
                disabled={isProcessing}
                className="h-8.5 px-2.5 lg:px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-xs font-semibold gap-1.5 shrink-0 transition-all cursor-pointer"
                title="Reajustar valores"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Reajustar</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaidaLote}
              disabled={isProcessing}
              className="h-8.5 px-2.5 lg:px-3 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold gap-1.5 shrink-0 transition-all cursor-pointer"
              title="Registrar saída em lote"
            >
              <X className="w-3.5 h-3.5 text-rose-600 stroke-[2.5] shrink-0" />
              <span>Saída</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConfirmarLote}
              disabled={isProcessing}
              className="h-8.5 px-2.5 lg:px-3 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold gap-1.5 shrink-0 transition-all cursor-pointer"
              title="Confirmar vaga em lote"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>Confirmar</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onDispararWhatsApp}
              disabled={isProcessing}
              className="h-8.5 px-3 lg:px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
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
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
