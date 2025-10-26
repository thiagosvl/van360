import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  ArrowRight,
  BarChart2,
  Bus,
  Car,
  CheckCircle,
  Cloud,
  DollarSign,
  Heart,
  ListChecks,
  Lock,
  Mail,
  School,
  Send,
  Smartphone,
  Star,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const CTA_LINK = "/login";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Bus className="h-7 w-7 text-primary" />
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                Van360
              </span>
            </div>
            <Link to={CTA_LINK}>
              <Button size="sm">Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-screen overflow-x-hidden">
        {/* 1.1 Hero Section - Fundo aspiracional e microtextos */}
        <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20 text-center bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-gray-900">
          <p className="text-sm font-semibold text-foreground mb-2">
            Sistema testado e aprovado por motoristas reais.
          </p>
          <Badge
            variant="default"
            className="mb-4 text-sm font-semibold py-1 px-3 bg-primary/10 text-primary hover:bg-primary/20"
          >
            Feito especialmente para motoristas de van escolar
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 leading-tight max-w-5xl mx-auto">
            O sistema gratuito para organizar passageiros e cobranças.
          </h1>
          <h2 className="text-xl sm:text-2xl text-primary font-medium mb-6 max-w-4xl mx-auto">
            Mais tempo para dirigir, menos tempo organizando planilhas.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Gerencie tudo pelo celular, de forma simples e intuitiva. Chega de
            burocracia na sua rotina.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to={CTA_LINK}>
              <Button size="lg" className="text-lg px-10 py-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="#como-funciona">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 group">
                Ver como funciona
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-3 text-sm text-yellow-500 font-semibold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-500" />
            ))}
            <span>Avaliado por motoristas de van</span>
          </div>
        </section>

        {/* 2. Mockup Section - Subtítulo envolvente e CTA atualizado */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 border-t">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-center text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Painel claro, direto e feito para quem não quer perder tempo.
            </h3>
            <p className="text-center text-lg text-muted-foreground mb-8">
              Visualize seus ganhos e cobranças em um painel simples.
            </p>
            <div className="h-72 sm:h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-xl border-4 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-4 shadow-xl">
              <span className="text-muted-foreground/70 text-center">
                [Mockup do painel de relatórios do Van360 com totais de cobranças
                e status de pagamentos]
              </span>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-3">
              Interface real do Van360 – simples, segura e fácil de usar.
            </p>
            <div className="mt-8 text-center">
              <Link to={CTA_LINK}>
                <Button size="lg" className="px-8 bg-primary/90 hover:bg-primary transition-colors shadow-lg">
                  Ver meu painel gratuito
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Funcionalidades - Agrupamento visual e novo card de cadastro */}
        <section className="py-16 sm:py-20 border-t bg-white dark:bg-gray-900">
          <div className="text-center mb-12 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Funcionalidades que simplificam de verdade.
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sem planilhas, sem confusão — tudo centralizado em um só sistema.
            </p>
          </div>

          <div className="space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* GRUPO 1: Gestão e Organização */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary mb-8">Gestão e Organização</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-t-4 border-blue-500/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Gestão de Passageiros com Facilidade
                    </h4>
                    <p className="text-muted-foreground">
                      Cadastre alunos e seus responsáveis com informações completas e
                      acesso rápido.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-t-4 border-blue-500/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <School className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Organize Escolas de Forma Prática
                    </h4>
                    <p className="text-muted-foreground">
                      Cadastre e vincule alunos às suas escolas de embarque e
                      desembarque. Tudo organizado.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-t-4 border-blue-500/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Registro Rápido de Veículos
                    </h4>
                    <p className="text-muted-foreground">
                      Cadastre seus veículos com placas e dados básicos para manter
                      sua documentação sempre centralizada.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* GRUPO 2: Cobranças e Controle Financeiro */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary mb-8">Cobranças e Controle Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-t-4 border-green-500/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Controle de Cobranças sem Complicação
                    </h4>
                    <p className="text-muted-foreground">
                      Registre mensalidades, marque pagamentos e saiba quem está em
                      dia ou pendente.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-t-4 border-green-500/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart2 className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Resumo Financeiro Mensal
                    </h4>
                    <p className="text-muted-foreground">
                      Tenha visibilidade total. Veja rapidamente o total previsto,
                      recebido e o que falta entrar no mês.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-t-4 border-green-500/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Status de Cobranças em Tempo Real
                    </h4>
                    <p className="text-muted-foreground">
                      Monitore quem está em dia e quem está em atraso com apenas um
                      clique, sem esforço.
                    </p>
                  </CardContent>
                </Card>

                {/* NOVO CARD: Link de Cadastro para Responsáveis */}
                <Card className="md:col-span-3 lg:col-span-3 h-full hover:shadow-lg transition-shadow duration-300 border-2 border-dashed border-yellow-500/50 bg-yellow-50/20 dark:bg-yellow-900/20">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Send className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Cadastro Rápido por Link (Economize Tempo!)
                    </h4>
                    <p className="text-muted-foreground">
                      Envie um link para o responsável do aluno. Ele preenche os dados, e você só precisa aprovar e definir os valores. Menos trabalho!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link to={CTA_LINK}>
              <Button size="lg" variant="default" className="px-8 shadow-lg hover:bg-primary/90 transition-colors">
                Quero usar agora
              </Button>
            </Link>
          </div>
        </section>

        {/* 4. Por que é gratuito - Preenchimento total da largura */}
        <section className="w-full py-16 sm:py-20 border-t bg-blue-50 dark:bg-gray-800/80">
          <div className="text-center max-w-4xl mx-auto p-4">
            <div className="mx-auto w-12 h-12 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Acreditamos no seu trabalho. Por isso somos grátis.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              O Van360 nasceu com a missão de facilitar a vida de quem transporta o
              futuro todos os dias. Nosso plano gratuito é completo e perfeito para
              começar — e, quando precisar de mais recursos, você evolui com
              facilidade.
            </p>
            <div className="flex justify-center space-x-6 mb-8 text-base font-semibold text-foreground">
              <div className="flex flex-col items-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-6 w-6 mb-1" />
                Acessível
              </div>
              <div className="flex flex-col items-center text-foreground">
                <Lock className="h-6 w-6 mb-1 text-primary" />
                Transparente
              </div>
              <div className="flex flex-col items-center text-purple-600 dark:text-purple-400">
                <AreaChart className="h-6 w-6 mb-1" />
                Feito para crescer
              </div>
            </div>
            <p className="text-xl text-primary font-semibold mb-6">
              Você usa todas as funções com até 20 passageiros cadastrados.
            </p>
            <Link to={CTA_LINK}>
              <Button size="lg" className="px-8 bg-primary/90 hover:bg-primary transition-colors shadow-lg">
                Começar grátis agora
              </Button>
            </Link>
          </div>
        </section>

        {/* 5. 3 passos - Linha visual e ícones sutis */}
        <section id="como-funciona" className="py-16 sm:py-20 border-t px-4 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Organizar sua van é fácil. Veja em 3 passos:
            </h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Linha de conexão */}
            <div className="hidden md:block absolute top-[58px] left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 mx-[15%]"></div>
            
            {/* Passo 1 */}
            <div className="text-center space-y-4 relative z-10 p-6 bg-white dark:bg-gray-900 rounded-xl border shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4 border-2 border-primary">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Cadastre seus dados
              </h3>
              <p className="text-muted-foreground">
                Adicione seus passageiros, escolas e veículos em minutos.
              </p>
            </div>
            {/* Passo 2 */}
            <div className="text-center space-y-4 relative z-10 p-6 bg-white dark:bg-gray-900 rounded-xl border shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4 border-2 border-primary">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Registre as cobranças
              </h3>
              <p className="text-muted-foreground">
                Crie as mensalidades e controle os pagamentos sem planilhas.
              </p>
            </div>
            {/* Passo 3 */}
            <div className="text-center space-y-4 relative z-10 p-6 bg-white dark:bg-gray-900 rounded-xl border shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4 border-2 border-primary">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Acompanhe tudo
              </h3>
              <p className="text-muted-foreground">
                Veja quem já pagou e o que falta receber, direto do celular ou computador.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link to={CTA_LINK}>
              <Button size="lg" variant="secondary" className="px-8 border shadow-md hover:bg-secondary/80 transition-colors">
                Quero testar esses 3 passos gratuitos
              </Button>
            </Link>
          </div>
        </section>

        {/* 6. Benefícios - Título e selo de prova social */}
        <section className="py-16 sm:py-20 border-t px-4 sm:px-0">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Benefícios que transformam sua rotina.
            </h2>
            <div className="flex items-center justify-center text-sm text-primary font-semibold">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>+100 motoristas já usam o Van360 diariamente.</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center max-w-7xl mx-auto">
            <div className="space-y-2 p-3 group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border shadow-sm">
              <ListChecks className="h-8 w-8 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
              <p className="font-semibold text-foreground">
                Chega de planilhas confusas.
              </p>
            </div>
            <div className="space-y-2 p-3 group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border shadow-sm">
              <Cloud className="h-8 w-8 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
              <p className="font-semibold text-foreground">
                Tudo salvo na nuvem e seguro.
              </p>
            </div>
            <div className="space-y-2 p-3 group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border shadow-sm">
              <Smartphone className="h-8 w-8 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
              <p className="font-semibold text-foreground">
                Acesse do celular ou computador.
              </p>
            </div>
            <div className="space-y-2 p-3 group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border shadow-sm">
              <Bus className="h-8 w-8 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
              <p className="font-semibold text-foreground">
                Feito para motoristas de van.
              </p>
            </div>
            <div className="space-y-2 p-3 group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border shadow-sm">
              <Zap className="h-8 w-8 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
              <p className="font-semibold text-foreground">
                Grátis, simples e sem complicação.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Depoimentos - Dois depoimentos e selo de avaliação */}
        <section className="py-16 sm:py-20 border-t bg-gray-50 dark:bg-gray-800">
          <div className="text-center mb-10 max-w-5xl mx-auto px-4 sm:px-0">
            <div className="flex items-center justify-center text-2xl text-yellow-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-500" />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              A prova social de quem já usa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-sky-500/50">
              <CardContent className="space-y-4">
                <blockquote className="text-lg italic font-serif text-foreground">
                  "O Van360 me ajudou a controlar minhas cobranças e pagamentos sem
                  depender de planilhas, de forma muito mais segura."
                </blockquote>
                <p className="text-base font-semibold text-primary">
                  – Carlos Souza, motorista há 12 anos
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-sky-500/50">
              <CardContent className="space-y-4">
                <blockquote className="text-lg italic font-serif text-foreground">
                  "Agora consigo saber quem pagou e quem falta pagar em segundos. É
                  muito prático e me dá tranquilidade na rotina."
                </blockquote>
                <p className="text-base font-semibold text-primary">
                  – Luciana Ribeiro, motorista há 7 anos
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 8. CTA final reforçado - Fundo com maior apelo visual */}
        <section className="py-16 sm:py-20 border-t">
          <div className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 p-8 sm:p-12 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Comece gratuitamente em poucos minutos.
            </h2>
            <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
              Sem cartão, sem compromisso. Cadastre-se e use o sistema agora mesmo
              para organizar suas cobranças.
            </p>
            <Link to={CTA_LINK}>
              <Button size="lg" className="text-lg px-12 py-3 shadow-2xl bg-white text-indigo-600 hover:bg-gray-100 transition-all duration-300">
                Criar conta grátis
              </Button>
            </Link>
            <p className="text-sm text-indigo-200 mt-4">
              Mais de 100 motoristas já começaram. Você pode ser o próximo.
            </p>
          </div>
        </section>
      </main>

      {/* 9. Rodapé atualizado */}
      <footer className="mt-0 border-t bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-start text-sm text-muted-foreground space-y-4 md:space-y-0">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <p>
                  © 2025 Van360 – desenvolvido por
                </p>
                <a
                  href="mailto:contato@tibisdigital.com"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Tibis Digital
                </a>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-end">
              <Link to="/duvidas" className="hover:text-primary">
                Dúvidas Frequentes
              </Link>
              <Link to="/sobre" className="hover:text-primary">
                Sobre o Projeto
              </Link>
              <Link to="/contato" className="hover:text-primary">
                Contato
              </Link>
              <Link to="/suporte" className="hover:text-primary">
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
        </div>
      </footer>
    </div>
  );
};

export default Index;