import { memo } from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare, X, Check, SlidersHorizontal, Loader2, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";

interface RenovacaoStickyBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDispararWhatsApp: () => void;
  onConfirmarLote: () => void;
  onSaidaLote: () => void;
  onPendenteLote?: () => void;
  onOpenReajuste?: () => void;
  isProcessing?: boolean;
}

export const RenovacaoStickyBar = memo(function RenovacaoStickyBar({
  selectedCount,
  onClearSelection,
  onDispararWhatsApp,
  onConfirmarLote,
  onSaidaLote,
  onPendenteLote,
  onOpenReajuste,
  isProcessing = false,
}: RenovacaoStickyBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-[calc(4.75rem+var(--safe-area-bottom,0px))] md:bottom-6 left-0 right-0 md:left-72 z-40 flex justify-center px-3 sm:px-6 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="pointer-events-auto w-full max-w-xl md:max-w-2xl xl:max-w-5xl bg-white/95 backdrop-blur-md border border-[#e5e5e5] shadow-xl rounded-[24px] p-3 sm:px-5 sm:py-3.5">
        <div className="flex xl:hidden flex-col gap-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-[8px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center text-xs shrink-0">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-[#0a0a0a]">
                <strong>{selectedCount}</strong>{" "}
                {selectedCount === 1 ? "aluno selecionado" : "alunos selecionados"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={isProcessing}
              className="text-xs font-normal text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
            >
              Limpar seleção
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {onOpenReajuste && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenReajuste}
                  disabled={isProcessing}
                  className="h-10 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-semibold gap-1.5 shadow-none cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span>Reajustar</span>
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={onDispararWhatsApp}
                disabled={isProcessing}
                className={cn(
                  "h-10 rounded-[18px] bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 transition-all",
                  !onOpenReajuste && "col-span-2"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                ) : (
                  <WhatsAppIcon className="w-4 h-4 fill-current text-white shrink-0" />
                )}
                <span className="truncate">Disparar WhatsApp</span>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onConfirmarLote}
                disabled={isProcessing}
                className="h-9 px-1 rounded-[16px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1 shadow-none cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
                <span className="truncate">Confirmar</span>
              </Button>
              {onPendenteLote && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onPendenteLote}
                  disabled={isProcessing}
                  className="h-9 px-1 rounded-[16px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1 shadow-none cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 stroke-[2.5] shrink-0" />
                  <span className="truncate">Pendente</span>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSaidaLote}
                disabled={isProcessing}
                className="h-9 px-1 rounded-[16px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1 shadow-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[#e7000b] stroke-[2.5] shrink-0" />
                <span className="truncate">Saída</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center text-xs shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-[#0a0a0a] whitespace-nowrap">
              <strong>{selectedCount}</strong>{" "}
              {selectedCount === 1 ? "aluno selecionado" : "alunos selecionados"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenReajuste && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenReajuste}
                disabled={isProcessing}
                className="h-9 px-3.5 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-semibold gap-1.5 shadow-none transition-all cursor-pointer"
                title="Reajustar valores"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                <span>Reajustar</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaidaLote}
              disabled={isProcessing}
              className="h-9 px-3.5 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1.5 shadow-none transition-all cursor-pointer"
              title="Registrar saída em lote"
            >
              <X className="w-3.5 h-3.5 text-[#e7000b] stroke-[2.5] shrink-0" />
              <span>Saída</span>
            </Button>

            {onPendenteLote && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPendenteLote}
                disabled={isProcessing}
                className="h-9 px-3.5 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1.5 shadow-none transition-all cursor-pointer"
                title="Redefinir para pendente em lote"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600 stroke-[2.5] shrink-0" />
                <span>Pendente</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConfirmarLote}
              disabled={isProcessing}
              className="h-9 px-3.5 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1.5 shadow-none transition-all cursor-pointer"
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
              className="h-9 px-4 rounded-[18px] bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-medium text-xs gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-40"
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
              className="h-9 w-9 text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[14px] shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
