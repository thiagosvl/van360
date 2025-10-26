import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart2,
  Bus,
  Car,
  CheckCircle,
  Cloud,
  DollarSign,
  Heart,
  Lock,
  School,
  Send,
  Smartphone,
  Timer,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const CTA_LINK = "/login";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-2">
            <Bus className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-extrabold tracking-tight">
              Van360
            </span>
          </div>
          <Link to={CTA_LINK}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between px-6 py-20 md:py-24">
          {/* Texto */}
          <div className="w-full md:w-1/2 text-center md:text-left mt-10 md:mt-0 space-y-5">
            <p className="text-blue-600 font-medium text-sm md:text-base">
              Feito por quem entende o dia a dia das vans escolares
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              O sistema simples que deixa sua van{" "}
              <span className="text-blue-600">organizada</span> e você no
              controle.
            </h1>

            <p className="text-gray-600 text-lg md:text-xl max-w-md mx-auto md:mx-0">
              Acabe com as planilhas. Controle passageiros e pagamentos direto
              do celular — rápido, seguro e 100% gratuito.
            </p>

            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
              <a href="/cadastro">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition">
                  Começar grátis agora
                </button>
              </a>
              <a href="#como-funciona">
                <button className="border border-gray-300 text-gray-800 hover:bg-gray-50 text-lg px-8 py-3 rounded-lg flex items-center justify-center group">
                  Ver como funciona
                  <svg
                    className="h-5 w-5 ml-2 text-blue-600 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </a>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 pt-4 text-sm text-gray-700">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    className="w-5 h-5"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.286 3.945c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.785.57-1.84-.197-1.54-1.118l1.286-3.945a1 1 0 00-.364-1.118L2.075 9.372c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.945z" />
                  </svg>
                ))}
              </div>
              <span>Aprovado por mais de 100 motoristas reais</span>
            </div>
          </div>

          {/* Imagem */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
            <div className="relative w-80 h-80 md:w-[400px] md:h-[400px]">
              <img
                src="/assets/hero-van360.png"
                alt="Motorista segurando celular com app Van360 e van escolar ao fundo"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-70"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full blur-2xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PAINEL */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-5xl mx-auto text-center px-6">
          <p className="text-sm font-semibold text-blue-600 mb-2">
            Chega de dor de cabeça.
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Tudo o que importa, em um só painel.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Veja seus ganhos, cobranças e status de pagamento sem abrir uma
            planilha sequer.
          </p>

          <div className="h-80 bg-white rounded-2xl shadow-2xl border flex items-center justify-center text-gray-400 mb-4">
            [Mockup: Painel do Van360 com totais e status de cobranças]
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Interface real do Van360 — simples, segura e fácil de usar.
          </p>
          <Link to={CTA_LINK}>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              Ver painel em ação <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="py-20 bg-white">
        <div className="text-center mb-12 px-6">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Tudo o que o motorista precisa para ficar no controle.
          </h2>
          <p className="text-lg text-gray-600">
            Organize sua rotina de forma profissional e sem confusão.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {[
            {
              icon: <Users className="h-7 w-7 text-blue-600" />,
              title: "Cadastre passageiros sem erro",
              text: "Adicione alunos e responsáveis com informações seguras e atualizadas.",
            },
            {
              icon: <School className="h-7 w-7 text-blue-600" />,
              title: "Organize escolas e rotas",
              text: "Saiba onde buscar cada aluno e mantenha tudo visível em um só lugar.",
            },
            {
              icon: <Car className="h-7 w-7 text-blue-600" />,
              title: "Registre seus veículos",
              text: "Centralize placas, documentos e controle de manutenção.",
            },
            {
              icon: <DollarSign className="h-7 w-7 text-green-600" />,
              title: "Controle de cobranças fácil",
              text: "Veja quem pagou e quem está em atraso com apenas um clique.",
            },
            {
              icon: <BarChart2 className="h-7 w-7 text-green-600" />,
              title: "Relatórios automáticos",
              text: "Saiba quanto vai receber no mês e tenha total clareza financeira.",
            },
            {
              icon: <Send className="h-7 w-7 text-yellow-600" />,
              title: "Cadastro rápido por link",
              text: "O responsável preenche, você só aprova. Ganhe tempo no dia a dia.",
            },
          ].map(({ icon, title, text }, i) => (
            <Card
              key={i}
              className="hover:shadow-xl transition-transform hover:scale-[1.02] border-t-4 border-blue-100"
            >
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-gray-600">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={CTA_LINK}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-10">
              Quero simplificar minha rotina agora
            </Button>
          </Link>
        </div>
      </section>

      {/* POR QUE É GRATUITO */}
      <section className="py-20 bg-blue-50 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <Heart className="h-10 w-10 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">
            Criado por motoristas, para motoristas.
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            O Van360 nasceu para facilitar a vida de quem transporta o futuro —
            eliminando o estresse das cobranças e das planilhas.
          </p>
          <div className="flex justify-center gap-8 mb-8 text-sm font-semibold">
            <div className="flex flex-col items-center text-green-600">
              <CheckCircle className="h-6 w-6 mb-1" />
              Acessível
            </div>
            <div className="flex flex-col items-center text-blue-600">
              <Lock className="h-6 w-6 mb-1" />
              Transparente
            </div>
            <div className="flex flex-col items-center text-purple-600">
              <Cloud className="h-6 w-6 mb-1" />
              Feito para crescer
            </div>
          </div>
          <p className="text-lg text-blue-700 font-medium mb-6">
            <Badge className="bg-green-100 text-green-700 font-bold px-3 py-1 mr-2">
              GRÁTIS
            </Badge>
            Use todas as funções com até 20 passageiros cadastrados.
          </p>
          <Link to={CTA_LINK}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-10">
              Começar grátis agora
            </Button>
          </Link>
        </div>
      </section>

      {/* 3 PASSOS */}
      <section id="como-funciona" className="py-20 bg-white text-center px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-10">
          Organizar sua van nunca foi tão fácil.
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              n: 1,
              title: "Cadastre passageiros em minutos",
              text: "Use o link de cadastro rápido ou adicione manualmente.",
            },
            {
              n: 2,
              title: "Lance as cobranças automaticamente",
              text: "Defina o valor e o vencimento uma única vez.",
            },
            {
              n: 3,
              title: "Veja quem pagou e o que falta",
              text: "Acompanhe tudo direto do celular.",
            },
          ].map(({ n, title, text }) => (
            <div
              key={n}
              className="p-6 rounded-xl border shadow-md hover:shadow-lg transition"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center text-blue-600 font-bold text-xl mb-4">
                {n}
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600">{text}</p>
            </div>
          ))}
        </div>

        <Link to={CTA_LINK}>
          <Button size="lg" variant="secondary" className="mt-10 px-8">
            Testar gratuitamente
          </Button>
        </Link>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 bg-blue-50 text-center px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Por que motoristas estão escolhendo o Van360.
        </h2>
        <p className="text-gray-600 mb-10">
          Mais tempo livre, menos preocupação.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Cloud, text: "Dados seguros na nuvem" },
            { icon: Timer, text: "Economia de tempo" },
            { icon: Smartphone, text: "Acesso móvel" },
            { icon: DollarSign, text: "Controle total das cobranças" },
            { icon: Zap, text: "Grátis para sempre" },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
              <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 bg-white text-center px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">
          O que motoristas reais estão dizendo.
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            {
              quote:
                "“Em um dia organizei 42 alunos — hoje sei exatamente quem pagou e quanto falta.”",
              author: "Carlos Souza",
              detail: "organizou 42 alunos em uma tarde.",
            },
            {
              quote:
                "“Reduzi meus atrasos em 60% só usando o celular. Muito mais prático que a planilha.”",
              author: "Luciana Ribeiro",
              detail: "reduziu atrasos em 60%.",
            },
          ].map(({ quote, author, detail }, i) => (
            <Card
              key={i}
              className="p-6 shadow-lg border-t-4 border-blue-200 hover:shadow-xl transition"
            >
              <CardContent>
                <blockquote className="italic text-lg text-gray-800 mb-4">
                  {quote}
                </blockquote>
                <p className="font-semibold text-blue-600">
                  – {author}, {detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-indigo-600 text-center text-white px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          O sistema gratuito que simplifica sua rotina de motorista.
        </h2>
        <p className="text-indigo-100 mb-6">
          Grátis, fácil e feito para quem quer focar no que importa: dirigir
          tranquilo.
        </p>
        <Link to={CTA_LINK}>
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-12 py-3 shadow-xl"
          >
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Criar conta grátis agora
          </Button>
        </Link>
        <p className="text-sm text-indigo-200 mt-4">
          Mais de 100 motoristas já começaram. Você pode ser o próximo.
        </p>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between text-sm text-gray-600">
          <p>
            © 2025 Van360 — desenvolvido por{" "}
            <a
              href="mailto:contato@tibisdigital.com"
              className="text-blue-600 hover:underline"
            >
              Tibis Digital
            </a>
          </p>
          <div className="flex flex-wrap gap-4 justify-end mt-3 md:mt-0">
            <Link to="/duvidas" className="hover:text-blue-600">
              Dúvidas Frequentes
            </Link>
            <Link to="/sobre" className="hover:text-blue-600">
              Sobre
            </Link>
            <Link to="/contato" className="hover:text-blue-600">
              Contato
            </Link>
            <Link to="/suporte" className="hover:text-blue-600">
              Suporte
            </Link>
            <Link to="/termos" className="hover:text-primary">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-primary">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
