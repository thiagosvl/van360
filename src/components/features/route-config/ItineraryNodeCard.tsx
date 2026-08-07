import React from "react";
import { School, Trash2, ArrowUp, ArrowDown, AlertTriangle, Plus, Home, ListOrdered } from "lucide-react";
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
  const hasError = !!nodeError;
  const showTopLine = index > 0;
  const isLast = index === totalItems - 1;

  return (
    <div className="relative w-full">
      {/* Linha vertical conectora individual (Metade Superior estendida) */}
      {showTopLine && (
        <div className="absolute left-[-26px] -top-6 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
      )}
      {/* Linha vertical conectora individual (Metade Inferior estendida) */}
      <div className="absolute left-[-26px] top-1/2 -bottom-6 w-[2.5px] bg-slate-200/70 z-0" />
      {/* Círculo do Timeline contendo o ícone da escola ou o número exato da parada */}
      <span
        className={cn(
          "absolute left-[-39px] top-1/2 -translate-y-[calc(50%+8px)] h-7 w-7 rounded-full text-white flex items-center justify-center font-bold text-[11px] border-2 shadow-sm z-10 transition-colors",
          hasError
            ? "bg-rose-500 border-rose-500 shadow-md shadow-rose-200"
            : "bg-[#1a3a5c] border-white"
        )}
      >
        {isEscola ? <School className="w-4 h-4" /> : displayLabel}
      </span>

      {/* Card */}
      <div className="bg-white flex flex-col overflow-hidden text-left transition-all w-full rounded-2xl border border-slate-200 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] relative">
        {/* Conteúdo Superior: Lado Esquerdo (Dados + Tabs) + Lado Direito (Setas) */}
        <div className="flex w-full items-stretch min-h-[96px]">
          {/* Lado Esquerdo */}
          <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
            {isEscola ? (
              <div className="flex flex-col gap-1.5 min-w-0">
                {/* Nome da Escola + Lixeira */}
                <div className="w-full flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <School className="w-5 h-5 text-[#1a3a5c] shrink-0" />
                    <span className="font-bold text-sm text-[#1a3a5c] leading-snug block break-words">
                      {item.nome}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0 cursor-pointer -mt-0.5"
                    title="Remover Escola"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Lista Direta de Alunos (Desembarque e Embarque) */}
                {(() => {
                  const totalAlunos = desces.length + subes.length;

                  return (
                    <div className="mt-1.5 w-full space-y-1.5 text-left">
                      {totalAlunos === 0 ? (
                        <p className="text-[11px] text-slate-400 font-medium italic">
                          Nenhum passageiro vinculado nesta parada
                        </p>
                      ) : (
                        <>
                          {desces.length > 0 && (
                            <div className="text-[11px] leading-snug">
                              <span className="font-semibold text-slate-700">⬇️ Desembarque ({desces.length}): </span>
                              <span className="text-slate-500 font-normal">
                                {desces.map(d => formatShortName(d.passageiro?.nome || d.nome || "", true)).join(", ")}
                              </span>
                            </div>
                          )}
                          {subes.length > 0 && (
                            <div className="text-[11px] leading-snug">
                              <span className="font-semibold text-slate-700">⬆️ Embarque ({subes.length}): </span>
                              <span className="text-slate-500 font-normal">
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
                {/* Nome + Subtítulo + Lixeira */}
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex-1 min-w-0 pr-1">
                    <span className="font-bold text-sm text-[#1a3a5c] break-words leading-snug block">
                      {formatShortName(item.nome, true)}
                    </span>
                    {(item.passageiro?.escola?.nome || item.detalhe) && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1">
                        <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="break-words leading-snug">
                          {item.passageiro?.escola?.nome || item.detalhe?.replace("Escola: ", "")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-0.5">
                      <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="break-words">
                        {formatarEnderecoParcialRota(item.passageiro) || "Endereço não informado"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0 cursor-pointer -mt-0.5"
                    title="Remover Parada"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Abas Pill (Indo / Voltando) */}
                <div className="flex items-center w-full mt-1.5 mb-0.5">
                  <div className="w-full bg-slate-100 p-0.5 rounded-full flex items-center gap-0.5 border border-slate-200/60 shadow-inner">
                    <button
                      type="button"
                      onClick={() => onToggleSentido(index, RouteSentido.INDO)}
                      className={cn(
                        "flex-1 rounded-full py-1 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none",
                        (item.sentido === RouteSentido.INDO || !item.sentido)
                          ? "bg-[#1a3a5c] text-white font-bold shadow-xs"
                          : "text-slate-500 hover:text-slate-800 font-medium"
                      )}
                    >
                      <span>Indo</span>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSentido(index, RouteSentido.VOLTANDO)}
                      className={cn(
                        "flex-1 rounded-full py-1 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer select-none",
                        item.sentido === RouteSentido.VOLTANDO
                          ? "bg-[#1a3a5c] text-[#1a3a5c] font-bold shadow-xs text-white"
                          : "text-slate-500 hover:text-slate-800 font-medium"
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

          {/* Lado Direito: Ações de Reposicionamento */}
          <div className="w-[44px] flex flex-col border-l border-slate-100 shrink-0 bg-slate-50/50">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(index, "up")}
              className="flex-1 flex items-center justify-center text-slate-500 hover:bg-slate-100/80 hover:text-[#1a3a5c] disabled:opacity-25 disabled:hover:bg-transparent transition-all border-b border-slate-100 outline-none select-none"
              title="Mover para Cima"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            {onOpenReordenarSheet && (
              <button
                type="button"
                onClick={() => onOpenReordenarSheet(item)}
                className="flex-1 flex items-center justify-center text-[#1a3a5c] hover:bg-slate-100/80 transition-all border-b border-slate-100 outline-none select-none"
                title="Reordenar Posição da Parada"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              disabled={isLast}
              onClick={() => onMove(index, "down")}
              className="flex-1 flex items-center justify-center text-slate-500 hover:bg-slate-100/80 hover:text-[#1a3a5c] disabled:opacity-25 disabled:hover:bg-transparent transition-all outline-none select-none"
              title="Mover para Baixo"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerta de Erro Contextual Embutido */}
        {nodeError && (
          <div className="w-full bg-rose-50 border-t border-rose-200/80 p-2.5 px-3.5 flex items-center gap-2.5 text-xs text-rose-900 font-medium text-left animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{nodeError}</span>
          </div>
        )}
      </div>

      {/* Nó Intermediário da Linha do Tempo entre Cards */}
      {!isLast && (
        <div className="relative w-full h-4 flex items-center justify-center my-1 z-10">
          <div className="absolute left-[-26px] -top-3 -bottom-3 w-[2.5px] bg-slate-200/70 z-0" />
          <button
            type="button"
            onClick={() => onInsertIntermediary(index + 1)}
            className="absolute left-[-39px] top-1/2 -translate-y-1/2 -translate-y-[8px] w-7 h-7 rounded-full bg-white hover:bg-slate-100 border-2 border-dashed border-[#1a3a5c]/45 hover:border-[#1a3a5c] text-[#1a3a5c] flex items-center justify-center shrink-0 shadow-xs z-10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title={`Inserir parada entre as paradas ${index + 1} e ${index + 2}`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        </div>
      )}
    </div>
  );
};