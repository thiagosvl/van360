import { BaseDialog } from "@/components/ui/BaseDialog";
import { Check, FileText, Lock, ShieldCheck, BarChart2 } from "lucide-react";
import React from "react";

const SectionTitle = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mt-6 mb-3">
    <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-emerald-600" />
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

interface PoliticaPrivacidadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PoliticaPrivacidadeDialog({ open, onOpenChange }: PoliticaPrivacidadeDialogProps) {
  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title="Política de Privacidade"
        subtitle="Última atualização: 01/04/2026 · Em conformidade com a LGPD"
        icon={<ShieldCheck className="text-emerald-600 w-5 h-5" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <p className="text-slate-500 leading-relaxed text-[0.95rem]">
          No Van360, levamos a privacidade a sério. Lidamos com dados sensíveis e garantimos total conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <SectionTitle icon={FileText}>1. Dados Coletados</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-[#1a3a5c] mb-2">Motorista</h4>
            <p className="text-sm text-slate-500">Dados cadastrais para gestão de cobranças, emissão de faturas e identificação do perfil profissional.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-[#1a3a5c] mb-2">Passageiros/Responsáveis</h4>
            <p className="text-sm text-slate-500">Nome, endereço e telefone estritamente para gestão de passageiros, planejamento de rotas e avisos de embarque.</p>
          </div>
        </div>

        <SectionTitle icon={Lock}>2. Proteção de Dados</SectionTitle>
        <p className="text-slate-500 leading-relaxed mb-3 text-[0.95rem]">
          O tratamento de dados de menores é realizado estritamente para garantir a <strong className="font-bold">segurança física</strong> e a execução do contrato de transporte escolar.
        </p>
        <ul className="space-y-2 text-[0.95rem]">
          <ListItem>Hospedagem em servidores seguros (Supabase).</ListItem>
          <ListItem>Acesso restrito apenas ao titular da conta.</ListItem>
          <ListItem>Não comercializamos dados com terceiros.</ListItem>
        </ul>

        <SectionTitle icon={BarChart2}>3. Cookies e Ferramentas de Análise</SectionTitle>
        <p className="text-slate-500 leading-relaxed mb-3 text-[0.95rem]">
          Utilizamos cookies de análise para entender como a plataforma é usada e melhorar continuamente a experiência dos usuários. Essas ferramentas coletam dados de navegação de forma agregada e anônima (páginas visitadas, cliques, tempo de sessão).
        </p>
        <ul className="space-y-2 mb-3 text-[0.95rem]">
          <ListItem>Os cookies de análise só são ativados após seu consentimento expresso.</ListItem>
          <ListItem>Você pode recusar ou revogar o consentimento a qualquer momento limpando os dados do navegador.</ListItem>
          <ListItem>Não utilizamos cookies para fins publicitários ou de remarketing.</ListItem>
        </ul>

        <SectionTitle icon={ShieldCheck}>4. Seus Direitos</SectionTitle>
        <p className="text-slate-500 leading-relaxed text-[0.95rem]">
          Você tem total controle sobre seus dados conforme a LGPD. Pode solicitar a exportação, correção ou exclusão completa de sua conta a qualquer momento através do suporte oficial do <strong className="font-bold">Van360</strong>.
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
