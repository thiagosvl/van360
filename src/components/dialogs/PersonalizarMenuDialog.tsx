import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { useSession } from "@/hooks/business/useSession";
import { useBottomNavPreferences } from "@/hooks/business/useBottomNavPreferences";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Home, LayoutGrid, Lock, SlidersHorizontal, RotateCcw, Plus, X } from "lucide-react";

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
    toast.info("Atalhos restaurados para o padrão do app.");
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
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Barra do App
            </span>
            <span className="text-xs font-medium text-[#737373]">
              {slots.filter(Boolean).length} de 3 selecionados
            </span>
          </div>

          <div className="flex items-stretch justify-between rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-1.5 shadow-2xs gap-1.5">
            <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[14px] p-1.5 text-[#737373] opacity-60 select-none min-w-0">
              <div className="relative">
                <Home className="h-4 w-4 text-[#737373]" />
                <Lock className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5 text-[#737373]" />
              </div>
              <span className="text-[10px] font-medium leading-tight">Início</span>
            </div>

            {dockSlots.map((item, idx) => {
              if (!item) {
                return (
                  <div
                    key={`empty-slot-${idx}`}
                    className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[14px] p-1.5 border-2 border-dashed border-primary/40 bg-primary/5 text-primary min-w-0 animate-pulse"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-[10px] font-semibold leading-tight">
                      Vazio
                    </span>
                  </div>
                );
              }

              const Icon = item.icon;

              return (
                <div
                  key={`dock-slot-${idx}`}
                  className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[14px] p-1.5 min-w-0 bg-white shadow-2xs border border-[#e5e5e5]"
                >
                  <button
                    type="button"
                    onClick={() => handleClearSlot(idx)}
                    title="Remover atalho"
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#171717] text-white flex items-center justify-center hover:bg-[#e7000b] active:scale-90 transition-all shadow-xs z-10 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  <Icon className="h-4 w-4 shrink-0 text-[#0a0a0a]" />
                  <span className="text-[10px] font-semibold text-[#0a0a0a] truncate max-w-full text-center leading-tight">
                    {item.title}
                  </span>
                </div>
              );
            })}

            <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[14px] p-1.5 text-[#737373] opacity-60 select-none min-w-0">
              <div className="relative">
                <LayoutGrid className="h-4 w-4 text-[#737373]" />
                <Lock className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5 text-[#737373]" />
              </div>
              <span className="text-[10px] font-medium leading-tight">Menu</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] px-0.5">
            Recursos Disponíveis
          </span>

          <div className="divide-y divide-[#e5e5e5] rounded-[18px] border border-[#e5e5e5] bg-white overflow-hidden max-h-52 overflow-y-auto">
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
                    "w-full flex items-center justify-between py-2.5 px-3 text-left transition-colors min-w-0",
                    isAlreadyInBar
                      ? "bg-[#fafafa]/80 opacity-60 cursor-not-allowed"
                      : hasEmptySlot
                        ? "hover:bg-primary/5 cursor-pointer"
                        : "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border transition-colors",
                        isAlreadyInBar
                          ? "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
                          : hasEmptySlot
                            ? "bg-white text-[#0a0a0a] border-[#e5e5e5] shadow-2xs"
                            : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <span className="text-xs font-semibold text-[#0a0a0a] truncate">
                      {item.title}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isAlreadyInBar ? (
                      <span className="text-[11px] font-medium text-[#737373] px-2 py-0.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5]">
                        Na barra
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex items-center justify-center h-6 w-6 rounded-full border transition-all",
                          hasEmptySlot
                            ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-2xs"
                            : "border-[#e5e5e5] text-[#737373]/50"
                        )}
                      >
                        <Plus className="h-3.5 w-3.5" />
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
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
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
