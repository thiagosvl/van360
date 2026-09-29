import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { XCircle, Route, Loader2, Play, Edit, Users, Bus, MapPin, School, Trash2, CheckCircle2, ChevronRight, CalendarDays } from "lucide-react";
import { RouteExecution, RouteExecutionStatus } from "@/types/route";
import { cn } from "@/lib/utils";

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
  temAlunosVolta?: boolean;
  chamadaRealizada?: boolean;
  resumoChamada?: { presentes: number; total: number } | null;
  totalAlunos?: number;
  totalEscolas?: number;
  totalAlunosVolta?: number;
  onOpenProximasAusencias?: () => void;
  onOpenChamadaRapida?: () => void;
  onCancel: () => void;
  onEditRoute: () => void;
  onDeleteRoute?: () => void;
  isDeletingRoute?: boolean;
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
  temAlunosVolta = false,
  chamadaRealizada = false,
  resumoChamada = null,
  totalAlunos = 0,
  totalEscolas = 0,
  totalAlunosVolta = 0,
  onOpenProximasAusencias,
  onOpenChamadaRapida,
  onCancel,
  onEditRoute,
  onDeleteRoute,
  isDeletingRoute = false,
  onIniciarRota
}: ActiveRouteHeaderProps) {
  const paradasCountDisplay = todasParadasCount || totalStops;
  const veiculo = execucao?.rota?.veiculo;
  const veiculoDisplay = veiculo?.modelo
    ? `${veiculo.modelo}${veiculo.placa ? ` (${veiculo.placa})` : ""}`
    : veiculo?.placa || null;

  return (
    <>
      {isPreview ? (
        <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl shadow-xs space-y-3.5 sm:space-y-4 text-left">
          <div className="flex items-start justify-between gap-2.5 w-full">
            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="text-base sm:text-xl font-headline font-black text-[#1a3a5c] tracking-tight leading-snug break-words">
                {execucao?.rota?.nome}
              </h2>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] sm:text-[11px] font-semibold text-slate-500">
                {veiculoDisplay && (
                  <span className="inline-flex items-center gap-1 bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <Bus className="w-3 h-3 text-[#1a3a5c] shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{veiculoDisplay}</span>
                  </span>
                )}
                {totalEscolas > 0 ? (
                  <span className="inline-flex items-center gap-1 bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <School className="w-3 h-3 text-[#1a3a5c] shrink-0" />
                    <span>{totalEscolas === 1 ? "1 escola" : `${totalEscolas} escolas`}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <MapPin className="w-3 h-3 text-[#1a3a5c] shrink-0" />
                    <span>{paradasCountDisplay === 1 ? "1 parada" : `${paradasCountDisplay} paradas`}</span>
                  </span>
                )}
                {totalAlunos > 0 && (
                  <span className="inline-flex items-center gap-1 bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <Users className="w-3 h-3 text-[#1a3a5c] shrink-0" />
                    <span>{totalAlunos === 1 ? "1 aluno" : `${totalAlunos} alunos`}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {can("rotas.criar_editar") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onEditRoute}
                  className="h-8 px-2 sm:px-2.5 rounded-lg border-slate-200 text-slate-600 hover:text-[#1a3a5c] hover:bg-slate-50 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-all flex items-center gap-1.5"
                  title="Configurar itinerário da rota"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}

              {can("rotas.excluir") && onDeleteRoute && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onDeleteRoute}
                  disabled={isDeletingRoute}
                  className="h-8 px-2 sm:px-2.5 rounded-lg border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-all flex items-center gap-1.5"
                  title="Excluir esta rota"
                >
                  {isDeletingRoute ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              )}
            </div>
          </div>

          {temAlunosVolta && onOpenChamadaRapida && (
            <div
              onClick={onOpenChamadaRapida}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 shadow-2xs group active:scale-[0.99]",
                chamadaRealizada
                  ? "bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-50"
                  : "bg-[#1a3a5c]/5 border-[#1a3a5c]/15 hover:bg-[#1a3a5c]/10"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors",
                    chamadaRealizada
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-[#1a3a5c] border border-slate-200/80"
                  )}
                >
                  {chamadaRealizada ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <Users className="w-4.5 h-4.5 stroke-[2.2]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-bold leading-tight",
                        chamadaRealizada ? "text-emerald-900" : "text-[#1a3a5c]"
                      )}
                    >
                      {chamadaRealizada ? "Chamada Concluída" : "Chamada de Embarque"}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-[11px] font-medium leading-snug mt-0.5 line-clamp-1",
                      chamadaRealizada ? "text-emerald-700" : "text-slate-500"
                    )}
                  >
                    {chamadaRealizada && resumoChamada
                      ? `${resumoChamada.presentes} de ${resumoChamada.total} alunos presentes`
                      : totalAlunosVolta > 0
                        ? `Conferir ${totalAlunosVolta} ${totalAlunosVolta === 1 ? "aluno" : "alunos"} antes de sair`
                        : "Conferir alunos antes de iniciar o trajeto"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <span
                  className={cn(
                    "hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all",
                    chamadaRealizada
                      ? "bg-emerald-600 text-white shadow-2xs group-hover:bg-emerald-700"
                      : "bg-[#1a3a5c] text-white shadow-2xs group-hover:bg-[#16314f]"
                  )}
                >
                  <span>{chamadaRealizada ? "Editar" : "Fazer Chamada"}</span>
                </span>
                <ChevronRight className={cn(
                  "w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5",
                  chamadaRealizada ? "text-emerald-700" : "text-[#1a3a5c]"
                )} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            {execucao?.rota_id && onOpenProximasAusencias && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenProximasAusencias}
                className="h-12 md:h-14 px-4 md:px-5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-[#1a3a5c] font-bold text-sm shadow-xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                title="Ver e registrar ausências desta rota"
              >
                <CalendarDays className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                <span>Ausências</span>
              </Button>
            )}

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
                    className="p-3 rounded-xl border border-amber-200/90 shadow-2xs flex-1"
                  />
                ) : (
                  <Button
                    onClick={onIniciarRota}
                    disabled={isLoading || isAnyActionBusy || iniciarMutation?.isPending}
                    className="flex-1 h-12 md:h-14 rounded-2xl font-headline font-black text-sm md:text-base flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 active:scale-[0.98] cursor-pointer transition-all border-none tracking-wide uppercase px-4 md:px-6"
                  >
                    {iniciarMutation?.isPending ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin shrink-0" />
                    ) : (
                      <Play className="w-4.5 h-4.5 shrink-0 fill-white text-white" />
                    )}
                    <span>INICIAR ROTA</span>
                  </Button>
                )}
              </>
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