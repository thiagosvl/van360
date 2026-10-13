import { Button } from "@/components/ui/button";
import { MapPin, School, UserMinus, ArrowUp, ArrowDown, Loader2, Home, ListOrdered } from "lucide-react";
import { RouteNodeType, RouteStopStatus, RouteSentido } from "@/types/route";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
import { podeReordenarParada } from "@/utils/domain/route/routeRules";
import { cn } from "@/lib/utils";
import { AddressDialogData } from "./AddressDetailsDialog";

const TAB_PRINCIPAL = "principal";

interface ActiveRouteUpcomingCardProps {
  parada: any;
  index: number;
  showTopLine: boolean;
  showBottomLine: boolean;
  isPreview?: boolean;
  selectedPreviewTabs: Record<string, string>;
  todasParadas: any[];
  activeParadaToRender?: any;
  proximasParadas: any[];
  execucaoTipo: string;
  isAnyActionBusy: boolean;
  reorderingTarget: { index: number; direction: "up" | "down" } | null;
  reorderingSheetStopId?: string | null;
  validarMovimentoPermitido: (tipo: string, index: number, direction: "up" | "down", pendentes: any[], concluidas: any[]) => boolean;
  paradasConcluidas: any[];
  isLoading: boolean;
  onOpenAddressDialog: (data: AddressDialogData) => void;
  onMoveParada: (index: number, direction: "up" | "down") => void;
  onConfirmFalta: (id: string, nome: string) => void;
  getAlunosEscolaPorPosicao: (paradas: any[], index: number) => { desces: any[]; subes: any[] };
  onOpenReordenarSheet?: (parada: any) => void;
  chamadaRapidaSavedMap?: Record<string, RouteStopStatus> | null;
}

