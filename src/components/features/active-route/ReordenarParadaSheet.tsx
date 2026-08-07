import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronUp, ChevronDown } from "lucide-react";
import { RouteNodeType, ExecucaoParada } from "@/types/route";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ReordenarParadaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  paradaTarget: ExecucaoParada | null;
  totalPendentes: ExecucaoParada[];
  paradasConcluidas: ExecucaoParada[];
  execucaoTipo: string;
  validarMovimentoPermitido: (
    tipo: string,
    index: number,
    direction: "up" | "down",
    pendentes: any[],
    concluidas: any[]
  ) => boolean;
  onConfirmReordenação: (novasParadas: ExecucaoParada[]) => void;
}

interface InsertionPoint {
  targetIndex: number;
  label: string;
  subtext?: string;
}

export function ReordenarParadaSheet({
  isOpen,
  onClose,
  paradaTarget,
  totalPendentes,
  paradasConcluidas,
  execucaoTipo,
  validarMovimentoPermitido,
  onConfirmReordenação,
}: ReordenarParadaSheetProps) {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number | null>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledOnOpenRef = useRef(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 5);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 5);
  }, []);

  const currentIndex = useMemo(() => {
    if (!paradaTarget) return -1;
    return totalPendentes.findIndex((p) => p.id === paradaTarget.id);
  }, [paradaTarget, totalPendentes]);

  const validInsertionPoints = useMemo(() => {
    if (!paradaTarget || currentIndex === -1) return [];

    const result: InsertionPoint[] = [];

    for (let targetIdx = 0; targetIdx < totalPendentes.length; targetIdx++) {
      let labelText = "";
      let subtextStr = "";

      if (targetIdx === currentIndex) {
        const prevItem = totalPendentes[currentIndex - 1];
        if (prevItem) {
          labelText = `Depois de ${
            prevItem.tipo_no === RouteNodeType.ESCOLA
              ? prevItem.escola?.nome || "Escola"
              : formatShortName(prevItem.passageiro?.nome || prevItem.nome || "", true)
          }`;
          subtextStr = formatarEnderecoParcialRota(
            prevItem.tipo_no === RouteNodeType.ESCOLA ? prevItem.escola : prevItem.passageiro
          ) || "";
        } else {
          labelText = "Primeira parada da rota";
          const firstItem = totalPendentes[0];
          if (firstItem) {
            subtextStr = formatarEnderecoParcialRota(
              firstItem.tipo_no === RouteNodeType.ESCOLA ? firstItem.escola : firstItem.passageiro
            ) || "";
          }
        }
        result.push({ targetIndex: currentIndex, label: labelText, subtext: subtextStr });
        continue;
      }

      const tempPendentes = [...totalPendentes];
      const [removed] = tempPendentes.splice(currentIndex, 1);
      tempPendentes.splice(targetIdx, 0, removed);

      const isValid = validarMovimentoPermitido(
        execucaoTipo,
        currentIndex,
        targetIdx < currentIndex ? "up" : "down",
        totalPendentes,
        paradasConcluidas
      );

      if (isValid) {
        if (targetIdx === 0) {
          labelText = "Primeira parada da rota";
          const firstItem = tempPendentes[0];
          if (firstItem) {
            subtextStr = formatarEnderecoParcialRota(
              firstItem.tipo_no === RouteNodeType.ESCOLA ? firstItem.escola : firstItem.passageiro
            ) || "";
          }
        } else {
          const prevItem = tempPendentes[targetIdx - 1];
          labelText = `Depois de ${
            prevItem.tipo_no === RouteNodeType.ESCOLA
              ? prevItem.escola?.nome || "Escola"
              : formatShortName(prevItem.passageiro?.nome || prevItem.nome || "", true)
          }`;
          subtextStr = formatarEnderecoParcialRota(
            prevItem.tipo_no === RouteNodeType.ESCOLA ? prevItem.escola : prevItem.passageiro
          ) || "";
        }
        result.push({ targetIndex: targetIdx, label: labelText, subtext: subtextStr });
      }
    }

    return result;
  }, [paradaTarget, currentIndex, totalPendentes, execucaoTipo, paradasConcluidas, validarMovimentoPermitido]);

  useEffect(() => {
    if (isOpen && currentIndex !== -1) {
      setSelectedTargetIndex(currentIndex);
      hasScrolledOnOpenRef.current = false;
    }
  }, [isOpen, currentIndex]);

  // Rola para centralizar o item selecionado APENAS UMA VEZ ao abrir o drawer
  useEffect(() => {
    if (isOpen && !hasScrolledOnOpenRef.current && activeItemRef.current) {
      hasScrolledOnOpenRef.current = true;
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        checkScrollState();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, checkScrollState]);

  if (!paradaTarget || currentIndex === -1) return null;

  const isTargetEscola = paradaTarget.tipo_no === RouteNodeType.ESCOLA;
  const targetNome = isTargetEscola
    ? paradaTarget.escola?.nome || "Escola"
    : formatShortName(paradaTarget.passageiro?.nome || paradaTarget.nome || "", true);

  const handleConfirm = () => {
    if (selectedTargetIndex === null || selectedTargetIndex === currentIndex) {
      onClose();
      return;
    }
    const newPendentes = [...totalPendentes];
    const [removed] = newPendentes.splice(currentIndex, 1);
    newPendentes.splice(selectedTargetIndex, 0, removed);
    onConfirmReordenação(newPendentes);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-w-md mx-auto rounded-t-[32px] bg-white border-none p-0 flex flex-col overflow-hidden shadow-2xl pb-0">
        <DrawerHeader className="pt-2 pb-4 px-6 bg-white border-b border-slate-100 flex flex-col items-center justify-center text-center shrink-0 sticky top-0 z-20">
          <DrawerTitle className="text-xl font-extrabold text-[#1a3a5c] font-headline tracking-tight">
            Reordenar Parada
          </DrawerTitle>
          <span className="text-xs font-semibold text-slate-500 mt-0.5">
            {targetNome}
          </span>
        </DrawerHeader>

        <div className="px-5 py-4 bg-[#eef2f6] text-left">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col gap-2.5 relative">
            <h3 className="text-xs font-bold text-[#1a3a5c]">
              Escolha o ponto de encaixe:
            </h3>

            <div className="relative">
              {canScrollUp && (
                <div className="absolute -top-1.5 left-0 right-0 h-5 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10 flex items-center justify-center">
                  <ChevronUp className="w-4 h-4 text-[#1a3a5c]/70 animate-bounce" />
                </div>
              )}

              <div
                ref={scrollContainerRef}
                onScroll={checkScrollState}
                className="max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scroll-smooth"
              >
                {validInsertionPoints.map((pt) => {
                  const isSelected = selectedTargetIndex === pt.targetIndex;
                  return (
                    <div
                      key={pt.targetIndex}
                      ref={isSelected ? activeItemRef : null}
                      onClick={() => {
                        setSelectedTargetIndex(pt.targetIndex);
                        setTimeout(checkScrollState, 50);
                      }}
                      className={cn(
                        "flex items-center gap-3 py-2.5 px-3 transition-all cursor-pointer select-none rounded-xl",
                        isSelected
                          ? "bg-[#1a3a5c]/5 border-2 border-[#1a3a5c] text-[#1a3a5c] shadow-2xs"
                          : "bg-transparent border-b border-slate-100/90 last:border-b-0 text-slate-700 hover:bg-slate-50/80"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all self-center",
                          isSelected
                            ? "border-[5px] border-[#1a3a5c] bg-white"
                            : "border-2 border-slate-300"
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1 text-left">
                        <span className={cn("text-xs font-bold leading-tight break-words", isSelected ? "text-[#1a3a5c]" : "text-slate-800")}>
                          {pt.label}
                        </span>
                        {pt.subtext && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{pt.subtext}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {canScrollDown && (
                <div className="absolute -bottom-1.5 left-0 right-0 h-5 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10 flex items-center justify-center">
                  <ChevronDown className="w-4 h-4 text-[#1a3a5c]/70 animate-bounce" />
                </div>
              )}
            </div>
          </div>
        </div>

        <DrawerFooter className="px-5 pt-0 pb-[calc(1.25rem+var(--safe-area-bottom))] bg-[#eef2f6] border-none shrink-0">
          <Button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-[#1a3a5c] hover:bg-[#15304d] text-white font-extrabold h-12 rounded-xl text-sm shadow-md shadow-[#1a3a5c]/20 transition-all active:scale-[0.98]"
          >
            Confirmar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
