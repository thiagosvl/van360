import { Button } from "@/components/ui/button";
import { XCircle, UserMinus, Route, Loader2, Play, AlertTriangle, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteExecution, RouteExecutionStatus } from "@/types/route";

interface ActiveRouteHeaderProps {
  execucao?: RouteExecution | null;
  todasParadasCount: number;
  totalStops: number;
  concludedStops: number;
  progressPercentage: number;
  isPreview?: boolean;
  isVehicleOccupied?: boolean;
  occupiedRouteName?: string;
  iniciarMutation?: { isPending?: boolean; mutate?: (id: string, options?: any) => void };
  isLoading: boolean;
  can: (permission: string) => boolean;
  onOpenAusenciaDialog: () => void;
  onCancel: () => void;
  onEditRoute: () => void;
  onIniciarRota: () => void;
}

export function ActiveRouteHeader({
  execucao,
  todasParadasCount,
  totalStops,
  concludedStops,
  progressPercentage,
  isPreview = false,
  isVehicleOccupied = false,
  occupiedRouteName = "",
  iniciarMutation,
  isLoading,
  can,
  onOpenAusenciaDialog,
  onCancel,
  onEditRoute,
  onIniciarRota
}: ActiveRouteHeaderProps) {
  const paradasCountDisplay = todasParadasCount || totalStops;

  return (
    <>
      {isPreview ? (
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-sm space-y-3.5 text-left">
          <div className="space-y-1 min-w-0 pr-1">
            <h2 className="text-xl font-extrabold text-[#1a3a5c] font-headline tracking-tight leading-snug break-words">
              {execucao?.rota?.nome || "Rota"}
            </h2>
            <p className="text-xs font-medium text-slate-400 leading-none pt-0.5">
              {paradasCountDisplay === 1 ? "1 PARADA" : `${paradasCountDisplay} PARADAS`}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {execucao?.rota_id && (
              <div className="flex items-center gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenAusenciaDialog}
                  className="flex-1 min-w-0 h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] font-bold text-xs sm:text-sm shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 px-3.5"
                  title="Registrar ausência antecipada de um passageiro"
                >
                  <UserMinus className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate uppercase">Registrar Ausência</span>
                </Button>

                {can("rotas.criar_editar") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onEditRoute}
                    className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center"
                    title="Configurar itinerário e passageiros"
                  >
                    <Edit className="w-4 h-4 text-[#1a3a5c] shrink-0" />
                  </Button>
                )}
              </div>
            )}

            {can("rotas.iniciar_encerrar") && (
              <div className="space-y-2 w-full">
                <Button
                  onClick={onIniciarRota}
                  disabled={isLoading || isVehicleOccupied || iniciarMutation?.isPending}
                  className={cn(
                    "h-12 w-full rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 border-none transition-all",
                    isVehicleOccupied
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none opacity-80"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.98] cursor-pointer"
                  )}
                >
                  {iniciarMutation?.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  ) : (
                    <Play className={cn("w-5 h-5 shrink-0", isVehicleOccupied ? "fill-slate-400 text-slate-400" : "fill-white text-white")} />
                  )}
                  <span>INICIAR ROTA</span>
                </Button>

                {isVehicleOccupied && (
                  <div className="text-[11px] font-semibold text-amber-700/90 text-center flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Veículo em rota ({occupiedRouteName || "outra rota"})</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="space-y-1 min-w-0 pr-1 text-left">
              <h2 className="text-xl font-extrabold text-[#1a3a5c] font-headline tracking-tight leading-snug break-words">
                {execucao?.rota?.nome}
              </h2>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Em Execução
                </span>
              </div>
            </div>

            {can("rotas.iniciar_encerrar") && execucao?.status === RouteExecutionStatus.INICIADA && (
              <Button
                variant="outline"
                className="rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs shrink-0 h-9 px-3 gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                onClick={onCancel}
                disabled={isLoading}
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>ENCERRAR</span>
              </Button>
            )}
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
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}