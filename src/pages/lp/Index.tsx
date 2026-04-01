import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { TermosUsoDialog } from "@/components/dialogs/TermosUsoDialog";
import { PoliticaPrivacidadeDialog } from "@/components/dialogs/PoliticaPrivacidadeDialog";
import { getWhatsAppUrl } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import {
  CheckCircle2,
  ChevronDown,
  Headphones,
  Lightbulb,
  MessageCircle,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
function InlineCta({ label = "Começar grátis — 15 dias sem cartão", to }: { label?: string; to: string }) {
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
          Sem cartão de crédito · Sem compromisso
        </p>
      </div>
    </Reveal>
  );
}

// ── Main component ──
const Index = () => {
  useSEO({
    title: "Van360 - Gestão Completa para Transporte Escolar",
    description:
      "O Van360 organiza passageiros, mensalidades, contratos e recibos para motoristas de van escolar. Tudo digital, tudo pelo celular.",
  });
  const [termosOpen, setTermosOpen] = useState(false);
  const [privacidadeOpen, setPrivacidadeOpen] = useState(false);
  const CTA = ROUTES.PUBLIC.REGISTER;
  const LOGIN = ROUTES.PUBLIC.LOGIN;

  const planFeatures = [
    "Passageiros ilimitados",
    "Controle de mensalidades",
    "Contratos digitais",
    "Recibos automáticos",
    "App Android + acesso web",
  ];

  const features = [
    {
      headline: "Todos os seus passageiros em um só lugar",
      text: "Cadastre alunos e responsáveis — ou mande o link pro pai e ele cadastra o filho direto. Sem você precisar anotar nada.",
      mockup: "/assets/lp/mockup-passageiros.png",
      alt: "Tela de gestão de passageiros do Van360",
    },
    {
      headline: "Veja quem já pagou e quem está devendo.",
      text: "Registre pagamentos e acompanhe o status de cada mensalidade. Dê baixa na hora — pix, dinheiro, transferência.",
      mockup: "/assets/lp/mockup-mensalidades.png",
      alt: "Tela de controle de mensalidades do Van360",
    },
    {
      headline: "Contrato digital com validade jurídica",
      text: "Gere contratos com todos os dados já preenchidos. Assinado digitalmente, com validade legal — protege você e o responsável.",
      mockup: "/assets/lp/mockup-contrato.png",
      alt: "Tela de contrato digital do Van360",
    },
    {
      headline: "Recibo gerado na hora, a cada pagamento",
      text: "Cada pagamento registrado gera um recibo automaticamente. Visualize e compartilhe quando o responsável pedir.",
      mockup: "/assets/lp/mockup-carteirinha.png",
      alt: "Tela de recibo do Van360",
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
              className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-[11px] sm:text-[13px] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all"
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
            <div className="text-center md:text-left order-1">
              <h1 className="text-[clamp(1.9rem,5vw,3rem)] font-black leading-[1.12] text-[#1a3a5c] tracking-tight mb-4">
                Chega de caderninho.
                <br />
                <em className="not-italic text-[#f59e0b] underline underline-offset-4 decoration-[#f59e0b]/30">
                  Sua van organizada
                </em>{" "}
                no celular.
              </h1>
              <p className="text-[clamp(1.05rem,2.5vw,1.2rem)] text-slate-500 max-w-[520px] md:mx-0 mx-auto mb-6 leading-relaxed">
                Passageiros, mensalidades, contratos e recibos — tudo em um lugar só. Digital e profissional.
              </p>

              {/* Mockup — SÓ MOBILE */}
              <div className="flex justify-center md:hidden my-6">
                <div className="max-w-[360px] w-full">
                  <img
                    src="/assets/lp/mockup-mensalidades-2.png"
                    alt="Tela de controle de mensalidades do Van360 mostrando status de pagamentos"
                    loading="eager"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center md:items-start gap-3">
                <Link
                  to={CTA}
                  className="lp-cta-glow inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-7 py-3.5 rounded-lg hover:scale-[1.02] hover:-translate-y-0.5 transition-all min-h-[44px]"
                >
                  Começar grátis — 15 dias sem cartão
                </Link>
                <p className="text-[0.82rem] text-slate-400">
                  Depois, a partir de{" "}
                  <strong className="text-[#1a3a5c]">R$20,75/mês</strong>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-[380px] md:mx-0 mx-auto mt-8">
                {[
                  { num: "4 em 1", label: "passageiros, mensalidades, contratos e recibos" },
                  { num: "5 min", label: "pra cadastrar tudo" },
                  { num: "100%", label: "digital e organizado" },
                ].map((s) => (
                  <div key={s.label} className="text-center md:text-left">
                    <div
                      className="text-2xl font-black text-[#1a3a5c] leading-none"
                      style={{ animation: "lp-countUp .6s ease both" }}
                    >
                      {s.num}
                    </div>
                    <div className="text-[0.75rem] text-slate-400 mt-1 leading-tight">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup — SÓ DESKTOP */}
            <div className="order-2 hidden md:flex justify-end">
              <div className="max-w-[480px] w-full hero-phone">
                <img
                  src="/assets/lp/mockup-mensalidades-2.png"
                  alt="Tela de controle de mensalidades do Van360 mostrando status de pagamentos"
                  loading="eager"
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
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Você conhece essa rotina?
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              Se pelo menos uma bateu, o Van360 resolve.
            </p>
          </Reveal>

          <div className="max-w-[680px] mx-auto grid gap-4">
            {[
              {
                icon: "📒",
                text: (
                  <>
                    Controla tudo no{" "}
                    <strong className="text-[#1a3a5c]">caderninho ou planilha</strong>{" "}
                    e no fim do mês não sabe quanto entrou.
                  </>
                ),
              },
              {
                icon: "⏰",
                text: (
                  <>
                    Perde{" "}
                    <strong className="text-[#1a3a5c]">horas cadastrando passageiro por passageiro</strong>{" "}
                    — nome, endereço, escola, responsável — tudo na mão.
                  </>
                ),
              },
              {
                icon: "😬",
                text: (
                  <>
                    Confere{" "}
                    <strong className="text-[#1a3a5c]">um por um</strong>{" "}
                    quem pagou e quem não pagou — e ainda erra.
                  </>
                ),
              },
              {
                icon: "😤",
                text: (
                  <>
                    Já teve{" "}
                    <strong className="text-[#1a3a5c]">problema com responsável</strong>{" "}
                    porque o combinado era de boca e cada um lembrou diferente.
                  </>
                ),
              },
              {
                icon: "📱",
                text: (
                  <>
                    Perde{" "}
                    <strong className="text-[#1a3a5c]">horas no WhatsApp</strong>{" "}
                    tirando dúvida, anotando dados e conferindo pagamento.
                  </>
                ),
              },
              {
                icon: "🧾",
                text: (
                  <>
                    Responsável pede{" "}
                    <strong className="text-[#1a3a5c]">recibo ou contrato</strong>{" "}
                    e você não tem nada pronto.
                  </>
                ),
              },
              {
                icon: "💼",
                text: (
                  <>
                    Trabalha muito mas{" "}
                    <strong className="text-[#1a3a5c]">ninguém leva a sério</strong>{" "}
                    como profissional.
                  </>
                ),
              },
            ].map((item, i) => (
              <Reveal key={i}>
                <div className="flex items-start gap-3.5 bg-white p-5 rounded-lg border-l-4 border-[#dc2626] shadow-[0_2px_12px_rgba(0,0,0,.08)] text-left">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <p className="text-[0.95rem] leading-relaxed">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FUNCIONALIDADES ══════════ */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1120px] mx-auto px-5">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
                O que o Van360 faz por você
              </h2>
              <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto">
                Quatro funcionalidades que resolvem o dia a dia da sua van.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-16">
            {features.map((feat, i) => (
              <Reveal key={feat.headline}>
                <div
                  className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    } items-center gap-8 md:gap-12`}
                >
                  <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
                    <div className="max-w-[240px] md:max-w-[300px] w-full">
                      <img
                        src={feat.mockup}
                        alt={feat.alt}
                        loading="lazy"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="text-center md:text-left max-w-[460px] md:max-w-none">
                    <h3 className="text-[1.3rem] md:text-[1.5rem] font-extrabold text-[#1a3a5c] mb-3 leading-tight">
                      {feat.headline}
                    </h3>
                    <p className="text-[1rem] text-slate-500 leading-relaxed">
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

      {/* ══════════ COMO FUNCIONA ══════════ */}
      <section
        id="como-funciona"
        className="py-14 md:py-20 bg-[#f9f9f7] scroll-mt-20"
      >
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
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
                desc: "Sem cartão, sem compromisso. Em 2 minutos você já está dentro.",
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

          {/* Mockup dashboard */}
          <Reveal className="mt-8 flex justify-center">
            {/* Aumentado o max-w para acomodar o celular deitado/inclinado */}
            <div className="max-w-[360px] md:max-w-[480px] w-full">
              <img
                src="/assets/lp/mockup-dashboard.png"
                alt="Dashboard do Van360 com primeiros passos"
                loading="lazy"
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
          📱 Celular · 💻 Computador · 📲 Tablet — funciona no navegador, sem baixar nada.
        </p>
      </div>

      {/* ══════════ PREÇOS ══════════ */}
      <section id="pricing" className="py-14 md:py-20 scroll-mt-20">
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

              <p className="text-xs text-[#f59e0b] font-bold mt-2 mb-6">
                Para os primeiros motoristas
              </p>

              <div className="mb-2">
                <div className="text-[2.8rem] font-black text-[#1a3a5c] leading-none">
                  15 dias grátis
                </div>
                <p className="text-[0.9rem] text-slate-400 mt-5">
                  De{" "}
                  <span className="line-through">R$39,90</span>
                  {" "}por
                </p>
                <div className="mt-0">
                  <span className="text-[1.5rem] font-black text-[#f59e0b]">
                    R$20,75
                  </span>
                  <span className="text-[0.95rem] font-medium text-[#f59e0b]/80">
                    /mês
                  </span>
                </div>
              </div>

              <hr className="my-6 border-slate-200" />

              <ul className="text-left space-y-2.5 mb-6">
                {planFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.92rem]">
                    <Check /> {f}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-[0.92rem] font-semibold text-[#1a3a5c]">
                  <Check /> Preço de fundador garantido para sempre
                </li>
              </ul>

              <Link
                to={CTA}
                className="block w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-3.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all text-base min-h-[44px] flex items-center justify-center"
              >
                Começar grátis — 15 dias sem cartão
              </Link>

              <p className="text-[0.8rem] text-slate-400 mt-3">
                Sem cartão · Cancele quando quiser
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ PROVA SOCIAL ══════════ */}
      {/* TODO: Substituir por depoimentos reais quando disponíveis */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-10">
              Feito por quem conhece a rotina da van
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
            {[
              {
                icon: <Users className="w-7 h-7 text-[#f59e0b]" />,
                text: "Testado por motoristas reais antes do lançamento.",
              },
              {
                icon: <Lightbulb className="w-7 h-7 text-[#f59e0b]" />,
                text: "Pensado em cada detalhe, ouvindo quem vive o transporte escolar todo dia.",
              },
              {
                icon: <WhatsAppIcon className="w-7 h-7 text-[#f59e0b]" />,
                text: "Suporte direto pelo WhatsApp — fala com gente, não com robô.",
              },
            ].map((card, i) => (
              <Reveal key={i}>
                <div className="bg-white rounded-xl p-7 shadow-[0_2px_16px_rgba(0,0,0,.07)] flex flex-col items-center gap-4 text-center h-full">
                  <div className="w-14 h-14 rounded-full bg-[#f0f4f8] flex items-center justify-center flex-shrink-0">
                    {card.icon}
                  </div>
                  <p className="text-[0.97rem] text-slate-600 leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ EM BREVE ══════════ */}
      <section className="py-12 md:py-16 bg-white">
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
                <span className="text-2xl flex-shrink-0">💸</span>
                <div>
                  <h3 className="font-bold text-[#1a3a5c] text-[0.95rem] mb-1">Cobrança automática por Pix</h3>
                  <p className="text-[0.88rem] text-slate-500 leading-relaxed">
                    O responsável recebe, paga e o sistema dá baixa sozinho. Você não precisa cobrar ninguém.
                  </p>
                </div>
              </div>
            </Reveal>

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
                <span className="text-2xl flex-shrink-0">👨‍👩‍👦</span>
                <div>
                  <h3 className="font-bold text-[#1a3a5c] text-[0.95rem] mb-1">App para os pais</h3>
                  <p className="text-[0.88rem] text-slate-500 leading-relaxed">
                    O responsável acompanha tudo pelo celular — pagamentos, contrato, dados do filho. Menos WhatsApp pra você.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <p className="text-[0.85rem] text-slate-400 mt-6">
              Quem entra agora como fundador terá acesso primeiro.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section id="faq" className="py-14 md:py-20 bg-[#f9f9f7] scroll-mt-20">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
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
              q="Preciso de cartão de crédito para começar?"
              a="Não. Os 15 dias de teste são 100% grátis, sem cadastrar cartão, sem compromisso. Você usa tudo, com seus dados reais, e só decide depois."
            />
            <FaqItem
              q="Onde posso usar o Van360?"
              a="Em qualquer lugar. Funciona no navegador do celular, tablet ou computador — sem baixar nada. Se preferir, tem o app Android, que é leve e rápido. O app para iPhone está em desenvolvimento, mas a versão web funciona perfeitamente no Safari."
            />
            <FaqItem
              q="O que é o preço de fundador?"
              a="É um preço especial para os primeiros motoristas que entrarem na plataforma. Quem entra agora paga a partir de R$20,75/mês para sempre, mesmo quando o preço subir."
            />
            <FaqItem
              q="O contrato gerado tem validade jurídica?"
              a="Sim. Os contratos são digitais e assinados eletronicamente, com validade legal conforme a legislação brasileira. Servem como documento formal entre você e o responsável do aluno."
            />
            <FaqItem
              q="O app é pesado? Preciso baixar?"
              a="Não precisa baixar nada pra começar. O Van360 funciona direto pelo navegador — no celular, tablet ou computador. Se preferir, tem o app Android que é leve e rápido. Você escolhe como quer usar."
            />
            <FaqItem
              q="Quanto vou pagar depois dos 15 dias?"
              a="Se você entrar agora como fundador, paga a partir de R$20,75/mês — para sempre, sem reajuste. Se preferir não continuar, é só não assinar. Sem multa, sem burocracia."
            />
          </div>
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="bg-gradient-to-br from-[#1a3a5c] to-[#234b73] text-white py-16 md:py-20">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-tight mb-3">
              Sua van merece uma gestão profissional.
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-[1.05rem] opacity-85 max-w-[520px] mx-auto mb-8">
              15 dias grátis. Sem cartão. Sem compromisso.
            </p>
          </Reveal>
          <Reveal>
            <Link
              to={CTA}
              className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-7 py-3.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all min-h-[44px]"
            >
              Começar grátis — 15 dias sem cartão
            </Link>
            <p className="text-[0.85rem] opacity-60 mt-4">
              Depois, a partir de R$20,75/mês · Preço de fundador
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#111] text-white/50 py-8 text-[0.85rem] text-center">
        <div className="max-w-[1120px] mx-auto px-5 flex flex-col items-center gap-3">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-8 w-auto brightness-0 invert select-none"
          />
          <div className="flex gap-6">
            <button
              onClick={() => setPrivacidadeOpen(true)}
              className="hover:text-white transition-colors"
            >
              Privacidade
            </button>
            <button
              onClick={() => setTermosOpen(true)}
              className="hover:text-white transition-colors"
            >
              Termos de uso
            </button>
          </div>
          <p>© {new Date().getFullYear()} Van360. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* ══════════ WHATSAPP FLUTUANTE ══════════ */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(37,211,102,.4)] hover:shadow-[0_6px_24px_rgba(37,211,102,.5)] hover:scale-110 transition-all"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>

      {/* ══════════ DIALOG — TERMOS DE USO ══════════ */}
      <TermosUsoDialog open={termosOpen} onOpenChange={setTermosOpen} />

      {/* ══════════ DIALOG — PRIVACIDADE ══════════ */}
      <PoliticaPrivacidadeDialog open={privacidadeOpen} onOpenChange={setPrivacidadeOpen} />
    </div>
  );
};

export default Index;
