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
import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Headset,
  Heart,
  Menu,
  MessageCircle,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  // Permitir indexação da landing page
  useSEO({
    noindex: false,
    title: "Van360 - Você dirige. Nós cobramos, confirmamos e organizamos.",
    description:
      "Recupere 15+ horas por mês e reduza a inadimplência em até 80%. Automatize cobranças via WhatsApp e baixa de PIX. Assuma o controle total do seu financeiro.",
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const CTA_LINK = ROUTES.PUBLIC.REGISTER;
  const LOGIN_LINK = ROUTES.PUBLIC.LOGIN;

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
                href="#como-funciona"
                className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
              >
                Como Funciona
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
              <a
                href="#faq"
                className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
              >
                FAQ
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
                    Criar Conta Grátis
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
              href="#como-funciona"
              className="block text-base font-medium text-slate-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
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
            <a
              href="#faq"
              className="block text-base font-medium text-slate-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
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
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/lp/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Copy */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Você dirige.
                <span className="block text-yellow-400">
                  Nós cobramos, confirmamos e organizamos.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                O Van360 organiza a burocracia para você focar no que importa: a
                segurança dos seus passageiros.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link to={CTA_LINK}>
                  <Button
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 h-14 text-lg font-bold shadow-xl rounded-xl hover:scale-105 transition-transform w-full sm:w-auto px-8"
                  >
                    Começar a usar agora
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-blue-200 mb-6">
                ✅ Gratuito e sem restrições • ❌ Sem pegadinhas
              </p>

              {/* Prova Social */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-blue-100 font-medium">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>
                    <strong>4.9/5</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>
                    <strong>+500</strong> motoristas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>
                    <strong>+R$2.5M</strong> processados
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[400px] h-[400px] md:h-[500px] flex items-center justify-center">
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-500/30 to-blue-300/10 blur-3xl"></div>
                <img
                  src="/assets/lp/mock4.png"
                  alt="App Van360 Mobile"
                  className="h-full w-auto max-w-none drop-shadow-3xl relative z-10"
                />
                {/* Notificação Animada */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                  className="absolute top-[15%] right-[-5%] bg-white p-3 rounded-2xl shadow-2xl border-2 border-green-100 z-30 w-48 flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-green-700 font-bold text-lg">R$</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      PIX Recebido
                    </p>
                    <p className="font-extrabold text-slate-900 text-lg">
                      R$ 350,00
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Parece familiar? Sua rotina não precisa ser assim.
            </h2>
            <p className="text-xl text-slate-600">
              Reconhece essas situações? Você não está sozinho.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Noites Perdidas Cobrando
              </h3>
              <p className="text-slate-600 leading-relaxed">
                São 22h e você ainda está no WhatsApp, mandando mensagem um por
                um, conferindo quem pagou e quem ainda não viu a mensagem.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Dinheiro Deixado na Mesa
              </h3>
              <p className="text-slate-600 leading-relaxed">
                A inadimplência de 5% parece pouco, mas no fim do ano são
                milhares de reais que você trabalhou para ganhar e não recebeu.
                Fora o estresse de cobrar.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Vergonha e Desgaste
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Cobrar é desconfortável. Você se sente mal, o pai se sente
                pressionado e a relação fica desgastada. Parece que você está
                pedindo um favor, e não recebendo pelo seu trabalho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA SECTION */}
      <section
        id="como-funciona"
        className="py-16 md:py-24 bg-slate-50 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              O Van360 trabalha por você, enquanto você dirige.
            </h2>
            <p className="text-xl text-slate-600">
              Simples, rápido e sem complicação. Configure em 5 minutos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>

            {/* Passo 1 */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center relative hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mb-6 shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Configure em 5 Minutos
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Cadastre seus passageiros e defina os valores. Nossa equipe te
                ajuda no processo, se precisar.
              </p>
            </div>

            {/* Passo 2 - Comentado Automação */}
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center text-center relative hover:shadow-lg transition-shadow opacity-60">
              <div className="w-16 h-16 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-2xl mb-6 shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Organize suas Cobranças
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Acompanhe quem pagou e quem está pendente de forma profissional
                e organizada em um só lugar.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-white p-8 rounded-2xl border-2 border-green-200 shadow-sm flex flex-col items-center text-center relative hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-2xl mb-6 shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Gestão e Controle
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Dê baixa nas cobranças e mantenha o histórico de pagamentos
                sempre atualizado. A carteirinha do passageiro reflete o status
                em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Menos burocracia, mais lucro e paz de espírito.
            </h2>
            <p className="text-xl text-slate-600">
              Veja o que você ganha de verdade com o Van360.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefício 1 */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Recupere Seu Tempo
                  </h3>
                  <p className="text-lg font-bold text-blue-700 mb-3">
                    Ganhe 15+ horas por mês.
                  </p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed mb-3">
                O tempo que você gastava cobrando, agora você usa para
                descansar, ficar com a família ou cuidar da sua van.
              </p>
              <p className="text-sm text-slate-500 italic">
                Valor: R$600+/mês (considerando seu tempo)
              </p>
            </div>

            {/* Benefício 2 */}
            <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Aumente Seu Faturamento
                  </h3>
                  <p className="text-lg font-bold text-green-700 mb-3">
                    Reduza a inadimplência em até 80%.
                  </p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed mb-3">
                Com cobranças automáticas e lembretes, os pais pagam em dia e
                você não perde dinheiro.
              </p>
              <p className="text-sm text-slate-500 italic">
                Valor: R$1.200+/ano (para um faturamento de R$10k/mês)
              </p>
            </div>

            {/* Benefício 3 */}
            <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Impressione os Pais
                  </h3>
                  <p className="text-lg font-bold text-purple-700 mb-3">
                    Mostre profissionalismo.
                  </p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed mb-3">
                Com carteirinha digital, link de cadastro e comunicação
                automática, os pais veem seu serviço com outros olhos e
                valorizam mais.
              </p>
              <p className="text-sm text-slate-500 italic">
                Valor: Aumento da percepção de valor e fidelização
              </p>
            </div>

            {/* Benefício 4 */}
            <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Tenha Controle Total
                  </h3>
                  <p className="text-lg font-bold text-yellow-700 mb-3">
                    Saiba exatamente quanto você lucra.
                  </p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed mb-3">
                Relatórios claros de faturamento, despesas e inadimplência.
                Chega de achismos e planilhas complicadas.
              </p>
              <p className="text-sm text-slate-500 italic">
                Valor: Tome decisões baseadas em dados, não em suposições
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS SECTION */}
      <section
        id="depoimentos"
        className="hidden py-16 md:py-24 bg-slate-50 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Mais de 500 motoristas já transformaram sua gestão.
            </h2>
            <p className="text-xl text-slate-600">
              Veja o que eles têm a dizer sobre o Van360.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 italic">
                "Eu perdia quase 3 horas por dia cobrando. Hoje, o Van360 faz
                tudo sozinho. A inadimplência caiu de 10% pra quase zero. Não
                vivo mais sem."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                  CA
                </div>
                <div>
                  <p className="font-bold text-slate-900">Carlos Alberto</p>
                  <p className="text-sm text-slate-500">São Paulo - SP</p>
                </div>
              </div>
            </div>

            {/* Depoimento 2 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 italic">
                "O que mais gostei foi o profissionalismo. Os pais elogiam a
                organização, a carteirinha digital. Parece que meu negócio subiu
                de nível."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">
                  JS
                </div>
                <div>
                  <p className="font-bold text-slate-900">Joana Silva</p>
                  <p className="text-sm text-slate-500">Belo Horizonte - MG</p>
                </div>
              </div>
            </div>

            {/* Depoimento 3 */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 italic">
                "No começo eu duvidei, mas em 2 meses eu já tinha recuperado o
                valor do ano inteiro só com a redução da inadimplência. É um
                investimento que se paga muito rápido."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                  RS
                </div>
                <div>
                  <p className="font-bold text-slate-900">Ricardo Souza</p>
                  <p className="text-sm text-slate-500">Rio de Janeiro - RJ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANTES E DEPOIS SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Sua vida antes e depois do Van360.
            </h2>
            <p className="text-xl text-slate-600">
              Veja a transformação que você vai experimentar.
            </p>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              {/* Antes */}
              <div className="p-8 bg-red-50 border-r-2 border-slate-200">
                <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-2">
                  <XCircle className="w-7 h-7" />
                  Antes
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span className="text-slate-700">
                      15h/mês gastas cobrando
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span className="text-slate-700">
                      5-10% de inadimplência
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span className="text-slate-700">
                      Caderninho e planilhas
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span className="text-slate-700">Vergonha de cobrar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span className="text-slate-700">Estresse e incerteza</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">❌</span>
                    <span className="text-slate-700">"Tio da van"</span>
                  </li>
                </ul>
              </div>

              {/* Depois */}
              <div className="p-8 bg-green-50">
                <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-7 h-7" />
                  Depois
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <span className="text-slate-700">0h gastas cobrando</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <span className="text-slate-700">
                      &lt; 1% de inadimplência
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <span className="text-slate-700">
                      App organizado no celular
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <span className="text-slate-700">
                      Cobrança automática e profissional
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <span className="text-slate-700">
                      Paz de espírito e controle total
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <span className="text-slate-700">
                      Empresário do transporte escolar
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇOS SECTION */}
      <section id="precos" className="py-16 md:py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Um investimento que se paga sozinho. Acesso total e gratuito.
            </h2>
            <p className="text-xl text-slate-600">
              Gerencie seu transporte sem custos. Sem cartão de crédito.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="relative flex flex-col h-full border-2 border-blue-600 shadow-2xl scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1 text-sm font-bold">
                    Acesso Vitalício
                  </Badge>
                </div>

                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                    Plano Único & Gratuito
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 mb-6">
                    Todas as ferramentas que você precisa para crescer sem
                    custos.
                  </CardDescription>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-extrabold text-slate-900">
                      R$ 0,00
                    </span>
                    <span className="text-slate-500 font-medium text-sm">
                      /sempre
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  <ul className="space-y-3 text-sm text-slate-700">
                    {[
                      "Passageiros Ilimitados",
                      "Suporte a Cobrança via WhatsApp",
                      "Baixa Automática via PIX",
                      "Relatórios Financeiros Completos",
                      "Carteirinha Digital para os Pais",
                      "Suporte Especializado",
                    ].map((beneficio, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-0.5 rounded-full flex-shrink-0 bg-blue-100 text-blue-700">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium leading-snug">
                          {beneficio}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2 pb-6">
                  <Link
                    to="/cadastro"
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 text-base font-medium rounded-xl transition-all duration-200"
                  >
                    Criar minha conta grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 md:py-24 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Dúvidas? A gente responde na lata.
            </h2>
            <p className="text-xl text-slate-600">
              As perguntas mais comuns sobre o Van360.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem
              value="item-1"
              className="border-2 border-slate-200 rounded-xl px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                É difícil de usar? Vou precisar de um computador?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Não. O Van360 foi feito para ser usado no celular. Em 5 minutos
                você configura tudo. E se tiver qualquer dúvida, nossa equipe te
                ajuda pelo WhatsApp.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="border-2 border-slate-200 rounded-xl px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Os pais dos passageiros vão gostar disso?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Sim! Eles preferem a organização. Receber uma cobrança clara com
                PIX é mais fácil do que lembrar de pagar em dinheiro ou fazer
                transferência manual. Mostra que você é um profissional sério.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="border-2 border-slate-200 rounded-xl px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Meu negócio é pequeno, só tenho 15 passageiros. Vale a pena?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Com certeza. O tempo que você economiza e a redução da
                inadimplência valem o investimento, não importa o tamanho da sua
                frota. O Van360 cresce com você.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="border-2 border-slate-200 rounded-xl px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                Preciso conectar meu WhatsApp? É seguro?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Sim! Usamos a API oficial do WhatsApp de forma 100% segura e não
                invasiva. O sistema só envia as mensagens de cobrança que você
                configurar. Não lemos suas conversas pessoais.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="border-2 border-slate-200 rounded-xl px-4 bg-slate-50/50"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline py-4">
                E se eu não gostar? Tem contrato de fidelidade?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
                Não tem fidelidade. Você pode cancelar quando quiser, sem multa
                e sem burocracia. Nosso objetivo é que você fique porque está
                amando, não porque está preso a um contrato.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* SUPORTE SECTION */}
      <section className="bg-slate-900 text-white py-8 border-b border-slate-800">
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

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/lp/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Chega de perder tempo e dinheiro.
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Junte-se a mais de 500 motoristas que já estão no controle. Comece
            agora e veja a transformação na sua rotina.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to={CTA_LINK}>
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xl font-bold px-12 h-16 rounded-2xl shadow-2xl hover:scale-105 transition-transform"
              >
                Criar minha conta gratuita
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Grátis para sempre</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span>Acesso total via celular</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>Suporte humanizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Coluna 1: Logo e descrição */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/assets/logo-van360.png"
                  alt="Van360"
                  className="h-8 w-auto opacity-80"
                />
                <span className="text-2xl font-bold text-white">Van360</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                O sistema de gestão completo para motoristas de transporte
                escolar. Automatize cobranças, organize passageiros e tenha
                controle total do seu negócio.
              </p>
            </div>

            {/* Coluna 2: Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#como-funciona"
                    className="hover:text-white transition-colors"
                  >
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a
                    href="#precos"
                    className="hover:text-white transition-colors"
                  >
                    Preços
                  </a>
                </li>
                <li>
                  <a
                    href="#depoimentos"
                    className="hover:text-white transition-colors"
                  >
                    Depoimentos
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos de Serviço
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm opacity-60">
              © {new Date().getFullYear()} Van360. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
