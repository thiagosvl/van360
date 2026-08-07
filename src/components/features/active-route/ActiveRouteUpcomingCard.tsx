import { Button } from "@/components/ui/button";
import { MapPin, School, UserMinus, ArrowUp, ArrowDown, Loader2, Home, ListOrdered } from "lucide-react";
import { RouteNodeType, RouteStopStatus, RouteSentido } from "@/types/route";
import { formatShortName, formatarEnderecoParcialRota } from "@/utils/formatters";
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
  validarMovimentoPermitido: (tipo: string, index: number, direction: "up" | "down", pendentes: any[], concluidas: any[]) => boolean;
  paradasConcluidas: any[];
  isLoading: boolean;
  onOpenAddressDialog: (data: AddressDialogData) => void;
  onMoveParada: (index: number, direction: "up" | "down") => void;
  onConfirmFalta: (id: string, nome: string) => void;
  getAlunosEscolaPorPosicao: (paradas: any[], index: number) => { desces: any[]; subes: any[] };
  onOpenReordenarSheet?: (parada: any) => void;
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
  validarMovimentoPermitido,
  paradasConcluidas,
  isLoading,
  onOpenAddressDialog,
  onMoveParada,
  onConfirmFalta,
  getAlunosEscolaPorPosicao,
  onOpenReordenarSheet,
}: ActiveRouteUpcomingCardProps) {
  const isEscolaItem = parada.tipo_no === RouteNodeType.ESCOLA;
  const pass = parada.passageiro;
  const responsaveisAdicionais = pass?.responsaveis || [];
  const activeTabForCard = selectedPreviewTabs[parada.id] || TAB_PRINCIPAL;

  let currentAddressStr = "";
  let currentLat = isEscolaItem ? parada.escola?.latitude : parada.passageiro?.latitude;
  let currentLng = isEscolaItem ? parada.escola?.longitude : parada.passageiro?.longitude;

  if (isEscolaItem) {
    currentAddressStr = formatarEnderecoParcialRota(parada.escola) || "Endereço da escola";
  } else if (pass) {
    if (activeTabForCard === TAB_PRINCIPAL) {
      currentAddressStr = formatarEnderecoParcialRota(pass) || "Endereço principal";
      currentLat = pass.latitude;
      currentLng = pass.longitude;
    } else {
      const respObj = responsaveisAdicionais.find((r: any) => r.id === activeTabForCard);
      if (respObj) {
        currentAddressStr = respObj.logradouro ? formatarEnderecoParcialRota(respObj) : (formatarEnderecoParcialRota(pass) || "Mesmo endereço");
        currentLat = respObj.latitude || pass.latitude;
        currentLng = respObj.longitude || pass.longitude;
      } else {
        currentAddressStr = formatarEnderecoParcialRota(pass) || "Endereço principal";
        currentLat = pass.latitude;
        currentLng = pass.longitude;
      }
    }
  }

  return (
    <div className="relative w-full">
      {showTopLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-0 bottom-1/2 w-[2.5px] bg-slate-200/70 z-0" />
      )}
      {showBottomLine && (
        <div className="absolute left-[-26px] -translate-x-1/2 top-1/2 bottom-[-24px] w-[2.5px] bg-slate-200/70 z-0" />
      )}

      <span className="absolute left-[-26px] -translate-x-1/2 top-1/2 -translate-y-1/2 h-7 w-7 font-bold text-[11px] flex items-center justify-center shrink-0 text-white border-2 rounded-full shadow-sm z-10 bg-[#1a3a5c] border-white">
        {isEscolaItem ? <School className="w-4 h-4" /> : parada.ordem}
      </span>

      <div className="bg-white p-3.5 rounded-2xl flex flex-col justify-center text-left shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] min-h-[52px] transition-all border border-slate-200">
        <div className="flex flex-col gap-1 min-w-0 items-start">
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="flex-1 min-w-0 pr-1 text-left">
              <div className="flex items-center gap-2 min-w-0">
                {isEscolaItem && <School className="w-5 h-5 text-[#1a3a5c] shrink-0" />}
                <h4 className="text-sm font-bold text-[#1a3a5c] break-words leading-snug">
                  {isEscolaItem
                    ? parada.escola?.nome
                    : formatShortName(parada.passageiro?.nome || parada.nome || "", true)}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1 text-left">
                {!isEscolaItem && (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="break-words">
                      {currentAddressStr}
                    </span>
                  </>
                )}
              </div>
            </div>

            {!isEscolaItem && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  onOpenAddressDialog({
                    open: true,
                    title: pass?.nome || "Passageiro",
                    passageiro: pass,
                    escola: null,
                    address: currentAddressStr,
                    latitude: currentLat,
                    longitude: currentLng,
                    tipoNo: RouteNodeType.PASSAGEIRO,
                    sentido: parada.sentido,
                    escolaNome: pass?.escola?.nome || pass?.escola_nome
                  });
                }}
                className="h-8 w-8 rounded-lg border-slate-200 text-[#1a3a5c] hover:bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs -mt-0.5"
                title="Ver endereço e detalhes"
              >
                <MapPin className="w-3.5 h-3.5 text-[#1a3a5c]" />
              </Button>
            )}
          </div>

          {isEscolaItem && (() => {
            const paradaIndexInTodas = todasParadas.findIndex(p => p.id === parada.id);
            const { desces, subes } = getAlunosEscolaPorPosicao(todasParadas, paradaIndexInTodas >= 0 ? paradaIndexInTodas : index);

            return (
              <div className="mt-1 space-y-1 w-full text-left">
                <div className="space-y-1 text-left">
                  <div className="text-[11px] leading-snug">
                    <span className="font-semibold text-slate-700">⬇️ Desembarque ({desces.length}):{" "}</span>
                    {desces.length > 0 && (
                      <span className="text-slate-500 font-normal">
                        {desces.map(d => formatShortName(d.passageiro?.nome || d.nome || "", true)).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] leading-snug">
                    <span className="font-semibold text-slate-700">⬆️ Embarque ({subes.length}):{" "}</span>
                    {subes.length > 0 && (
                      <span className="text-slate-500 font-normal">
                        {subes.map(s => formatShortName(s.passageiro?.nome || s.nome || "", true)).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {!isEscolaItem && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-1 text-left">
              {parada.sentido === RouteSentido.VOLTANDO ? (
                <>
                  <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-words"><span className="font-bold">Voltando</span> para casa</span>
                </>
              ) : (
                <>
                  <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-words"><span className="font-bold">Indo</span> para a escola</span>
                </>
              )}
            </div>
          )}
        </div>

        {!isPreview && (
          <div className="flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2">
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
                  <div className="flex items-center gap-0.5 border border-slate-100 rounded-lg p-0.5 bg-slate-50 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isUpDisabled || isAnyActionBusy}
                      onClick={() => onMoveParada(realIndex, "up")}
                      className="h-7 w-6.5 sm:w-7 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-20 shrink-0 flex items-center justify-center p-0"
                      title="Subir 1 posição"
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
                      onClick={() => onMoveParada(realIndex, "down")}
                      className="h-7 w-6.5 sm:w-7 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-20 shrink-0 flex items-center justify-center p-0"
                      title="Descer 1 posição"
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
                        title="Reordenar posição da parada"
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isEscolaItem ? null : parada.status === RouteStopStatus.EMBARCADO ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[10px] font-bold px-2 py-0.5 leading-none block whitespace-nowrap">
                  EMBARCADO
                </span>
              ) : parada.status === RouteStopStatus.AUSENTE ? (
                <span className="bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[10px] font-bold px-2 py-0.5 leading-none block whitespace-nowrap">
                  AUSENTE
                </span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || isAnyActionBusy}
                  onClick={() => onConfirmFalta(parada.id, parada.passageiro?.nome || "")}
                  className="h-7.5 sm:h-8 px-2 sm:px-3 rounded-lg border-rose-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 shadow-xs flex items-center gap-1 bg-white text-[10px] sm:text-[11px] font-bold transition-colors shrink-0"
                  title="Marcar como ausente hoje"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserMinus className="w-3.5 h-3.5" />
                  )}
                  <span>AUSENTE</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}