import { Badge } from "@/components/ui/badge";
import {
  Check, Route, School, UserMinus, Calendar, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteExecutionStatus, RouteNodeType, RouteStopStatus, RouteSentido } from "@/types/route";
import { formatShortName, formatDateTime } from "@/utils/formatters";

interface ActiveRouteHistoryViewProps {
  execucao: any;
  paradasConcluidas: any[];
  proximasParadas: any[];
  concludedStops: number;
  totalStops: number;
  progressPercentage: number;
}

export function ActiveRouteHistoryView({
  execucao,
  paradasConcluidas,
  proximasParadas,
  concludedStops,
  totalStops,
  progressPercentage,
}: ActiveRouteHistoryViewProps) {
  const isCancelada = execucao?.status === RouteExecutionStatus.CANCELADA;

  const displayParadasConcluidas = [...paradasConcluidas].sort((a, b) => a.ordem - b.ordem);
  const displayProximasParadas = [...proximasParadas].sort((a, b) => a.ordem - b.ordem);

  const totalTimelineItems = displayParadasConcluidas.length + displayProximasParadas.length;

  const duracaoTexto = execucao?.finalizada_em && execucao?.iniciada_em
    ? `${Math.round((new Date(execucao.finalizada_em).getTime() - new Date(execucao.iniciada_em).getTime()) / 60000)} min`
    : null;

  return (
    <div className="space-y-5 text-left">
      {/* Card de Progresso Estático com Data e Duração */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3.5 text-left">
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="space-y-1 min-w-0 pr-1 text-left">
            <h2 className="text-xl font-extrabold text-[#1a3a5c] font-headline tracking-tight leading-snug break-words">
              {execucao?.rota?.nome || "Rota"}
            </h2>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isCancelada ? "bg-rose-500" : "bg-emerald-500"
              )} />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isCancelada ? "text-rose-600" : "text-emerald-600"
              )}>
                {isCancelada ? "Cancelada" : "Concluída"}
              </span>
            </div>

            {/* Data e Duração da Execução */}
            <div className="text-xs text-slate-400 font-medium pt-1 flex flex-wrap items-center gap-2">
              {execucao?.iniciada_em && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateTime(execucao.iniciada_em)}
                </span>
              )}
              {duracaoTexto && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {duracaoTexto}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#1a3a5c]">
            <span className="flex items-center gap-1.5 uppercase text-[9px] tracking-wider text-slate-500 font-bold">
              <Route className="w-3.5 h-3.5 text-slate-400" /> Progresso
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase bg-[#1a3a5c]/5 text-[#1a3a5c] px-2 py-0.5 rounded-md">
              {concludedStops} de {totalStops} Paradas ({progressPercentage}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", isCancelada ? "bg-rose-500" : "bg-emerald-500")}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* TIMELINE UNIFICADO DE PARADAS DA ROTA HISTÓRICA */}
      <div className="relative flex flex-col gap-6 pl-10 pb-1 text-left">
        {/* PARADAS CONCLUÍDAS / REALIZADAS */}
        {displayParadasConcluidas.map((parada, index) => {
          const absIndex = index;
          const showTopLine = absIndex > 0;
          const showBottomLine = absIndex < totalTimelineItems - 1;

          const isAusente = parada.status === RouteStopStatus.AUSENTE;
          const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;

          const statusLabel = isAusente ? "AUSENTE" : "CONCLUÍDO";
          const subtitleText = isEscolaItem
            ? "Parada na escola"
            : isAusente
              ? "Não embarcado"
              : parada.sentido === RouteSentido.VOLTANDO
                ? "Passageiro desembarcado"
                : "Passageiro embarcado";

          return (
            <div key={parada.id} className="relative w-full">
              {showTopLine && (
                <div className="absolute left-[-26px] top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
              )}
              {showBottomLine && (
                <div className="absolute left-[-26px] top-1/2 bottom-[-24px] w-[2.5px] bg-slate-200/70 z-0" />
              )}

              <span className={cn(
                "absolute left-[-39px] top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center font-extrabold text-[11px] border-2 shadow-sm z-10",
                isAusente
                  ? "bg-white border-rose-400 text-rose-500"
                  : "bg-emerald-500 border-emerald-500 text-white"
              )}>
                {isAusente ? (
                  <UserMinus className="w-4 h-4 text-rose-500" />
                ) : isEscolaItem ? (
                  <School className="w-4 h-4 text-white" />
                ) : (
                  <Check className="w-4 h-4 text-white" />
                )}
              </span>

              <div className="bg-slate-50/70 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs opacity-65 min-h-[52px] transition-all">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-bold text-left break-words leading-tight pr-2 text-[#1a3a5c]">
                    {isEscolaItem
                      ? `🏫 ${parada.escola?.nome}`
                      : formatShortName(parada.passageiro?.nome || "", true)}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 text-left truncate">
                    {subtitleText}
                  </p>
                </div>

                <Badge className={cn(
                  "text-[9px] font-bold border px-1.5 py-0.5 rounded-md shrink-0 leading-none uppercase",
                  isAusente ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                )}>
                  {statusLabel}
                </Badge>
              </div>
            </div>
          );
        })}

        {/* PARADAS NÃO REALIZADAS (Se a Rota foi Cancelada) */}
        {displayProximasParadas.map((parada, index) => {
          const absIndex = displayParadasConcluidas.length + index;
          const showTopLine = absIndex > 0;
          const showBottomLine = absIndex < totalTimelineItems - 1;
          const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;

          return (
            <div key={parada.id} className="relative w-full">
              {showTopLine && (
                <div className="absolute left-[-26px] top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
              )}
              {showBottomLine && (
                <div className="absolute left-[-26px] top-1/2 bottom-[-24px] w-[2.5px] bg-slate-200/70 z-0" />
              )}

              <span className="absolute left-[-39px] top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold text-[11px] shadow-2xs z-10">
                {isEscolaItem ? <School className="w-4 h-4 text-slate-400" /> : (parada.ordem || absIndex + 1)}
              </span>

              <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-2xs opacity-50 min-h-[52px] transition-all">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-bold text-left break-words leading-tight pr-2 text-slate-600">
                    {isEscolaItem
                      ? `🏫 ${parada.escola?.nome}`
                      : formatShortName(parada.passageiro?.nome || "", true)}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 text-left truncate">
                    Parada não realizada
                  </p>
                </div>

                <Badge className="bg-slate-100 text-slate-500 border border-slate-200/80 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 leading-none">
                  NÃO REALIZADA
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
