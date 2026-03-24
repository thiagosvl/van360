import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import {
  CheckCircle2,
  ChevronDown,
  Menu,
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

// ── Pricing data ──
// Fundador: R$24,90/mês ou R$249/ano (10 meses)
// Desconto anual: 1 - (249 / (24.9*12)) ≈ 17%
const ANNUAL_DISCOUNT_PCT = 17;

// ── Main component ──
const Index = () => {
  useSEO({
    title: "Van360 - Gestão Completa para Transporte Escolar",
    description: "O Van360 é o sistema definitivo para motoristas de van escolar. Organize passageiros, automatize mensalidades, gere contratos e emita recibos, tudo pelo celular.",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"anual" | "mensal">("anual");
  const CTA = ROUTES.PUBLIC.REGISTER;
  const LOGIN = ROUTES.PUBLIC.LOGIN;

  const features = [
    "Passageiros ilimitados",
    "Controle de mensalidades",
    "Contratos digitais com assinatura",
    "Recibos gerados na hora",
  ];

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
              Entrar
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
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-5 space-y-3 shadow-xl">
            <Link
              to={LOGIN}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-center font-bold text-[#1a3a5c] border-2 border-slate-200 rounded-lg"
            >
              Entrar
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
            Caderninho, planilha e WhatsApp
            <br />
            <em className="not-italic text-[#f59e0b] underline underline-offset-4 decoration-[#f59e0b]/30">
              não dão conta
            </em>{" "}
            da sua van.
          </h1>
          <p className="text-[clamp(1.05rem,2.5vw,1.25rem)] text-slate-500 max-w-[560px] mx-auto mb-8">
            O Van360 organiza seus passageiros, mensalidades, contratos e
            recibos — tudo pelo celular, sem complicação.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-10 flex-wrap mb-10">
            {[
              ["5 min", "para cadastrar tudo"],
              ["0", "papel"],
              ["100%", "digital"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-[#1a3a5c] leading-none">
                  {num}
                </div>
                <div className="text-[0.85rem] text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <a
              href="#precos"
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
              href="#precos"
              className="block bg-gradient-to-br from-[#1a3a5c] to-[#234b73] text-white rounded-xl p-6 max-w-[480px] mx-auto shadow-[0_8px_32px_rgba(0,0,0,.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,.18)] transition-shadow cursor-pointer"
            >
              <span className="inline-block bg-[#f59e0b] text-[#1a1a1a] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Oferta de fundador
              </span>
              <div className="text-[1.6rem] font-black leading-tight">
                R$24,90
                <small className="text-[0.9rem] font-medium opacity-80">
                  /mês
                </small>
              </div>
              <p className="text-[0.9rem] opacity-85 mt-2">
                Preço válido para sempre para quem entrar agora.
              </p>
              <div className="inline-flex items-center gap-1.5 bg-white/15 px-3.5 py-1.5 rounded-full text-[0.85rem] font-semibold mt-3">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] lp-pulse" />
                11 vagas restantes
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
                    Controla tudo no <strong className="text-[#1a3a5c]">caderninho ou planilha</strong> e no fim do mês não sabe ao certo quanto entrou.
                  </>
                ),
              },
              {
                icon: "😬",
                text: (
                  <>
                    Fica <strong className="text-[#1a3a5c]">sem jeito de cobrar</strong> porque é pai de aluno que você vê todo dia na porta da escola.
                  </>
                ),
              },
              {
                icon: "😤",
                text: (
                  <>
                    Já teve <strong className="text-[#1a3a5c]">briga com pai</strong> porque o combinado era só verbal e cada um lembrou diferente.
                  </>
                ),
              },
              {
                icon: "📱",
                text: (
                  <>
                    Perde <strong className="text-[#1a3a5c]">horas por mês</strong> no WhatsApp tirando dúvida, anotando dados e conferindo pagamento um por um.
                  </>
                ),
              },
              {
                icon: "🧾",
                text: (
                  <>
                    Pai pede <strong className="text-[#1a3a5c]">recibo ou contrato</strong> e você não tem nada pronto — improvisa na hora.
                  </>
                ),
              },
              {
                icon: "🤷",
                text: (
                  <>
                    Sente que trabalha muito mas <strong className="text-[#1a3a5c]">ninguém leva a sério</strong> como se fosse um profissional de verdade.
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
            {/* Feature 1 — Gestão de passageiros */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Gest%C3%A3o+de+Passageiros"
                  alt="Mock da tela de gestão de passageiros do Van360"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Todos os seus passageiros em um lugar só
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    Cadastre alunos, responsáveis, escolas e turnos. Chega de
                    caderninho, papel solto e dado espalhado no WhatsApp.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Feature 2 — Controle de mensalidades */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Controle+de+Mensalidades"
                  alt="Mock da tela de controle de mensalidades do Van360"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Saiba em segundos quem pagou e quem deve
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    Registre pagamentos (Pix, dinheiro, transferência), dê baixa
                    manual e acompanhe o status de cada mensalidade — pago,
                    pendente ou atrasado.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Feature 3 — Contratos digitais */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Contrato+Digital"
                  alt="Mock da tela de geração de contrato digital do Van360"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Contrato digital que protege você
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    Gere contratos entre você e o responsável com assinatura
                    digital. Tudo com validade jurídica, PDF salvo, sem
                    impressora e sem "eu não sabia dessa regra".
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Feature 4 — Recibos */}
            <Reveal>
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.08)] hover:-translate-y-1 transition-transform h-full">
                <img
                  src="https://placehold.co/600x400/1a1a2e/ffffff?text=Gera%C3%A7%C3%A3o+de+Recibo"
                  alt="Mock da tela de geração de recibo do Van360"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="p-6 text-left">
                  <h3 className="text-[1.1rem] font-bold text-[#1a3a5c] mb-2">
                    Recibo gerado na hora, sempre que precisar
                  </h3>
                  <p className="text-[0.9rem] text-slate-500 leading-relaxed">
                    A cada pagamento registrado, o recibo fica pronto
                    automaticamente. Você visualiza e compartilha quando quiser
                    — sem improvisar nada.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ COMO FUNCIONA ══════════ */}
      <section id="como-funciona" className="py-14 md:py-20 bg-[#f9f9f7] scroll-mt-20">
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
                desc: "Gere contratos digitais e recibos automaticamente. Compartilhe pelo WhatsApp quando precisar.",
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
      <section id="precos" className="py-14 md:py-20 scroll-mt-20">
        <div className="max-w-[520px] mx-auto px-5 text-center">
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
                <span className={`ml-1.5 text-xs font-bold ${billingPeriod === "anual" ? "text-[#f59e0b]" : "text-green-600"}`}>
                  {ANNUAL_DISCOUNT_PCT}% off
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

          {/* Card único — Fundador */}
          <Reveal>
            <div className="relative bg-white rounded-xl p-8 border-2 border-[#f59e0b] shadow-[0_8px_40px_rgba(245,158,11,.2)] text-center">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-[#1a1a1a] text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                Oferta de fundador
              </span>

              {billingPeriod === "mensal" ? (
                <div className="mt-4">
                  <div className="text-[2.8rem] font-black text-[#1a3a5c] leading-none">
                    R$24<small className="text-[0.9rem] font-medium text-slate-500">,90</small>
                    <span className="text-[0.9rem] font-medium text-slate-500">/mês</span>
                  </div>
                  <p className="text-[0.8rem] text-slate-400 mt-2">Cartão ou Pix</p>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="text-[2.8rem] font-black text-[#1a3a5c] leading-none">
                    R$20<small className="text-[0.9rem] font-medium text-slate-500">,75</small>
                    <span className="text-[0.9rem] font-medium text-slate-500">/mês</span>
                  </div>
                  <p className="text-[0.8rem] text-slate-400 mt-2">R$249/ano no cartão</p>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold text-[#f59e0b] mt-4">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] lp-pulse" />
                11 vagas · preço fixo para sempre
              </div>

              <hr className="my-5 border-slate-200" />

              <ul className="text-left space-y-2.5 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.88rem]">
                    <Check /> {f}
                  </li>
                ))}
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
              q="Preciso de cartão de crédito para testar?"
              a="Não. Os 15 dias de teste são 100% grátis, sem cadastrar cartão, sem compromisso. Você usa tudo, com seus dados reais, e só decide depois."
            />
            <FaqItem
              q="Funciona no celular?"
              a="Sim, funciona no celular, tablet e computador. Você pode usar pelo app ou pelo site — acesse de onde preferir, a qualquer hora."
            />
            <FaqItem
              q="Meus dados ficam seguros?"
              a="Sim. Seus dados e os dados dos seus passageiros ficam protegidos com criptografia e armazenados em servidores seguros. Só você tem acesso."
            />
            <FaqItem
              q="Tenho muitos passageiros, demora para cadastrar?"
              a="Não. Você pode enviar um link para cada pai preencher os dados do filho direto pelo celular. Também pode importar de uma planilha. Não precisa digitar um por um."
            />
            <FaqItem
              q="O contrato tem validade legal?"
              a="Sim. O contrato digital com assinatura eletrônica tem validade jurídica conforme a legislação brasileira (MP 2.200-2/2001). Ambas as partes recebem o PDF assinado."
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
              Sua van merece uma gestão
              <br />
              de verdade.
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-[1.05rem] opacity-85 max-w-[520px] mx-auto mb-8">
              Organize passageiros, mensalidades, contratos e recibos — tudo
              pelo celular, em um lugar só.
            </p>
          </Reveal>
          <Reveal>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={CTA}
                className="inline-flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold text-base px-7 py-3.5 rounded-lg transition-colors"
              >
                Começar grátis — 15 dias sem cartão
              </Link>
              <a
                href="#precos"
                className="inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white font-bold text-base px-7 py-3.5 rounded-lg transition-colors"
              >
                Ver planos e preços
              </a>
            </div>
            <p className="text-[0.9rem] opacity-70 mt-5">
              Sem cartão. Sem burocracia. Começa em 5 minutos.
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
            <a href="/privacidade" className="hover:text-white transition-colors">
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
