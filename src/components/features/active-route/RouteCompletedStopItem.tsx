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

  const statusLabel = isAusente ? "AUSENTE" : "CONCLUÍDO";
  const subtitleText = isEscolaItem
    ? "Parada na escola"
    : isAusente
      ? "Passageiro não embarcou"
      : parada.sentido === RouteSentido.VOLTANDO
        ? "Desembarque realizado"
        : "Embarque realizado";

  return (
    <div className="relative w-full">
      {showTopLine && (
        <div className="absolute left-[-26px] top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
      )}
      {showBottomLine && (
        <div className="absolute left-[-26px] top-1/2 bottom-0 w-[2.5px] bg-slate-200/70 z-0" />
      )}

      {/* Ícone Indicador */}
      <div className="absolute left-[-37px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center z-10 shadow-2xs">
        {isEscolaItem ? (
          <School className="w-3 h-3 text-slate-400" />
        ) : isAusente ? (
          <UserMinus className="w-3 h-3 text-rose-500" />
        ) : (
          <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
        )}
      </div>

      {/* Card da Parada Concluída */}
      <div className="bg-slate-50/60 border border-slate-100 p-3 rounded-xl flex items-center justify-between gap-3 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 truncate">
              {formatShortName(isEscolaItem ? parada.escola?.nome : (parada.passageiro?.nome || parada.nome), true)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
            {subtitleText}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge
            className={cn(
              "text-[9px] font-bold border px-1.5 py-0.5 rounded-md shrink-0 leading-none uppercase pointer-events-none select-none shadow-none cursor-default",
              isAusente
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
            )}
          >
            {statusLabel}
          </Badge>

          {isAusente && onDesfazer && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDesfazendo || disabled}
              onClick={(e) => {
                e.stopPropagation();
                onDesfazer();
              }}
              className="h-6 px-2 text-[9px] font-bold border-rose-200 bg-white hover:bg-rose-50 text-rose-600 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Desfazer ausência do aluno"
            >
              {isDesfazendo ? (
                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              ) : (
                <RotateCcw className="w-3 h-3 shrink-0" />
              )}
              <span>Desfazer</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
