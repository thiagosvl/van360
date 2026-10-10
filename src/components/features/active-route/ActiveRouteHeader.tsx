import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { XCircle, Route, Loader2, Play, Edit, Users, Bus, MapPin, School, Trash2, CheckCircle2, ChevronRight, CalendarDays, ArrowLeft } from "lucide-react";
import { RouteExecution, RouteExecutionStatus } from "@/types/route";
import { cn } from "@/lib/utils";

interface ActiveRouteHeaderProps {
  execucao?: RouteExecution | null;
  todasParadasCount: number;
  totalStops: number;
  concludedStops: number;
  progressPercentage: number;
  isPreview?: boolean;
  onBack?: () => void;
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
  onBack,
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
  onIniciarRota,
}: ActiveRouteHeaderProps) {
  const paradasCountDisplay = todasParadasCount || totalStops;
  const veiculo = execucao?.rota?.veiculo;
  const veiculoDisplay = veiculo?.modelo
    ? `${veiculo.modelo}${veiculo.placa ? ` (${veiculo.placa})` : ""}`
    : veiculo?.placa || null;
  const hasChamada = temAlunosVolta && !!onOpenChamadaRapida;

  return (
    <>
      {isPreview ? (
        <div className="space-y-3">
          {onBack && (
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-[#737373] hover:text-[#0a0a0a] hover:bg-white gap-1.5 -ml-2 font-medium text-xs h-8 sm:h-9 rounded-[18px] border border-transparent hover:border-[#e5e5e5] transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>

              <div className="flex items-center gap-1.5 shrink-0">
                {can("rotas.criar_editar") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onEditRoute}
                    className="h-8 px-3 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] font-medium text-xs shrink-0 cursor-pointer shadow-none transition-all flex items-center gap-1.5"
                    title="Configurar itinerário da rota"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </Button>
                )}

                {can("rotas.excluir") && onDeleteRoute && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDeleteRoute}
                    disabled={isDeletingRoute}
                    className="h-8 px-3 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#e7000b]/10 text-[#737373] hover:text-[#e7000b] hover:border-[#e7000b]/20 font-medium text-xs shrink-0 cursor-pointer shadow-none transition-all flex items-center gap-1.5"
                    title="Excluir esta rota"
                  >
                    {isDeletingRoute ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e7000b]" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Excluir</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-[#e5e5e5] p-4 sm:p-5 rounded-[24px] shadow-xs space-y-3.5 sm:space-y-4 text-left">
            <div className="space-y-1.5 text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight leading-snug break-words">
                {execucao?.rota?.nome}
              </h2>

              <div className="flex items-center gap-2 flex-wrap text-xs text-[#737373]">
                {totalEscolas > 0 ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[#737373]">
                    <School className="w-3.5 h-3.5 shrink-0" />
                    <span>{totalEscolas === 1 ? "1 escola" : `${totalEscolas} escolas`}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-[#737373]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{paradasCountDisplay === 1 ? "1 parada" : `${paradasCountDisplay} paradas`}</span>
                  </span>
                )}

                {totalAlunos > 0 && (
                  <>
                    <span className="text-[#d4d4d4]">•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#737373]">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>{totalAlunos === 1 ? "1 aluno" : `${totalAlunos} alunos`}</span>
                    </span>
                  </>
                )}

                {veiculoDisplay && (
                  <>
                    <span className="text-[#d4d4d4]">•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#737373]">
                      <Bus className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-none">{veiculoDisplay}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {hasChamada ? (
              <div className="space-y-2.5 pt-0.5 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5">
                <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-2.5 shrink-0">
                  {execucao?.rota_id && onOpenProximasAusencias && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onOpenProximasAusencias}
                      className="h-11 md:h-12 px-3 sm:px-4 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] font-medium text-xs sm:text-sm shadow-xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                      title="Ver e registrar ausências desta rota"
                    >
                      <CalendarDays className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Ausências</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenChamadaRapida}
                    className={cn(
                      "h-11 md:h-12 px-3 sm:px-4 rounded-[18px] font-medium text-xs sm:text-sm shadow-xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border",
                      chamadaRealizada
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/60"
                        : "bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] border-[#e5e5e5]"
                    )}
                    title={chamadaRealizada ? "Editar chamada de embarque" : "Fazer chamada de embarque"}
                  >
                    {chamadaRealizada ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Users className="w-4 h-4 text-[#0a0a0a] shrink-0" />
                    )}
                    <span>{chamadaRealizada ? "Chamada Feita" : "Chamada"}</span>
                  </Button>
                </div>

                {can("rotas.iniciar_encerrar") && (
                  <div className="w-full sm:flex-1">
                    {isVehicleOccupied ? (
                      <Banner
                        variant="warning"
                        title="INÍCIO BLOQUEADO"
                        description={
                          <span>
                            Veículo em execução na rota <strong className="font-semibold text-amber-950">{occupiedRouteName || "outra rota"}</strong>
                          </span>
                        }
                        className="p-3 rounded-[18px] border border-amber-500/20 shadow-xs w-full"
                      />
                    ) : (
                      <Button
                        onClick={onIniciarRota}
                        disabled={isLoading || isAnyActionBusy || iniciarMutation?.isPending}
                        className="w-full h-11 md:h-12 rounded-[18px] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.98] cursor-pointer transition-all border-none px-4"
                      >
                        {iniciarMutation?.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        ) : (
                          <Play className="w-4 h-4 shrink-0 fill-white text-white" />
                        )}
                        <span>Iniciar Rota</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pt-0.5">
                {execucao?.rota_id && onOpenProximasAusencias && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenProximasAusencias}
                    className="h-11 md:h-12 px-4 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] font-medium text-xs sm:text-sm shadow-xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                    title="Ver e registrar ausências desta rota"
                  >
                    <CalendarDays className="w-4 h-4 text-amber-500 shrink-0" />
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
                            Veículo em execução na rota <strong className="font-semibold text-amber-950">{occupiedRouteName || "outra rota"}</strong>
                          </span>
                        }
                        className="p-3 rounded-[18px] border border-amber-500/20 shadow-xs flex-1"
                      />
                    ) : (
                      <Button
                        onClick={onIniciarRota}
                        disabled={isLoading || isAnyActionBusy || iniciarMutation?.isPending}
                        className="flex-1 h-11 md:h-12 rounded-[18px] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.98] cursor-pointer transition-all border-none px-4"
                      >
                        {iniciarMutation?.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        ) : (
                          <Play className="w-4 h-4 shrink-0 fill-white text-white" />
                        )}
                        <span>Iniciar Rota</span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {onBack && (
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-[#737373] hover:text-[#0a0a0a] hover:bg-white gap-1.5 -ml-2 font-medium text-xs h-8 sm:h-9 rounded-[18px] border border-transparent hover:border-[#e5e5e5] transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
            </div>
          )}

          <div className="bg-white border border-[#e5e5e5] p-4 sm:p-5 rounded-[24px] shadow-xs space-y-3.5 text-left">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight leading-snug break-words">
                    {execucao?.rota?.nome}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-[18px]">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span>Em Execução</span>
                  </span>
                </div>
              </div>

              {can("rotas.iniciar_encerrar") && execucao?.status === RouteExecutionStatus.INICIADA && (
                <Button
                  variant="outline"
                  className="rounded-[18px] border border-[#e7000b]/20 bg-white hover:bg-[#e7000b]/10 text-[#e7000b] font-medium text-xs shrink-0 h-8 px-3 gap-1.5 shadow-none cursor-pointer transition-all active:scale-95"
                  onClick={onCancel}
                  disabled={isLoading || isAnyActionBusy}
                >
                  <XCircle className="w-3.5 h-3.5 text-[#e7000b]" />
                  <span>Encerrar</span>
                </Button>
              )}
            </div>

            <div className="h-px bg-[#e5e5e5]" />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0a0a0a] flex-wrap gap-1">
                <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[#737373] font-medium">
                  <Route className="w-3.5 h-3.5 text-[#737373]" /> Progresso
                </span>
                <span className="text-xs font-medium text-[#737373]">
                  {concludedStops} de {totalStops} paradas ({progressPercentage}%)
                </span>
              </div>

              <div className="w-full bg-[#f5f5f5] rounded-full h-2 overflow-hidden border border-[#e5e5e5]/40">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}