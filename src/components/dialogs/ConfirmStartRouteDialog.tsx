import React, { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Play, Bell, MapPinOff, Settings, ListOrdered, Navigation, Radio } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppPermissions } from "@/hooks/business/useAppPermissions";
import { Capacitor } from "@capacitor/core";
import { AppPermissionStatus } from "@/types/enums";
import { RouteExecutionMode } from "@/types/route";
import { routeStorage } from "@/utils/storage/routeStorage";

export interface ConfirmStartRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { notificarPais: boolean; modoExecucao: RouteExecutionMode; rastreamentoAtivo: boolean }) => void;
  routeName?: string;
  isLoading?: boolean;
}

export function ConfirmStartRouteDialog({
  isOpen,
  onClose,
  onConfirm,
  routeName,
  isLoading = false,
}: ConfirmStartRouteDialogProps) {
  const { locationStatus, openDeviceSettings } = useAppPermissions();

  const [modoExecucao, setModoExecucao] = useState<RouteExecutionMode>(() => routeStorage.getPreferredStartRouteMode());
  const [rastreamentoAtivo, setRastreamentoAtivo] = useState<boolean>(() => routeStorage.getPreferredGpsTracking());
  const [notificarPassoAPasso, setNotificarPassoAPasso] = useState<boolean>(() => routeStorage.getPreferredStepNotify());

  useEffect(() => {
    if (isOpen) {
      setModoExecucao(routeStorage.getPreferredStartRouteMode());
      setRastreamentoAtivo(routeStorage.getPreferredGpsTracking());
      setNotificarPassoAPasso(routeStorage.getPreferredStepNotify());
    }
  }, [isOpen]);

  const handleConfirm = () => {
    routeStorage.setPreferredStartRouteMode(modoExecucao);
    routeStorage.setPreferredGpsTracking(rastreamentoAtivo);
    routeStorage.setPreferredStepNotify(notificarPassoAPasso);

    const notificarPais = modoExecucao === "simples" ? rastreamentoAtivo : notificarPassoAPasso;

    onConfirm({
      notificarPais,
      modoExecucao,
      rastreamentoAtivo
    });
  };

  const isGpsDenied = Capacitor.isNativePlatform() && locationStatus === AppPermissionStatus.DENIED;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()} maxWidth="md">
      <BaseDialog.Header
        title="Iniciar Rota"
        subtitle={routeName || "Execução de itinerário"}
        icon={<Play className="w-5 h-5 text-emerald-600 fill-emerald-600/10" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Modo de Navegação
          </label>
          <div className="flex flex-col gap-2.5">
            <div
              onClick={() => setModoExecucao("simples")}
              className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center gap-3.5 ${
                modoExecucao === "simples"
                  ? "bg-emerald-50/50 border-emerald-600 shadow-xs ring-1 ring-emerald-600/30"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    modoExecucao === "simples"
                      ? "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-100 shadow-2xs"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {modoExecucao === "simples" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className="font-headline font-bold text-[#1a3a5c] text-sm block">
                  Modo Simples
                </span>
                <p className="text-xs text-slate-500 leading-snug mt-0.5">
                  Lista de alunos para dirigir livremente sem confirmar paradas.
                </p>
              </div>
            </div>

            <div
              onClick={() => setModoExecucao("passo_a_passo")}
              className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center gap-3.5 ${
                modoExecucao === "passo_a_passo"
                  ? "bg-emerald-50/50 border-emerald-600 shadow-xs ring-1 ring-emerald-600/30"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    modoExecucao === "passo_a_passo"
                      ? "border-emerald-600 bg-emerald-50 ring-4 ring-emerald-100 shadow-2xs"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {modoExecucao === "passo_a_passo" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className="font-headline font-bold text-[#1a3a5c] text-sm block">
                  Passo a Passo
                </span>
                <p className="text-xs text-slate-500 leading-snug mt-0.5">
                  Confirmação de embarque e desembarque a cada parada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isGpsDenied && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <MapPinOff className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-950">
                  GPS desativado no aparelho
                </p>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  A rota iniciará sem envio de trajeto ao vivo aos pais.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openDeviceSettings}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurar GPS no Aparelho</span>
            </button>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <div
            onClick={() => setRastreamentoAtivo(!rastreamentoAtivo)}
            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 cursor-pointer select-none transition-all hover:bg-slate-100/70 active:scale-[0.99] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-200/80 text-[#1a3a5c] shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <span className="font-headline font-bold text-[#1a3a5c] text-xs sm:text-sm leading-snug">
                Compartilhar localização ao vivo
              </span>
            </div>
            <Switch
              checked={rastreamentoAtivo}
              onCheckedChange={(checked) => setRastreamentoAtivo(checked)}
              className="data-[state=checked]:bg-emerald-600 shrink-0"
            />
          </div>

          {modoExecucao === "passo_a_passo" && (
            <div
              onClick={() => setNotificarPassoAPasso(!notificarPassoAPasso)}
              className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 cursor-pointer select-none transition-all hover:bg-slate-100/70 active:scale-[0.99] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-200/80 text-[#1a3a5c] shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="font-headline font-bold text-[#1a3a5c] text-xs sm:text-sm leading-snug">
                  Notificar os pais
                </span>
              </div>
              <Switch
                checked={notificarPassoAPasso}
                onCheckedChange={(checked) => setNotificarPassoAPasso(checked)}
                className="data-[state=checked]:bg-emerald-600 shrink-0"
              />
            </div>
          )}
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        />
        <BaseDialog.Action
          label="Iniciar Rota"
          variant="primary"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
          icon={<Play className="w-4 h-4 fill-white" />}
          isLoading={isLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ConfirmStartRouteDialog;

