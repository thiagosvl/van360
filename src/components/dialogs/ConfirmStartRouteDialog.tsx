import React, { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Play, Bell, MapPinOff, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppPermissions } from "@/hooks/business/useAppPermissions";
import { Capacitor } from "@capacitor/core";

import { AppPermissionStatus } from "@/types/enums";

export interface ConfirmStartRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notificarPais: boolean) => void;
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
  const [notificarPais, setNotificarPais] = useState<boolean>(true);
  const { locationStatus, openDeviceSettings } = useAppPermissions();

  const handleConfirm = () => {
    onConfirm(notificarPais);
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
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          Deseja dar a partida nesta corrida? Você poderá acompanhar as paradas e registrar os alunos em tempo real.
        </p>

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
                  A rota iniciará sem envio de trajeto ao vivo aos pais. Você pode configurar agora ou ativar o GPS durante a corrida.
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

        {/* Card de Notificações com Título e Descrição sem Truncamento */}
        <div
          onClick={() => setNotificarPais(!notificarPais)}
          className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer select-none transition-all hover:bg-emerald-50 active:scale-[0.99] flex items-start gap-3.5"
        >
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-grow min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-headline font-bold text-[#1a3a5c] text-xs sm:text-sm leading-snug">
                Notificar pais e responsáveis
              </span>
              <Switch
                checked={notificarPais}
                onCheckedChange={(checked) => setNotificarPais(checked)}
                className="data-[state=checked]:bg-emerald-600 shrink-0"
              />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed break-words">
              Os pais receberão alertas automáticos no celular quando a van estiver a caminho e quando seu filho embarcar ou desembarcar.
            </p>
          </div>
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
