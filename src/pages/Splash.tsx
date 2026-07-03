import { ROUTES } from "@/constants/routes";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { useSEO } from "@/hooks/useSEO";
import { useNavigate } from "react-router-dom";

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
  useSEO({
    title: "Van360 — Você dirige. A gente organiza.",
    description:
      "Organize passageiros, mensalidades, contratos e recibos da sua van escolar.",
  });

  useAnalyticsInjector({ clarity: true, force: true });

  const navigate = useNavigate();

  return (
    <main className="h-[100dvh] w-full bg-[#FBF8F9] overflow-hidden flex flex-col justify-between">

      {/* ================= CONTEÚDO (TOPO) ================= */}
      <section className="shrink-0 flex flex-col items-center pt-[max(env(safe-area-inset-top),3.5rem)] [@media(max-height:850px)]:pt-[max(env(safe-area-inset-top),2.5rem)] [@media(max-height:750px)]:pt-6 [@media(max-height:580px)]:pt-3 px-6">

        <img
          src="/assets/logo-van360.webp"
          alt="Van360"
          className="h-10 w-auto [@media(max-height:750px)]:h-9 [@media(max-height:580px)]:h-7"
        />

        <div className="mt-3 [@media(max-height:750px)]:mt-2 text-center max-w-[340px]">
          <h1 className="font-bold text-[#081A34] leading-tight text-[2.15rem] [@media(max-height:750px)]:text-[1.85rem] [@media(max-height:580px)]:text-[1.6rem]">
            Bem-vindo ao
            <br />
            <span className="text-[#15469C]">
              Van360
            </span>
          </h1>

          <p className="mt-3 [@media(max-height:750px)]:mt-2 [@media(max-height:580px)]:mt-1.5 text-[1.05rem] [@media(max-height:750px)]:text-[0.95rem] [@media(max-height:580px)]:text-[0.88rem] leading-7 [@media(max-height:750px)]:leading-6 [@media(max-height:580px)]:leading-5 text-slate-500">
            Você dirige.
            <br />
            A gente organiza.
          </p>
        </div>

        {/* Botões */}
        <div className="w-full max-w-[320px] mt-10 [@media(max-height:850px)]:mt-8 [@media(max-height:750px)]:mt-5 [@media(max-height:580px)]:mt-3">
          <button
            onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
            className="
              h-14
              [@media(max-height:750px)]:h-12
              [@media(max-height:580px)]:h-10
              w-full
              rounded-full
              bg-[#081A34]
              text-white
              font-semibold
              text-lg
              [@media(max-height:750px)]:text-base
              [@media(max-height:580px)]:text-sm
              shadow-xl
              active:scale-[.98]
            "
          >
            Entrar
          </button>

          <button
            onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
            className="
              mt-3
              [@media(max-height:750px)]:mt-2
              h-14
              [@media(max-height:750px)]:h-12
              [@media(max-height:580px)]:h-10
              w-full
              rounded-full
              border-2
              border-[#081A34]
              bg-white
              text-[#081A34]
              font-semibold
              text-lg
              [@media(max-height:750px)]:text-base
              [@media(max-height:580px)]:text-sm
              active:scale-[.98]
            "
          >
            Criar conta
          </button>
        </div>

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
            /* Matemática exata: compensa os 106px excedentes de altura distribuindo 53px para cima e 53px para baixo em relação ao S9+ */
            [@media(min-width:341px)_and_(max-height:680px)]:!bottom-[-100px]
          "
        />
      </section>

    </main>
  );
}