import { Badge } from "@/components/ui/badge";
import { Route, School, Calendar, Timer } from "lucide-react";
import { RouteCompletedStopItem } from "./RouteCompletedStopItem";
import { cn } from "@/lib/utils";
import { RouteExecutionStatus, RouteNodeType } from "@/types/route";
import { formatShortName, formatarDuracao, formatarDataCurtaBR, formatarHoraMinuto } from "@/utils/formatters";

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

  const duracaoTexto = formatarDuracao(execucao?.iniciada_em, execucao?.finalizada_em);
  const dataExecucao = formatarDataCurtaBR(execucao?.iniciada_em);
  const horaInicio = formatarHoraMinuto(execucao?.iniciada_em);
  const horaFim = formatarHoraMinuto(execucao?.finalizada_em);
  const intervaloHorario = horaInicio && horaFim ? `${horaInicio} - ${horaFim}` : (horaInicio || horaFim);

  return (
    <div className="space-y-5 text-left">
      <div className="bg-white border border-[#e5e5e5] p-4 sm:p-5 rounded-[24px] shadow-xs space-y-3.5 text-left">
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="space-y-1 min-w-0 pr-1 text-left">
            <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-snug break-words">
              {execucao?.rota?.nome || "Rota"}
            </h2>
            <div className="pt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium border leading-none",
                  isCancelada
                    ? "bg-red-50 text-[#e7000b] border-red-200/60"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isCancelada ? "bg-[#e7000b]" : "bg-emerald-500"
                  )}
                />
                <span>{isCancelada ? "Cancelada" : "Concluída"}</span>
              </span>
            </div>

            <div className="text-xs text-[#737373] font-normal pt-1 space-y-1">
              {dataExecucao && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span>
                    Data: {dataExecucao}
                    {intervaloHorario ? `, ${intervaloHorario}` : ""}
                  </span>
                </div>
              )}
              {duracaoTexto && (
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span>Duração: <strong className="font-semibold text-[#0a0a0a]">{duracaoTexto}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#e5e5e5]" />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#0a0a0a]">
            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[#737373] font-medium">
              <Route className="w-3.5 h-3.5 text-[#737373]" /> Progresso
            </span>
            <span className="text-[11px] font-medium bg-[#f5f5f5] text-[#0a0a0a] px-2.5 py-0.5 rounded-[18px] border border-[#e5e5e5] leading-none">
              {concludedStops} de {totalStops} paradas ({progressPercentage}%)
            </span>
          </div>

          <div className="w-full bg-[#f5f5f5] rounded-full h-2 overflow-hidden border border-[#e5e5e5]/40">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCancelada ? "bg-[#e7000b]" : "bg-emerald-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative flex flex-col gap-6 pl-10 pb-1 text-left">
        {displayParadasConcluidas.map((parada, index) => {
          const absIndex = index;
          const showTopLine = absIndex > 0;
          const showBottomLine = absIndex < totalTimelineItems - 1;

          return (
            <RouteCompletedStopItem
              key={parada.id}
              parada={parada}
              showTopLine={showTopLine}
              showBottomLine={showBottomLine}
            />
          );
        })}

        {displayProximasParadas.map((parada, index) => {
          const absIndex = displayParadasConcluidas.length + index;
          const showTopLine = absIndex > 0;
          const showBottomLine = absIndex < totalTimelineItems - 1;
          const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;

          return (
            <div key={parada.id} className="relative w-full">
              {showTopLine && (
                <div className="absolute left-[-26px] top-0 bottom-1/2 w-[2px] bg-[#e5e5e5] z-0" />
              )}
              {showBottomLine && (
                <div className="absolute left-[-26px] top-1/2 bottom-[-24px] w-[2px] bg-[#e5e5e5] z-0" />
              )}

              <span className="absolute left-[-26px] -translate-x-1/2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-[#f5f5f5] border-2 border-white text-[#737373] flex items-center justify-center font-semibold text-[11px] shadow-xs z-10">
                {isEscolaItem ? <School className="w-3.5 h-3.5 text-[#737373]" /> : (parada.ordem || absIndex + 1)}
              </span>

              <div className="bg-white border border-[#e5e5e5] p-3 rounded-[18px] flex items-center justify-between gap-3 shadow-xs opacity-60 min-h-[50px] transition-all">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-left break-words leading-tight pr-2 text-[#0a0a0a]">
                    {isEscolaItem
                      ? `🏫 ${parada.escola?.nome}`
                      : formatShortName(parada.passageiro?.nome || "", true)}
                  </h4>
                  <p className="text-[10px] text-[#737373] font-normal leading-none mt-0.5 text-left truncate">
                    Parada não realizada
                  </p>
                </div>

                <span className="bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5] text-[11px] font-medium px-2.5 py-0.5 rounded-[18px] shrink-0 leading-none">
                  Não realizada
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