export function ActiveRouteUpcomingCard({
  parada,
  index,
  showTopLine,
  showBottomLine,
  isPreview = false,
  selectedPreviewTabs,
  todasParadas,
  activeParadaToRender,
  proximasParadas,
  execucaoTipo,
  isAnyActionBusy,
  reorderingTarget,
  reorderingSheetStopId,
  validarMovimentoPermitido,
  paradasConcluidas,
  isLoading,
  onOpenAddressDialog,
  onMoveParada,
  onConfirmFalta,
  getAlunosEscolaPorPosicao,
  onOpenReordenarSheet,
  chamadaRapidaSavedMap,
}: ActiveRouteUpcomingCardProps) {
  const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;
  const pass = parada.passageiro;
  const responsaveisAdicionais = pass?.responsaveis || [];
  const activeTabForCard = selectedPreviewTabs[parada.id] || TAB_PRINCIPAL;

  const temEnderecoValido = Boolean(
    isEscolaItem
      ? parada.escola?.logradouro
      : (pass?.responsavel_principal?.logradouro || pass?.logradouro || responsaveisAdicionais.some((r: any) => r.logradouro))
  );

  let currentAddressStr = "";

  if (isEscolaItem) {
    currentAddressStr = formatarEnderecoParcialRota(parada.escola) || "Endereço da escola";
  } else if (pass) {
    if (activeTabForCard === TAB_PRINCIPAL) {
      currentAddressStr = formatarEnderecoParcialRota(pass.responsavel_principal || pass) || "Sem endereço cadastrado";
    } else {
      const respObj = responsaveisAdicionais.find((r: any) => r.id === activeTabForCard);
      if (respObj) {
        currentAddressStr = respObj.logradouro ? formatarEnderecoParcialRota(respObj) : (formatarEnderecoParcialRota(pass.responsavel_principal || pass) || "Sem endereço cadastrado");
      } else {
        currentAddressStr = formatarEnderecoParcialRota(pass.responsavel_principal || pass) || "Sem endereço cadastrado";
      }
    }
  }

  return (
    <div className="relative w-full">
      {showTopLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-0 bottom-1/2 w-[2px] bg-[#e5e5e5] z-0" />
      )}
      {showBottomLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-1/2 bottom-[-24px] w-[2px] bg-[#e5e5e5] z-0" />
      )}

      <span className="absolute left-[-26px] -translate-x-1/2 top-1/2 -translate-y-1/2 h-7 w-7 font-semibold text-[11px] flex items-center justify-center shrink-0 text-white border-2 rounded-full shadow-xs z-10 bg-[#0a0a0a] border-white">
        {isEscolaItem ? <School className="w-3.5 h-3.5" /> : parada.ordem}
      </span>

      <div className="bg-white p-3.5 sm:p-4 rounded-[20px] sm:rounded-[24px] flex flex-col justify-center text-left shadow-xs min-h-[52px] transition-all border border-[#e5e5e5] hover:border-[#d4d4d4]">
        <div className="flex flex-col gap-1 min-w-0 items-start">
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="flex-1 min-w-0 pr-1 text-left">
              <div className="flex items-center gap-2 min-w-0">
                {isEscolaItem && <School className="w-4.5 h-4.5 text-[#0a0a0a] shrink-0" />}
                <h4 className="text-sm font-semibold text-[#0a0a0a] break-words leading-snug">
                  {isEscolaItem
                    ? parada.escola?.nome
                    : formatShortName(parada.passageiro?.nome || parada.nome || "", true)}
                </h4>
              </div>
              {!isEscolaItem && (
                <div className="flex items-center gap-1.5 text-xs text-[#737373] font-normal mt-0.5 text-left">
                  <MapPin className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span className="break-words">
                    {currentAddressStr}
                  </span>
                </div>
              )}
            </div>

            {!isEscolaItem && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isAnyActionBusy || !temEnderecoValido}
                onClick={() => {
                  if (!temEnderecoValido) return;
                  onOpenAddressDialog({
                    open: true,
                    title: pass?.nome || "Aluno",
                    passageiro: pass,
                    escola: null,
                    address: currentAddressStr,
                    tipoNo: RouteNodeType.PASSAGEIRO,
                    sentido: parada.sentido,
                    escolaNome: pass?.escola?.nome || pass?.escola_nome
                  });
                }}
                className="h-8 w-8 rounded-[12px] border border-[#e5e5e5] bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#0a0a0a] flex items-center justify-center shrink-0 cursor-pointer shadow-none active:scale-95 transition-all -mt-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                title={temEnderecoValido ? "Ver endereço e detalhes da parada" : "Endereço não cadastrado"}
              >
                <MapPin className="w-4 h-4 text-[#0a0a0a]" />
              </Button>
            )}
          </div>

          {isEscolaItem && (() => {
            const paradaIndexInTodas = todasParadas.findIndex((p) => p.id === parada.id);
            const { desces, subes } = getAlunosEscolaPorPosicao(todasParadas, paradaIndexInTodas >= 0 ? paradaIndexInTodas : index);

            const descesAtivos = desces.filter((d) => d.status !== RouteStopStatus.AUSENTE);
            const subesAtivos = subes.filter((s) => {
              if (s.status === RouteStopStatus.AUSENTE || s.is_ausente || s.ausencia_id) return false;
              if (isPreview && chamadaRapidaSavedMap) {
                const pid = s.passageiro_id || s.passageiro?.id;
                if (pid && chamadaRapidaSavedMap[pid] === RouteStopStatus.AUSENTE) {
                  return false;
                }
              }
              return true;
            });

            return (
              <div className="mt-1 space-y-1 w-full text-left">
                <div className="space-y-1 text-left">
                  <div className="text-xs leading-snug">
                    <span className="font-semibold text-[#0a0a0a]">⬇️ Desembarque ({descesAtivos.length}):{" "}</span>
                    {descesAtivos.length > 0 && (
                      <span className="text-[#737373] font-normal">
                        {descesAtivos.map((d) => formatShortName(d.passageiro?.nome || d.nome || "", true)).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="font-semibold text-[#0a0a0a]">⬆️ Embarque ({subesAtivos.length}):{" "}</span>
                    {subesAtivos.length > 0 && (
                      <span className="text-[#737373] font-normal">
                        {subesAtivos.map((s) => formatShortName(s.passageiro?.nome || s.nome || "", true)).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {!isEscolaItem && (
            <div className="flex items-center gap-1.5 text-xs font-normal text-[#737373] mt-1 text-left">
              {parada.sentido === RouteSentido.VOLTANDO ? (
                <>
                  <Home className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span className="break-words"><span className="font-semibold text-[#0a0a0a]">Voltando</span> para casa</span>
                </>
              ) : (
                <>
                  <School className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span className="break-words"><span className="font-semibold text-[#0a0a0a]">Indo</span> para a escola</span>
                </>
              )}
            </div>
          )}
        </div>

        {!isPreview && (
          <div className="flex items-center justify-between border-t border-[#e5e5e5] mt-2.5 pt-2">
            <div className="flex items-center gap-2">
              {(() => {
                const totalPendentesReal = activeParadaToRender ? [activeParadaToRender, ...proximasParadas] : [...proximasParadas];
                if (totalPendentesReal.length <= 1) return null;

                const realIndex = index + 1;
                const isUpReordering = reorderingTarget?.index === realIndex && reorderingTarget?.direction === "up";
                const isDownReordering = reorderingTarget?.index === realIndex && reorderingTarget?.direction === "down";

                const isUpDisabled =
                  realIndex === 0 ||
                  isAnyActionBusy ||
                  !validarMovimentoPermitido(execucaoTipo, realIndex, "up", totalPendentesReal, paradasConcluidas);

                const isDownDisabled =
                  realIndex === totalPendentesReal.length - 1 ||
                  isAnyActionBusy ||
                  !validarMovimentoPermitido(execucaoTipo, realIndex, "down", totalPendentesReal, paradasConcluidas);

                return (
                  <div className="flex items-center gap-1 border border-[#e5e5e5] rounded-[14px] px-1.5 py-0.5 bg-[#f5f5f5] shrink-0 h-8">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isUpDisabled || isAnyActionBusy}
                      onClick={() => onMoveParada(realIndex, "up")}
                      className="h-7 w-7 rounded-[10px] text-[#0a0a0a] hover:bg-white active:bg-white disabled:opacity-20 shrink-0 flex items-center justify-center p-0 transition-colors cursor-pointer"
                      title="Subir 1 posição"
                    >
                      {isUpReordering ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a0a0a]" />
                      ) : (
                        <ArrowUp className="w-3.5 h-3.5 stroke-[2.25]" />
                      )}
                    </Button>
                    <div className="w-px h-4 bg-[#e5e5e5] my-auto shrink-0" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isDownDisabled || isAnyActionBusy}
                      onClick={() => onMoveParada(realIndex, "down")}
                      className="h-7 w-7 rounded-[10px] text-[#0a0a0a] hover:bg-white active:bg-white disabled:opacity-20 shrink-0 flex items-center justify-center p-0 transition-colors cursor-pointer"
                      title="Descer 1 posição"
                    >
                      {isDownReordering ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a0a0a]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 stroke-[2.25]" />
                      )}
                    </Button>
                    {onOpenReordenarSheet && (() => {
                      const canReorder = podeReordenarParada(execucaoTipo, realIndex, totalPendentesReal, paradasConcluidas);
                      const isSheetReorderingThisCard = reorderingSheetStopId === parada.id;
                      return (
                        <>
                          <div className="w-px h-4 bg-[#e5e5e5] my-auto shrink-0" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={!canReorder || isAnyActionBusy}
                            onClick={() => canReorder && !isAnyActionBusy && onOpenReordenarSheet(parada)}
                            className={cn(
                              "h-7 w-7 rounded-[10px] shrink-0 flex items-center justify-center p-0 transition-colors",
                              canReorder && !isAnyActionBusy
                                ? "text-[#0a0a0a] hover:bg-white active:bg-white cursor-pointer"
                                : "text-[#737373] opacity-20 cursor-not-allowed"
                            )}
                            title={canReorder ? "Reordenar posição da parada" : "Nenhuma posição alternativa disponível"}
                          >
                            {isSheetReorderingThisCard ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a0a0a]" />
                            ) : (
                              <ListOrdered className="w-3.5 h-3.5 stroke-[2.25]" />
                            )}
                          </Button>
                        </>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isEscolaItem ? null : parada.status === RouteStopStatus.EMBARCADO ? (
                <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-[18px] text-[11px] font-semibold px-2.5 py-1 leading-none block whitespace-nowrap">
                  Embarcado
                </span>
              ) : parada.status === RouteStopStatus.AUSENTE ? (
                <span className="bg-[#e7000b]/10 text-[#e7000b] border border-[#e7000b]/20 rounded-[18px] text-[11px] font-semibold px-2.5 py-1 leading-none block whitespace-nowrap">
                  Ausente
                </span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || isAnyActionBusy}
                  onClick={() => onConfirmFalta(parada.id, parada.passageiro?.nome || "")}
                  className="h-8 px-3 rounded-[18px] border border-[#e7000b]/20 text-[#e7000b] hover:bg-[#e7000b]/10 shadow-none flex items-center gap-1.5 bg-white text-xs font-medium transition-colors shrink-0 cursor-pointer"
                  title="Marcar como ausente hoje"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e7000b]" />
                  ) : (
                    <UserMinus className="w-3.5 h-3.5" />
                  )}
                  <span>Ausente</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}