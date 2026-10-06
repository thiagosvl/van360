import { memo, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Banner } from "@/components/ui/Banner";
import { useBiometricLock, GRACE_PERIOD_OPTIONS } from "@/hooks/business/useBiometricLock";
import { isNativeIos } from "@/utils/detectPlatform";
import { toast } from "sonner";
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
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
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
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1a3a5c]">
              Bloqueio de Tela
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
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

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="space-y-0.5 min-w-0 pr-1">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
              Exigir autenticação ao entrar
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
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
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs sm:text-sm font-semibold">
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
                      "flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all cursor-pointer",
                      isSelected
                        ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold"
                        : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1a3a5c]" />}
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
