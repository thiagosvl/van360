import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  APP_STORE_BADGE_URL,
  APP_STORE_URL,
  getAppPlatformEligibility,
  isNativeApp,
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
  const showAppDownload = !isNativeApp() && hasEligibleApp;

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 text-center bg-white border border-[#e5e5e5] shadow-xs rounded-[24px] relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-[18px] flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <h2 className="text-2xl font-headline font-bold text-foreground mb-3 tracking-tight">
          Cadastro Enviado!
        </h2>

        {showAppDownload ? (
          <>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm font-medium">
              Baixe o aplicativo para acompanhar a{" "}
              <strong className="text-foreground font-semibold">
                carteirinha do aluno
              </strong>{" "}
              e a rotina escolar:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {isEligibleAndroid && (
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
                    className="h-10 sm:h-11 w-auto object-contain"
                  />
                </a>
              )}

              {isEligibleIos && (
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
                    className="h-10 sm:h-11 w-auto object-contain"
                  />
                </a>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground mb-8 leading-relaxed text-base font-medium">
            Tudo certo! Os dados do aluno foram enviados com sucesso para {subtitleDestino}.
          </p>
        )}

        <div className="pt-2 space-y-4">
          <Button
            onClick={onNewCadastro}
            className="w-full h-12 rounded-[18px] bg-primary hover:bg-primary-hover text-white font-bold shadow-xs transition-all active:scale-[0.98]"
          >
            Fazer novo cadastro
          </Button>
          <p className="text-xs text-muted-foreground font-medium italic">
            Você já pode fechar esta janela com segurança.
          </p>
        </div>
      </div>
    </div>
  );
}
