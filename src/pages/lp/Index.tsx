import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { usePlanos } from "@/hooks";
import { useSEO } from "@/hooks/useSEO";
import { Plano, SubPlano } from "@/types/plano";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Headset,
  Lightbulb,
  Loader2,
  Menu,
  MessageCircle,
  Quote,
  Settings,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  // Permitir indexação da landing page
  useSEO({
    noindex: false,
    title: "Van360 - Gestão para Transporte Escolar | Você só dirige. O Van360 cuida da burocracia.",
    description: "Sistema de gestão para transporte escolar. Automatize cobranças, controle passageiros e organize sua frota. Cobrança automática via WhatsApp e baixa automática de PIX.",
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ROI Calculator State
  const [roiPassageiros, setRoiPassageiros] = useState([60]);
  const [roiMensalidade, setRoiMensalidade] = useState(200);
  const [roiPerdaAnual, setRoiPerdaAnual] = useState(0);

  const CTA_LINK = "/cadastro";
  const LOGIN_LINK = "/login";

  // Calculate ROI
  useEffect(() => {
    const faturamentoMensal = roiPassageiros[0] * roiMensalidade;
    const perdaInadimplencia = faturamentoMensal * 0.05; // 5% inadimplência
    const perdaTempo = roiPassageiros[0] * 10; // R$ 10 de tempo/stress por aluno
    const perdaTotalMensal = perdaInadimplencia + perdaTempo;
    setRoiPerdaAnual(perdaTotalMensal * 12);
  }, [roiPassageiros, roiMensalidade]);

  // Fetch dos planos
  const { data: planosData, isLoading: isLoadingPlanos } = usePlanos({
    ativo: "true",
  });

  const planosDataTyped: { bases: Plano[]; sub: SubPlano[] } = (planosData as
    | { bases: Plano[]; sub: SubPlano[] }
    | undefined) ?? { bases: [], sub: [] };

  const planosOrdenados = planosDataTyped.bases.sort((a, b) => {
    const order = [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO];
    return order.indexOf(a.slug) - order.indexOf(b.slug);
  });

  const getPlanoConfig = (slug: string) => {
    switch (slug) {
      case PLANO_GRATUITO:
        return {
          subtitle: "Recursos limitados. Ideal para testar.",
          buttonText: "Começar Grátis",
          buttonVariant: "ghost" as const,
          highlight: false,
          badge: null,
        };
      case PLANO_ESSENCIAL:
        return {
          subtitle: "Gestão ilimitada + 7 dias grátis",
          buttonText: "Testar 7 dias grátis",
          buttonVariant: "outline" as const,
          highlight: false,
          badge: null,
        };
      case PLANO_COMPLETO:
        return {
          subtitle: "Cobrança automática ativa",
          buttonText: "Quero Automatizar",
          buttonVariant: "default" as const,
          highlight: true,
          badge: "Recomendado",
        };
      default:
        return {
          subtitle: "Plano Van360",
          buttonText: "Escolher Plano",
          buttonVariant: "outline" as const,
          highlight: false,
          badge: null,
        };
    }
  };

  const processarBeneficio = (beneficio: string, plano: Plano) => {
    if (beneficio.includes("{{LIMITE_PASSAGEIROS}}")) {
      return beneficio.replace(
        "{{LIMITE_PASSAGEIROS}}",
        plano.limite_passageiros ? String(plano.limite_passageiros) : "0"
      );
    }
    return beneficio;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-200 overflow-x-hidden scroll-smooth">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <img
                src="/assets/logo-van360.png"
                alt="Van360"
                className="h-8 md:h-10 w-auto"
              />
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#funcionalidades"
                className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#depoimentos"
                className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
              >
                Depoimentos
              </a>
              <a
                href="#precos"
                className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
              >
                Preços
              </a>
              <div className="flex items-center gap-4 ml-4">
                <Link
                  to={LOGIN_LINK}
                  className="text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Entrar
                </Link>
                <Link to={CTA_LINK}>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-sm px-5 shadow-md hover:shadow-lg transition-all">
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </nav>

            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t bg-white p-4 space-y-4 shadow-xl absolute w-full z-50">
            <a
              href="#funcionalidades"
              className="block text-base font-medium text-slate-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Funcionalidades
            </a>
            <a
              href="#depoimentos"
              className="block text-base font-medium text-slate-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Depoimentos
            </a>
            <a
              href="#precos"
              className="block text-base font-medium text-slate-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Preços
            </a>
            <div className="pt-4 border-t flex flex-col gap-3">
              <Link
                to={LOGIN_LINK}
                className="w-full text-center py-3 text-base font-bold text-blue-700 border-2 border-blue-100 rounded-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link to={CTA_LINK} onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-base h-12 rounded-xl">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION (MOBILE OTIMIZADO) */}
      <section className="md:hidden relative pt-8 pb-16 bg-blue-600 text-white overflow-hidden">
        <div className="px-4 text-center relative z-10 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight mt-12 mb-3">
            Você só dirige.
            <span className="text-yellow-400 block">
              O Van360 cuida da burocracia.
            </span>
          </h1>

          {/* Mobile Mockup */}
          <div className="relative w-[90%] max-w-[400px] h-[320px] sm:h-[380px] mb-4 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-500/30 to-blue-300/10 blur-2xl"></div>
            <img
              src="/assets/lp/mock4.png"
              alt="App Van360 Mobile"
              className="h-full w-auto max-w-none drop-shadow-3xl relative z-10 mx-auto"
            />
            {/* Notificação */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut",
              }}
              className="absolute top-[20%] right-[-8%] bg-white p-0 rounded-2xl shadow-2xl border-2 border-green-100 z-30 w-40 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-green-700 font-bold text-sm">R$</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Pix Recebido
                </p>
                <p className="font-extrabold text-slate-900 text-sm">
                  R$ 350,00
                </p>
              </div>
            </motion.div>
          </div>

          {/* CTA Principal */}
          <a href="#precos" className="w-full block max-w-xs relative z-20">
            <Button
              size="lg"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-14 text-lg font-bold shadow-xl rounded-xl hover:scale-105 transition-transform"
            >
              Ver Planos e Preços
            </Button>
          </a>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-blue-100 font-medium z-20">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.9/5
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" /> +500 Motoristas
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Seguro
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION DESKTOP (80% Height Strict) */}
      <section
        id="hero-desktop"
        className="hidden md:flex relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 h-screen min-h-[600px] items-center"
      >
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-0"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 w-full h-full items-center pt-20">
            {/* Texto (Lado Esquerdo) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="text-left space-y-6 flex flex-col justify-center"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold border border-yellow-200 w-fit"
              >
                <span>🚐</span> O braço direito do Tio e da Tia escolar
              </motion.div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Você só dirige. <br />
                <span className="text-blue-700 relative inline-block">
                  O Van360 cuida da burocracia.
                  <svg
                    className="absolute w-full h-3 -bottom-2 left-0 text-yellow-400 -z-10"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
                O Van360 cobra os pais no WhatsApp, confirma o pagamento PIX na
                hora e organiza sua frota. Adeus planilhas e cadernos.
              </p>

              <div className="flex flex-col items-start gap-6 pt-2">
                <a href="#precos">
                  <Button
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-14 px-10 text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-xl"
                  >
                    Ver Planos e Preços
                  </Button>
                </a>

                <div className="flex gap-8 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />{" "}
                    <span>4.9/5 Avaliação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />{" "}
                    <span>+500 Motoristas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-600" />{" "}
                    <span>Dados Seguros</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Imagem Desktop (Lado Direito) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              // ADICIONADO: 'flex items-center' para centralizar verticalmente o conteúdo filho
              className="relative mx-auto lg:ml-auto w-full h-full flex items-center justify-center"
            >
              {/* Container da Imagem */}
              {/* MANTIDO: h-[85vh] para definir o tamanho máximo */}
              <div className="relative z-10 h-[85vh] w-full flex justify-center items-center">
                <img
                  src="/assets/lp/mock4.png"
                  alt="App Van360"
                  className="h-full w-full object-cover object-center drop-shadow-2xl"
                />

                {/* Notificação flutuante */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-[3%] -left-[5%] bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-20 w-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 font-bold text-sm">
                        R$
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Pix Recebido
                      </p>
                      <p className="font-extrabold text-slate-900 text-base">
                        R$ 350,00
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Notification 2: Cobrança (Ajuste de posição) */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute top-[10%] right-[-00%] bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-20 w-64"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        Cobrança Enviada
                      </p>
                      <p className="font-bold text-slate-900 text-sm leading-tight">
                        "Olá! A mensalidade vence hoje..."
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-12 lg:py-20 bg-white relative z-20 rounded-t-[2rem] -mt-6 md:mt-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Sua rotina: do caos à{" "}
              <span className="text-blue-700">tranquilidade</span>.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Veja como sua vida muda quando você sai do papel e vem para o
              Van360.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Nightmare */}
            <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 border border-slate-100 relative">
              <div className="absolute -top-3 right-6 bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                O PESADELO (ANTES)
              </div>
              <div className="space-y-6 mt-2">
                {[
                  {
                    title: "Caderno e Planilhas",
                    desc: "Anotações perdidas, rasuras e café derramado na lista de quem pagou.",
                  },
                  {
                    title: "Cobrança Constrangedora",
                    desc: "Ter que cobrar pai atrasado e ficar no vácuo.",
                  },
                  {
                    title: "Trabalhar no escuro",
                    desc: "Trabalhar o mês todo e não saber se o lucro real pagou a gasolina e a manutenção.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start opacity-80">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Dream */}
            <div className="bg-blue-50 rounded-2xl p-6 lg:p-8 border-2 border-blue-100 relative shadow-lg">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                O SONHO (COM VAN360)
              </div>
              <div className="space-y-6 mt-2">
                {[
                  {
                    title: "Tudo no Celular",
                    desc: "Lista de passageiros e pagamentos na palma da mão.",
                    icon: Smartphone,
                  },
                  // Ícone trocado para MessageCircle e texto ajustado
                  {
                    title: "Cobrança Automática",
                    desc: "O Van360 envia a cobrança no WhatsApp. Você não se estressa e recebe mais rápido.",
                    icon: MessageCircle,
                  },
                  {
                    title: "Lucro Real",
                    desc: "Relatórios claros de quanto entrou e saiu.",
                    icon: TrendingUp,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm">
                      <item.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-700">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900">
              Como funciona na prática?
            </h3>
            <p className="text-slate-600 mt-2">
              Simples, rápido e sem complicação. Configure em 5 minutos e deixe
              o Van360 trabalhar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>

            {[
              {
                step: "1",
                title: "Cadastre",
                desc: "Registre veículos, escolas e passageiros.",
                icon: UserPlus,
                color: "bg-blue-600",
              },
              {
                step: "2",
                title: "Configure",
                desc: "Defina valores e vencimentos.",
                icon: Settings,
                color: "bg-blue-600",
              },
              {
                step: "3",
                title: "Automatize",
                desc: "O Van360 cobra e confirma o pagamento.",
                icon: Zap,
                color: "bg-green-500",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative"
              >
                <div
                  className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES ZIG-ZAG */}
      <section
        id="funcionalidades"
        className="py-12 lg:py-32 overflow-hidden bg-slate-50 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 lg:space-y-32">
          {/* Feature 1: Financeiro */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Mockup UI */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-bold text-slate-700">
                      Pagamentos do Mês
                    </span>
                    <Badge className="bg-green-100 text-green-700">
                      Em dia
                    </Badge>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                          {String.fromCharCode(64 + i)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            Mãe do Enzo
                          </p>
                          <p className="text-xs text-slate-500">Pago via PIX</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">
                        + R$ 350,00
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                <Wallet className="w-4 h-4" /> Financeiro Blindado
              </div>
              <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900">
                Receba enquanto dirige.
              </h3>
              <p className="text-xl text-slate-600 leading-relaxed">
                Pagou, caiu, atualizou: O dinheiro é seu e a carteirinha do
                passageiro fica verde instantaneamente.
              </p>
            </div>
          </div>

          {/* Feature 2: Organização */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-24">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Mockup UI */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                    <div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-blue-50 rounded-2xl border border-blue-100"></div>
                    <div className="h-24 bg-blue-50 rounded-2xl border border-blue-100"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                <Users className="w-4 h-4" /> Organização Total
              </div>
              <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900">
                Tudo na palma da mão.
              </h3>
              <p className="text-xl text-slate-600 leading-relaxed">
                Lista de passageiros, escolas e veículos com acesso instantâneo.
                Tudo que você precisa em um só lugar.
              </p>
            </div>
          </div>

          {/* Feature 3: Profissionalismo */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500 flex items-center justify-center">
                <div className="w-full max-w-xs bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
                  <div className="flex justify-between items-start mb-8">
                    <Smartphone className="w-8 h-8" />
                    <span className="font-mono opacity-50">CARTEIRINHA</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                    <div className="h-4 w-1/2 bg-white/20 rounded"></div>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/20 flex justify-between items-center">
                    <div className="text-xs opacity-70">Van360 Digital</div>
                    <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-bold">
                <Star className="w-4 h-4" /> Profissionalismo
              </div>
              <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900">
                Impressione os pais.
              </h3>
              <p className="text-xl text-slate-600 leading-relaxed">
                Chega de papelzinho amassado. Ofereça Carteirinha Digital, Link
                de Cadastro e mostre que seu transporte é coisa séria.
              </p>
            </div>
          </div>

          {/* CTA após Funcionalidades */}
          <div className="text-center mt-16 lg:mt-24">
            <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
              Toda essa organização cabe no seu bolso e no seu celular.
            </p>
            <a href="#precos">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-14 px-10 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-xl"
              >
                Quero me Profissionalizar
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF: TESTIMONIALS (AVATARS) */}
      <section
        id="depoimentos"
        className="py-12 lg:py-20 bg-blue-600 text-white scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6">
              Quem usa, não larga mais.
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Aprovado por motoristas de todo o Brasil. Veja o que eles dizem:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "Tia Márcia",
                role: "Transporte Escolar há 15 anos",
                text: "Nossa, facilitou muito minha vida! Antes eu perdia o domingo cobrando, agora eles fazem tudo. Sobra tempo pra família.",
                location: "São Paulo, SP",
                stats: "Economizou 8h/sem",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              },
              {
                name: "Tio Carlos",
                role: "Frota com 3 Vans",
                text: "Eu achava que era difícil mexer, mas é muito simples. Meus motoristas adoraram e os pais elogiam a organização.",
                location: "Curitiba, PR",
                stats: "Inadimplência reduzida",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                name: "Tia Sueli",
                role: "Iniciante no ramo",
                text: "Comecei agora e já comecei certo. O Van360 me ajuda a não esquecer nada e passar confiança pros pais. Sem preocupações com inadimplência.",
                location: "Belo Horizonte, MG",
                stats: "Mais profissional",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xl relative w-full max-w-full overflow-hidden"
              >
                <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 text-blue-100 w-8 h-8 sm:w-10 sm:h-10" />
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 pr-8 sm:pr-12">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-200 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base sm:text-lg">{item.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {item.location}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 sm:p-4 rounded-xl rounded-tl-none border border-slate-100 mb-3 sm:mb-4">
                  <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed">"{item.text}"</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                  <TrendingUp className="w-3 h-3 flex-shrink-0" /> <span className="whitespace-nowrap">{item.stats}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Prova Social Destaque - Movido para depois dos reviews */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-4 border border-white/20 w-full max-w-2xl mx-auto mt-12 md:mt-16">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold">98%</div>
              <div className="text-xs sm:text-sm text-blue-100">Recomendariam</div>
            </div>
            <div className="w-full sm:w-px sm:h-12 h-px bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold">4.9/5</div>
              <div className="text-xs sm:text-sm text-blue-100">Avaliação média</div>
            </div>
            <div className="w-full sm:w-px sm:h-12 h-px bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold">15h</div>
              <div className="text-xs sm:text-sm text-blue-100">Economizadas/mês</div>
            </div>
          </div>

          {/* CTA após Depoimentos */}
          <div className="text-center mt-12 md:mt-16">
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Faça parte do grupo de motoristas que dirige tranquilo e recebe em
              dia.
            </p>
            <a href="#precos">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-14 px-10 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-xl"
              >
                Quero fazer parte
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="py-12 lg:py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-slate-50 rounded-3xl shadow-lg border border-slate-200 p-5 sm:p-8 lg:p-12">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
                Quanto você perde por mês?
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Faça as contas e veja o prejuízo de continuar no manual.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-bold text-slate-700">
                      Passageiros
                    </Label>
                    <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                      {roiPassageiros[0]}
                    </span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={roiPassageiros}
                      onValueChange={setRoiPassageiros}
                      max={100}
                      step={1}
                      className="py-2 w-full cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-bold text-slate-700 block">
                    Mensalidade Média (R$)
                  </Label>
                  <Input
                    type="number"
                    value={roiMensalidade}
                    onChange={(e) => setRoiMensalidade(Number(e.target.value))}
                    className="text-lg font-bold h-12 w-full"
                  />
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl p-5 sm:p-6 border border-red-100 text-center space-y-2 w-full">
                <p className="text-red-600 font-medium text-xs sm:text-sm uppercase tracking-wide">
                  Você pode estar perdendo até
                </p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-red-600 break-words">
                  {roiPerdaAnual.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-red-400 text-xs sm:text-sm px-2">
                  por ano com inadimplência e tempo gasto.
                </p>
                <div className="pt-4 w-full">
                  <a href="#precos" className="block w-full">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-sm sm:text-base whitespace-normal">
                      Parar de perder dinheiro
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="precos" className="py-12 lg:py-24 bg-slate-50 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Planos que cabem no bolso
            </h2>
            <p className="text-lg text-slate-600">
              Sem fidelidade, sem multas. Cancele quando quiser.
            </p>
          </div>

          {isLoadingPlanos ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
              {planosOrdenados.map((plano) => {
                const config = getPlanoConfig(plano.slug);
                const isCompleto = plano.slug === PLANO_COMPLETO;
                const isGratuito = plano.slug === PLANO_GRATUITO;
                const isEssencial = plano.slug === PLANO_ESSENCIAL;

                let preco =
                  plano.promocao_ativa && plano.preco_promocional
                    ? plano.preco_promocional
                    : plano.preco;

                if (isCompleto) {
                  const subPlanos = planosDataTyped.sub.filter(
                    (sub) => sub.parent_id === plano.id
                  );
                  if (subPlanos.length > 0) {
                    const precosSub = subPlanos.map((sub) =>
                      sub.promocao_ativa && sub.preco_promocional
                        ? sub.preco_promocional
                        : sub.preco
                    );
                    preco = Math.min(...precosSub);
                  }
                }

                return (
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    key={plano.id}
                  >
                    <Card
                      className={`border-2 shadow-md transition-all relative overflow-hidden flex flex-col ${
                        config.highlight
                          ? "ring-4 ring-yellow-400 border-yellow-400 shadow-xl z-10 bg-white"
                          : "border-slate-100 bg-white"
                      }`}
                    >
                      <div
                        className={`text-center py-1.5 font-bold text-xs uppercase tracking-wide ${
                          config.highlight
                            ? "bg-yellow-400 text-slate-900"
                            : "bg-transparent text-white"
                        }`}
                      >
                        {config.badge ?? "x"}
                      </div>

                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-slate-900">
                          {plano.nome}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {config.subtitle}
                        </CardDescription>
                        <div className="mt-4">
                          {isGratuito ? (
                            <>
                              <span className="text-4xl font-extrabold text-slate-900">
                                R$ 0
                              </span>
                              <span className="text-slate-500 font-medium text-sm">
                                /mês
                              </span>
                            </>
                          ) : (
                            <>
                              {isCompleto && (
                                <span className="text-xs text-slate-500 block font-medium mb-1">
                                  A partir de
                                </span>
                              )}
                              {isEssencial && (
                                <span className="text-xs text-slate-500 block font-medium mb-1">
                                  Por apenas
                                </span>
                              )}
                              <span className="text-4xl font-extrabold text-slate-900">
                                {preco
                                  .toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                  .replace("R$", "")
                                  .trim()}
                              </span>
                              <span className="text-slate-500 font-medium text-sm">
                                /mês
                              </span>
                            </>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-grow">
                        <ul className="space-y-3 text-sm text-slate-700">
                          {plano.beneficios.map((beneficio, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <div
                                className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${
                                  config.highlight
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium leading-snug">
                                {processarBeneficio(beneficio, plano)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter className="pt-2 pb-6">
                        <Link to={CTA_LINK} className="w-full">
                          <Button
                            variant={config.buttonVariant}
                            className={`w-full h-12 text-base font-bold rounded-xl ${
                              config.highlight
                                ? "bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-md"
                                : ""
                            }`}
                          >
                            {config.buttonText}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* COMPARISON TABLE */}
          <div className="max-w-5xl mx-auto mt-12">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-center gap-4 shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm md:text-base">
                  O Plano Completo te economiza{" "}
                  <span className="text-blue-700">15+ horas</span> por mês.
                </p>
                <p className="text-xs md:text-sm text-slate-600">
                  Veja a diferença abaixo e escolha o que faz sentido para você:
                </p>
              </div>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="comparison" className="border-none">
                <AccordionTrigger className="justify-center text-blue-600 font-bold hover:no-underline hover:text-blue-800">
                  <span className="pr-2">
                    Ver comparação{" "}
                    <span className="hidden sm:inline">detalhada</span> dos
                    planos
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                    {/* Header Otimizado */}
                    <div className="grid grid-cols-4 bg-slate-50 p-2 sm:p-4 font-bold text-slate-700 text-[10px] sm:text-sm uppercase tracking-wide border-b-2 border-slate-200 items-center">
                      <div className="col-span-1 text-left px-1 text-transparent sm:text-inherit">
                        Recurso
                      </div>
                      <div className="text-center">Grátis</div>
                      <div className="text-center">Essencial</div>
                      <div className="text-center text-blue-700">Completo</div>
                    </div>

                    {[
                      // 1. O BÁSICO
                      {
                        name: "Limite de Passageiros",
                        free: "Limitado",
                        ess: "Ilimitado",
                        comp: "Ilimitado",
                      },
                      {
                        name: "Quantidade de Veículos",
                        free: "Ilimitado",
                        ess: "Ilimitado",
                        comp: "Ilimitado",
                      },
                      {
                        name: "Quantidade de Escolas",
                        free: "Ilimitado",
                        ess: "Ilimitado",
                        comp: "Ilimitado",
                      },
                      {
                        name: "Link para Pais se Cadastrarem",
                        free: false,
                        ess: true,
                        comp: true,
                      },

                      // 2. FINANCEIRO
                      {
                        name: "Controle de Quem Pagou (Manual)",
                        free: true,
                        ess: true,
                        comp: true,
                      },
                      {
                        name: "Controle de Gastos e Lucro",
                        free: false,
                        ess: true,
                        comp: true,
                      },
                      {
                        name: "Relatórios de Faturamento",
                        free: false,
                        ess: true,
                        comp: true,
                      },

                      // 3. O ROBÔ (AUTOMAÇÃO)
                      {
                        name: "Cobrança Automática no WhatsApp",
                        free: false,
                        ess: false,
                        comp: true,
                      },
                      {
                        name: "Baixa Automática do PIX",
                        free: false,
                        ess: false,
                        comp: true,
                      },
                      {
                        name: "Envio de Recibos e Lembretes",
                        free: false,
                        ess: false,
                        comp: true,
                      },

                      // 4. AJUDA
                      {
                        name: "Atendimento Prioritário (WhatsApp)",
                        free: false,
                        ess: true,
                        comp: true,
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-4 p-2 sm:p-4 border-t border-slate-100 items-center text-xs sm:text-sm"
                      >
                        <div className="col-span-1 font-medium text-slate-700 text-left px-1 leading-tight">
                          {row.name}
                        </div>

                        <div className="text-center flex justify-center">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <CheckCircle2 className="text-green-500 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            ) : (
                              <XCircle className="text-slate-300 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            )
                          ) : (
                            <span className="font-bold text-slate-600">
                              {row.free}
                            </span>
                          )}
                        </div>

                        <div className="text-center flex justify-center">
                          {typeof row.ess === "boolean" ? (
                            row.ess ? (
                              <CheckCircle2 className="text-green-500 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            ) : (
                              <XCircle className="text-slate-300 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            )
                          ) : (
                            <span className="font-bold text-slate-600">
                              {row.ess}
                            </span>
                          )}
                        </div>

                        {/* Coluna Completo com destaque sutil */}
                        <div className="text-center flex justify-center bg-blue-50/30 -my-2 py-2 sm:-my-4 sm:py-4">
                          {typeof row.comp === "boolean" ? (
                            row.comp ? (
                              <CheckCircle2 className="text-green-500 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            ) : (
                              <XCircle className="text-slate-300 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            )
                          ) : (
                            <span className="font-extrabold text-blue-700">
                              {row.comp}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* HUMAN SUPPORT STRIP */}
      <section className="bg-slate-900 text-white py-8 border-b border-slate-800 selection:bg-blue-700">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <div className="bg-blue-600 p-3 rounded-full animate-pulse">
            <Headset className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg">
              Suporte humanizado e Vídeos Tutoriais
            </p>
            <p className="text-slate-300 text-sm">
              Te ensinamos a usar o Van360 em 5 minutos. Conte com a gente.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-12 lg:py-20 bg-white scroll-mt-28">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-slate-600">
              Tire suas dúvidas sobre o melhor sistema de gestão para transporte
              escolar.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem
              value="item-1"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Qual plano é melhor para mim?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                O <strong>Gratuito</strong> é para testar. O{" "}
                <strong>Essencial</strong> organiza sua gestão. O{" "}
                <strong>Completo</strong> automatiza tudo (cobrança e baixa de
                PIX) e te dá folga.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-2"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Como posso cobrar os pais automaticamente?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Com o Van360, você configura o valor e a data de vencimento uma
                única vez. Nós enviamos o lembrete e o código PIX para o
                WhatsApp dos pais automaticamente todo mês.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-3"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Preciso de internet para usar?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Sim, o Van360 precisa de conexão (Wi-Fi ou dados móveis) para
                processar os pagamentos e enviar as mensagens em tempo real. O
                Van360 é leve e não consome quase nada do seu plano.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-4"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                É seguro receber pelo Van360?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Totalmente seguro. O pagamento via PIX cai direto na sua conta
                bancária, sem intermediários segurando seu dinheiro. O Van360
                apenas identifica que o pagamento foi feito.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-5"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Posso mudar de plano depois?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Sim! Você pode realizar a troca de plano a qualquer momento pelo
                próprio painel. Se sua frota crescer, o Van360 cresce com você.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-6"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Quanto tempo leva para configurar?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Menos de 5 minutos. Você cria sua conta, cadastra sua van e já
                pode começar a adicionar passageiros. É muito rápido.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-7"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Tem fidelidade?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Nenhuma. Você pode cancelar a qualquer momento com um clique no
                seu painel. Sem multas, sem letras miúdas e sem precisar ligar
                para ninguém.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-8"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Preciso de computador?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Não! O Van360 foi desenvolvido para rodar 100% no seu celular,
                tablet ou computador. Você gerencia tudo de onde estiver.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="item-9"
              className="border rounded-lg px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                O dinheiro cai na hora?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Sim! O valor pago de cada cobrança cai direto na sua conta
                cadastrada. O Van360 não segura seu dinheiro em nenhum momento.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-20 bg-slate-900 text-white text-center px-4 relative overflow-hidden selection:bg-blue-700">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8">
            Você só dirige. O Van360 cuida da burocracia.
          </h2>
          <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto">
            Automatize a rotina, pare de perder tempo no WhatsApp e tenha a
            sensação de ter um assistente 24h por dia.
          </p>
          <Link to={CTA_LINK}>
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xl font-bold px-12 h-16 rounded-2xl shadow-2xl hover:scale-105 transition-transform"
            >
              Começar Grátis Agora
            </Button>
          </Link>
          <p className="mt-6 text-sm text-slate-500">
            Não pede cartão de crédito • Cancelamento grátis
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-van360.png"
              alt="Van360"
              className="h-8 w-auto opacity-80"
            />
            <span className="text-2xl font-bold text-white">Van360</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contato
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Blog
            </a>
          </div>

          <div className="text-sm opacity-60">
            © {new Date().getFullYear()} Van360 Tecnologia.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
