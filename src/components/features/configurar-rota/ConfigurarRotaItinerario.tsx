import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItineraryNodeCard } from "@/components/features/route-config/ItineraryNodeCard";
import { getAlunosEscolaPorPosicao } from "@/hooks/business/useRouteRules";

interface ConfigurarRotaItinerarioProps {
  itinerario: any[];
  errosPorNo: Record<string, string>;
  listBottomRef: React.RefObject<HTMLDivElement | null>;
  showTopAddButton?: boolean;
  onToggleSentido: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (index: number) => void;
  onInsertIntermediary: (index: number) => void;
  onOpenReordenarSheet: (item: any) => void;
  onOpenModalParadaGeral: () => void;
}

export function ConfigurarRotaItinerario({
  itinerario,
  errosPorNo,
  listBottomRef,
  showTopAddButton,
  onToggleSentido,
  onMove,
  onRemove,
  onInsertIntermediary,
  onOpenReordenarSheet,
  onOpenModalParadaGeral,
}: ConfigurarRotaItinerarioProps) {
  const shouldShowTopButton = showTopAddButton !== undefined ? showTopAddButton : itinerario.length >= 3;

  return (
    <div id="itinerario-container" className="bg-transparent scroll-mt-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <h2 className="text-sm font-semibold text-[#0a0a0a]">
          {itinerario.length === 1 ? "1 parada" : `${itinerario.length} paradas`}
        </h2>
        {shouldShowTopButton && (
          <Button
            type="button"
            size="sm"
            onClick={onOpenModalParadaGeral}
            className="h-8 px-3 rounded-[18px] bg-primary hover:bg-primary-hover text-white font-medium text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-in fade-in duration-200"
            title="Adicionar Parada no Final"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Adicionar Parada</span>
          </Button>
        )}
      </div>

      <div className="relative pl-10 sm:pl-11">
        {itinerario.map((item, index) => {
          const { desces, subes } = getAlunosEscolaPorPosicao(itinerario, index);
          return (
            <ItineraryNodeCard
              key={item.id}
              item={item}
              index={index}
              totalItems={itinerario.length}
              nodeError={errosPorNo[item.id]}
              desces={desces}
              subes={subes}
              onToggleSentido={onToggleSentido}
              onMove={onMove}
              onRemove={onRemove}
              onInsertIntermediary={onInsertIntermediary}
              onOpenReordenarSheet={onOpenReordenarSheet}
            />
          );
        })}

        <div className="relative w-full my-3.5">
          {itinerario.length > 0 && (
            <div className="absolute left-[-26px] -top-6 bottom-1/2 w-[2px] bg-[#e5e5e5] z-0" />
          )}
          <button
            type="button"
            onClick={onOpenModalParadaGeral}
            className="absolute left-[-39px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white hover:bg-[#fafafa] border border-dashed border-[#737373]/60 hover:border-[#0a0a0a] text-[#0a0a0a] flex items-center justify-center shrink-0 shadow-xs z-10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Adicionar Parada no Final"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <Button
            type="button"
            onClick={onOpenModalParadaGeral}
            className="w-full h-11 bg-white hover:bg-[#fafafa] border border-dashed border-[#e5e5e5] hover:border-[#0a0a0a] text-[#0a0a0a] font-medium text-xs rounded-[18px] shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Parada</span>
          </Button>
        </div>
        <div ref={listBottomRef} />
      </div>
    </div>
  );
}
