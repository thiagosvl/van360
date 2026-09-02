import React from "react";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { useTrackingViewModel } from "@/hooks/ui/useTrackingViewModel";
import { TrackingMap } from "./TrackingMap";
import { MapPin, Navigation, CheckCircle2, Radio } from "lucide-react";
import { RouteStopStatus, RouteSentido } from "@/types/route";
import { ENABLE_LIVE_TRACKING } from "@/constants/tracking";

interface TrackingCardProps {
  passageiroId: string;
  passageiroNome: string;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({
  passageiroId,
  passageiroNome
}) => {
  if (!ENABLE_LIVE_TRACKING) {
    return null;
  }

  const { token } = useResponsavelAuth();

  const {
    isExecucaoAtiva,
    isParadaPendente,
    isEmbarcadoNaIda,
    isFinalizado,
    isParadaAusente,
    rastreamentoAtivo,
    isLiberadoGps,
    paradaStatus,
    execucao,
    vanCoord,
    heading,
    speed,
    paradasRestantes,
    sentido,
    destinoEndereco
  } = useTrackingViewModel({ passageiroId, token });

  if (isParadaAusente) {
    return null;
  }

  if (isFinalizado) {
    const textoConclusao =
      paradaStatus === RouteStopStatus.EMBARCADO
        ? `${passageiroNome} já embarcou na van!`
        : `${passageiroNome} foi entregue com sucesso!`;

    return (
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <span className="block font-bold text-sm leading-tight text-emerald-950">
            {textoConclusao}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium block truncate mt-0.5">
            {execucao?.rota_nome || "Rota Escolar"} • Concluído
          </span>
        </div>
      </div>
    );
  }

  if (!isExecucaoAtiva || (!isParadaPendente && !isEmbarcadoNaIda)) {
    return null;
  }

  if (!rastreamentoAtivo) {
    return null;
  }

  if (!isLiberadoGps) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-[#1a3a5c]">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="block font-bold text-sm leading-tight text-slate-900">
            Acompanhamento de Rota
          </span>
          <span className="text-xs text-slate-500 font-medium block mt-0.5">
            A localização ao vivo será exibida assim que a van estiver a caminho da sua parada.
          </span>
        </div>
      </div>
    );
  }

  const primeiroNome = passageiroNome?.trim().split(" ")[0] || "o aluno";

  const descricaoSentido = isEmbarcadoNaIda
    ? `A caminho da escola (${execucao?.escola?.nome || "Escola"})`
    : sentido === RouteSentido.VOLTANDO
      ? `A caminho da residência de ${primeiroNome}`
      : `A caminho da residência de ${primeiroNome}`;

  const textoFila = isEmbarcadoNaIda
    ? `${primeiroNome} está a bordo da van a caminho da escola`
    : paradasRestantes === 0
      ? sentido === RouteSentido.VOLTANDO
        ? `A caminho de entregar ${primeiroNome}`
        : `A caminho de buscar ${primeiroNome}`
      : `Faltam ${paradasRestantes} ${paradasRestantes === 1 ? "parada" : "paradas"} antes de ${primeiroNome}`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs space-y-0">
      <div className="p-4 bg-gradient-to-r from-slate-900 to-[#1a3a5c] text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs leading-tight truncate text-white">
                Van em Trânsito
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                Ao Vivo
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium block truncate">
              {descricaoSentido}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3">
        <TrackingMap
          vanCoord={vanCoord}
          heading={heading}
          className="w-full h-56 rounded-xl overflow-hidden shadow-inner border border-slate-200"
        />
      </div>

      <div className="px-3 pb-3 pt-0 space-y-2 text-left">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1a3a5c]/10 text-[#1a3a5c] flex items-center justify-center shrink-0">
              {isEmbarcadoNaIda ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 font-medium block">
                {isEmbarcadoNaIda ? "Status do Aluno" : "Fila de paradas"}
              </span>
              <span className="font-bold text-xs text-slate-900 block leading-tight">
                {textoFila}
              </span>
            </div>
          </div>
          {isEmbarcadoNaIda ? (
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0">
              A bordo
            </span>
          ) : (
            paradasRestantes === 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0">
                Próxima
              </span>
            )
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 font-medium block">
                Destino da Corrida
              </span>
              <span className="font-bold text-xs text-slate-900 block leading-tight truncate">
                {destinoEndereco || (vanCoord ? "Van em trânsito" : "Aguardando sinal GPS...")}
              </span>
            </div>
          </div>
          {speed !== null && speed > 5 && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0">
              {Math.round(speed)} km/h
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
