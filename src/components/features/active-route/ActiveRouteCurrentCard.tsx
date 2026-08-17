import { RefObject, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, School, User, Check, UserMinus, ArrowUp, ArrowDown, Loader2, Play, UserCheck, CheckCheck, ListOrdered, Users, ChevronDown } from "lucide-react";
import { RouteNodeType, RouteStopStatus, RouteSentido, ExecucaoParada } from "@/types/route";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { podeReordenarParada } from "@/utils/domain/route/routeRules";
import { cn } from "@/lib/utils";
import { AddressDialogData } from "./AddressDetailsDialog";

interface ActiveRouteCurrentCardProps {
  parada: ExecucaoParada;
  activeCardRef?: RefObject<HTMLDivElement | null>;
  showTopLine: boolean;
  showBottomLine: boolean;
  isLastStop: boolean;
  selectedRespTab: string;
  setSelectedRespTab: (tab: string) => void;
  execucaoTipo: string;
  totalPendentesReal: any[];
  isAnyActionBusy: boolean;
  reorderingTarget: { index: number; direction: "up" | "down" } | null;
  reorderingSheetStopId?: string | null;
  validarMovimentoPermitido: (tipo: string, index: number, direction: "up" | "down", pendentes: any[], concluidas: any[]) => boolean;
  paradasConcluidas: any[];
  proximasParadas: any[];
  alunosParaEmbarcar: any[];
  alunosParaDesembarcar: any[];
  isLoading: boolean;
  isStepping: boolean;
  isFinalizing: boolean;
  onOpenAddressDialog: (data: AddressDialogData) => void;
  onMoveParada: (index: number, direction: "up" | "down") => void;
  onConfirmFalta: (id: string, nome: string) => void;
  onConfirmEmbarqueDialog: () => void;
  onDirectStep: () => void;
  onOpenChamadaDialog?: () => void;
  onOpenReordenarSheet?: (parada: any) => void;
}

