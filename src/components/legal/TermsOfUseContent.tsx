import React from "react";
import { AlertCircle, MessageSquare, Truck, Wallet } from "lucide-react";
import { SectionTitle, ListItem } from "./Shared";
import { TRIAL_DURATION_DAYS } from "@/constants";

export function TermsOfUseContent() {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-[#737373] mb-4">
        Última atualização: 19/06/2026
      </p>
      <p className="text-[#737373] leading-relaxed text-xs sm:text-sm">
        Bem-vindo ao <strong className="text-[#0a0a0a] font-medium">Van360</strong>. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo, estabelecidos para garantir a melhor experiência e segurança para todos.
      </p>

      <SectionTitle icon={Truck}>1. O Serviço</SectionTitle>
      <p className="text-[#737373] leading-relaxed mb-3 text-xs sm:text-sm">
        O Van360 é uma plataforma destinada à gestão de transporte escolar. Nossas ferramentas incluem:
      </p>
      <ul className="space-y-2 mb-4 text-xs sm:text-sm">
        <ListItem>Organização inteligente de alunos e rotas.</ListItem>
        <ListItem>Gestão financeira com automação de cobranças.</ListItem>
        <ListItem>Comunicação automatizada via WhatsApp.</ListItem>
      </ul>

      <SectionTitle icon={AlertCircle}>2. Responsabilidades</SectionTitle>
      <div className="bg-[#fafafa] border border-amber-500/25 rounded-[18px] p-4 mb-4">
        <p className="text-xs font-medium text-[#0a0a0a] mb-2.5">Importante ressaltar:</p>
        <ul className="space-y-2 text-xs sm:text-sm">
          <ListItem>O Van360 fornece apenas a <strong className="font-medium text-[#0a0a0a]">tecnologia</strong>.</ListItem>
          <ListItem>Não somos responsáveis pela execução do transporte, segurança física ou manutenção dos veículos.</ListItem>
          <ListItem>É dever do motorista manter CNH e documentação em dia.</ListItem>
        </ul>
      </div>

      <SectionTitle icon={Wallet}>3. Planos e Acesso</SectionTitle>
      <p className="text-[#737373] leading-relaxed text-xs sm:text-sm">
        O <strong className="text-[#0a0a0a] font-medium">Van360</strong> oferece um período gratuito de {TRIAL_DURATION_DAYS} dias para novos cadastros. Após este período, o acesso contínuo às funcionalidades de gestão e automação está condicionado à assinatura de um dos planos vigentes no site. O usuário será notificado sobre o fim do período de testes.
      </p>
      <p className="text-[#737373] leading-relaxed text-xs sm:text-sm mt-3">
        <strong className="font-medium text-[#0a0a0a]">E se eu atrasar a assinatura do Van360?</strong> Fique tranquilo, sabemos que a rotina na rua é corrida e imprevistos acontecem. Para não prejudicar seu trabalho, nós oferecemos um período de carência após o vencimento, permitindo que você continue usando o app normalmente por alguns dias. Caso o pagamento não seja regularizado após essa carência, o acesso às funcionalidades do aplicativo será temporariamente suspenso. Mas não se preocupe: mesmo com o acesso bloqueado, seus dados, alunos e rotas não serão apagados. Tudo ficará guardado com segurança esperando a regularização do plano para você voltar a usar de onde parou!
      </p>

      <SectionTitle icon={MessageSquare}>4. Comunicação e WhatsApp</SectionTitle>
      <p className="text-[#737373] leading-relaxed text-xs sm:text-sm">
        A plataforma disponibiliza ferramentas para facilitar a comunicação entre motorista e responsáveis via WhatsApp. O usuário concorda em utilizar esta funcionalidade de forma ética, sendo proibido o envio de SPAM. O Van360 não se responsabiliza por eventuais instabilidades ou bloqueios decorrentes do uso inadequado das ferramentas de terceiros.
      </p>
    </div>
  );
}
