import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, School, UserMinus, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteNodeType, RouteStopStatus, RouteSentido } from "@/types/route";
import { formatShortName } from "@/utils/formatters";

interface RouteCompletedStopItemProps {
  parada: any;
  showTopLine: boolean;
  showBottomLine: boolean;
  onDesfazer?: () => void;
  isDesfazendo?: boolean;
  disabled?: boolean;
}

export function RouteCompletedStopItem({
  parada,
  showTopLine,
  showBottomLine,
  onDesfazer,
  isDesfazendo = false,
  disabled = false,
}: RouteCompletedStopItemProps) {
  const isAusente = parada.status === RouteStopStatus.AUSENTE || parada.is_ausente;
  const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;
  const isAntecipada = !!parada.ausencia_id || !!parada.is_ausente_antecipada;

  const statusLabel = isAusente ? "AUSENTE" : "CONCLUÍDO";
  const subtitleText = isEscolaItem
    ? "Parada na escola"
    : isAusente
      ? isAntecipada
        ? "Ausência notificada antecipadamente"
        : "Ausência notificada"
      : parada.sentido === RouteSentido.VOLTANDO
        ? "Desembarque concluído"
        : "Embarque concluído";

  return (
    <div className="relative w-full">
      {showTopLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
      )}
      {showBottomLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-1/2 bottom-[-24px] w-[2.5px] bg-slate-200/70 z-0" />
      )}

      {/* Ícone Indicador da Timeline (Padronizado: Ausente em Vermelho/Branco, Concluído/Escola Concluída em Verde/Branco) */}
      <div
        className={cn(
          "absolute left-[-26px] -translate-x-1/2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-xs transition-colors",
          isAusente
            ? "bg-rose-500 text-white"
            : "bg-emerald-600 text-white"
        )}
      >
        {isEscolaItem ? (
          <School className="w-3.5 h-3.5 text-white stroke-[2.2]" />
        ) : isAusente ? (
          <UserMinus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        ) : (
          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
        )}
      </div>

      {/* Card da Parada Concluída Discreto */}
      <div className="bg-slate-50 border border-slate-200/80 p-2.5 px-3 rounded-xl flex items-center justify-between gap-2.5 text-left min-h-[48px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 break-words">
              {isEscolaItem ? parada.escola?.nome : formatShortName(parada.passageiro?.nome || parada.nome, true)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
            {subtitleText}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isAusente && onDesfazer ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDesfazendo || disabled}
              onClick={(e) => {
                e.stopPropagation();
                onDesfazer();
              }}
              className="h-7.5 px-2.5 py-1 text-[11px] font-bold border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 shrink-0 active:scale-95 shadow-2xs"
              title="Desfazer registro de ausência"
            >
              {isDesfazendo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-rose-500" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
              <span>Desfazer</span>
            </Button>
          ) : (
            <Badge
              className={cn(
                "text-[9px] font-bold border px-1.5 py-0.5 rounded-md shrink-0 leading-none uppercase pointer-events-none select-none shadow-none cursor-default",
                isAusente
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              )}
            >
              {statusLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
