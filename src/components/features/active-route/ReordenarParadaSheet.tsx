import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronUp, ChevronDown, AlertTriangle, Loader2 } from "lucide-react";
import { RouteNodeType, ExecucaoParada } from "@/types/route";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { validarItinerarioPronto } from "@/utils/domain/route/routeRules";
import { cn } from "@/lib/utils";

interface ReordenarParadaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  paradaTarget: ExecucaoParada | null;
  totalPendentes: ExecucaoParada[];
  paradasConcluidas: ExecucaoParada[];
  execucaoTipo?: string;
  isConfigMode?: boolean;
  validarMovimentoPermitido: (
    tipo: string,
    index: number,
    direction: "up" | "down",
    pendentes: any[],
    concluidas: any[]
  ) => boolean;
  onConfirmReordenação: (novasParadas: ExecucaoParada[]) => Promise<void> | void;
  escolasList?: any[];
}

interface InsertionPoint {
  targetIndex: number;
  label: string;
  subtext?: string;
}

const getNodeDisplayInfo = (node: any, escolasList?: any[]) => {
  if (!node) return { name: "", subtext: "" };

  const isEscola = node.tipo_no === RouteNodeType.ESCOLA;
  if (isEscola) {
    const escFromList = escolasList && (node.escola_id || node.escola?.id)
      ? escolasList.find((e: any) => e.id === (node.escola_id || node.escola?.id))
      : null;
    const escObj = node.escola || escFromList || node;
    const name = node.escola?.nome || node.nome || escFromList?.nome || node.escola_nome || "Escola";
    const subtext = formatarEnderecoParcialRota(escObj) || "";
    return { name, subtext };
  } else {
    const passObj = node.passageiro || node;
    const rawName = node.passageiro?.nome || node.nome || "";
    const name = formatShortName(rawName, true);
    const subtext = formatarEnderecoParcialRota(passObj) || "";
    return { name, subtext };
  }
};

