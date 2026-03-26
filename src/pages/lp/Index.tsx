import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import {
  CheckCircle2,
  ChevronDown,
  Menu,
  Star,
  X,
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

// ── Main component ──
const Index = () => {
  useSEO({
    title: "Van360 - Gestão Completa para Transporte Escolar",
    description:
      "O Van360 organiza passageiros, mensalidades, contratos e recibos para motoristas de van escolar. Tudo digital, tudo pelo celular.",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"anual" | "mensal">(
    "anual"
  );
  const CTA = ROUTES.PUBLIC.REGISTER;
  const LOGIN = ROUTES.PUBLIC.LOGIN;

  const planFeatures = [
    "Gestão de passageiros",
    "Controle de mensalidades",
    "Geração de contratos",
    "Geração de recibos",
    "Acesso web + app Android",
  ];

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    document
      .getElementById("pricing")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-['Inter',sans-serif] overflow-x-hidden scroll-smooth selection:bg-amber-200">
      <style>{`
        .lp-reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
        .lp-visible { opacity: 1; transform: translateY(0); }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .lp-pulse { animation: lp-pulse 1.5s infinite; }
      `}</style>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="sticky top-0 z-50 bg-white/97 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-[1120px] mx-auto px-5 flex items-center justify-between h-14 md:h-16">
          <span className="text-2xl font-black text-[#1a3a5c] tracking-tight">
            Van<span className="text-[#f59e0b]">360</span>
          </span>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to={LOGIN}
              className="text-sm font-bold text-[#1a3a5c] hover:text-[#f59e0b] transition-colors"
            >
              Login
            </Link>
            <Link
              to={CTA}
              className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-sm px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Começar grátis
            </Link>
          </div>
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-5 space-y-3 shadow-xl">
            <Link
              to={LOGIN}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-center font-bold text-[#1a3a5c] border-2 border-slate-200 rounded-lg"
            >
              Login
            </Link>
            <Link
              to={CTA}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-center font-bold bg-[#f59e0b] text-[#1a1a1a] rounded-lg shadow-md"
            >
              Começar grátis — 15 dias sem cartão
            </Link>
          </div>
        )}
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24 bg-gradient-to-b from-[#f0f4f8] to-white">
        <div className="max-w-[720px] mx-auto px-5 text-center">
          <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-black leading-[1.15] text-[#1a3a5c] tracking-tight mb-4">
            Chega de caderninho.
            <br />
            <em className="not-italic text-[#f59e0b] underline underline-offset-4 decoration-[#f59e0b]/30">
              Organize suas vans
            </em>{" "}
            em um só lugar.
          </h1>
          <p className="text-[clamp(1.05rem,2.5vw,1.25rem)] text-slate-500 max-w-[560px] mx-auto mb-8">
            O Van360 organiza seus passageiros, mensalidades, contratos e
            recibos — tudo digital, tudo pelo celular.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-10 flex-wrap mb-10">
            {[
              ["5 min", "para cadastrar tudo"],
              ["0", "planilhas necessárias"],
              ["100%", "digital e organizado"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-[#1a3a5c] leading-none">
                  {num}
                </div>
                <div className="text-[0.85rem] text-slate-400 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <a
              href="#pricing"
              onClick={scrollToPricing}
              className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-7 py-3.5 rounded-lg shadow-[0_2px_8px_rgba(245,158,11,.35)] hover:shadow-[0_4px_16px_rgba(245,158,11,.4)] hover:-translate-y-0.5 transition-all"
            >
              Começar grátis — 15 dias sem cartão
            </a>
          </div>
        </div>
      </section>

      {/* ══════════ TEASER FUNDADOR ══════════ */}
      <section className="py-10 md:py-14">
        <div className="max-w-[720px] mx-auto px-5">
          <Reveal>
            <a
              href="#pricing"
              onClick={scrollToPricing}
              className="block bg-gradient-to-br from-[#1a3a5c] to-[#234b73] text-white rounded-xl p-6 max-w-[480px] mx-auto shadow-[0_8px_32px_rgba(0,0,0,.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,.18)] transition-shadow cursor-pointer"
            >
              <span className="inline-block bg-[#f59e0b] text-[#1a1a1a] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Oferta Fundador — por tempo limitado
              </span>
              <div className="text-[1rem] opacity-80 mb-1">
                <span className="line-through opacity-60">R$39,90</span> por
              </div>
              <div className="text-[1.6rem] font-black leading-tight">
                R$24,90
                <small className="text-[0.9rem] font-medium opacity-80">
                  /mês — para sempre.
                </small>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 px-3.5 py-1.5 rounded-full text-[0.85rem] font-semibold mt-3">
                Ver planos ↓
              </div>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ══════════ PROVA DE DOR ══════════ */}
      <section className="py-14 md:py-20 bg-[#f9f9f7]">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Você se identifica com alguma dessas?
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              Se pelo menos uma bateu, o Van360 foi feito para você.
            </p>
          </Reveal>

          <div className="max-w-[680px] mx-auto grid gap-4">
            {[
              {
                icon: "📒",
                text: (
                  <>
                    Controla tudo no{" "}
                    <strong className="text-[#1a3a5c]">
                      caderninho ou planilha
                    </strong>{" "}
                    e no fim do mês não sabe ao certo quanto entrou.
                  </>
                ),
              },
              {
                icon: "😬",
                text: (
                  <>
                    Perde tempo{" "}
                    <strong className="text-[#1a3a5c]">
                      conferindo um por um
                    </strong>{" "}
                    quem pagou e quem não pagou — e ainda erra.
                  </>
                ),
              },
              {
                icon: "😤",
                text: (
                  <>
                    Já teve{" "}
                    <strong className="text-[#1a3a5c]">
                      problema com responsável
                    </strong>{" "}
                    porque o combinado era só verbal e cada um lembrou diferente.
                  </>
                ),
              },
              {
                icon: "📱",
                text: (
                  <>
                    Perde{" "}
                    <strong className="text-[#1a3a5c]">horas por mês</strong> no
                    WhatsApp tirando dúvida, anotando dados e conferindo
                    pagamento.
                  </>
                ),
              },
              {
                icon: "🧾",
                text: (
                  <>
                    Responsável pede{" "}
                    <strong className="text-[#1a3a5c]">
                      recibo ou contrato
                    </strong>{" "}
                    e você não tem nada pronto — improvisa na hora.
                  </>
                ),
              },
              {
                icon: "🤷",
                text: (
                  <>
                    Sente que trabalha muito mas{" "}
                    <strong className="text-[#1a3a5c]">
                      ninguém leva a sério
                    </strong>{" "}
                    como se fosse um profissional de verdade.
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
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Tudo o que você precisa, nada que você não precisa
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              Quatro funcionalidades que resolvem o dia a dia da sua van.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 — Gestão de Passageiros */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Mock+Gestao+Passageiros"
                  alt="Tela de gestão de passageiros do Van360"
                  className="w-full h-auto rounded-t-lg"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Todos os seus passageiros organizados
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    Cadastre alunos, responsáveis e informações de cada
                    passageiro. Consulte tudo em segundos, direto pelo celular.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Feature 2 — Controle de Mensalidades */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Mock+Controle+Mensalidades"
                  alt="Tela de controle de mensalidades do Van360"
                  className="w-full h-auto rounded-t-lg"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Saiba quem pagou e quem não pagou
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    Registre pagamentos, acompanhe status de cada mensalidade e
                    dê baixa na hora. Sem planilha, sem caderninho.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Feature 3 — Geração de Contratos */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Mock+Geracao+Contrato"
                  alt="Tela de geração de contrato do Van360"
                  className="w-full h-auto rounded-t-lg"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Contrato digital pronto em minutos
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    Gere contratos entre você e o responsável do aluno, com todos
                    os dados preenchidos. Digital, profissional e sem burocracia.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Feature 4 — Geração de Recibos */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Mock+Geracao+Recibo"
                  alt="Tela de geração de recibo do Van360"
                  className="w-full h-auto rounded-t-lg"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Recibo gerado na hora, a cada pagamento
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    Cada pagamento registrado gera um recibo automaticamente.
                    Visualize e compartilhe quando precisar.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
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
              Como funciona
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-10">
              Três passos. Sem curso. Sem manual.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-[800px] mx-auto">
            {[
              {
                n: "1",
                title: "Cadastre seus alunos",
                desc: "Envie um link para cada pai preencher os dados ou importe de uma planilha que você já tem.",
              },
              {
                n: "2",
                title: "Registre os pagamentos",
                desc: "Dê baixa nas mensalidades conforme recebe. Pix, dinheiro, transferência — tudo num lugar só.",
              },
              {
                n: "3",
                title: "Contratos e recibos prontos",
                desc: "Gere contratos digitais e recibos na hora. Compartilhe pelo WhatsApp quando precisar.",
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
        </div>
      </section>

      {/* ══════════ PREÇOS ══════════ */}
      <section id="pricing" className="py-14 md:py-20 scroll-mt-20">
        <div className="max-w-[900px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold text-[#1a3a5c] tracking-tight mb-2">
              Quanto custa organizar sua van?
            </h2>
            <p className="text-[1.05rem] text-slate-500 max-w-[560px] mx-auto mb-8">
              Menos que uma mensalidade de um passageiro.
            </p>
          </Reveal>

          {/* Toggle Anual / Mensal */}
          <Reveal>
            <div className="inline-flex items-center bg-slate-100 rounded-full p-1 mb-10">
              <button
                onClick={() => setBillingPeriod("anual")}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  billingPeriod === "anual"
                    ? "bg-[#1a3a5c] text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Anual
                <span
                  className={`ml-1.5 text-xs font-bold ${billingPeriod === "anual" ? "text-[#f59e0b]" : "text-green-600"}`}
                >
                  Economize 2 meses
                </span>
              </button>
              <button
                onClick={() => setBillingPeriod("mensal")}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  billingPeriod === "mensal"
                    ? "bg-[#1a3a5c] text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Mensal
              </button>
            </div>
          </Reveal>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-[760px] mx-auto">
            {/* Card 1 — Plano Padrão */}
            <Reveal>
              <div className="relative bg-white rounded-xl p-8 border-2 border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,.06)] text-center h-full flex flex-col">
                <h3 className="text-lg font-extrabold text-[#1a3a5c] mb-4">
                  Plano Padrão
                </h3>

                {billingPeriod === "mensal" ? (
                  <div>
                    <div className="text-[2.4rem] font-black text-[#1a3a5c] leading-none">
                      R$39
                      <small className="text-[0.85rem] font-medium text-slate-500">
                        ,90
                      </small>
                      <span className="text-[0.85rem] font-medium text-slate-500">
                        /mês
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[2.4rem] font-black text-[#1a3a5c] leading-none">
                      R$33
                      <small className="text-[0.85rem] font-medium text-slate-500">
                        ,25
                      </small>
                      <span className="text-[0.85rem] font-medium text-slate-500">
                        /mês
                      </span>
                    </div>
                    <p className="text-[0.8rem] text-slate-400 mt-2">
                      R$399,00/ano — economize 2 meses
                    </p>
                  </div>
                )}

                <hr className="my-5 border-slate-200" />

                <ul className="text-left space-y-2.5 mb-6 flex-1">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[0.88rem]">
                      <Check /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={CTA}
                  className="block w-full bg-[#1a3a5c] hover:bg-[#15304d] text-white font-bold py-3.5 rounded-lg transition-colors"
                >
                  Começar grátis — 15 dias
                </Link>

                <p className="text-[0.8rem] text-slate-400 mt-3">
                  15 dias grátis · sem cartão para testar
                </p>
              </div>
            </Reveal>

            {/* Card 2 — Plano Fundador (DESTAQUE) */}
            <Reveal>
              <div className="relative bg-white rounded-xl p-8 border-2 border-[#f59e0b] shadow-[0_8px_40px_rgba(245,158,11,.2)] text-center h-full flex flex-col">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-[#1a1a1a] text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Mais popular
                </span>

                <h3 className="text-lg font-extrabold text-[#1a3a5c] mb-1 mt-2">
                  Plano Fundador
                </h3>
                <p className="text-xs text-[#f59e0b] font-bold mb-4">
                  Vagas limitadas
                </p>

                {billingPeriod === "mensal" ? (
                  <div>
                    <div className="text-[0.95rem] text-slate-400 line-through mb-1">
                      R$39,90/mês
                    </div>
                    <div className="text-[2.4rem] font-black text-[#f59e0b] leading-none">
                      R$24
                      <small className="text-[0.85rem] font-medium text-[#f59e0b]/80">
                        ,90
                      </small>
                      <span className="text-[0.85rem] font-medium text-[#f59e0b]/80">
                        /mês
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[0.95rem] text-slate-400 line-through mb-1">
                      R$33,25/mês
                    </div>
                    <div className="text-[2.4rem] font-black text-[#f59e0b] leading-none">
                      R$20
                      <small className="text-[0.85rem] font-medium text-[#f59e0b]/80">
                        ,75
                      </small>
                      <span className="text-[0.85rem] font-medium text-[#f59e0b]/80">
                        /mês
                      </span>
                    </div>
                    <p className="text-[0.8rem] text-slate-400 mt-2">
                      R$249,00/ano
                    </p>
                  </div>
                )}

                <hr className="my-5 border-slate-200" />

                <ul className="text-left space-y-2.5 mb-6 flex-1">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[0.88rem]">
                      <Check /> {f}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-[0.88rem] font-semibold text-[#1a3a5c]">
                    <Check /> Preço garantido para sempre
                  </li>
                </ul>

                <Link
                  to={CTA}
                  className="block w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-3.5 rounded-lg transition-colors"
                >
                  Garantir preço fundador
                </Link>

                <p className="text-[0.8rem] text-slate-400 mt-3">
                  15 dias grátis · sem cartão para testar
                </p>
              </div>
            </Reveal>
          </div>

          <p className="text-[0.85rem] text-slate-400 mt-6">
            Preço válido para sempre para quem entrar agora.
          </p>
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
              q="Funciona no celular?"
              a="Sim, temos app Android e versão web que funciona em qualquer navegador. Você pode acessar de onde preferir, a qualquer hora."
            />
            <FaqItem
              q="E no iPhone?"
              a="A versão web funciona perfeitamente no iPhone pelo navegador. O app nativo para iOS está em desenvolvimento."
            />
            <FaqItem
              q="O que é o plano fundador?"
              a="É um preço especial para os primeiros motoristas que entrarem na plataforma. Quem entra agora paga R$24,90/mês para sempre, mesmo quando o preço subir."
            />
            <FaqItem
              q="Posso usar pelo computador?"
              a="Sim, o Van360 funciona no browser de qualquer computador. Mas recomendamos o app Android para a melhor experiência no dia a dia."
            />
            <FaqItem
              q="Posso cancelar quando quiser?"
              a="Pode. No plano mensal, basta não renovar. No plano anual, você tem 7 dias após a compra para cancelar e receber reembolso integral. Depois disso, seu acesso segue ativo até o fim do período pago. Tudo direto pelo app, sem ligar para ninguém."
            />
          </div>
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="bg-gradient-to-br from-[#1a3a5c] to-[#234b73] text-white py-16 md:py-20">
        <div className="max-w-[1120px] mx-auto px-5 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-tight mb-3">
              Comece a organizar suas vans hoje
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-[1.05rem] opacity-85 max-w-[520px] mx-auto mb-8">
              15 dias grátis. Sem cartão. Sem compromisso.
            </p>
          </Reveal>
          <Reveal>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={CTA}
                className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-7 py-3.5 rounded-lg transition-colors"
              >
                Começar grátis
              </Link>
              <a
                href="#pricing"
                onClick={scrollToPricing}
                className="inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white font-bold text-base px-7 py-3.5 rounded-lg transition-colors"
              >
                Ver planos e preços
              </a>
            </div>
            <p className="text-[0.9rem] opacity-70 mt-5">
              Sem burocracia. Começa em 5 minutos.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#111] text-white/50 py-8 text-[0.85rem] text-center">
        <div className="max-w-[1120px] mx-auto px-5 flex flex-col items-center gap-3">
          <span className="font-extrabold text-white text-lg">
            Van<span className="text-[#f59e0b]">360</span>
          </span>
          <div className="flex gap-6">
            <a
              href="/privacidade"
              className="hover:text-white transition-colors"
            >
              Privacidade
            </a>
            <a href="/termos" className="hover:text-white transition-colors">
              Termos de uso
            </a>
          </div>
          <p>© 2026 Van360. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
