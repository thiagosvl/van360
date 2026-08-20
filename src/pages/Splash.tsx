import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bus, ChevronRight, LogIn, Sparkles, Users } from "lucide-react";

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
  useAnalyticsInjector({ clarity: true, force: true });

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

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
    <main className="h-[100dvh] w-full bg-[#FBF8F9] overflow-hidden flex flex-col justify-between relative">

      {/* Botão Voltar Circular (Etapa Motorista) */}
      {step === "motorista" && (
        <button
          type="button"
          onClick={handleBackToProfile}
          aria-label="Voltar para seleção de perfil"
          className="absolute left-4 top-[max(env(safe-area-inset-top),2.5rem)] [@media(min-height:751px)]:top-[max(env(safe-area-inset-top),3rem)] [@media(max-height:680px)]:top-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm flex items-center justify-center text-[#081A34] hover:bg-white active:scale-90 outline-none focus:outline-none focus-visible:outline-none transition-all cursor-pointer z-30 animate-in fade-in zoom-in-95 duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
      )}

      {/* ================= CONTEÚDO (TOPO) ================= */}
      <section className="shrink-0 flex flex-col items-center pt-[max(env(safe-area-inset-top),5.5rem)] [@media(min-height:751px)_and_(max-height:850px)]:!pt-[max(env(safe-area-inset-top),4.5rem)] [@media(min-height:681px)_and_(max-height:750px)]:!pt-[max(env(safe-area-inset-top),3.75rem)] [@media(min-height:581px)_and_(max-height:680px)]:!pt-6 [@media(max-height:580px)]:!pt-3 px-6 z-10">

        {step === "profile" ? (
          <div className="flex flex-col items-center w-full max-w-[340px] animate-in fade-in zoom-in-95 duration-300">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-10 w-auto [@media(min-height:581px)_and_(max-height:750px)]:!h-9 [@media(max-height:580px)]:!h-7"
            />

            <div className="mt-3.5 [@media(min-height:581px)_and_(max-height:750px)]:!mt-2.5 text-center">
              <h1 className="font-bold text-[#081A34] leading-tight text-[1.75rem] [@media(min-height:751px)]:text-[1.95rem] [@media(max-height:680px)]:text-[1.5rem]">
                Quem está acessando?
              </h1>

              <p className="mt-1.5 text-[0.95rem] [@media(max-height:680px)]:text-[0.85rem] text-slate-500">
                Selecione o seu perfil no Van360
              </p>
            </div>

            {/* Cards de Seleção */}
            <div className="w-full space-y-3 mt-8 [@media(min-height:751px)]:mt-10 [@media(max-height:680px)]:mt-5">
              {/* Opção 1: Motorista / Equipe */}
              <button
                type="button"
                onClick={handleSelectMotorista}
                className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-200/80 hover:border-slate-300 active:border-[#15469C] active:scale-[0.98] shadow-sm hover:shadow-md outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-[#15469C]/10 text-[#15469C] flex items-center justify-center shrink-0">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-slate-800 block leading-tight">
                      Motorista ou Equipe
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                      Gerenciar rotas, alunos e financeiro
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-1">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              {/* Opção 2: Pai / Responsável */}
              <button
                type="button"
                onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}?tipo=responsavel`, { state: { fromSplash: true } })}
                className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-200/80 hover:border-slate-300 active:border-amber-500 active:scale-[0.98] shadow-sm hover:shadow-md outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-slate-800 block leading-tight">
                      Pai ou Responsável
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                      Acompanhar a van e carteirinha do aluno
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-1">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-[340px] animate-in fade-in slide-in-from-right-4 duration-300">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-10 w-auto [@media(min-height:581px)_and_(max-height:750px)]:!h-9 [@media(max-height:580px)]:!h-7"
            />

            <div className="mt-3.5 [@media(min-height:581px)_and_(max-height:750px)]:!mt-2.5 text-center">
              <h1 className="font-bold text-[#081A34] leading-tight text-[1.75rem] [@media(min-height:751px)]:text-[1.95rem] [@media(max-height:680px)]:text-[1.5rem]">
                Área do Motorista
              </h1>

              <p className="mt-1.5 text-[0.95rem] [@media(max-height:680px)]:text-[0.85rem] text-slate-500">
                Você dirige. A gente organiza.
              </p>
            </div>

            {/* Cards de Ação do Motorista */}
            <div className="w-full space-y-3 mt-8 [@media(min-height:751px)]:mt-10 [@media(max-height:680px)]:mt-5">
              {/* Opção 1: Já tenho uma conta (Login) */}
              <button
                type="button"
                onClick={() => navigate(`${ROUTES.PUBLIC.LOGIN}?tipo=motorista`, { state: { fromSplash: true } })}
                className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-200/80 hover:border-slate-300 active:border-[#15469C] active:scale-[0.98] shadow-sm hover:shadow-md outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-[#15469C]/10 text-[#15469C] flex items-center justify-center shrink-0">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-slate-800 block leading-tight">
                      Já tenho uma conta
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                      Entrar com CPF ou CNPJ
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-1">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              {/* Opção 2: Criar conta grátis (Registro) */}
              <button
                type="button"
                onClick={() => navigate(ROUTES.PUBLIC.REGISTER, { state: { fromSplash: true } })}
                className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-200/80 hover:border-slate-300 active:border-emerald-500 active:scale-[0.98] shadow-sm hover:shadow-md outline-none focus:outline-none focus-visible:outline-none transition-all flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[14px] sm:text-base text-slate-800 block leading-tight">
                      Criar conta grátis
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                      Cadastrar minha van em 1 minuto
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-1">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            </div>
          </div>
        )}

      </section>

      {/* ================= ILUSTRAÇÃO (BASE) ================= */}
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
            
            /* Padrão para telas altas */
            bottom-[-20px]
            
            /* 1. Telas normais altas */
            [@media(min-height:751px)_and_(max-height:850px)]:!bottom-[-45px]
            
            /* 2. Telas finas como Galaxy S9+ (largura até 340px) ficam perfeitas com -45px independente da altura */
            [@media(max-width:340px)]:!bottom-[-45px]
            
            /* 3. Telas largas e altura média */
            [@media(min-width:341px)_and_(min-height:681px)_and_(max-height:750px)]:!bottom-[-70px]
            
            /* 4. Telas largas e muito curtas como iPhone SE (largura > 340 e altura < 680) */
            [@media(min-width:341px)_and_(max-height:680px)]:!bottom-[-70px]
          "
        />
      </section>

    </main>
  );
}