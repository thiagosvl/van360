import { FileText, Lock, BarChart2, ShieldCheck, Trash2 } from "lucide-react";
import { SectionTitle, ListItem } from "./Shared";

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-4">
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
        Você tem total controle sobre seus dados conforme a LGPD. Pode solicitar a exportação ou correção de sua conta a qualquer momento através do suporte oficial.
      </p>

      <SectionTitle icon={Trash2}>5. Exclusão de Dados</SectionTitle>
      <p className="text-slate-500 leading-relaxed text-[0.95rem]">
        O usuário pode solicitar a exclusão de sua conta e de todos os dados associados a qualquer momento:
      </p>
      <ul className="space-y-2 mt-2 text-[0.95rem]">
        <ListItem>
          <strong>Pelo Aplicativo:</strong> Em breve disponível diretamente nas configurações de perfil.
        </ListItem>
        <ListItem>
          <strong>Por E-mail:</strong> Envie uma solicitação para <strong className="font-bold">contato@van360.com.br</strong> com o assunto "Exclusão de Conta".
        </ListItem>
      </ul>
      <p className="text-slate-500 leading-relaxed mt-3 text-[0.95rem]">
        Após a solicitação, todos os seus dados pessoais, registros de alunos e histórico financeiro serão removidos permanentemente de nossos servidores em até 7 dias úteis.
      </p>
    </div>
  );
}
