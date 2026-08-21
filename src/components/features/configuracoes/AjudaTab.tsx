import { memo, useMemo, useState } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppUrl } from "@/constants";
import { openBrowserLink } from "@/utils/browser";
import {
  ChevronDown,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  MessageCircle,
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
  { id: "passageiros", label: "Passageiros", icon: Users },
  { id: "cobrancas", label: "Cobranças", icon: BadgeDollarSign },
  { id: "rotas", label: "Rotas", icon: RouteIcon },
  { id: "contratos", label: "Contratos", icon: FileText },
  { id: "gps", label: "GPS & Mapa", icon: Radio },
  { id: "equipe", label: "Equipe", icon: Users2 },
] as const;

const FAQS_DATA: FaqItemData[] = [
  // Passageiros
  {
    id: "cadastrar-aluno",
    category: "passageiros",
    question: "Como cadastrar um novo passageiro?",
    answer:
      "Você tem duas formas práticas: 1) Acesse a aba Passageiros, clique no botão '+ Novo' e preencha os dados você mesmo(a); ou 2) Clique em 'Link de Cadastro' e envie pelo WhatsApp para os pais preencherem pelo próprio celular. Quando eles enviarem, a solicitação aparece na aba 'Solicitações' para você aprovar com um toque!",
  },
  {
    id: "carteirinha-dados",
    category: "passageiros",
    question: "Onde vejo a carteirinha e os dados do passageiro?",
    answer:
      "Na aba Passageiros, basta tocar no nome do aluno. A carteirinha digital se abre com o telefone dos pais, endereço completo, escola, histórico de parcelas, contrato e botão rápido de WhatsApp.",
  },
  {
    id: "registrar-ausencia",
    category: "passageiros",
    question: "Como registrar que o passageiro vai faltar (ausência)?",
    answer:
      "Você pode registrar uma ausência abrindo a carteirinha do passageiro ou diretamente na lista de paradas da Rota. Selecione o dia da falta e o sistema ajustará a rota daquele dia automaticamente, sem enviar notificações desnecessárias aos pais.",
  },

  // Cobranças & Parcelas
  {
    id: "dar-baixa-parcela",
    category: "cobrancas",
    question: "Como dar baixa no pagamento de uma parcela?",
    answer:
      "Acesse a aba Parcelas, localize o passageiro desejado e clique em 'Dar Baixa'. Escolha a forma de pagamento (PIX, Dinheiro, Transferência ou Cartão) e confirme. Se desejar, o comprovante de pagamento fica pronto na hora para compartilhar no WhatsApp dos pais.",
  },
  {
    id: "lembretes-automaticos",
    category: "cobrancas",
    question: "Como funcionam os lembretes automáticos de parcelas para os pais?",
    answer:
      "O Van360 envia mensagens educadas de cobrança antes da data de vencimento, no dia do vencimento e em caso de atraso (caso estejam ativadas em Conta > Notificações aos Pais). A sua chave PIX cadastrada é enviada junto na mensagem para facilitar o pagamento. Assim que você registra a baixa da parcela no sistema, os lembretes seguintes são cancelados automaticamente.",
  },
  {
    id: "configurar-pix",
    category: "cobrancas",
    question: "Como cadastrar minha chave PIX de recebimento?",
    answer:
      "Vá em Conta > Pagamentos & PIX. Lá você informa sua chave PIX principal (CPF, CNPJ, Celular, E-mail ou Chave Aleatória). Essa chave será incluída automaticamente nos lembretes de cobrança enviados aos pais.",
  },

  // Rotas & Viagens
  {
    id: "organizar-rotas",
    category: "rotas",
    question: "Como criar e organizar a ordem das paradas da rota?",
    answer:
      "Na aba Rotas, clique em 'Configurar Rota'. O sistema permite definir o sentido (Ida para a escola ou Volta para casa), selecionar as escolas e os passageiros. Você pode arrastar as paradas para ajustar a ordem exata do seu itinerário.",
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
      "Na aba Contratos, você pode configurar o modelo padrão da sua van. Na carteirinha do passageiro, basta clicar em 'Gerar Contrato' para criar o documento com os valores e datas acordadas. O responsável recebe um link seguro para assinar com o dedo na tela do celular, com total validade jurídica.",
  },
  {
    id: "importar-contrato-existente",
    category: "contratos",
    question: "Posso importar contratos que já tenho em papel ou PDF?",
    answer:
      "Sim! Na aba Contratos, clique no botão 'Importar Contrato'. Você pode anexar o documento já assinado ou preencher os dados para vincular o contrato diretamente ao cadastro do passageiro, mantendo todo o seu histórico centralizado no app.",
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
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 sm:py-4.5 text-left group cursor-pointer"
      >
        <span className="text-sm sm:text-[15px] font-semibold text-slate-800 group-hover:text-[#1a3a5c] transition-colors leading-snug pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-300 shrink-0",
            isOpen && "rotate-180 text-[#1a3a5c]"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        )}
      >
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-100">
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

  const handleWhatsAppSupport = () => {
    openBrowserLink(getWhatsAppUrl());
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Suporte Direto WhatsApp */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1a3a5c]">
              Atendimento Direto
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Precisa de ajuda com a sua conta ou suporte técnico?
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppSupport}
          className="w-full group flex items-center justify-between p-4 sm:p-5 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/70 rounded-2xl transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-md shadow-emerald-200/60 group-hover:scale-105 transition-transform shrink-0">
              <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm sm:text-base font-bold text-emerald-950">
                Falar com Suporte no WhatsApp
              </p>
              <p className="text-xs text-emerald-800 font-medium truncate">
                Atendimento rápido para tirar dúvidas da sua operação
              </p>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>
      </div>

      {/* Central de Dúvidas Frequentes */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1a3a5c]">
              Dúvidas Frequentes
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Guias rápidos para as principais etapas do aplicativo
            </p>
          </div>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dúvida ou funcionalidade..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c] transition-all"
          />
        </div>

        {/* Filtro por Categorias / Pílulas */}
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
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#1a3a5c] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lista de FAQs */}
        <div className="divide-y divide-slate-100 pt-1">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Nenhuma dúvida encontrada
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
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
