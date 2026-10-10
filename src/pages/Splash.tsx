import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bus, ChevronRight, Info, LogIn, Sparkles, Users } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";


function SplashIllustration({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const webpSrc = src.replace(/\.png$/, ".webp");

  return (
    <picture className="contents">
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={className}
      />
    </picture>
  );
}

export default function Splash() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openShowcaseTransporteEscolarDialog } = useLayout();

  const getInitialStep = (): "profile" | "motorista" => {
    if (
      searchParams.get("tipo") === "motorista" ||
      (location.state as { step?: string })?.step === "motorista"
    ) {
      return "motorista";
    }
    return "profile";
  };

  const [step, setStep] = useState<"profile" | "motorista">(getInitialStep);

  const handleSelectMotorista = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e?.currentTarget instanceof HTMLElement) {
      e.currentTarget.blur();
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setStep("motorista");
    setSearchParams({ tipo: "motorista" }, { replace: true });
    window.history.pushState({ splashStep: "motorista" }, "");
  };

  const handleBackToProfile = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setStep("profile");
    setSearchParams({}, { replace: true });
    if (window.history.state?.splashStep === "motorista") {
      window.history.back();
    }
  }, [setSearchParams]);

  useEffect(() => {
    const handlePopState = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      if (step === "motorista") {
        setStep("profile");
        setSearchParams({}, { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [step, setSearchParams]);

  return (
    <main className="h-[100dvh] w-full bg-[#f5f5f5] overflow-hidden flex flex-col justify-between relative">
      {step === "motorista" && (
        <button
          type="button"
          onClick={handleBackToProfile}
          aria-label="Voltar para seleção de perfil"
          className="absolute left-4 top-[max(env(safe-area-inset-top),2.5rem)] [@media(min-height:751px)]:top-[max(env(safe-area-inset-top),3rem)] [@media(max-height:680px)]:top-4 w-10 h-10 rounded-full bg-white border border-[#e5e5e5] shadow-xs flex items-center justify-center text-[#0a0a0a] hover:bg-[#f5f5f5] active:scale-90 outline-none focus:outline-none focus-visible:outline-none transition-all cursor-pointer z-30 animate-in fade-in zoom-in-95 duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-[#737373]" />
        </button>
      )}

      <section className="shrink-0 flex flex-col items-center pt-[max(env(safe-area-inset-top),5.5rem)] [@media(min-height:751px)_and_(max-height:850px)]:!pt-[max(env(safe-area-inset-top),4.5rem)] [@media(min-height:681px)_and_(max-height:750px)]:!pt-[max(env(safe-area-inset-top),3.75rem)] [@media(min-height:581px)_and_(max-height:680px)]:!pt-6 [@media(max-height:580px)]:!pt-3 px-6 z-10">
        {step === "profile" ? (
          <div className="flex flex-col items-center w-full max-w-[340px] animate-in fade-in zoom-in-95 duration-300">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-11 w-auto [@media(min-height:581px)_and_(max-height:750px)]:!h-10 [@media(max-height:580px)]:!h-8 drop-shadow-xs"
            />

            <div className="mt-3.5 [@media(min-height:581px)_and_(max-height:750px)]:!mt-2.5 text-center">
              <h1 className="font-bold text-[#0a0a0a] leading-tight text-[1.75rem] [@media(min-height:751px)]:text-[1.95rem] [@media(max-height:680px)]:text-[1.5rem]">
                Quem está acessando?
              </h1>

              <p className="mt-1.5 text-[0.95rem] [@media(max-height:680px)]:text-[0.85rem] text-[#737373]">
                Selecione uma opção para continuar
              </p>
            </div>

            <div className="w-full space-y-3 mt-8 [@media(min-height:751px)]:mt-10 [@media(max-height:680px)]:mt-5">
              <button
                type="button"
                onClick={handleSelectMotorista}
                className="w-full text-left p-3.5 sm:p-4 rounded-[20px] bg-white border border-[#e5e5e5] hover:border-[#2563eb] hover:bg-[#f8faff] active:scale-[0.98] shadow-xs hover:shadow-sm outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-[14px] bg-[#eff6ff] text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-[#0a0a0a] group-hover:text-[#2563eb] transition-colors block leading-tight">
                      Transporte Escolar
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#737373] leading-snug mt-0.5">
                      Motoristas, monitores ou donos de van
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#f5f5f5] group-hover:bg-[#eff6ff] flex items-center justify-center shrink-0 ml-1 transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#2563eb] transition-colors" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}?tipo=responsavel`, { state: { fromSplash: true } })}
                className="w-full text-left p-3.5 sm:p-4 rounded-[20px] bg-white border border-[#e5e5e5] hover:border-amber-500 hover:bg-[#fffbeb] active:scale-[0.98] shadow-xs hover:shadow-sm outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-[14px] bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-[#0a0a0a] group-hover:text-amber-800 transition-colors block leading-tight">
                      Pai / Responsável
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#737373] leading-snug mt-0.5">
                      Acessar a carteirinha do seu filho
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#f5f5f5] group-hover:bg-amber-100 flex items-center justify-center shrink-0 ml-1 transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-amber-600 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-[340px] animate-in fade-in slide-in-from-right-4 duration-300">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-11 w-auto [@media(min-height:581px)_and_(max-height:750px)]:!h-10 [@media(max-height:580px)]:!h-8 drop-shadow-xs"
            />

            <div className="mt-3.5 [@media(min-height:581px)_and_(max-height:750px)]:!mt-2.5 text-center">
              <h1 className="font-bold text-[#0a0a0a] leading-tight text-[1.75rem] [@media(min-height:751px)]:text-[1.95rem] [@media(max-height:680px)]:text-[1.5rem]">
                Transporte Escolar
              </h1>

              <p className="mt-1.5 text-[0.95rem] [@media(max-height:680px)]:text-[0.85rem] text-[#737373]">
                Você dirige. A gente organiza.
              </p>
            </div>

            <div className="w-full space-y-3 mt-8 [@media(min-height:751px)]:mt-10 [@media(max-height:680px)]:mt-5">
              <button
                type="button"
                onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}?tipo=motorista`, { state: { fromSplash: true } })}
                className="w-full text-left p-3.5 sm:p-4 rounded-[20px] bg-white border border-[#e5e5e5] hover:border-[#2563eb] hover:bg-[#f8faff] active:scale-[0.98] shadow-xs hover:shadow-sm outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-[14px] bg-[#eff6ff] text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-[#0a0a0a] group-hover:text-[#2563eb] transition-colors block leading-tight">
                      Já tenho uma conta
                    </span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#f5f5f5] group-hover:bg-[#eff6ff] flex items-center justify-center shrink-0 ml-1 transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#2563eb] transition-colors" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.PUBLIC.REGISTER, { state: { fromSplash: true } })}
                className="w-full text-left p-3.5 sm:p-4 rounded-[20px] bg-white border border-[#e5e5e5] hover:border-emerald-500 hover:bg-[#f0fdf4] active:scale-[0.98] shadow-xs hover:shadow-sm outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-[14px] bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-[#0a0a0a] group-hover:text-emerald-700 transition-colors block leading-tight">
                      Criar conta grátis
                    </span>
                    <p className="text-[11px] sm:text-xs text-[#737373] leading-snug mt-0.5">
                      Cadastrar minha van em 1 minuto
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#f5f5f5] group-hover:bg-emerald-100 flex items-center justify-center shrink-0 ml-1 transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-emerald-700 transition-colors" />
                </div>
              </button>

              <button
                type="button"
                onClick={openShowcaseTransporteEscolarDialog}
                className="w-full text-center py-2.5 px-3 rounded-[18px] bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] active:scale-[0.98] outline-none transition-all flex items-center justify-center gap-2 cursor-pointer select-none text-[#0a0a0a] group shadow-xs"
              >
                <Info className="w-4 h-4 text-[#2563eb] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs sm:text-[13px] text-[#0a0a0a]">
                  Veja o que o app faz
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#737373] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="flex-1 min-h-0 w-full relative overflow-hidden mt-3 [@media(max-height:750px)]:mt-2 pointer-events-none select-none">
        <SplashIllustration
          src="/assets/login-splash.webp"
          alt="Van escolar"
          className="
            absolute
            left-1/2
            -translate-x-1/2
            w-full
            h-auto
            top-auto
            bottom-[-20px]
            [@media(min-height:751px)_and_(max-height:850px)]:!bottom-[-45px]
            [@media(max-width:340px)]:!bottom-[-45px]
            [@media(min-width:341px)_and_(min-height:681px)_and_(max-height:750px)]:!bottom-[-70px]
            [@media(min-width:341px)_and_(max-height:680px)]:!bottom-[-70px]
          "
        />
      </section>

    </main>
  );
}
