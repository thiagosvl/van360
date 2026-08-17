import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { XCircle, UserMinus, Route, Loader2, Play, AlertTriangle, Edit } from "lucide-react";
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
  isAnyActionBusy?: boolean;
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
  isAnyActionBusy = false,
  onOpenAusenciaDialog,
  onCancel,
  onEditRoute,
  onIniciarRota
}: ActiveRouteHeaderProps) {
  const paradasCountDisplay = todasParadasCount || totalStops;

  return (
    <>
      {isPreview ? (
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-3.5 text-left">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-headline font-extrabold text-[#1a3a5c] tracking-tight leading-snug break-words">
                {execucao?.rota?.nome}
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500 shrink-0">
              {paradasCountDisplay === 1 ? "1 parada" : `${paradasCountDisplay} paradas`}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 pt-0.5">
            {can("rotas.iniciar_encerrar") && (
              <>
                {isVehicleOccupied ? (
                  <Banner
                    variant="warning"
                    title="INÍCIO BLOQUEADO"
                    description={
                      <span>
                        Veículo em execução na rota <strong className="font-bold text-amber-950">{occupiedRouteName || "outra rota"}</strong>
                      </span>
                    }
                    className="p-3 rounded-lg border border-amber-200/90 shadow-2xs"
                  />
                ) : (
                  <Button
                    onClick={onIniciarRota}
                    disabled={isLoading || isAnyActionBusy || iniciarMutation?.isPending}
                    className="h-14 w-full rounded-lg font-extrabold text-base flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.98] cursor-pointer transition-all border-none"
                  >
                    {iniciarMutation?.isPending ? (
                      <Loader2 className="w-5.5 h-5.5 animate-spin shrink-0" />
                    ) : (
                      <Play className="w-5.5 h-5.5 shrink-0 fill-white text-white" />
                    )}
                    <span>INICIAR ROTA</span>
                  </Button>
                )}
              </>
            )}

            {execucao?.rota_id && (
              <div className="flex items-center gap-2 w-full pt-0.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenAusenciaDialog}
                  className="flex-1 min-w-0 h-9.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] font-bold text-xs shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 px-2.5"
                  title="Registrar ausência antecipada de um passageiro"
                >
                  <UserMinus className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">Registrar Ausência</span>
                </Button>

                {can("rotas.criar_editar") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onEditRoute}
                    className="h-9.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] font-bold text-xs shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 px-3"
                    title="Configurar itinerário e passageiros"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#1a3a5c] shrink-0" />
                    <span>Editar</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-3 text-left">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-headline font-extrabold text-[#1a3a5c] tracking-tight leading-snug break-words">
                  {execucao?.rota?.nome}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>EM EXECUÇÃO</span>
                </span>
              </div>
            </div>

            {can("rotas.iniciar_encerrar") && execucao?.status === RouteExecutionStatus.INICIADA && (
              <Button
                variant="outline"
                className="rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-[11px] shrink-0 h-8 px-2.5 gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                onClick={onCancel}
                disabled={isLoading || isAnyActionBusy}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>ENCERRAR</span>
              </Button>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#1a3a5c] flex-wrap gap-1">
              <span className="flex items-center gap-1 uppercase text-[10px] tracking-wider text-slate-500 font-bold">
                <Route className="w-3.5 h-3.5 text-slate-400" /> Progresso
              </span>
              <span className="text-[11px] font-bold text-slate-600">
                {concludedStops} de {totalStops} paradas ({progressPercentage}%)
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