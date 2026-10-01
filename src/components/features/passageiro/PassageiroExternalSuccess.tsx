import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  APP_STORE_BADGE_URL,
  APP_STORE_URL,
  getAppPlatformEligibility,
  PLAY_STORE_BADGE_URL,
  PLAY_STORE_URL,
} from "@/utils/detectPlatform";

interface PassageiroExternalSuccessProps {
  subtitleDestino: string;
  onNewCadastro: () => void;
}

export function PassageiroExternalSuccess({
  subtitleDestino,
  onNewCadastro,
}: PassageiroExternalSuccessProps) {
  const { isEligibleAndroid, isEligibleIos, hasEligibleApp } = getAppPlatformEligibility();

  return (
    <div className="min-h-screen bg-[#e8ecf1] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 text-center bg-slate-50 border border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-[#1a3a5c] mb-3 tracking-tight">
          Cadastro Enviado!
        </h2>

        {hasEligibleApp ? (
          <>
            <p className="text-slate-500 mb-6 leading-relaxed text-sm font-medium">
              Baixe o aplicativo para acompanhar a{" "}
              <strong className="text-[#1a3a5c] font-semibold">
                carteirinha do aluno
              </strong>{" "}
              e a rotina escolar:
            </p>

            {isEligibleAndroid && (
              <div className="flex flex-col items-center mb-6">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:-translate-y-0.5 active:scale-95 transition-transform"
                  aria-label="Baixar Van360 na Play Store"
                >
                  <img
                    src={PLAY_STORE_BADGE_URL}
                    alt="Disponível no Google Play"
                    className="h-11 sm:h-12 w-auto object-contain"
                  />
                </a>
              </div>
            )}

            {isEligibleIos && (
              <div className="flex flex-col items-center mb-6">
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:-translate-y-0.5 active:scale-95 transition-transform"
                  aria-label="Baixar Van360 na App Store"
                >
                  <img
                    src={APP_STORE_BADGE_URL}
                    alt="Baixar na App Store"
                    className="h-11 sm:h-12 w-auto object-contain"
                  />
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500 mb-8 leading-relaxed text-base font-medium">
            Tudo certo! Os dados do aluno foram enviados com sucesso para {subtitleDestino}.
          </p>
        )}

        <div className="pt-2 space-y-4">
          <Button
            onClick={onNewCadastro}
            className="w-full h-12 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold shadow-md transition-all active:scale-[0.98]"
          >
            Fazer novo cadastro
          </Button>
          <p className="text-xs text-slate-400 font-medium italic">
            Você já pode fechar esta janela com segurança.
          </p>
        </div>
      </div>
    </div>
  );
}
