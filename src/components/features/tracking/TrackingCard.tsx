import React from "react";
import { Capacitor } from "@capacitor/core";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { useTrackingViewModel } from "@/hooks/ui/useTrackingViewModel";
import { TrackingMap } from "./TrackingMap";
import { MapPin, Navigation, CheckCircle2, Download, Radio } from "lucide-react";
import { openBrowserLink } from "@/utils/browser";
import { RouteStopStatus, RouteSentido } from "@/types/route";
import { FEATURE_FLAGS } from "@/constants/tracking";

interface TrackingCardProps {
  passageiroId: string;
  passageiroNome: string;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({
  passageiroId,
  passageiroNome
}) => {
  if (!FEATURE_FLAGS.ENABLE_LIVE_TRACKING) {
    return null;
  }

  const { token } = useResponsavelAuth();
  const isNative = Capacitor.isNativePlatform();

  const {
    isExecucaoAtiva,
    isParadaPendente,
    isParadaConcluida,
    isParadaAusente,
    paradaStatus,
    execucao,
    vanCoord,
    destCoord,
    heading,
    distanciaKm,
    paradasRestantes,
    sentido,
    hasLivePing
  } = useTrackingViewModel({ passageiroId, token });

  if (!isExecucaoAtiva && !isParadaConcluida && !isParadaAusente) {
    return null;
  }

  if (isParadaConcluida) {
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

  if (isParadaAusente) {
    return null;
  }

  if (!isParadaPendente) {
    return null;
  }

  if (!isNative) {
    return (
      <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0d2238] text-white rounded-2xl p-5 shadow-xs border border-blue-900/40 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              ROTA EM ANDAMENTO
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium truncate max-w-[140px]">
            {execucao?.rota_nome}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-base leading-snug">
            Acompanhe a van em tempo real
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            A rota com <strong>{passageiroNome}</strong> já iniciou. Para visualizar o mapa ao vivo com a aproximação da van e receber alertas, acesse pelo aplicativo Van360.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openBrowserLink("https://play.google.com/store/apps/details?id=com.tibis.van360")
          }
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Baixar / Abrir Aplicativo Van360</span>
        </button>
      </div>
    );
  }

  const descricaoSentido =
    sentido === RouteSentido.VOLTANDO
      ? "A caminho da sua residência"
      : "A caminho da escola";

  const textoFila =
    paradasRestantes === 0
      ? "Você é a próxima parada! 🚌"
      : `Faltam ${paradasRestantes} ${paradasRestantes === 1 ? "parada" : "paradas"} antes da sua`;

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
          destCoord={destCoord}
          heading={heading}
          className="w-full h-56 rounded-xl overflow-hidden shadow-inner border border-slate-200"
        />
      </div>

      <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2 text-left">
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <Navigation className="w-3.5 h-3.5 text-[#1a3a5c]" />
            <span>Fila de Paradas</span>
          </div>
          <span className="block font-bold text-xs text-slate-900 mt-1 truncate">
            {textoFila}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Distância Direta</span>
          </div>
          <span className="block font-bold text-xs text-slate-900 mt-1 truncate">
            {distanciaKm !== null ? `~${distanciaKm} km de você` : hasLivePing ? "Calculando..." : "Localizando van..."}
          </span>
        </div>
      </div>
    </div>
  );
};
