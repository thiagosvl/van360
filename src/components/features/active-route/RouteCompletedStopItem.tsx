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
}

export function RouteCompletedStopItem({
  parada,
  showTopLine,
  showBottomLine,
  onDesfazer,
  isDesfazendo = false,
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
        <div className="absolute left-[-26px] top-1/2 bottom-[-24px] w-[2.5px] bg-slate-200/70 z-0" />
      )}

      <span
        className={cn(
          "absolute left-[-39px] top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center font-extrabold text-[11px] border-2 shadow-sm z-10 pointer-events-none select-none",
          isAusente
            ? "bg-white border-rose-400 text-rose-500"
            : "bg-emerald-500 border-emerald-500 text-white"
        )}
      >
        {isAusente ? (
          <UserMinus className="w-4 h-4 text-rose-500" />
        ) : isEscolaItem ? (
          <School className="w-4 h-4 text-white" />
        ) : (
          <Check className="w-4 h-4 text-white" />
        )}
      </span>

      <div className="bg-slate-50/70 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between gap-3 shadow-2xs opacity-65 min-h-[52px] transition-all select-none">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {isEscolaItem && <School className="w-3.5 h-3.5 text-[#1a3a5c] shrink-0" />}
            <h4 className="text-[11px] font-bold text-left break-words leading-tight pr-2 text-[#1a3a5c]">
              {isEscolaItem
                ? parada.escola?.nome
                : formatShortName(parada.passageiro?.nome || "", true)}
            </h4>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 text-left truncate">
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
              disabled={isDesfazendo}
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
