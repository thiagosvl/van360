import { memo, useMemo, useState } from "react";
import { WhatsAppSupportButton } from "@/components/ui/WhatsAppSupportButton";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  HelpCircle,
  Lightbulb,
  Search,
  Users,
  BadgeDollarSign,
  Route as RouteIcon,
  FileText,
  Radio,
  Users2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItemData {
  id: string;
  category: "passageiros" | "cobrancas" | "rotas" | "contratos" | "gps" | "equipe";
  question: string;
  answer: string;
}

const CATEGORIES = [
  { id: "todos", label: "Todas", icon: Sparkles },
  { id: "passageiros", label: "Alunos", icon: Users },
  { id: "cobrancas", label: "Cobranças", icon: BadgeDollarSign },
  { id: "rotas", label: "Rotas", icon: RouteIcon },
  { id: "contratos", label: "Contratos", icon: FileText },
  { id: "gps", label: "GPS & Mapa", icon: Radio },
  { id: "equipe", label: "Equipe", icon: Users2 },
] as const;

const FAQS_DATA: FaqItemData[] = [
  // Alunos
  {
    id: "cadastrar-aluno",
    category: "passageiros",
    question: "Como cadastrar um novo aluno?",
    answer:
      "Você tem duas formas práticas: 1) Acesse a aba Alunos, clique no botão '+ Novo' e preencha os dados você mesmo(a); ou 2) Clique em 'Link de Cadastro' e envie pelo WhatsApp para os pais preencherem pelo próprio celular. Quando eles enviarem, a solicitação aparece na aba 'Solicitações' para você aprovar com um toque!",
  },
  {
    id: "carteirinha-dados",
    category: "passageiros",
    question: "Onde vejo a carteirinha e os dados do aluno?",
    answer:
      "Na aba Alunos, basta tocar no nome do aluno. A carteirinha digital se abre com o telefone dos pais, endereço completo, escola, histórico de parcelas, contrato e botão rápido de WhatsApp.",
  },
  {
    id: "registrar-ausencia",
    category: "passageiros",
    question: "Como registrar que o aluno vai faltar (ausência)?",
    answer:
      "Você pode registrar uma ausência abrindo a carteirinha do aluno ou diretamente na lista de paradas da Rota. Selecione o dia da falta e o app ajustará a rota daquele dia automaticamente, sem enviar notificações desnecessárias aos pais.",
  },

  // Cobranças & Parcelas
  {
    id: "dar-baixa-parcela",
    category: "cobrancas",
    question: "Como dar baixa no pagamento de uma parcela?",
    answer:
      "Acesse a aba Parcelas, localize o aluno desejado e clique em 'Dar Baixa'. Escolha a forma de pagamento (Pix, Dinheiro, Transferência ou Cartão) e confirme. Se desejar, o comprovante de pagamento fica pronto na hora para compartilhar no WhatsApp dos pais.",
  },
  {
    id: "lembretes-automaticos",
    category: "cobrancas",
    question: "Como funcionam os lembretes automáticos de parcelas para os pais?",
    answer:
      "O app envia mensagens educadas de cobrança antes da data de vencimento, no dia do vencimento e em caso de atraso (caso estejam ativadas em Conta > Notificações aos Pais). A sua chave Pix cadastrada é enviada junto na mensagem para facilitar o pagamento. Assim que você registra a baixa da parcela no app, os lembretes seguintes são cancelados automaticamente.",
  },
  {
    id: "configurar-pix",
    category: "cobrancas",
    question: "Como cadastrar minha chave Pix de recebimento?",
    answer:
      "Vá em Conta > Pagamentos & Pix. Lá você informa sua chave Pix principal (CPF, CNPJ, Celular, E-mail ou Chave Aleatória). Essa chave será incluída automaticamente nos lembretes de cobrança enviados aos pais.",
  },

  // Rotas & Viagens
  {
    id: "organizar-rotas",
    category: "rotas",
    question: "Como criar e organizar a ordem das paradas da rota?",
    answer:
      "Na aba Rotas, clique em 'Configurar Rota'. O app permite definir o sentido (Ida para a escola ou Volta para casa), selecionar as escolas e os alunos. Você pode arrastar as paradas para ajustar a ordem exata do seu itinerário.",
  },
  {
    id: "iniciar-viagem",
    category: "rotas",
    question: "O que acontece ao clicar em 'Iniciar Rota'?",
    answer:
      "O aplicativo inicia o painel de viagem em tempo real. Se as notificações estiverem ativadas, os pais recebem o aviso de que a van iniciou o trajeto e, conforme você conclui as paradas, o próximo responsável da fila é avisado de que a van está a caminho.",
  },
  {
    id: "confirmar-embarque",
    category: "rotas",
    question: "Como confirmar o embarque ou a entrega da criança?",
    answer:
      "Durante a rota ativa, ao chegar no endereço do aluno, basta tocar no botão 'Confirmar Embarque' (na ida) ou 'Confirmar Entrega' (na volta). O responsável recebe uma notificação imediata confirmando que o filho embarcou ou foi entregue com segurança.",
  },

  // Contratos
  {
    id: "gerar-contrato-digital",
    category: "contratos",
    question: "Como funciona o contrato digital com assinatura pelo celular?",
    answer:
      "Na aba Contratos, você pode configurar o modelo padrão da sua van. Na carteirinha do aluno, basta clicar em 'Gerar Contrato' para criar o documento com os valores e datas acordadas. O responsável recebe um link seguro para assinar com o dedo na tela do celular, com total validade jurídica.",
  },
  {
    id: "importar-contrato-existente",
    category: "contratos",
    question: "Posso importar contratos que já tenho assinados no papel ou em PDF?",
    answer:
      "Sim! Se você já possui um contrato assinado pelo responsável que esteja em PDF, basta ir em Contratos e clicar em 'Importar Contrato Assinado'. O documento digitalizado ficará arquivado na carteirinha do aluno como um contrato assinado e válido. Atenção: essa opção não serve para cadastrar modelos em branco; para personalizar as cláusulas e o modelo padrão da sua van, acesse 'Configurar Modelo'.",
  },

  // GPS & Mapa
  {
    id: "rastreamento-ao-vivo",
    category: "gps",
    question: "Como os pais acompanham a van no mapa?",
    answer:
      "Os pais acompanham a van apenas se você habilitar essa opção. Em Conta > Rastreamento & GPS, você decide se o rastreamento fica Ativado ou Desativado. Quando ativado, você pode escolher entre o modo Completo (eles acompanham todo o trajeto) ou Apenas Próximo (o mapa é liberado apenas quando a van estiver indo em direção à casa do aluno). Se desativado, os pais veem apenas avisos de texto, sem mapa.",
  },

  // Equipe
  {
    id: "adicionar-monitores",
    category: "equipe",
    question: "Como cadastrar monitoras ou motoristas auxiliares?",
    answer:
      "Na aba Minha Equipe, clique em '+ Convidar Membro', preencha o nome, e-mail, função e defina uma senha inicial. O membro da equipe receberá um e-mail com os dados de acesso (login e senha) para baixar o app e entrar com as permissões que você configurou para ajudar na sua rotina.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#e5e5e5] last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 sm:py-4.5 text-left group cursor-pointer"
      >
        <span className="text-sm sm:text-[15px] font-semibold text-[#0a0a0a] group-hover:text-[#0a0a0a] transition-colors leading-snug pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#737373] transition-transform duration-300 shrink-0",
            isOpen && "rotate-180 text-[#0a0a0a]"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        )}
      >
        <p className="text-xs sm:text-sm text-[#737373] leading-relaxed bg-[#fafafa] p-3.5 sm:p-4 rounded-[14px] border border-[#e5e5e5]">
          {answer}
        </p>
      </div>
    </div>
  );
}

export const AjudaTab = memo(function AjudaTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchesCategory =
        selectedCategory === "todos" || faq.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <WhatsAppSupportButton
        variant="clean"
        title="Falar com Suporte"
        subtitle="Atendimento rápido para tirar dúvidas sobre o app"
        message="Olá, preciso de ajuda com o Van360"
      />

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Dúvidas Frequentes
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Guias rápidos para as principais etapas do aplicativo
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dúvida ou funcionalidade..."
            className="w-full pl-10 pr-4 h-10 sm:h-11 bg-white border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] text-sm font-normal text-[#0a0a0a] placeholder:text-[#737373] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] text-xs font-medium shrink-0 transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-[#f5f5f5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5]/60"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-[#e5e5e5] pt-1">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <HelpCircle className="w-8 h-8 text-[#737373] opacity-40 mx-auto" />
              <p className="text-sm font-semibold text-[#0a0a0a]">
                Nenhuma dúvida encontrada
              </p>
              <p className="text-xs text-[#737373] max-w-xs mx-auto">
                Tente buscar com outras palavras ou fale diretamente com a gente no WhatsApp acima.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))
          )}
        </div>
      </div>
    </div>
  );
});