export function ReordenarParadaSheet({
  isOpen,
  onClose,
  paradaTarget,
  totalPendentes,
  paradasConcluidas,
  execucaoTipo = "",
  isConfigMode,
  validarMovimentoPermitido,
  onConfirmReordenação,
  escolasList,
}: ReordenarParadaSheetProps) {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledOnOpenRef = useRef(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const isConfig = isConfigMode !== undefined ? isConfigMode : (!execucaoTipo || execucaoTipo === "");

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
      if (targetIdx === currentIndex) continue;

      let labelText = "";
      let subtextStr = "";

      const tempPendentes = [...totalPendentes];
      const [removed] = tempPendentes.splice(currentIndex, 1);
      tempPendentes.splice(targetIdx, 0, removed);

      const isValid = isConfig || validarItinerarioPronto(
        execucaoTipo,
        [...(paradasConcluidas || []), ...tempPendentes]
      ).isPronto;

      if (isValid) {
        if (targetIdx === 0) {
          if (isConfig) {
            labelText = "Primeira parada da rota";
            subtextStr = "Início do trajeto";
          } else {
            labelText = "Próxima parada";
            subtextStr = "Será a parada atual a ser atendida";
          }
        } else {
          const prevItem = tempPendentes[targetIdx - 1];
          const info = getNodeDisplayInfo(prevItem, escolasList);
          labelText = `Depois de ${info.name}`;
          subtextStr = info.subtext;
        }
        result.push({ targetIndex: targetIdx, label: labelText, subtext: subtextStr });
      }
    }

    return result;
  }, [paradaTarget, currentIndex, totalPendentes, isConfig, execucaoTipo, paradasConcluidas, validarMovimentoPermitido, escolasList]);

  useEffect(() => {
    if (isOpen && currentIndex !== -1) {
      setSelectedTargetIndex(null);
      setIsSubmitting(false);
      hasScrolledOnOpenRef.current = false;
    }
  }, [isOpen, currentIndex]);

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

  const targetInfo = getNodeDisplayInfo(paradaTarget, escolasList);
  const targetNome = targetInfo.name;

  const alternativePointsCount = validInsertionPoints.length;
  const hasNoAlternativePositions = !isConfig && alternativePointsCount === 0;

  const isSamePositionOrNull = selectedTargetIndex === null;

  const handleConfirm = async () => {
    if (isSamePositionOrNull || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newPendentes = [...totalPendentes];
      const [removed] = newPendentes.splice(currentIndex, 1);
      newPendentes.splice(selectedTargetIndex, 0, removed);
      await onConfirmReordenação(newPendentes);
      onClose();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DrawerContent className="max-w-md mx-auto rounded-t-[32px] bg-white border-none p-0 flex flex-col overflow-hidden shadow-2xl pb-0">
        <DrawerHeader className="pt-2 pb-4 px-6 bg-white border-b border-slate-100 flex flex-col items-center justify-center text-center shrink-0 sticky top-0 z-20">
          <DrawerTitle className="text-xl font-extrabold text-[#1a3a5c] font-headline tracking-tight">
            Reordenar Parada
          </DrawerTitle>
          <span className="text-xs font-normal text-slate-400 mt-0.5">
            Mover <span className="font-medium text-slate-600">{targetNome}</span> para outra posição
          </span>
        </DrawerHeader>

        <div className="px-3 py-3 sm:px-4 bg-[#eef2f6] text-left">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col gap-2 relative">
            <h3 className="text-xs font-semibold text-slate-600">
              Escolha a nova posição:
            </h3>

            {hasNoAlternativePositions && (
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 my-1 flex items-start gap-2.5 text-xs text-amber-900 text-left shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="font-bold block text-amber-950">
                    Reordenação restrita pelas regras da rota
                  </strong>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    {paradaTarget?.tipo_no === RouteNodeType.ESCOLA
                      ? "Esta escola não pode ser movida para baixo pois todos os alunos no sentido Voltando (Desembarque) devem ser entregues obrigatoriamente após a escola."
                      : "Esta parada não pode ser movida para outras posições devido às regras de sentido (Indo / Voltando)."}
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              {canScrollUp && (
                <div className="absolute -top-1.5 left-0 right-0 h-5 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10 flex items-center justify-center">
                  <ChevronUp className="w-4 h-4 text-[#1a3a5c]/70 animate-bounce" />
                </div>
              )}

              <div
                ref={scrollContainerRef}
                onScroll={checkScrollState}
                className="max-h-[300px] sm:max-h-[340px] overflow-y-auto px-2 pt-1 pb-1 space-y-1.5 scrollbar-thin scroll-smooth"
              >
                {validInsertionPoints.map((pt) => {
                  const isSelected = selectedTargetIndex === pt.targetIndex;

                  return (
                    <div
                      key={pt.targetIndex}
                      ref={isSelected ? activeItemRef : null}
                      onClick={() => {
                        if (isSubmitting) return;
                        setSelectedTargetIndex(pt.targetIndex);
                        setTimeout(checkScrollState, 50);
                      }}
                      className={cn(
                        "relative flex items-center gap-2.5 py-3 px-3.5 transition-all select-none rounded-xl border cursor-pointer",
                        isSelected
                          ? "bg-[#1a3a5c]/5 border-2 border-[#1a3a5c] text-[#1a3a5c] shadow-2xs"
                          : "bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all self-center ml-0.5",
                          isSelected
                            ? "border-[5px] border-[#1a3a5c] bg-white"
                            : "border-2 border-slate-300"
                        )}
                      />

                      <div className="flex flex-col min-w-0 flex-1 text-left ml-1">
                        <span
                          className={cn(
                            "text-xs font-bold leading-snug break-words",
                            isSelected ? "text-[#1a3a5c]" : "text-slate-800"
                          )}
                        >
                          {pt.label}
                        </span>

                        {pt.subtext && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-1">
                            {pt.targetIndex !== 0 && (
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 self-start mt-0.5" />
                            )}
                            <span className="break-words leading-snug">{pt.subtext}</span>
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
            disabled={isSamePositionOrNull || isSubmitting}
            onClick={handleConfirm}
            className={cn(
              "w-full font-extrabold h-12 rounded-xl text-sm shadow-md transition-all active:scale-[0.98]",
              isSamePositionOrNull || isSubmitting
                ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none opacity-80"
                : "bg-[#1a3a5c] hover:bg-[#15304d] text-white shadow-[#1a3a5c]/20"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Reordenando...</span>
              </span>
            ) : isSamePositionOrNull ? (
              "Selecione uma nova posição"
            ) : (
              "Confirmar Nova Posição"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default ReordenarParadaSheet;
