import { BaseDialog } from "@/components/ui/BaseDialog";
import { AlertCircle, Check, FileText, MessageSquare, Truck, Wallet } from "lucide-react";
import React from "react";

const SectionTitle = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mt-6 mb-3">
    <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-blue-600" />
    </div>
    <h3 className="font-bold text-[#1a3a5c] text-lg">{children}</h3>
  </div>
);

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 text-slate-500 leading-relaxed">
    <Check className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

interface TermosUsoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermosUsoDialog({ open, onOpenChange }: TermosUsoDialogProps) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Termos de Uso"
        subtitle="Última atualização: 01/04/2026"
        icon={<FileText className="w-5 h-5" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <p className="text-slate-500 leading-relaxed text-[0.95rem]">
          Bem-vindo ao <strong className="text-[#1a3a5c]">Van360</strong>. Ao utilizar nossa plataforma, você concorda com os termos descritos abaixo, estabelecidos para garantir a melhor experiência e segurança para todos.
        </p>

        <SectionTitle icon={Truck}>1. O Serviço</SectionTitle>
        <p className="text-slate-500 leading-relaxed mb-3 text-[0.95rem]">
          O Van360 é uma plataforma destinada à gestão de transporte escolar. Nossas ferramentas incluem:
        </p>
        <ul className="space-y-2 mb-4 text-[0.95rem]">
          <ListItem>Organização inteligente de passageiros e rotas.</ListItem>
          <ListItem>Gestão financeira com automação de cobranças.</ListItem>
          <ListItem>Comunicação automatizada via WhatsApp.</ListItem>
        </ul>

        <SectionTitle icon={AlertCircle}>2. Responsabilidades</SectionTitle>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
          <p className="text-amber-900 text-sm font-bold mb-2">Importante ressaltar:</p>
          <ul className="space-y-2 text-[0.95rem]">
            <ListItem>O Van360 fornece apenas a <strong className="font-bold">tecnologia</strong>.</ListItem>
            <ListItem>Não somos responsáveis pela execução do transporte, segurança física ou manutenção dos veículos.</ListItem>
            <ListItem>É dever do motorista manter CNH e documentação em dia.</ListItem>
          </ul>
        </div>

        <SectionTitle icon={Wallet}>3. Planos e Acesso</SectionTitle>
        <p className="text-slate-500 leading-relaxed text-[0.95rem]">
          O <strong className="text-[#1a3a5c]">Van360</strong> oferece um período gratuito de 15 dias para novos cadastros. Após este período, o acesso contínuo aos recursos de gestão e automação está condicionado à assinatura de um dos planos vigentes no site. O usuário será notificado sobre o fim do período de testes.
        </p>

        <SectionTitle icon={MessageSquare}>4. Comunicação e WhatsApp</SectionTitle>
        <p className="text-slate-500 leading-relaxed text-[0.95rem]">
          A plataforma disponibiliza ferramentas para facilitar a comunicação entre motorista e responsáveis via WhatsApp. O usuário concorda em utilizar este recurso de forma ética, sendo proibido o envio de SPAM. O Van360 não se responsabiliza por eventuais instabilidades ou bloqueios decorrentes do uso inadequado das ferramentas de terceiros.
        </p>
      </BaseDialog.Body>
      <BaseDialog.Footer>
         <BaseDialog.Action 
            label="Fechar"
            onClick={() => onOpenChange(false)}
            variant="primary"
         />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
