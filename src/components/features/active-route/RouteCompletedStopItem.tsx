import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, School, UserMinus, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteNodeType, RouteStopStatus, RouteSentido, RouteExecutionPassenger } from "@/types/route";
import { formatShortName } from "@/utils/formatters";

interface RouteCompletedStopItemProps {
  parada: RouteExecutionPassenger | any;
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

  const statusLabel = isAusente ? "Ausente" : "Concluído";
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
        <div className="absolute left-[-26px] -translate-x-1/2 top-0 bottom-1/2 w-[2px] bg-[#e5e5e5] z-0" />
      )}
      {showBottomLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-1/2 bottom-[-24px] w-[2px] bg-[#e5e5e5] z-0" />
      )}

      <div
        className={cn(
          "absolute left-[-26px] -translate-x-1/2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-xs transition-colors",
          isAusente
            ? "bg-[#e7000b] text-white"
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

      <div className="bg-[#fafafa] border border-[#e5e5e5] p-3 rounded-[18px] flex items-center justify-between gap-3 text-left min-h-[48px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0a0a0a] break-words">
              {isEscolaItem ? parada.escola?.nome : formatShortName(parada.passageiro?.nome || parada.nome, true)}
            </span>
          </div>
          <p className="text-[11px] text-[#737373] font-normal leading-tight mt-0.5">
            {subtitleText}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onDesfazer ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDesfazendo || disabled}
              onClick={(e) => {
                e.stopPropagation();
                onDesfazer();
              }}
              className={cn(
                "h-7.5 px-3 py-1 text-xs font-medium bg-white rounded-[18px] border border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f5f5f5] flex items-center gap-1.5 shrink-0 active:scale-95 shadow-none transition-colors",
                isAusente && "hover:text-[#e7000b] hover:border-[#e7000b]/20"
              )}
              title={isAusente ? "Desfazer registro de ausência" : "Desfazer conclusão da parada"}
            >
              {isDesfazendo ? (
                <Loader2 className={cn("w-3.5 h-3.5 animate-spin shrink-0", isAusente ? "text-[#e7000b]" : "text-[#0a0a0a]")} />
              ) : (
                <RotateCcw className={cn("w-3.5 h-3.5 shrink-0", isAusente ? "text-[#e7000b]" : "text-[#737373]")} />
              )}
              <span>Desfazer</span>
            </Button>
          ) : (
            <span
              className={cn(
                "inline-flex items-center justify-center text-[11px] font-medium border px-2.5 py-0.5 rounded-[18px] shrink-0 leading-none pointer-events-none select-none shadow-none cursor-default",
                isAusente
                  ? "bg-red-50 text-[#e7000b] border-red-200/60"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
              )}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
