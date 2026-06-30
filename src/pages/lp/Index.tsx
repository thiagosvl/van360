import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { TermosUsoDialog } from "@/components/dialogs/TermosUsoDialog";
import { PoliticaPrivacidadeDialog } from "@/components/dialogs/PoliticaPrivacidadeDialog";
import { CookieConsentGlobal } from "@/components/features/CookieConsentGlobal";
import { VideoCommerce } from "@/components/features/VideoCommerce";
import { useCookieConsent } from "@/hooks/business/useCookieConsent";
import { getWhatsAppUrl } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";

import {
  Check as LucideCheck,
  CheckCircle2,
  ChevronDown,
  Star,
} from "lucide-react";

import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePublicPlans } from "@/hooks/api/usePublicPlans";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import { SubscriptionIdentifer } from "@/types/enums";
import { getNowBR } from "@/utils/dateUtils";

// ── Scroll reveal hook ──
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("lp-visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`lp-reveal ${className}`}>
      {children}
    </div>
  );
}

function WhatsAppBalloon({ text, delay = "1s", positionClass = "top-6 -left-6" }: { text: string, delay?: string, positionClass?: string }) {
  return (
    <div
      className={`absolute bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 md:p-3 border border-slate-100 max-w-[150px] md:max-w-[220px] z-20 pointer-events-none ${positionClass}`}
      style={{ animation: `lp-countUp .6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both` }}
    >
      <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5">
        <div className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
          <WhatsAppIcon className="w-2 h-2 md:w-3 md:h-3 text-[#25D366]" />
        </div>
        <div className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">WhatsApp enviado</div>
      </div>
      <div className="text-[0.65rem] md:text-[0.75rem] text-[#1a3a5c] font-medium leading-snug">{text}</div>
    </div>
  );
}

// ── FAQ item ──
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal>
      <div className="border-b border-slate-200">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-5 text-left text-[#1a3a5c] font-semibold text-base hover:text-[#f59e0b] transition-colors gap-3"
          aria-expanded={open}
        >
          {q}
          <ChevronDown
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: open ? "200px" : "0" }}
        >
          <p className="pb-5 text-[0.92rem] text-slate-500 leading-relaxed">
            {a}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

// ── Check icon for pricing ──
const Check = () => (
  <CheckCircle2 className="w-[18px] h-[18px] text-green-600 flex-shrink-0 mt-0.5" />
);

// ── Inline CTA block (reusado entre seções) ──
function InlineCta({ label = "Testar grátis por 15 dias", to }: { label?: string; to: string }) {
  return (
    <Reveal>
      <div className="text-center mt-10">
        <Link
          to={to}
          className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-7 py-3.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all"
        >
          {label}
        </Link>
        <p className="text-[0.8rem] text-slate-400 mt-2">
          Sem cartão · Sem compromisso
        </p>
      </div>
    </Reveal>
  );
}

// ── Mockup image with WebP fallback ──
function MockupImage({ src, alt, loading = "lazy", width, height, className }: {
  src: string;
  alt: string;
  loading?: "lazy" | "eager";
  width: number;
  height: number;
  className?: string;
}) {
  const webpSrc = src.replace(/\.png$/, ".webp");
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} loading={loading} width={width} height={height} className={className} />
    </picture>
  );
}

