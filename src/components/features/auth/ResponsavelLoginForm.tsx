import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import {
  useCheckPhoneMutation,
  useLoginResponsavelMutation,
  useSetupPinMutation
} from "@/hooks/api/useResponsavelAuthApi";
import { phoneMask } from "@/utils/masks";
import { ArrowLeft, KeyRound, Lock, Phone, ShieldCheck, UserCheck } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ResponsavelLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useResponsavelAuth();

  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [telefone, setTelefone] = useState("");
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkPhoneMutation = useCheckPhoneMutation();
  const setupPinMutation = useSetupPinMutation();
  const loginMutation = useLoginResponsavelMutation();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = telefone.replace(/\D/g, "");
    if (clean.length < 10) {
      setErrorMessage("Por favor, digite um telefone com DDD válido.");
      return;
    }

    try {
      const res = await checkPhoneMutation.mutateAsync(clean);
      setIsFirstAccess(!res.hasPin);
      setStep("pin");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "Cadastro não encontrado. Entre em contato com o motorista.";
      setErrorMessage(msg);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setErrorMessage("O PIN deve conter exatamente 4 números.");
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, "");

    if (isFirstAccess) {
      if (pin !== pinConfirm) {
        setErrorMessage("Os PINs digitados não coincidem.");
        return;
      }

      try {
        const res = await setupPinMutation.mutateAsync({ telefone: cleanPhone, pin });
        setSession(res.token, res.passageiros);
        if (res.passageiros.length > 1) {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT);
        } else {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
        }
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setErrorMessage(errorObj.response?.data?.message || "Erro ao configurar o PIN. Tente novamente.");
      }
    } else {
      try {
        const res = await loginMutation.mutateAsync({ telefone: cleanPhone, pin });
        setSession(res.token, res.passageiros);
        if (res.passageiros.length > 1) {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT);
        } else {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
        }
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setErrorMessage(errorObj.response?.data?.message || "PIN incorreto. Tente novamente.");
      }
    }
  };

  const handleForgotPin = () => {
    alert("Para redefinir o seu PIN de acesso, solicite ao motorista da van para resetar seu PIN no aplicativo.");
  };

  const isPending = checkPhoneMutation.isPending || setupPinMutation.isPending || loginMutation.isPending;

  return (
    <div className="w-full space-y-4">
      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Telefone do Responsável (WhatsApp)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(phoneMask(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700/60 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-semibold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : (
              <>
                <span>Avançar</span>
                <UserCheck className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === "pin" && (
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setPin("");
              setPinConfirm("");
              setErrorMessage(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Alterar telefone ({telefone})</span>
          </button>

          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-3 text-amber-300 text-xs">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              {isFirstAccess ? (
                <p className="font-medium">Primeiro Acesso! Crie uma senha PIN de 4 dígitos para proteger seu acesso.</p>
              ) : (
                <p className="font-medium">Digite o seu PIN de 4 dígitos para acessar a carteirinha.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              PIN de 4 Dígitos
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="****"
                className="w-full text-center tracking-widest text-xl rounded-xl bg-slate-800/80 border border-slate-700/60 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
                disabled={isPending}
              />
            </div>
          </div>

          {isFirstAccess && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Confirme o PIN de 4 Dígitos
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  maxLength={4}
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                  placeholder="****"
                  className="w-full text-center tracking-widest text-xl rounded-xl bg-slate-800/80 border border-slate-700/60 py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                  disabled={isPending}
                />
              </div>
            </div>
          )}

          {!isFirstAccess && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPin}
                className="text-xs text-amber-400 hover:underline"
              >
                Esqueci meu PIN
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-semibold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : (
              <span>{isFirstAccess ? "Criar PIN e Entrar" : "Entrar no App"}</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
