import React from "react";
import { AlertCircle, FileText, MessageSquare, Truck, Wallet } from "lucide-react";
import { SectionTitle, ListItem } from "./Shared";

export function TermsOfUseContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-400 mb-6">
        Última atualização: 19/06/2026
      </p>
      <p className="text-slate-500 leading-relaxed text-[0.95rem]">
        Bem-vindo ao <strong className="text-[#1a3a5c]">Van360</strong>. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo, estabelecidos para garantir a melhor experiência e segurança para todos.
      </p>

      <SectionTitle icon={Truck} colorClass="bg-blue-50 text-blue-600">1. O Serviço</SectionTitle>
      <p className="text-slate-500 leading-relaxed mb-3 text-[0.95rem]">
        O Van360 é uma plataforma destinada à gestão de transporte escolar. Nossas ferramentas incluem:
      </p>
      <ul className="space-y-2 mb-4 text-[0.95rem]">
        <ListItem>Organização inteligente de passageiros e rotas.</ListItem>
        <ListItem>Gestão financeira com automação de cobranças.</ListItem>
        <ListItem>Comunicação automatizada via WhatsApp.</ListItem>
      </ul>

      <SectionTitle icon={AlertCircle} colorClass="bg-amber-50 text-amber-600">2. Responsabilidades</SectionTitle>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
        <p className="text-amber-900 text-sm font-bold mb-2">Importante ressaltar:</p>
        <ul className="space-y-2 text-[0.95rem]">
          <ListItem>O Van360 fornece apenas a <strong className="font-bold">tecnologia</strong>.</ListItem>
          <ListItem>Não somos responsáveis pela execução do transporte, segurança física ou manutenção dos veículos.</ListItem>
          <ListItem>É dever do motorista manter CNH e documentação em dia.</ListItem>
        </ul>
      </div>

      <SectionTitle icon={Wallet} colorClass="bg-blue-50 text-blue-600">3. Planos e Acesso</SectionTitle>
      <p className="text-slate-500 leading-relaxed text-[0.95rem]">
        O <strong className="text-[#1a3a5c]">Van360</strong> oferece um período gratuito de 15 dias para novos cadastros. Após este período, o acesso contínuo as funcionalidades de gestão e automação está condicionado à assinatura de um dos planos vigentes no site. O usuário será notificado sobre o fim do período de testes.
      </p>
      <p className="text-slate-500 leading-relaxed text-[0.95rem] mt-3">
        <strong className="font-bold text-[#1a3a5c]">E se eu atrasar a assinatura do Van360?</strong> Fique tranquilo, sabemos que a rotina na rua é corrida e imprevistos acontecem. Para não prejudicar seu trabalho, nós oferecemos um período de carência após o vencimento, permitindo que você continue usando o app normalmente por alguns dias. Caso o pagamento não seja regularizado após essa carência, o acesso às funcionalidades do sistema será temporariamente suspenso. Mas não se preocupe: mesmo com o acesso bloqueado, seus dados, passageiros e rotas não serão apagados. Tudo ficará guardado com segurança esperando a regularização do plano para você voltar a usar de onde parou!
      </p>

      <SectionTitle icon={MessageSquare} colorClass="bg-blue-50 text-blue-600">4. Comunicação e WhatsApp</SectionTitle>
      <p className="text-slate-500 leading-relaxed text-[0.95rem]">
        A plataforma disponibiliza ferramentas para facilitar a comunicação entre motorista e responsáveis via WhatsApp. O usuário concorda em utilizar esta funcionalidade de forma ética, sendo proibido o envio de SPAM. O Van360 não se responsabiliza por eventuais instabilidades ou bloqueios decorrentes do uso inadequado das ferramentas de terceiros.
      </p>
    </div>
  );
}
