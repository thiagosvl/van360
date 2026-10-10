import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Play, Bell, MapPinOff, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppPermissions } from "@/hooks/business/useAppPermissions";
import { useConfiguracoes } from "@/hooks";
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
  const { configuracoes } = useConfiguracoes();
  const { locationStatus, openDeviceSettings } = useAppPermissions();

  const temNotificacoesAtivas =
    (configuracoes?.notificar_inicio_rota ?? false) ||
    (configuracoes?.notificar_proxima_parada ?? false) ||
    (configuracoes?.notificar_conclusao_parada ?? false);

  const [notificarPais, setNotificarPais] = useState<boolean>(temNotificacoesAtivas);

  useEffect(() => {
    if (isOpen) {
      setNotificarPais(temNotificacoesAtivas);
    }
  }, [isOpen, temNotificacoesAtivas]);

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

      <BaseDialog.Body className="space-y-4 pt-2">
        <p className="text-xs sm:text-sm text-[#737373] font-normal leading-relaxed">
          Deseja iniciar a rota? Você poderá acompanhar as paradas e registrar os alunos em tempo real.
        </p>

        {isGpsDenied && (
          <div className="p-3.5 rounded-[18px] bg-amber-500/[0.08] border border-amber-500/20 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-[10px] bg-amber-500/15 text-amber-700 shrink-0 mt-0.5">
                <MapPinOff className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0a0a0a]">
                  GPS desativado no aparelho
                </p>
                <p className="text-[11px] text-[#737373] leading-relaxed">
                  A rota iniciará sem envio de trajeto ao vivo aos pais. Você pode configurar agora ou ativar o GPS durante a corrida.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openDeviceSettings}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-[14px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurar GPS no Aparelho</span>
            </button>
          </div>
        )}

        <div
          onClick={() => setNotificarPais(!notificarPais)}
          className="p-4 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5] cursor-pointer select-none transition-all hover:border-[#d4d4d4] active:scale-[0.99] flex items-start gap-3.5"
        >
          <div className="p-2 rounded-[14px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shrink-0 mt-0.5">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm leading-snug">
                Notificar pais e responsáveis
              </span>
              <Switch
                checked={notificarPais}
                onCheckedChange={(checked) => setNotificarPais(checked)}
                className="data-[state=checked]:bg-emerald-600 shrink-0"
              />
            </div>
            <p className="text-[11px] sm:text-xs text-[#737373] font-normal leading-relaxed break-words">
              Os pais receberão alertas automáticos no celular quando a van estiver a caminho e quando seu filho embarcar ou desembarcar.
            </p>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        />
        <BaseDialog.Action
          label="Iniciar Rota"
          variant="primary"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          icon={<Play className="w-4 h-4 fill-white text-white" />}
          isLoading={isLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ConfirmStartRouteDialog;