export function ActiveRouteCurrentCard({
  parada,
  activeCardRef,
  showTopLine,
  showBottomLine,
  isLastStop,
  execucaoTipo,
  totalPendentesReal,
  isAnyActionBusy,
  reorderingTarget,
  reorderingSheetStopId,
  validarMovimentoPermitido,
  paradasConcluidas,
  alunosParaEmbarcar,
  alunosParaDesembarcar,
  isLoading,
  isStepping,
  isFinalizing,
  onOpenAddressDialog,
  onMoveParada,
  onConfirmFalta,
  onConfirmEmbarqueDialog,
  onDirectStep,
  onOpenChamadaDialog,
  onOpenReordenarSheet,
}: ActiveRouteCurrentCardProps) {
  const [isEmbarquesExpanded, setIsEmbarquesExpanded] = useState(false);
  const isEscola = parada.tipo_no === RouteNodeType.ESCOLA;
  const displayOrdem = parada.ordem || 0;
  const pass = parada.passageiro;

  const currentAddressStr = isEscola
    ? formatarEnderecoParcialRota(parada.escola)
    : formatarEnderecoParcialRota(pass);

  const activeAddressStr = isEscola
    ? formatarEnderecoParcialRota(parada.escola)
    : formatarEnderecoParcialRota(pass);

  const cardClass = "bg-white p-3.5 sm:p-4 rounded-2xl shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-200 text-left border-2 border-[#1a3a5c] relative z-10";

  let actionLabel = isLastStop ? "CONCLUIR" : "CONFIRMAR";
  if (parada.sentido === RouteSentido.VOLTANDO && !isEscola) {
    actionLabel = isLastStop ? "CONCLUIR" : "CONFIRMAR";
  }

  return (
    <div ref={activeCardRef} className="relative w-full">
      {showTopLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
      )}
      {showBottomLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-1/2 bottom-[-24px] w-[2.5px] bg-slate-200/70 z-0" />
      )}

      <span className="absolute left-[-26px] -translate-x-1/2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-white flex items-center justify-center font-bold text-[11px] border-2 shadow-md z-10 scale-110 ring-4 bg-[#1a3a5c] border-white ring-[#1a3a5c]/25">
        {isEscola ? <School className="w-4 h-4" /> : displayOrdem}
      </span>

      <div className={cardClass}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5 gap-1">
          <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-[#1a3a5c] uppercase tracking-wider shrink-0 bg-[#1a3a5c]/8 px-2 py-0.5 rounded-md border border-[#1a3a5c]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">{isLastStop ? "Atual" : "Atual"}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
            {!isEscola && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isAnyActionBusy}
                onClick={() => {
                  onOpenAddressDialog({
                    open: true,
                    title: parada.passageiro?.nome,
                    address: currentAddressStr || "",
                    tipoNo: RouteNodeType.PASSAGEIRO,
                    sentido: parada.sentido,
                    escolaNome: parada.passageiro?.escola?.nome,
                    passageiro: parada.passageiro
                  });
                }}
                className="h-8 w-8 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Ver endereço e detalhes da parada"
              >
                <MapPin className="w-4 h-4 text-[#1a3a5c]" />
              </Button>
            )}

            {totalPendentesReal.length > 1 && (() => {
              const index = 0;
              const isUpDisabled = true;
              const isUpReordering = reorderingTarget?.index === index && reorderingTarget?.direction === "up";
              const isDownReordering = reorderingTarget?.index === index && reorderingTarget?.direction === "down";

              const isDownDisabled =
                index === totalPendentesReal.length - 1 ||
                isAnyActionBusy ||
                !validarMovimentoPermitido(execucaoTipo, index, "down", totalPendentesReal, paradasConcluidas);

              return (
                <div className="flex items-center gap-1 border border-slate-200/80 rounded-lg max-[338px]:px-0 px-2 py-1 bg-slate-50/80 shrink-0 shadow-2xs h-9">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isUpDisabled || isAnyActionBusy}
                    className="h-8 w-8 sm:w-8.5 rounded-lg text-slate-400 opacity-20 shrink-0 cursor-not-allowed flex items-center justify-center p-0"
                    title="Subir parada (já está ativa)"
                  >
                    {isUpReordering ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1a3a5c]" />
                    ) : (
                      <ArrowUp className="w-4 h-4 stroke-[2.25]" />
                    )}
                  </Button>
                  <div className="w-px h-5 bg-slate-200/80 my-auto shrink-0" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isDownDisabled || isAnyActionBusy}
                    onClick={() => onMoveParada(index, "down")}
                    className="h-8 w-8 sm:w-8.5 rounded-lg text-slate-600 hover:bg-slate-200/80 active:bg-slate-300 disabled:opacity-20 shrink-0 flex items-center justify-center p-0 transition-colors"
                    title="Descer parada ativa"
                  >
                    {isDownReordering ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1a3a5c]" />
                    ) : (
                      <ArrowDown className="w-4 h-4 stroke-[2.25]" />
                    )}
                  </Button>
                  {onOpenReordenarSheet && (() => {
                    const canReorder = podeReordenarParada(execucaoTipo, index, totalPendentesReal, paradasConcluidas);
                    const isSheetReorderingThisCard = reorderingSheetStopId === parada.id;
                    return (
                      <>
                        <div className="w-px h-5 bg-slate-200/80 my-auto shrink-0" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={!canReorder || isAnyActionBusy}
                          onClick={() => canReorder && !isAnyActionBusy && onOpenReordenarSheet(parada)}
                          className={cn(
                            "h-8 w-8 sm:w-8.5 rounded-lg shrink-0 flex items-center justify-center p-0 transition-colors",
                            canReorder && !isAnyActionBusy
                              ? "text-[#1a3a5c] hover:bg-slate-200/80 active:bg-slate-300 cursor-pointer"
                              : "text-slate-400 opacity-20 cursor-not-allowed"
                          )}
                          title={canReorder ? "Reordenar posição da parada ativa" : "Nenhuma posição alternativa disponível"}
                        >
                          {isSheetReorderingThisCard ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#1a3a5c]" />
                          ) : (
                            <ListOrdered className="w-4 h-4 stroke-[2.25]" />
                          )}
                        </Button>
                      </>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        </div>

        {isEscola ? (
          <div className="space-y-3.5">
            <div className="space-y-1.5 text-left w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <School className="w-5 h-5 text-[#1a3a5c] shrink-0" />
                <h2 className="text-base font-bold text-[#1a3a5c] font-headline leading-snug break-words">
                  {parada.escola?.nome}
                </h2>
              </div>
              {activeAddressStr && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 text-left pl-7.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-words">{activeAddressStr}</span>
                </div>
              )}
            </div>

            <Tabs defaultValue={alunosParaEmbarcar.length > 0 ? "embarques" : "desembarques"} className="w-full mt-3">
              <div className="bg-slate-100/80 p-1 rounded-lg">
                <TabsList className="grid grid-cols-2 w-full bg-transparent p-0 h-8">
                  <TabsTrigger
                    value="embarques"
                    className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs text-slate-500 py-1"
                  >
                    Embarques ({alunosParaEmbarcar.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="desembarques"
                    className="rounded-lg text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-[#1a3a5c] data-[state=active]:shadow-2xs text-slate-500 py-1"
                  >
                    Desembarques ({alunosParaDesembarcar.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="embarques" className="mt-2.5 space-y-1.5 focus-visible:outline-none">
                {alunosParaEmbarcar.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium py-3 text-center bg-slate-50/50 rounded-lg border border-slate-100">
                    Nenhum embarque nesta parada
                  </p>
                ) : (
                  <>
                    {(() => {
                      const MAX_VISIBLE_EMBARQUES = 7;
                      const hasManyEmbarques = alunosParaEmbarcar.length > MAX_VISIBLE_EMBARQUES;
                      const visibleEmbarques = (hasManyEmbarques && !isEmbarquesExpanded)
                        ? alunosParaEmbarcar.slice(0, MAX_VISIBLE_EMBARQUES)
                        : alunosParaEmbarcar;

                      return (
                        <>
                          {visibleEmbarques.map((aluno) => {
                            const isPendente = aluno.status === RouteStopStatus.PENDENTE;
                            const isABordo = aluno.status === RouteStopStatus.EMBARCADO;

                            return (
                              <div key={aluno.id} className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-xs font-medium text-[#1a3a5c]">
                                    {formatShortName(aluno.passageiro?.nome || aluno.nome, true)}
                                  </span>
                                </div>
                                {isPendente ? (
                                  <Button
                                    type="button"
                                    onClick={() => onConfirmFalta(aluno.id, aluno.passageiro?.nome || aluno.nome)}
                                    disabled={isLoading}
                                    className="h-8 px-2.5 bg-white border border-rose-200/80 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 transition-all active:scale-95"
                                  >
                                    <UserMinus className="w-3 h-3 text-rose-500" />
                                    <span>AUSENTE</span>
                                  </Button>
                                ) : isABordo ? (
                                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs" title="Embarcado">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border border-rose-100 bg-rose-50 text-rose-600 shrink-0 leading-none">
                                    AUSENTE
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {hasManyEmbarques && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEmbarquesExpanded((prev) => !prev)}
                              className="w-full h-8 text-xs font-bold text-[#1a3a5c] hover:bg-slate-100/80 rounded-lg flex items-center justify-center gap-1.5 transition-all mt-1 cursor-pointer"
                            >
                              <span>
                                {isEmbarquesExpanded
                                  ? "Ocultar embarques"
                                  : `Exibir mais ${alunosParaEmbarcar.length - MAX_VISIBLE_EMBARQUES} embarque${(alunosParaEmbarcar.length - MAX_VISIBLE_EMBARQUES) > 1 ? "s" : ""}`}
                              </span>
                              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isEmbarquesExpanded && "rotate-180")} />
                            </Button>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </TabsContent>

              <TabsContent value="desembarques" className="mt-2.5 space-y-1.5 focus-visible:outline-none">
                {alunosParaDesembarcar.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium py-3 text-center bg-slate-50/50 rounded-lg border border-slate-100">
                    Nenhum desembarque nesta parada
                  </p>
                ) : (
                  alunosParaDesembarcar.map((aluno) => {
                    const isAusente = aluno.status === RouteStopStatus.AUSENTE;
                    const isABordo = aluno.status === RouteStopStatus.EMBARCADO && !aluno.visitado_em;
                    const isConcluido = aluno.status === RouteStopStatus.EMBARCADO && !!aluno.visitado_em;

                    return (
                      <div key={aluno.id} className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-medium text-[#1a3a5c]">
                            {formatShortName(aluno.passageiro?.nome || aluno.nome, true)}
                          </span>
                        </div>
                        {isConcluido ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs" title="Desembarcado">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : isABordo ? (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border border-emerald-200/60 bg-emerald-50 text-emerald-700 shrink-0 leading-none">
                            EMBARCADO
                          </span>
                        ) : isAusente ? (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border border-rose-100 bg-rose-50 text-rose-600 shrink-0 leading-none">
                            AUSENTE
                          </span>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-left min-w-0">
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-[#1a3a5c] font-bold text-base sm:text-lg tracking-tight block">
                {formatShortName(parada.passageiro?.nome || parada.nome, true)}
              </span>
            </div>

            {currentAddressStr && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5 text-left">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="break-words">{currentAddressStr}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-1.5">
          {!isEscola ? (
            <div className="flex items-center gap-2 w-full min-w-0">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || isAnyActionBusy}
                onClick={() => onConfirmFalta(parada.id, parada.passageiro?.nome || "")}
                className="h-10 border-rose-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 shadow-2xs rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 bg-white px-2.5 shrink-0 min-w-0"
                title="Marcar como ausente hoje"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : (
                  <UserMinus className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>AUSENTE</span>
              </Button>

              <Button
                type="button"
                onClick={onConfirmEmbarqueDialog}
                disabled={isLoading || isStepping || isFinalizing || isAnyActionBusy}
                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold max-[320px]:text-[10px] text-[11px] sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2.5  whitespace-nowrap overflow-hidden"
              >
                {isStepping || isFinalizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : isLastStop ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="">{actionLabel}</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="">{actionLabel}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full min-w-0">
              {alunosParaEmbarcar.length > 0 && onOpenChamadaDialog && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || isStepping || isFinalizing || isAnyActionBusy}
                  onClick={onOpenChamadaDialog}
                  className="h-10 border-[#1a3a5c]/30 text-[#1a3a5c] hover:bg-[#1a3a5c]/5 font-bold max-[320px]:text-[10px] text-[11px] sm:text-xs rounded-xl shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 px-3 shrink-0 transition-all active:scale-[0.98]"
                  title="Fazer chamada dos alunos para embarque"
                >
                  <Users className="w-4 h-4 text-[#1a3a5c]" />
                  <span>CHAMADA</span>
                </Button>
              )}

              <Button
                type="button"
                onClick={onDirectStep}
                disabled={isLoading || isStepping || isFinalizing || isAnyActionBusy}
                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold font-bold max-[320px]:text-[10px] text-[11px] sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3"
              >
                {isStepping || isFinalizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : isLastStop ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="">CONCLUIR ROTA</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
                    <span className="">CONTINUAR</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}