// ── Main component ──
const Index = () => {
  useSEO({
    title: "Van360 — App para Van Escolar e Gestão de Passageiros",
    description: "Cobre mensalidades automaticamente, envie lembretes aos pais e emita recibos. A gestão completa da sua van escolar na palma da mão. 15 dias grátis!",
  });
  const [termosOpen, setTermosOpen] = useState(false);
  const [privacidadeOpen, setPrivacidadeOpen] = useState(false);
  const { isPending: cookiePending } = useCookieConsent();

  // ── Preços Dinâmicos ──
  const { data: plansData } = usePublicPlans();

  const pricing = useMemo(() => {
    const plans = plansData?.plans || [];
    const isPromoActive = plansData?.isPromotionActive ?? false;

    const monthlyPlan = SubscriptionUtils.getPlanByPeriod(plans, SubscriptionIdentifer.MONTHLY);
    const yearlyPlan = SubscriptionUtils.getPlanByPeriod(plans, SubscriptionIdentifer.YEARLY);

    // Valor equivalente do plano anual
    const highlightPrice = SubscriptionUtils.getMonthlyEquivalent(yearlyPlan, isPromoActive);

    // Valor do plano mensal considerando promo
    const originalPrice = monthlyPlan ? SubscriptionUtils.getFinalPrice(monthlyPlan, isPromoActive) : 25.00;

    // Valor total do anual considerando promo
    const yearlyTotal = yearlyPlan ? SubscriptionUtils.getFinalPrice(yearlyPlan, isPromoActive) : 239.00;

    // Valor normal sem desconto do mensal
    const monthlyNormalPrice = monthlyPlan?.valor || 39.90;

    return {
      highlight: highlightPrice > 0 ? highlightPrice : 19.90,
      original: originalPrice,
      monthlyNormal: monthlyNormalPrice,
      yearlyTotal: yearlyTotal,
      isPromoActive,
      highlightFormatted: SubscriptionUtils.formatCurrency(highlightPrice > 0 ? highlightPrice : 19.90).replace("R$", "").trim(),
      originalFormatted: SubscriptionUtils.formatCurrency(originalPrice).replace("R$", "").trim(),
      monthlyNormalFormatted: SubscriptionUtils.formatCurrency(monthlyNormalPrice).replace("R$", "").trim(),
      yearlyTotalFormatted: SubscriptionUtils.formatCurrency(yearlyTotal).replace("R$", "").trim()
    };
  }, [plansData]);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "van360-schema";
    script.textContent = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Van360",
        "description": "Organize passageiros, mensalidades, contratos e recibos da sua van escolar. Tudo digital, tudo pelo celular.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Android, Web",
        "url": "https://van360.com.br",
        "offers": {
          "@type": "Offer",
          "price": pricing.highlight.toFixed(2),
          "priceCurrency": "BRL",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "O que o Van360 faz?",
            "acceptedAnswer": { "@type": "Answer", "text": "O Van360 organiza a gestão da sua van escolar: cadastro de passageiros, controle de mensalidades, geração de contratos digitais e emissão de recibos. Tudo pelo celular, em um lugar só." },
          },
          {
            "@type": "Question",
            "name": "Preciso pagar para começar a utilizar?",
            "acceptedAnswer": { "@type": "Answer", "text": "Não. Os 15 dias de teste são 100% grátis, sem cadastrar cartão, sem compromisso. Você usa tudo, com seus dados reais, e só decide depois." },
          },
          {
            "@type": "Question",
            "name": "Onde posso usar o Van360?",
            "acceptedAnswer": { "@type": "Answer", "text": "Em qualquer lugar. Funciona no navegador do celular, tablet ou computador — sem baixar nada. Se preferir, tem o app Android, que é leve e rápido. O app para iPhone está em desenvolvimento, mas a versão web funciona perfeitamente no Safari." },
          },
          {
            "@type": "Question",
            "name": "O que é a oferta/preço fundador?",
            "acceptedAnswer": { "@type": "Answer", "text": `É um preço especial para os primeiros motoristas que entrarem na plataforma. Quem entra agora paga a partir de R$ ${pricing.isPromoActive ? pricing.highlightFormatted : pricing.originalFormatted}/mês para sempre, mesmo quando o preço subir.` },
          },
          {
            "@type": "Question",
            "name": "O contrato gerado tem validade jurídica?",
            "acceptedAnswer": { "@type": "Answer", "text": "Sim. Os contratos são digitais e assinados eletronicamente, com validade legal conforme a legislação brasileira. Servem como documento formal entre você e o responsável do passageiro." },
          },
          {
            "@type": "Question",
            "name": "O app é pesado? Preciso baixar?",
            "acceptedAnswer": { "@type": "Answer", "text": "Não precisa baixar nada pra começar. O Van360 funciona direto pelo navegador — no celular, tablet ou computador. Se preferir, tem o app Android que é leve e rápido. Você escolhe como quer usar." },
          },
          {
            "@type": "Question",
            "name": "Quanto vou pagar depois dos 15 dias?",
            "acceptedAnswer": { "@type": "Answer", "text": `Se você entrar agora como fundador, paga a partir de R$ ${pricing.isPromoActive ? pricing.highlightFormatted : pricing.originalFormatted}/mês — para sempre, sem reajuste. Se preferir não continuar, é só não assinar. Sem multa, sem burocracia.` },
          },
        ],
      },
    ]);
    document.head.appendChild(script);
    return () => { document.getElementById("van360-schema")?.remove(); };
  }, []);

  const CTA = ROUTES.PUBLIC.REGISTER;
  const LOGIN = ROUTES.PUBLIC.LOGIN;

  const planFeatures = [
    "Lembretes de cobrança aos pais via WhatsApp",
    "Recibos gerados automaticamente",
    "Contratos digitais ilimitados",
    "Link de cadastro fácil para os pais",
    "Passageiros e vans sem limite",
    "Controle de gastos e finanças",
    "Alerta de aniversariantes",
    "Acesso no celular e computador",
    "Suporte direto no WhatsApp",
  ];

  const features = [
    {
      headline: "Pare de correr atrás de quem ainda não pagou",
      text: "Chega de esquecimentos. Saiba exatamente quem pagou e quem está pendente.",
      mockup: "/assets/lp/mockup-mensalidades.png",
      alt: "App de cobrança de mensalidade para van escolar mostrando painel financeiro",
      balloonText: "A mensalidade do Enzo está atrasada há 3 dias.",
    },
    {
      headline: "Pare de cobrar pais manualmente todos os meses",
      text: "O Van360 envia lembretes de pagamento automaticamente pelo WhatsApp.",
      mockup: "/assets/lp/mockup-whatsapp.png",
      alt: "Sistema de cobrança automática via WhatsApp para transporte escolar",
      balloonText: "A mensalidade do Enzo vence hoje!",
    },
    {
      headline: "Nunca mais procure informações em conversas e planilhas",
      text: "Todos os passageiros organizados em um só lugar.",
      mockup: "/assets/lp/mockup-carteirinha.png",
      alt: "Lista e cadastro de passageiros no aplicativo de gestão de van escolar",
      balloonText: "Clique no link e cadastre o seu filho na van.",
    },
    {
      headline: "Menos caderno, menos risco de perder contrato",
      text: "Envie contratos digitais para assinatura online.",
      mockup: "/assets/lp/mockup-contrato.png",
      alt: "Gerador de contrato digital e assinatura online para motoristas de van",
      balloonText: "O motorista enviou um contrato para assinatura.",
    },
    {
      headline: "Recibos gerados automaticamente",
      text: "Registre pagamentos e gere comprovantes em segundos.",
      mockup: "/assets/lp/mockup-recibo.png",
      alt: "Emissor de recibo de pagamento online para passageiros de van escolar",
      balloonText: "Segue abaixo o recibo de pagamento:",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-['Inter',sans-serif] overflow-x-hidden scroll-smooth selection:bg-amber-200">
      <style>{`
        .lp-reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
        .lp-visible { opacity: 1; transform: translateY(0); }



        @keyframes lp-countUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        @keyframes lp-cta-glow {
          0%, 100% { box-shadow: 0 2px 8px rgba(245,158,11,0.35); }
          50% { box-shadow: 0 4px 20px rgba(245,158,11,0.5); }
        }
        .lp-cta-glow { animation: lp-cta-glow 2.5s ease-in-out infinite; }

        @media (min-width: 768px) {
          .hero-phone {
            transform: perspective(800px) rotateY(-8deg);
            transition: transform 0.4s ease;
          }
          .hero-phone:hover {
            transform: perspective(800px) rotateY(-2deg);
          }
          .feature-phone {
            transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .feature-phone:hover {
            transform: translateY(-12px) scale(1.03);
          }
        }
      `}</style>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center shrink-0">
            <img
              src="/assets/logo-van360.png"
              alt="Van360"
              className="h-7 sm:h-8 w-auto select-none"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link
              to={LOGIN}
              className="text-xs sm:text-sm font-bold text-[#1a3a5c] hover:text-[#f59e0b] px-2 py-1 transition-colors"
            >
              Login
            </Link>
            <Link
              to={CTA}
              className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-[12px] sm:text-[14px] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer navbar fixed */}
      <div className="h-14 md:h-16" />

      {/* ══════════ HERO ══════════ */}
      <section className="pt-12 md:pt-16 pb-14 md:pb-20 bg-gradient-to-b from-[#f0f4f8] to-white">
        <div className="max-w-[1120px] mx-auto px-5">
          <div className="flex flex-col md:grid md:grid-cols-[60%_40%] items-center gap-10 md:gap-8">

            {/* Texto */}
            <div className="text-center md:text-left order-1 flex flex-col">
              <div className="inline-flex items-center justify-center md:justify-start gap-1.5 bg-[#1a3a5c]/5 px-3 py-1.5 rounded-full text-[#1a3a5c] font-bold text-xs uppercase tracking-wider mb-5 mx-auto md:mx-0 border border-[#1a3a5c]/10 w-fit">
                App para motorista escolar
              </div>
              <h1 className="text-[clamp(1.8rem,5vw,3rem)] sm:text-[clamp(1.9rem,5vw,3rem)] font-black leading-[1.12] tracking-tight mb-4">
                <span className="text-[#f59e0b]">Chega de cobrar pai por pai.</span>
                <br />
                <span className="text-[#1a3a5c]">Chega de planilha e caderno.</span>
              </h1>
              <p className="text-[clamp(1.05rem,2.5vw,1.2rem)] text-slate-500 max-w-[520px] md:mx-0 mx-auto mb-8 leading-relaxed">
                O Van360 organiza seus passageiros, cobra automático pelo WhatsApp e emite recibo — tudo num só lugar.
              </p>

              {/* CTA */}
              <div className="flex flex-col items-center md:items-start gap-3">
                <Link
                  to={CTA}
                  className="lp-cta-glow inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-8 py-4 rounded-lg hover:scale-[1.02] hover:-translate-y-0.5 transition-all min-h-[44px] w-full sm:w-auto shadow-lg"
                >
                  Testar grátis por 15 dias
                </Link>
              </div>

              {/* Mockup — SÓ MOBILE */}
              <div className="flex justify-center md:hidden relative mt-10 mb-8">
                <div className="max-w-[320px] sm:max-w-[360px] w-full relative">
                  <WhatsAppBalloon text="A mensalidade do Enzo vence hoje." delay="1s" positionClass="-top-4 left-0 sm:-left-4" />
                  <MockupImage
                    src="/assets/lp/mockup-mensalidades-2.png"
                    alt="App de cobrança de mensalidade para van escolar rodando no celular"
                    loading="eager"
                    width={1080}
                    height={1400}
                    className="w-full h-auto drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-3 mt-0 md:mt-6 mb-4 md:mb-0 md:mx-0 mx-auto w-fit text-left">
                {[
                  "Passageiros ilimitados",
                  "Configure em 5 minutos",
                  "Use no celular ou computador",
                ].map((label, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-[0.95rem] text-[#1a3a5c] font-bold" style={{ animation: `lp-countUp .6s ease ${index * 0.15}s both` }}>
                    <div className="w-5 h-5 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#d97706] shrink-0 border border-[#f59e0b]/30">
                      <LucideCheck className="w-3 h-3 stroke-[3]" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup — SÓ DESKTOP */}
            <div className="order-2 hidden md:flex justify-end">
              <div className="max-w-[480px] w-full hero-phone relative">
                <WhatsAppBalloon text="A mensalidade do Enzo vence hoje." delay="1.2s" positionClass="-top-4 -left-6" />
                <MockupImage
                  src="/assets/lp/mockup-dashboard.png"
                  alt="Sistema de gestão de transporte escolar rodando no navegador"
                  loading="eager"
                  width={1080}
                  height={1400}
                  className="w-full h-auto"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════ PROVA DE DOR ══════════ */}
      <section className="py-14 md:py-20 bg-[#f9f9f7]">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.8rem,4.5vw,2.5rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Dificuldades comuns no Transporte Escolar
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              <span className="md:hidden">Deslize para o lado e veja</span>
              <span className="hidden md:inline">Veja</span> se alguma dessas dores bate com o seu dia a dia. Se sim, o Van360 resolve.
            </p>
          </Reveal>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 pt-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar pb-6 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0">
            {[
              {
                icon: "📒",
                title: "Descontrole Financeiro",
                text: "Anota tudo no caderninho e no fim do mês não sabe o que entrou e o que não entrou.",
              },
              {
                icon: "⏰",
                title: "Trabalho Manual",
                text: "Perde horas conferindo pagamentos um a um na mão.",
              },
              {
                icon: "😤",
                title: "Combinados de Boca",
                text: "Gera estresse com os responsáveis porque os acordos não ficam registrados.",
              },
              {
                icon: "📱",
                title: "Sufoco no WhatsApp",
                text: "Gasta o seu tempo de descanso cobrando mensalidades e tirando dúvidas.",
              },
              {
                icon: "🧾",
                title: "Falta de Documentos",
                text: "Responsável pede recibo ou contrato e você não tem nada pronto para enviar.",
              },
              {
                icon: "💼",
                title: "Imagem Amadora",
                text: "Você trabalha duro, mas a falta de organização não passa profissionalismo.",
              },
            ].map((item, i) => (
              <div key={i} className="flex-none w-[85%] sm:w-[50%] md:w-auto snap-center flex flex-col">
                <Reveal className="flex-1 flex flex-col">
                  <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#f59e0b]/40 transition-all hover:-translate-y-1 h-full text-left flex flex-col">
                    <div className="w-14 h-14 bg-[#f59e0b]/10 text-[#d97706] rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:bg-[#f59e0b]/20 transition-all">
                      {item.icon}
                    </div>
                    <h3 className="text-[#1a3a5c] font-bold text-[1.1rem] mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-[0.95rem] leading-relaxed flex-1">{item.text}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FUNCIONALIDADES ══════════ */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1120px] mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-[clamp(1.8rem,4.5vw,2.5rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
                O melhor aplicativo de gestão de van escolar
              </h2>
              <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto">
                Funcionalidades que resolvem o dia a dia da sua van.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-16">
            {features.map((feat, i) => (
              <Reveal key={feat.headline}>
                <div
                  className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    } items-center gap-6 md:gap-12`}
                >
                  <div className="order-2 md:order-none flex-shrink-0 w-full md:w-auto flex justify-center">
                    <div className="max-w-[240px] md:max-w-[300px] w-full feature-phone relative">
                      {feat.balloonText && (
                        <WhatsAppBalloon
                          text={feat.balloonText}
                          delay={`${0.5 + i * 0.2}s`}
                          positionClass={i % 2 === 0 ? "-top-2 md:-top-4 -left-8 sm:-left-12 md:left-auto md:-right-28 lg:-right-32" : "-top-2 md:-top-4 -left-8 sm:-left-12 md:-left-28 lg:-left-32 md:right-auto"}
                        />
                      )}
                      <MockupImage
                        src={feat.mockup}
                        alt={feat.alt}
                        loading="lazy"
                        width={1080}
                        height={1920}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="order-1 md:order-none text-center md:text-left max-w-[460px] md:max-w-none px-4 md:px-0">
                    <h3 className="text-[1.4rem] md:text-[1.8rem] font-extrabold text-[#1a3a5c] mb-3 leading-tight">
                      {feat.headline}
                    </h3>
                    <p className="text-[1rem] md:text-[1.1rem] text-slate-500 leading-relaxed">
                      {feat.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <InlineCta to={CTA} />
        </div>
      </section>

      {/* ══════════ PRIMEIROS USUÁRIOS ══════════ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-[#fff8ed]">
        <div className="max-w-[800px] mx-auto px-5 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 bg-[#f59e0b]/20 px-3 py-1.5 rounded-full text-[#d97706] font-black text-xs uppercase tracking-wider mb-5 border border-[#f59e0b]/30">
              <Star className="w-3.5 h-3.5" />
              Condição de Lançamento
            </div>
            <h2 className="text-[clamp(1.8rem,4.5vw,2.5rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-5 leading-tight">
              Entre agora e garanta o menor<br className="hidden md:block" /> preço da plataforma para sempre.
            </h2>
            <p className="text-[1.1rem] text-slate-600 leading-relaxed max-w-[550px] mx-auto font-medium">
              O Van360 acabou de chegar. Você testa grátis por 15 dias e <strong className="text-[#f59e0b]">trava sua mensalidade em R$ {pricing.originalFormatted}/mês</strong>. Sem fidelidade e sem reajustes, para a vida toda.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ PREÇOS ══════════ */}
      <section id="pricing" className="py-14 md:py-20 bg-[#f9f9f7] scroll-mt-20">
        <div className="max-w-[480px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Comece grátis. Pague só se gostar.
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              15 dias pra testar com seus dados reais. Sem cartão.
            </p>
          </Reveal>

          <Reveal>
            <div className="relative bg-white rounded-2xl p-8 border-2 border-[#f59e0b] shadow-[0_8px_40px_rgba(245,158,11,.15)] text-center">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-[#1a1a1a] text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1">
                <Star className="w-3 h-3" />
                Oferta Fundador
              </span>

              <div className="mb-6">
                <div className="text-[2.6rem] font-black text-[#1a3a5c] leading-none mb-6">
                  15 dias grátis
                </div>

                <div className="bg-[#f9f9f7] rounded-xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f59e0b]"></div>
                  <p className="text-[0.95rem] text-slate-500 font-bold mb-1">
                    Depois, por apenas
                  </p>
                  <div className="mb-4 flex flex-col items-center">
                    {pricing.isPromoActive && pricing.original < pricing.monthlyNormal && (
                      <span className="text-[1rem] text-slate-400 line-through font-semibold mb-[-4px]">
                        R$ {pricing.monthlyNormalFormatted}
                      </span>
                    )}
                    <div>
                      <span className="text-[2.2rem] font-black text-[#f59e0b]">
                        R$ {pricing.originalFormatted}
                      </span>
                      <span className="text-[1.1rem] font-bold text-[#f59e0b]/80">
                        /mês
                      </span>
                    </div>
                  </div>

                  <div className="text-left space-y-3 mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center text-[0.9rem]">
                      <span className="text-slate-500 font-medium">Plano Mensal:</span>
                      <span className="text-[#1a3a5c] font-bold">R$ {pricing.originalFormatted}/mês</span>
                    </div>
                    <div className="flex justify-between items-start text-[0.9rem] flex-wrap gap-1 mt-2">
                      <span className="text-slate-500 font-medium pt-1">Plano Anual:</span>
                      <div className="flex flex-col items-end">
                        <span className="text-[#1a3a5c] font-bold">R$ {pricing.yearlyTotalFormatted}/ano</span>
                        <span className="text-emerald-700 font-bold text-[0.6rem] uppercase tracking-wide bg-emerald-100 px-2 py-0.5 rounded mt-1">
                          🎁 2 meses grátis
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="text-left space-y-3 mb-8">
                {planFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[0.92rem] text-slate-600">
                    <Check /> {f}
                  </li>
                ))}
              </ul>

              <div className="bg-amber-50 rounded-xl p-4 mb-8 border border-amber-200 text-left">
                <p className="text-[0.85rem] text-amber-900 font-medium flex gap-2.5">
                  <span className="shrink-0 text-amber-600 text-base">🚀</span>
                  <span className="leading-relaxed"><strong>Garanta o menor preço para sempre.</strong> Entre agora e mantenha este valor vitalício, protegido contra futuros reajustes.</span>
                </p>
              </div>

              <Link
                to={CTA}
                className="block w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-3.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all text-[1.05rem] min-h-[48px] flex items-center justify-center"
              >
                Testar grátis por 15 dias
              </Link>

              <p className="text-[0.8rem] text-slate-400 mt-3 font-medium">
                Sem cartão · Cancele quando quiser
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ COMO FUNCIONA ══════════ */}
      <section
        id="como-funciona"
        className="py-14 md:py-20 bg-white scroll-mt-20"
      >
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.8rem,4.5vw,2.5rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Comece em 5 minutos
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              Três passos. Sem burocracia.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-[800px] mx-auto">
            {[
              {
                n: "1",
                title: "Crie sua conta grátis",
                desc: "Sem cartão, sem compromisso. Em segundos você faz seu cadastro.",
              },
              {
                n: "2",
                title: "Cadastre seus passageiros sem esforço",
                desc: "Mande um link pro pai pelo WhatsApp. Ele preenche os dados do filho e pronto — aparece na sua lista.",
              },
              {
                n: "3",
                title: "Pronto. Tudo organizado.",
                desc: "Mensalidades, contratos e recibos — no seu celular.",
              },
            ].map((step) => (
              <Reveal key={step.n}>
                <div className="text-center">
                  <div className="w-[52px] h-[52px] rounded-full bg-[#1a3a5c] text-white text-xl font-extrabold inline-flex items-center justify-center mb-4">
                    {step.n}
                  </div>
                  <h3 className="text-[1.05rem] font-bold text-[#1a3a5c] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[0.9rem] text-slate-500">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8 flex justify-center">
            <div className="max-w-[360px] md:max-w-[480px] w-full hero-phone">
              <MockupImage
                src="/assets/lp/mockup-dashboard.png"
                alt="Dashboard do Van360 com primeiros passos"
                loading="lazy"
                width={1080}
                height={1400}
                className="w-full h-auto"
              />
            </div>
          </Reveal>

          <InlineCta to={CTA} />
        </div>
      </section>

      {/* ══════════ FAIXA MULTI-DISPOSITIVO ══════════ */}
      <div className="bg-[#1a3a5c] text-white py-4 text-center">
        <p className="text-sm md:text-base font-medium opacity-90">
          📱 Celular · 💻 Computador · 📲 Tablet — também funciona no navegador, sem baixar nada.
        </p>
      </div>




      {/* ══════════ FAQ ══════════ */}
      <section id="faq" className="py-14 md:py-20 bg-[#f9f9f7] scroll-mt-20">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.8rem,4.5vw,2.5rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Perguntas frequentes
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              Se a sua dúvida não estiver aqui, manda no WhatsApp que a gente
              responde.
            </p>
          </Reveal>

          <div className="max-w-[680px] mx-auto">
            <FaqItem
              q="O que o Van360 faz?"
              a="O Van360 organiza a gestão da sua van escolar: cadastro de passageiros, controle de mensalidades, geração de contratos digitais e emissão de recibos. Tudo pelo celular, em um lugar só."
            />
            <FaqItem
              q="Preciso pagar para começar a utilizar?"
              a="Não. Os 15 dias de teste são 100% grátis, sem cadastrar cartão, sem compromisso. Você usa tudo, com seus dados reais, e só decide depois."
            />
            <FaqItem
              q="Onde posso usar o Van360?"
              a="Em qualquer lugar. Funciona no navegador do celular, tablet ou computador — sem baixar nada. Se preferir, tem o app Android, que é leve e rápido. O app para iPhone está em desenvolvimento, mas a versão web funciona perfeitamente no Safari."
            />
            <FaqItem
              q="O que é a oferta/preço fundador?"
              a={`É o nosso preço de lançamento para os primeiros transportadores escolares que começarem a usar o Van360. Você paga R$ ${pricing.originalFormatted}/mês e mantém esse valor para sempre — mesmo quando o preço subir para quem entrar depois.`}
            />
            <FaqItem
              q="O contrato gerado tem validade jurídica?"
              a="Sim. Os contratos são digitais e assinados eletronicamente, com validade legal conforme a legislação brasileira. Servem como documento formal entre você e o responsável do passageiro."
            />
            <FaqItem
              q="O app é pesado? Preciso baixar?"
              a="Não precisa baixar nada pra começar. O Van360 funciona direto pelo navegador — no celular, tablet ou computador. Se preferir, tem o app Android que é leve e rápido. Você escolhe como quer usar."
            />
            <FaqItem
              q="Quanto vou pagar depois dos 15 dias?"
              a={`Se você entrar agora como fundador, paga R$ ${pricing.originalFormatted}/mês — para sempre, sem reajuste. Se preferir não continuar, é só não assinar. Sem multa, sem burocracia.`}
            />
            <FaqItem
              q="Como funciona o programa de indicações?"
              a="É muito simples! Dentro do aplicativo você terá acesso ao seu link exclusivo de convite. Compartilhe esse link com seus colegas. Quando eles se cadastrarem e efetuarem a primeira assinatura, você ganha mensalidades gratuitas (sem limites de indicações) e o seu amigo indicado ainda recebe um desconto especial na assinatura. Ambos ganham!"
            />
          </div>

          <div className="mt-12">
            <InlineCta to={CTA} />
          </div>
        </div>
      </section>

      {/* ══════════ INDIQUE E GANHE ══════════ */}
      <section className="py-10 md:py-12 bg-white">
        <div className="max-w-[800px] mx-auto px-5">
          <Reveal>
            <div className="relative rounded-2xl bg-gradient-to-br from-[#1a3a5c] to-[#244c75] p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-center gap-6 md:gap-10 border border-white/5">

              <div className="relative z-10 flex-1 space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/25 px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                  🎁 Indique e Ganhe
                </div>
                <h2 className="text-[1.2rem] sm:text-[1.4rem] font-bold leading-tight tracking-tight text-white">
                  Use o Van360 de graça
                </h2>
                <p className="text-[0.85rem] text-slate-200 leading-relaxed max-w-[440px] md:mx-0 mx-auto selection:bg-white/20">
                  Indique outros motoristas escolares com o seu link. A cada indicado que ativar a assinatura, você ganha 1 mês grátis — sem limite de indicações.
                </p>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto flex flex-col items-center gap-2">
                <Link
                  to={CTA}
                  className="w-full md:w-auto inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-sm px-7 py-3 rounded-lg active:scale-95 transition-all text-center whitespace-nowrap shadow-md"
                >
                  Criar conta e indicar
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ EM BREVE ══════════ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#f9f9f7] to-white">
        <div className="max-w-[700px] mx-auto px-5 text-center">
          <Reveal>
            <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-3">
              Em breve
            </p>
            <h2 className="text-[clamp(1.3rem,3vw,1.75rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-8">
              E tem mais vindo por aí
            </h2>
          </Reveal>

          <div className="grid gap-6 text-left max-w-[540px] mx-auto">
            <Reveal>
              <div className="flex items-start gap-4 bg-[#f9f9f7] p-5 rounded-xl">
                <span className="text-2xl flex-shrink-0">🗺️</span>
                <div>
                  <h3 className="font-bold text-[#1a3a5c] text-[0.95rem] mb-1">Rotas e itinerários</h3>
                  <p className="text-[0.88rem] text-slate-500 leading-relaxed">
                    Monte suas rotas, organize os pontos de embarque e otimize seu trajeto diário.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="flex items-start gap-4 bg-[#f9f9f7] p-5 rounded-xl">
                <span className="text-2xl flex-shrink-0">🚌</span>
                <div>
                  <h3 className="font-bold text-[#1a3a5c] text-[0.95rem] mb-1">Fretamentos e Viagens</h3>
                  <p className="text-[0.88rem] text-slate-500 leading-relaxed">
                    Organize passeios e excursões. Registre suas viagens extras, controle quem já pagou e acompanhe quanto você faturou no mês.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="flex items-start gap-4 bg-[#f9f9f7] p-5 rounded-xl">
                <span className="text-2xl flex-shrink-0">👨‍👩‍👦</span>
                <div>
                  <h3 className="font-bold text-[#1a3a5c] text-[0.95rem] mb-1">App para os pais</h3>
                  <p className="text-[0.88rem] text-slate-500 leading-relaxed">
                    O responsável acompanha tudo pelo celular — pagamentos, contrato, dados do filho. Menos WhatsApp pra você.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="flex items-start gap-4 bg-[#f9f9f7] p-5 rounded-xl">
                <span className="text-2xl flex-shrink-0">💸</span>
                <div>
                  <h3 className="font-bold text-[#1a3a5c] text-[0.95rem] mb-1">Pagamento via Pix com baixa automática</h3>
                  <p className="text-[0.88rem] text-slate-500 leading-relaxed">
                    O pai paga direto pelo app e o sistema dá baixa sozinho — sem você precisar marcar nada manualmente.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="bg-gradient-to-br from-[#1a3a5c] to-[#234b73] text-white py-16 md:py-20">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-tight mb-3">
              Pare de perder tempo com planilhas e cobranças manuais.
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-[1.05rem] opacity-85 max-w-[520px] mx-auto mb-8">
              Teste grátis por 15 dias. Sem cartão. Sem compromisso.
            </p>
          </Reveal>
          <Reveal>
            <Link
              to={CTA}
              className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-7 py-3.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all min-h-[44px]"
            >
              Testar grátis por 15 dias
            </Link>
            <p className="text-[0.85rem] opacity-60 mt-4">
              Depois, R$ {pricing.originalFormatted}/mês ou R$ {pricing.highlightFormatted}/mês (no plano anual)
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#111] text-white/50 py-10 text-[0.85rem]">
        <div className="max-w-[1120px] mx-auto px-5 flex flex-col items-center gap-5">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-8 w-auto brightness-0 invert select-none"
          />
          <p className="text-white/70 text-sm font-medium">
            Você dirige. A gente organiza.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/van360.oficial/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Van360"
              className="hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://wa.me/5511962508068"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Van360"
              className="hover:text-white transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </a>
          </div>
          <div className="flex gap-6">
            <Link
              to={ROUTES.PUBLIC.PRIVACY_POLICY}
              className="hover:text-white transition-colors"
            >
              Privacidade
            </Link>
            <Link
              to={ROUTES.PUBLIC.TERMS_OF_USE}
              className="hover:text-white transition-colors"
            >
              Termos de uso
            </Link>
          </div>
          <div className="text-center text-white/30 text-xs space-y-1">
            <p>© {getNowBR().getFullYear()} Van360. Todos os direitos reservados.</p>
            <p>CNPJ: 52.573.294/0001-44</p>
          </div>
        </div>
      </footer>

      {/* ══════════ WHATSAPP FLUTUANTE ══════════ */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
        className={`fixed right-5 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(37,211,102,.4)] hover:shadow-[0_6px_24px_rgba(37,211,102,.5)] hover:scale-110 transition-all duration-500 ${cookiePending ? "bottom-24 sm:bottom-20" : "bottom-5"}`}
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>

      {/* ══════════ DIALOG — TERMOS DE USO ══════════ */}
      <TermosUsoDialog open={termosOpen} onOpenChange={setTermosOpen} />

      {/* ══════════ DIALOG — PRIVACIDADE ══════════ */}
      <PoliticaPrivacidadeDialog open={privacidadeOpen} onOpenChange={setPrivacidadeOpen} />

      {/* <VideoCommerce
        previewUrl="https://res.cloudinary.com/demo/video/upload/dog.mp4"
        videoUrls={[
          "https://res.cloudinary.com/demo/video/upload/dog.mp4",
          "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
          "https://www.w3schools.com/html/mov_bbb.mp4"
        ]}
        positionClasses="fixed z-40 left-4 sm:left-6 top-[65%] sm:top-auto sm:bottom-10" */}
      {/* /> */}

      <CookieConsentGlobal />
    </div>
  );
};

export default Index;
