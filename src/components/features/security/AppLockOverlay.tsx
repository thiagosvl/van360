import { useEffect, useState } from "react";
import { useBiometricLock } from "@/hooks/business/useBiometricLock";
import { sessionManager } from "@/services/sessionManager";
import { ROUTES } from "@/constants/routes";
import { Fingerprint, Lock, Loader2, LogOut } from "lucide-react";

export function AppLockOverlay() {
  const { isLocked, isAuthenticating, unlockApp } = useBiometricLock();
  const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);

  useEffect(() => {
    if (!isLocked) return;

    const timer = setTimeout(() => {
      void unlockApp();
    }, 200);

    return () => clearTimeout(timer);
  }, [isLocked, unlockApp]);

  if (!isLocked) return null;

  const handleSignOut = async () => {
    await sessionManager.signOut();
    window.location.href = ROUTES.PUBLIC.LOGIN;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aplicativo Bloqueado"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-gradient-to-b from-[#0d1f33] via-[#091524] to-[#040910] p-6 text-white select-none animate-in fade-in duration-200"
    >
      <div className="pt-10 flex flex-col items-center">
        <img
          src="/assets/logo-van360.png"
          alt="Van 360"
          className="h-12 w-auto object-contain drop-shadow-md"
        />
      </div>

      <div className="flex flex-col items-center text-center max-w-sm px-4 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-[24px] bg-[#0b1a2e]/60 border border-[#2563eb]/20 flex items-center justify-center shadow-2xl backdrop-blur-xl">
            <Fingerprint className="w-12 h-12 text-primary stroke-[1.8]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0b1a2e] border-2 border-primary/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Aplicativo Bloqueado
          </h1>
          <p className="text-sm text-white/70 leading-relaxed">
            Confirme sua identidade para acessar seus dados com segurança.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void unlockApp()}
          disabled={isAuthenticating}
          className="w-full py-3.5 px-6 rounded-[18px] bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-70"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Aguardando autenticação...</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5" />
              <span>Desbloquear</span>
            </>
          )}
        </button>
      </div>

      <div className="pb-6">
        {showConfirmSignOut ? (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-[14px] animate-in fade-in zoom-in-95 duration-150">
            <span className="text-xs text-white/70">Deseja realmente sair?</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-semibold text-[#e7000b] hover:text-[#e7000b]/80 cursor-pointer"
            >
              Sim, sair
            </button>
            <span className="text-white/20">|</span>
            <button
              type="button"
              onClick={() => setShowConfirmSignOut(false)}
              className="text-xs font-medium text-white/60 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmSignOut(true)}
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-[#e7000b] transition-colors py-2 px-3 rounded-[12px] hover:bg-white/5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </button>
        )}
      </div>
    </div>
  );
}
