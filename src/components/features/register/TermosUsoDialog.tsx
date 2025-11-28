import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Check, FileText, Lock, MessageSquare, ShieldCheck, Truck, Wallet } from "lucide-react";
import { useState } from "react";

export function TermosUsoDialog() {
  const [openTermos, setOpenTermos] = useState(false);
  const [openPolitica, setOpenPolitica] = useState(false);

  const currentDate = new Date().toLocaleDateString("pt-BR");

  // Componentes de UI reutilizáveis para o texto legal
  const SectionTitle = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mt-6 mb-3">
      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg">{children}</h3>
    </div>
  );

  const ListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-2 text-gray-600 leading-relaxed">
      <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );

  return (
    <div className="px-4 pt-2 pb-0 text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
      <span>Ao criar sua conta, você concorda com nossos </span>
      
      {/* --- DIALOG TERMOS DE USO --- */}
      <Dialog open={openTermos} onOpenChange={setOpenTermos}>
        <DialogTrigger asChild>
          <button className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-sm px-0.5 inline-flex items-center">
            Termos de Uso
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 sm:rounded-2xl overflow-hidden border-0 shadow-2xl">
          {/* Header com Gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 pb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText className="h-32 w-32 transform rotate-12" />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                <FileText className="h-6 w-6" />
                Termos de Uso
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-1">
                Última atualização: {currentDate}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {/* Conteúdo com ScrollArea */}
          <ScrollArea className="flex-1 bg-white">
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-gray-600 leading-relaxed text-base">
                Bem-vindo ao <strong>Van360</strong>. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo, estabelecidos para garantir a melhor experiência e segurança para todos.
              </p>

              <SectionTitle icon={Truck}>1. O Serviço</SectionTitle>
              <p className="text-gray-600 leading-relaxed mb-3">
                O Van360 é uma plataforma destinada à gestão de transporte escolar. Nossas ferramentas incluem:
              </p>
              <ul className="space-y-2 mb-4">
                <ListItem>Organização inteligente de passageiros e rotas.</ListItem>
                <ListItem>Gestão financeira com automação de cobranças.</ListItem>
                <ListItem>Comunicação automatizada via WhatsApp.</ListItem>
              </ul>

              <SectionTitle icon={AlertCircle}>2. Responsabilidades</SectionTitle>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                <p className="text-amber-900 text-sm font-medium mb-2">Importante ressaltar:</p>
                <ul className="space-y-2">
                  <ListItem>O Van360 fornece apenas a <strong>tecnologia</strong>.</ListItem>
                  <ListItem>Não somos responsáveis pela execução do transporte, segurança física ou manutenção dos veículos.</ListItem>
                  <ListItem>É dever do motorista manter CNH e documentação em dia.</ListItem>
                </ul>
              </div>

              <SectionTitle icon={Wallet}>3. Pagamentos e Assinaturas</SectionTitle>
              <p className="text-gray-600 leading-relaxed">
                O serviço é oferecido mediante planos de assinatura. O não pagamento poderá acarretar na suspensão temporária das funcionalidades premium, incluindo as automações de cobrança e envio de mensagens.
              </p>

              <SectionTitle icon={MessageSquare}>4. Uso do WhatsApp</SectionTitle>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos integrações oficiais e seguras. O usuário concorda em não utilizar a plataforma para SPAM. O Van360 não se responsabiliza por instabilidades nos serviços da Meta (WhatsApp).
              </p>
            </div>
          </ScrollArea>
          
          {/* Footer Fixo */}
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
            <Button variant="default" onClick={() => setOpenTermos(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Li e Concordo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <span> e </span>

      {/* --- DIALOG POLÍTICA DE PRIVACIDADE --- */}
      <Dialog open={openPolitica} onOpenChange={setOpenPolitica}>
        <DialogTrigger asChild>
          <button className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-sm px-0.5 inline-flex items-center">
            Política de Privacidade
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 sm:rounded-2xl overflow-hidden border-0 shadow-2xl">
          {/* Header com Gradiente */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 pb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-32 w-32 transform -rotate-12" />
            </div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                <ShieldCheck className="h-6 w-6" />
                Política de Privacidade
              </DialogTitle>
              <DialogDescription className="text-emerald-100 mt-1">
                Em conformidade com a LGPD
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Conteúdo com ScrollArea */}
          <ScrollArea className="flex-1 bg-white">
            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-gray-600 leading-relaxed text-base">
                No Van360, levamos a privacidade a sério. Lidamos com dados sensíveis e garantimos total conformidade com a Lei Geral de Proteção de Dados (LGPD).
              </p>

              <SectionTitle icon={FileText}>1. Dados Coletados</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Motorista</h4>
                  <p className="text-sm text-gray-600">Dados cadastrais e financeiros para faturamento e emissão de notas.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Alunos/Responsáveis</h4>
                  <p className="text-sm text-gray-600">Nome, endereço e telefone estritamente para gestão de passageiros e rotas.</p>
                </div>
              </div>

              <SectionTitle icon={Lock}>2. Proteção de Dados</SectionTitle>
              <p className="text-gray-600 leading-relaxed mb-3">
                O tratamento de dados de menores é realizado com base no <strong>legítimo interesse</strong> e na execução do contrato de transporte.
              </p>
              <ul className="space-y-2">
                <ListItem>Dados criptografados de ponta a ponta.</ListItem>
                <ListItem>Acesso restrito apenas ao titular da conta.</ListItem>
                <ListItem>Não comercializamos dados com terceiros.</ListItem>
              </ul>

              <SectionTitle icon={ShieldCheck}>3. Seus Direitos</SectionTitle>
              <p className="text-gray-600 leading-relaxed">
                Você tem total controle sobre seus dados. Pode solicitar a exportação, correção ou exclusão completa de sua conta e dados associados a qualquer momento através do nosso suporte.
              </p>
            </div>
          </ScrollArea>

          {/* Footer Fixo */}
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
            <Button variant="default" onClick={() => setOpenPolitica(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}