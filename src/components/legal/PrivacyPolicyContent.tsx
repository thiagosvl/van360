import { FileText, Lock, BarChart2, ShieldCheck, Trash2 } from "lucide-react";
import { SectionTitle, ListItem } from "./Shared";

export function PrivacyPolicyContent() {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-[#737373] mb-4">
        Última atualização: 19/06/2026 · Em conformidade com a LGPD
      </p>
      <p className="text-[#737373] leading-relaxed text-xs sm:text-sm">
        No Van360, levamos a privacidade a sério. Lidamos com dados sensíveis e garantimos total conformidade com a Lei Geral de Proteção de Dados (LGPD).
      </p>

      <SectionTitle icon={FileText}>1. Dados Coletados</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-[#fafafa] p-4 rounded-[18px] border border-[#e5e5e5]">
          <h4 className="font-medium text-sm text-[#0a0a0a] mb-1.5">Motorista</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Dados cadastrais para gestão de cobranças, emissão de faturas e identificação do perfil profissional.
          </p>
        </div>
        <div className="bg-[#fafafa] p-4 rounded-[18px] border border-[#e5e5e5]">
          <h4 className="font-medium text-sm text-[#0a0a0a] mb-1.5">Alunos/Responsáveis</h4>
          <p className="text-xs text-[#737373] leading-relaxed">
            Nome, endereço e telefone estritamente para gestão de alunos, planejamento de rotas e avisos de embarque.
          </p>
        </div>
      </div>

      <SectionTitle icon={Lock}>2. Proteção de Dados</SectionTitle>
      <p className="text-[#737373] leading-relaxed mb-3 text-xs sm:text-sm">
        O tratamento de dados de menores é realizado estritamente para garantir a <strong className="font-medium text-[#0a0a0a]">segurança física</strong> e a execução do contrato de transporte escolar.
      </p>
      <ul className="space-y-2 text-xs sm:text-sm">
        <ListItem>Hospedagem em servidores seguros (Supabase).</ListItem>
        <ListItem>Acesso restrito apenas ao titular da conta.</ListItem>
        <ListItem>Não comercializamos dados com terceiros.</ListItem>
      </ul>

      <SectionTitle icon={BarChart2}>3. Cookies e Ferramentas de Análise</SectionTitle>
      <p className="text-[#737373] leading-relaxed mb-3 text-xs sm:text-sm">
        Utilizamos cookies de análise para entender como a plataforma é usada e melhorar continuamente a experiência dos usuários. Essas ferramentas coletam dados de navegação de forma agregada e anônima (páginas visitadas, cliques, tempo de sessão).
      </p>
      <ul className="space-y-2 mb-3 text-xs sm:text-sm">
        <ListItem>Os cookies de análise só são ativados após seu consentimento expresso.</ListItem>
        <ListItem>Você pode recusar ou revogar o consentimento a qualquer momento limpando os dados do navegador.</ListItem>
        <ListItem>Não utilizamos cookies para fins publicitários ou de remarketing.</ListItem>
      </ul>

      <SectionTitle icon={ShieldCheck}>4. Seus Direitos</SectionTitle>
      <p className="text-[#737373] leading-relaxed text-xs sm:text-sm">
        Você tem total controle sobre seus dados conforme a LGPD. Pode solicitar a exportação ou correção de sua conta a qualquer momento através do suporte oficial.
      </p>

      <SectionTitle icon={Trash2}>5. Exclusão de Dados</SectionTitle>
      <p className="text-[#737373] leading-relaxed text-xs sm:text-sm">
        O usuário pode solicitar a exclusão de sua conta e de todos os dados associados a qualquer momento:
      </p>
      <ul className="space-y-2 mt-2 text-xs sm:text-sm">
        <ListItem>
          <strong className="text-[#0a0a0a] font-medium">Pelo Aplicativo:</strong> Disponível diretamente nas configurações de perfil.
        </ListItem>
        <ListItem>
          <strong className="text-[#0a0a0a] font-medium">Por E-mail:</strong> Envie uma solicitação para <strong className="font-medium text-[#0a0a0a]">contato@van360.com.br</strong> com o assunto "Exclusão de Conta".
        </ListItem>
      </ul>
      <p className="text-[#737373] leading-relaxed mt-3 text-xs sm:text-sm">
        Após a solicitação, todos os seus dados pessoais, registros de alunos e histórico financeiro serão removidos permanentemente de nossos servidores em até 7 dias úteis.
      </p>
    </div>
  );
}
