import { memo, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import { useBiometricLock, GRACE_PERIOD_OPTIONS } from "@/hooks/business/useBiometricLock";
import { isNativeIos } from "@/utils/detectPlatform";
import { toast } from "@/utils/notifications/toast";
import { Fingerprint, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const SegurancaBiometriaTab = memo(function SegurancaBiometriaTab() {
  const {
    isSupported,
    deviceSecurity,
    isLockEnabled,
    gracePeriod,
    enableLock,
    disableLock,
    setGracePeriod,
    refreshSecurity,
  } = useBiometricLock();

  const [isUpdating, setIsUpdating] = useState(false);
  const isIos = isNativeIos();

  useEffect(() => {
    refreshSecurity();
  }, [refreshSecurity]);

  const isDeviceSecure = deviceSecurity?.deviceIsSecure || deviceSecurity?.hasBiometrics;

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      if (!isLockEnabled) {
        const success = await enableLock();
        if (success) {
          toast.success("Bloqueio ativado com sucesso!");
        } else {
          toast.info("Ativação cancelada.");
        }
      } else {
        const success = await disableLock();
        if (success) {
          toast.success("Bloqueio desativado com sucesso.");
        } else {
          toast.info("Desativação cancelada.");
        }
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectGracePeriod = (value: number) => {
    setGracePeriod(value);
    toast.success("Tempo de bloqueio atualizado.");
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <Banner
          variant="info"
          title="Recurso exclusivo do aplicativo"
          description="O bloqueio biométrico está disponível nos aplicativos Van 360 para Android e iOS."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <Fingerprint className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Bloqueio de Tela
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              {isIos
                ? "Proteja seus dados com Face ID, Touch ID ou código do celular"
                : "Proteja seus dados com biometria ou senha do celular"}
            </p>
          </div>
        </div>

        {!isDeviceSecure && deviceSecurity !== null && (
          <Banner
            variant="warning"
            title="Bloqueio de tela não configurado"
            description="Seu celular não tem bloqueio de tela cadastrado. Caso queira proteger o acesso ao app Van360, ative primeiro o bloqueio de tela nas configurações do seu aparelho."
          />
        )}

        <div className="flex items-center justify-between gap-4 py-1">
          <div className="space-y-0.5 min-w-0 pr-2">
            <h3 className="text-sm font-medium text-[#0a0a0a]">
              Exigir autenticação ao entrar
            </h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              {isIos
                ? "Solicita Face ID, Touch ID ou código do celular ao abrir o app."
                : "Solicita impressão digital ou senha do celular ao abrir o app."}
            </p>
          </div>

          <div className="shrink-0">
            <Switch
              id="switch-bloqueio-biometrico"
              checked={isLockEnabled}
              disabled={isUpdating || !isDeviceSecure}
              loading={isUpdating}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>

        {isLockEnabled && (
          <div className="pt-5 border-t border-[#e5e5e5] space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#737373]" />
              <h4 className="text-xs sm:text-sm font-medium text-[#0a0a0a]">
                Bloquear após inatividade
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GRACE_PERIOD_OPTIONS.map((opt) => {
                const isSelected = gracePeriod === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectGracePeriod(opt.value)}
                    className={cn(
                      "flex items-center justify-between p-3.5 sm:p-4 rounded-[18px] border text-left text-xs sm:text-sm transition-all cursor-pointer",
                      isSelected
                        ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] text-[#0a0a0a] font-medium shadow-xs"
                        : "border-[#e5e5e5] bg-white text-[#737373] hover:border-[#0a0a0a]/30 hover:bg-[#fafafa]"
                    )}
                  >
                    <span className={isSelected ? "text-[#0a0a0a]" : "text-[#737373]"}>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#0a0a0a] shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
