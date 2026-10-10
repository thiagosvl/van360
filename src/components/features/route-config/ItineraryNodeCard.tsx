import React from "react";
import { School, Trash2, ArrowUp, ArrowDown, Info, Plus, Home, ListOrdered } from "lucide-react";
import { RouteNodeType, RouteSentido } from "@/types/route";
import { Passageiro } from "@/types/passageiro";
import { Escola } from "@/types/escola";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export interface ItineraryItem {
  id: string;
  tipo_no: RouteNodeType;
  passageiro_id?: string;
  escola_id?: string;
  nome: string;
  detalhe?: string;
  temEndereco?: boolean;
  responsaveisAdicionais?: Array<{ id: string; nome: string; parentesco: string }>;
  passageiro?: Passageiro;
  escola?: Escola;
  sentido?: RouteSentido;
}

interface ItineraryNodeCardProps {
  item: ItineraryItem;
  index: number;
  totalItems: number;
  nodeError?: string;
  desces?: ItineraryItem[];
  subes?: ItineraryItem[];
  onToggleSentido: (index: number, sentido: RouteSentido) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (index: number) => void;
  onInsertIntermediary: (targetIndex: number) => void;
  onOpenReordenarSheet?: (item: ItineraryItem) => void;
}

export const ItineraryNodeCard: React.FC<ItineraryNodeCardProps> = ({
  item,
  index,
  totalItems,
  nodeError,
  desces = [],
  subes = [],
  onToggleSentido,
  onMove,
  onRemove,
  onInsertIntermediary,
  onOpenReordenarSheet,
}) => {
  const displayLabel = index + 1;
  const isEscola = item.tipo_no === RouteNodeType.ESCOLA;
  const showTopLine = index > 0;
  const isLast = index === totalItems - 1;

  return (
    <div className="relative w-full">
      {showTopLine && (
        <div className="absolute left-[-26px] -top-6 bottom-1/2 w-[2px] bg-[#e5e5e5] z-0" />
      )}
      <div className="absolute left-[-26px] top-1/2 -bottom-6 w-[2px] bg-[#e5e5e5] z-0" />

      <span
        className="absolute left-[-39px] top-1/2 -translate-y-[calc(50%+8px)] h-7 w-7 rounded-full text-white flex items-center justify-center font-semibold text-[11px] border-2 border-white bg-[#0a0a0a] shadow-xs z-10"
      >
        {isEscola ? <School className="w-3.5 h-3.5" /> : displayLabel}
      </span>

      <div className="bg-white flex flex-col overflow-hidden text-left transition-all w-full rounded-[24px] border border-[#e5e5e5] shadow-xs hover:border-[#d4d4d4] relative">
        <div className="flex w-full items-stretch min-h-[96px]">
          <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
            {isEscola ? (
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="w-full flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <School className="w-4.5 h-4.5 text-[#0a0a0a] shrink-0" />
                    <span className="font-semibold text-sm text-[#0a0a0a] leading-snug block break-words">
                      {item.nome}
                    </span>
                    {nodeError && (
                      <span title={nodeError} className="inline-flex shrink-0">
                        <Info className="w-3.5 h-3.5 text-primary" />
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1.5 text-[#737373] hover:text-[#e7000b] hover:bg-[#e7000b]/10 rounded-full transition-colors shrink-0 cursor-pointer -mt-0.5"
                    title="Remover Escola"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {(() => {
                  const totalAlunos = desces.length + subes.length;

                  return (
                    <div className="mt-1.5 w-full space-y-1 text-left">
                      {totalAlunos === 0 ? (
                        <p className="text-xs text-[#737373] font-normal italic">
                          Nenhum aluno vinculado nesta parada
                        </p>
                      ) : (
                        <>
                          {desces.length > 0 && (
                            <div className="text-xs leading-snug">
                              <span className="font-semibold text-[#0a0a0a]">⬇️ Desembarque ({desces.length}): </span>
                              <span className="text-[#737373] font-normal">
                                {desces.map(d => formatShortName(d.passageiro?.nome || d.nome || "", true)).join(", ")}
                              </span>
                            </div>
                          )}
                          {subes.length > 0 && (
                            <div className="text-xs leading-snug">
                              <span className="font-semibold text-[#0a0a0a]">⬆️ Embarque ({subes.length}): </span>
                              <span className="text-[#737373] font-normal">
                                {subes.map(s => formatShortName(s.passageiro?.nome || s.nome || "", true)).join(", ")}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-[#0a0a0a] break-words leading-snug">
                        {formatShortName(item.nome, true)}
                      </span>
                      {nodeError && (
                        <span title={nodeError} className="inline-flex shrink-0">
                          <Info className="w-3.5 h-3.5 text-primary" />
                        </span>
                      )}
                    </div>
                    {(item.passageiro?.escola?.nome || item.detalhe) && (
                      <div className="flex items-center gap-1.5 text-xs font-normal text-[#737373] mt-1">
                        <School className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                        <span className="break-words leading-snug">
                          {item.passageiro?.escola?.nome || item.detalhe?.replace("Escola: ", "")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-normal text-[#737373] mt-0.5">
                      <Home className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                      <span className="break-words">
                        {formatarEnderecoParcialRota(item.passageiro) || "Sem endereço cadastrado"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1.5 text-[#737373] hover:text-[#e7000b] hover:bg-[#e7000b]/10 rounded-full transition-colors shrink-0 cursor-pointer -mt-0.5"
                    title="Remover Parada"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center w-full mt-1.5 mb-0.5">
                  <div className="w-full bg-[#f5f5f5] p-0.5 rounded-[18px] flex items-center gap-0.5 border border-[#e5e5e5]">
                    <button
                      type="button"
                      onClick={() => onToggleSentido(index, RouteSentido.INDO)}
                      className={cn(
                        "flex-1 rounded-[16px] py-1 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none",
                        (item.sentido === RouteSentido.INDO || !item.sentido)
                          ? "bg-primary text-primary-foreground font-medium shadow-xs"
                          : "text-[#737373] hover:text-[#0a0a0a] font-normal"
                      )}
                    >
                      <span>Indo</span>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSentido(index, RouteSentido.VOLTANDO)}
                      className={cn(
                        "flex-1 rounded-[16px] py-1 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none",
                        item.sentido === RouteSentido.VOLTANDO
                          ? "bg-primary text-primary-foreground font-medium shadow-xs"
                          : "text-[#737373] hover:text-[#0a0a0a] font-normal"
                      )}
                    >
                      <span>Voltando</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-[44px] flex flex-col border-l border-[#e5e5e5] shrink-0 bg-[#fafafa]">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(index, "up")}
              className="flex-1 flex items-center justify-center text-[#737373] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] disabled:opacity-25 disabled:hover:bg-transparent transition-all border-b border-[#e5e5e5] outline-none select-none cursor-pointer"
              title="Mover para Cima"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            {onOpenReordenarSheet && (
              <button
                type="button"
                onClick={() => onOpenReordenarSheet(item)}
                className="flex-1 flex items-center justify-center text-[#0a0a0a] hover:bg-[#f0f0f0] transition-all border-b border-[#e5e5e5] outline-none select-none cursor-pointer"
                title="Reordenar Posição da Parada"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              disabled={isLast}
              onClick={() => onMove(index, "down")}
              className="flex-1 flex items-center justify-center text-[#737373] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] disabled:opacity-25 disabled:hover:bg-transparent transition-all outline-none select-none cursor-pointer"
              title="Mover para Baixo"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {!isLast && (
        <div className="relative w-full h-4 flex items-center justify-center my-1 z-10">
          <div className="absolute left-[-26px] -top-3 -bottom-3 w-[2px] bg-[#e5e5e5] z-0" />
          <button
            type="button"
            onClick={() => onInsertIntermediary(index + 1)}
            className="absolute left-[-39px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white hover:bg-[#fafafa] border border-dashed border-[#737373]/60 hover:border-[#0a0a0a] text-[#0a0a0a] flex items-center justify-center shrink-0 shadow-xs z-10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title={`Inserir parada entre as paradas ${index + 1} e ${index + 2}`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};