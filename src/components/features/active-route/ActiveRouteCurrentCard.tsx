import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, School, User, Check, UserMinus, ArrowUp, ArrowDown, Loader2, Play, UserCheck, CheckCheck, ListOrdered } from "lucide-react";
import { RouteNodeType, RouteStopStatus, RouteSentido } from "@/types/route";
import { formatShortName, formatarEnderecoCompleto, formatarEnderecoParcialRota } from "@/utils/formatters";
import { AddressDialogData } from "./AddressDetailsDialog";

const TAB_DEFAULT = "default";
const TAB_PRINCIPAL = "principal";

interface ActiveRouteCurrentCardProps {
  parada: any;
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
  onOpenReordenarSheet?: (parada: any) => void;
}

export function ActiveRouteCurrentCard({
  parada,
  activeCardRef,
  showTopLine,
  showBottomLine,
  isLastStop,
  selectedRespTab,
  setSelectedRespTab,
  execucaoTipo,
  totalPendentesReal,
  isAnyActionBusy,
  reorderingTarget,
  validarMovimentoPermitido,
  paradasConcluidas,
  proximasParadas,
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
  onOpenReordenarSheet,
}: ActiveRouteCurrentCardProps) {
  const isEscola = parada.tipo_no === RouteNodeType.ESCOLA;
  const displayOrdem = parada.ordem || 0;
  const pass = parada.passageiro;
  const responsaveisAdicionais = pass?.responsaveis || [];
  const isPrincipal = selectedRespTab === TAB_DEFAULT || selectedRespTab === TAB_PRINCIPAL;
  const respObj = !isPrincipal ? responsaveisAdicionais.find((r: any) => r.id === selectedRespTab) : null;

  let currentAddressStr = isEscola
    ? formatarEnderecoCompleto(parada.escola) || ""
    : formatarEnderecoParcialRota(pass) || "";

  if (!isEscola && pass) {
    if (isPrincipal) {
      currentAddressStr = formatarEnderecoParcialRota(pass) || "";
    } else if (respObj) {
      currentAddressStr = respObj.logradouro
        ? formatarEnderecoParcialRota(respObj)
        : (formatarEnderecoParcialRota(pass) || "");
    }
  }

  const activeAddressStr = isEscola
    ? formatarEnderecoParcialRota(parada.escola)
    : formatarEnderecoParcialRota(pass);

  const cardClass = "bg-gradient-to-b from-slate-50/90 via-white to-slate-50/60 p-3.5 sm:p-4 rounded-2xl shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-200 text-left border-2 border-[#1a3a5c] relative z-10";

  let actionLabel = isLastStop ? "CONCLUIR" : "CONFIRMAR";
  if (parada.sentido === RouteSentido.VOLTANDO && !isEscola) {
    actionLabel = isLastStop ? "CONCLUIR" : "REGISTRAR";
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
            <span className="truncate">{isLastStop ? "Última Parada" : "Parada Atual"}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
            {!isEscola && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  onOpenAddressDialog({
                    open: true,
                    title: parada.passageiro?.nome || "Passageiro",
                    address: currentAddressStr,
                    latitude: respObj?.latitude || parada.passageiro?.latitude,
                    longitude: respObj?.longitude || parada.passageiro?.longitude,
                    tipoNo: RouteNodeType.PASSAGEIRO,
                    sentido: parada.sentido,
                    escolaNome: parada.passageiro?.escola?.nome,
                    passageiro: parada.passageiro
                  });
                }}
                className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-[#1a3a5c] hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-2xs"
                title="Ver endereço e detalhes"
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
                <div className="h-8 flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0 shadow-2xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isUpDisabled || isAnyActionBusy}
                    className="h-7 w-6.5 sm:w-7 rounded-md text-slate-400 opacity-20 shrink-0 cursor-not-allowed flex items-center justify-center p-0"
                    title="Subir parada (já está ativa)"
                  >
                    {isUpReordering ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a3a5c]" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isDownDisabled || isAnyActionBusy}
                    onClick={() => onMoveParada(index, "down")}
                    className="h-7 w-6.5 sm:w-7 rounded-md text-slate-500 hover:bg-slate-200/80 disabled:opacity-20 shrink-0 flex items-center justify-center p-0"
                    title="Descer parada ativa"
                  >
                    {isDownReordering ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a3a5c]" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  {onOpenReordenarSheet && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenReordenarSheet(parada)}
                      className="h-7 w-6.5 sm:w-7 rounded-md text-[#1a3a5c] hover:bg-slate-200 shrink-0 flex items-center justify-center border-l border-slate-200/60 p-0"
                      title="Reordenar posição da parada ativa"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </Button>
                  )}
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
                  alunosParaEmbarcar.map((aluno) => {
                    const isPendente = aluno.status === RouteStopStatus.PENDENTE;
                    const isABordo = aluno.status === RouteStopStatus.EMBARCADO;

                    return (
                      <div key={aluno.id} className="flex items-center justify-between bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-medium text-[#1a3a5c] truncate">
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
                  })
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
                          <span className="text-xs font-medium text-[#1a3a5c] truncate">
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
              <span className="text-[#1a3a5c] font-bold text-base sm:text-lg tracking-tight truncate block">
                {formatShortName(parada.passageiro?.nome || parada.nome, true)}
              </span>
            </div>

            {currentAddressStr && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate mt-0.5 text-left">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentAddressStr}</span>
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
                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-2.5  whitespace-nowrap overflow-hidden"
              >
                {isStepping || isFinalizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : isLastStop ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{actionLabel}</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{actionLabel}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={onDirectStep}
              disabled={isLoading || isStepping || isFinalizing || isAnyActionBusy}
              className="h-10 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] sm:text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 px-3 min-w-0"
            >
              {isStepping || isFinalizing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : isLastStop ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">CONCLUIR PARADA NA ESCOLA</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
                  <span className="truncate">CONFIRMAR PARADA NA ESCOLA</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}