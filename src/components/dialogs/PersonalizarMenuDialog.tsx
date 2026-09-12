import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { useSession } from "@/hooks/business/useSession";
import { useBottomNavPreferences } from "@/hooks/business/useBottomNavPreferences";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LayoutDashboard, Lock, Menu, SlidersHorizontal, RotateCcw, Plus, X } from "lucide-react";

interface PersonalizarMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SlotsState = [string | null, string | null, string | null];

export default function PersonalizarMenuDialog({ isOpen, onClose }: PersonalizarMenuDialogProps) {
  const { user } = useSession();
  const {
    customSlots,
    defaultSlots,
    availableItems,
    savePreferences,
    resetToDefault,
  } = useBottomNavPreferences(user?.id);

  const [slots, setSlots] = useState<SlotsState>(customSlots);

  useEffect(() => {
    if (isOpen) {
      setSlots([customSlots[0], customSlots[1], customSlots[2]]);
    }
  }, [isOpen, customSlots]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768 && isOpen) {
        safeCloseDialog(onClose);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]);

  const hasEmptySlot = slots.some((s) => s === null);
  const isFull = slots.every((s) => s !== null);

  const handleClearSlot = (index: number) => {
    const next: SlotsState = [...slots];
    next[index] = null;
    setSlots(next);
  };

  const handleSelectOption = (href: string) => {
    if (slots.includes(href)) return;

    const emptyIndex = slots.findIndex((s) => s === null);

    if (emptyIndex === -1) {
      toast.info("Remova um atalho tocando no X para abrir espaço.");
      return;
    }

    const next: SlotsState = [...slots];
    next[emptyIndex] = href;
    setSlots(next);
  };

  const handleReset = () => {
    setSlots([defaultSlots[0], defaultSlots[1], defaultSlots[2]]);
    resetToDefault();
    toast.info("Atalhos restaurados para o padrão do sistema.");
  };

  const handleSave = () => {
    if (!isFull || !slots[0] || !slots[1] || !slots[2]) {
      toast.warning("Preencha os 3 atalhos antes de salvar.");
      return;
    }

    savePreferences([slots[0], slots[1], slots[2]]);
    toast.success("Barra de atalhos atualizada!");
    safeCloseDialog(onClose);
  };

  const dockSlots = slots.map((href) =>
    href ? pagesItems.find((p) => p.href === href) : null
  );

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) safeCloseDialog(onClose);
      }}
      maxWidth="sm"
      className="md:hidden"
      description="Personalize os atalhos exibidos na barra inferior do aplicativo."
    >
      <BaseDialog.Header
        title="Atalhos da Barra"
        icon={<SlidersHorizontal className="w-5 h-5" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="space-y-3">
        <Banner
          variant={hasEmptySlot ? "warning" : "info"}
          description={
            hasEmptySlot
              ? "Espaço vago! Toque em uma das opções abaixo para preencher."
              : "Toque no X de um atalho para liberar espaço para outro."
          }
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Barra do App
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {slots.filter(Boolean).length} de 3 selecionados
            </span>
          </div>

          <div className="flex items-stretch justify-between rounded-xl border border-slate-200 bg-slate-50/90 p-1 shadow-inner gap-1">
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg p-1 text-slate-400 opacity-60 select-none min-w-0">
              <div className="relative">
                <LayoutDashboard className="h-4 w-4" />
                <Lock className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5 text-slate-400" />
              </div>
              <span className="text-[9px] font-medium leading-tight">Início</span>
            </div>

            {dockSlots.map((item, idx) => {
              if (!item) {
                return (
                  <div
                    key={`empty-slot-${idx}`}
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg p-1 border-2 border-dashed border-amber-400 bg-amber-50/70 text-amber-700 min-w-0 animate-pulse"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-[8px] font-bold leading-tight">
                      Vazio
                    </span>
                  </div>
                );
              }

              const Icon = item.icon;

              return (
                <div
                  key={`dock-slot-${idx}`}
                  className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg p-1 min-w-0 bg-white shadow-xs border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => handleClearSlot(idx)}
                    title="Remover atalho"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-slate-600 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xs z-10 cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>

                  <Icon className="h-4 w-4 shrink-0 text-slate-700" />
                  <span className="text-[9px] font-bold text-slate-800 truncate max-w-full text-center leading-tight">
                    {item.title}
                  </span>
                </div>
              );
            })}

            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg p-1 text-slate-400 opacity-60 select-none min-w-0">
              <div className="relative">
                <Menu className="h-4 w-4" />
                <Lock className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5 text-slate-400" />
              </div>
              <span className="text-[9px] font-medium leading-tight">Mais</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 px-0.5">
            Recursos Disponíveis
          </span>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden max-h-48 overflow-y-auto">
            {availableItems.map((item) => {
              const isAlreadyInBar = slots.includes(item.href);
              const Icon = item.icon;

              return (
                <button
                  key={item.href}
                  type="button"
                  disabled={isAlreadyInBar || !hasEmptySlot}
                  onClick={() => handleSelectOption(item.href)}
                  className={cn(
                    "w-full flex items-center justify-between py-2 px-2.5 text-left transition-colors min-w-0",
                    isAlreadyInBar
                      ? "bg-slate-50/70 opacity-60 cursor-not-allowed"
                      : hasEmptySlot
                        ? "hover:bg-amber-50/50 cursor-pointer"
                        : "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                        isAlreadyInBar
                          ? "bg-slate-100 text-slate-400 border-slate-200"
                          : hasEmptySlot
                            ? "bg-white text-slate-700 border-slate-300 shadow-2xs"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <span className="text-xs font-bold text-slate-800 truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isAlreadyInBar ? (
                      <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                        Na barra
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center h-5 w-5 rounded-full border transition-colors",
                          hasEmptySlot
                            ? "border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "border-slate-200 text-slate-300"
                        )}
                      >
                        <Plus className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restaurar atalhos padrão</span>
        </button>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
        />
        <BaseDialog.Action
          label="Salvar"
          variant="primary"
          disabled={!isFull}
          onClick={handleSave}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
