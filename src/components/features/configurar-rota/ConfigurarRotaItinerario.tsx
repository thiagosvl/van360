import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItineraryNodeCard } from "@/components/features/route-config/ItineraryNodeCard";
import { getAlunosEscolaPorPosicao } from "@/hooks/business/useRouteRules";

interface ConfigurarRotaItinerarioProps {
  itinerario: any[];
  errosPorNo: Record<string, string>;
  listBottomRef: React.RefObject<HTMLDivElement | null>;
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
  onToggleSentido,
  onMove,
  onRemove,
  onInsertIntermediary,
  onOpenReordenarSheet,
  onOpenModalParadaGeral,
}: ConfigurarRotaItinerarioProps) {
  return (
    <div id="itinerario-container" className="bg-transparent scroll-mt-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-sm font-bold text-[#1a3a5c] font-headline">
          Itinerário
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {itinerario.length} paradas
        </span>
      </div>

      <div className="relative pl-10 sm:pl-11">
        {/* Renderização das Paradas Intermediárias */}
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

        {/* Botão "Adicionar Parada" no Rodapé do Itinerário */}
        <div className="relative w-full my-3.5">
          {itinerario.length > 0 && (
            <div className="absolute left-[-26px] -top-6 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
          )}
          <button
            type="button"
            onClick={onOpenModalParadaGeral}
            className="absolute left-[-39px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white hover:bg-slate-100 border-2 border-dashed border-[#1a3a5c]/45 hover:border-[#1a3a5c] text-[#1a3a5c] flex items-center justify-center shrink-0 shadow-xs z-10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Adicionar Parada no Final"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
          </button>
          <Button
            type="button"
            onClick={onOpenModalParadaGeral}
            className="w-full h-11 bg-white hover:bg-[#1a3a5c]/5 border-2 border-dashed border-[#1a3a5c]/30 hover:border-[#1a3a5c] text-[#1a3a5c] font-extrabold uppercase text-xs tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>Adicionar Parada</span>
          </Button>
        </div>
        <div ref={listBottomRef} />
      </div>
    </div>
  );
}
