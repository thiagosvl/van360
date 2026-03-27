import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppUrl } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { ChevronDown, HelpCircle, ExternalLink, Lightbulb } from "lucide-react";
import { useState } from "react";

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-semibold text-slate-700 group-hover:text-[#1a3a5c] transition-colors leading-tight pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 pb-4" : "max-h-0"
          }`}
      >
        <p className="text-sm text-slate-500 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function HelpSheet() {
  const { isHelpOpen, setIsHelpOpen } = useLayout();

  const faqs = [
    {
      question: "Como adicionar um novo passageiro?",
      answer: "Na aba 'Passageiros'. Lá você poderá copiar e enviar o link de cadastro para os pais, ou você mesmo(a) pode realizar o cadastro clicando no botão '+ Novo'."
    },
    {
      question: "Como gerar um contrato digital?",
      answer: "Após cadastrar um passageiro, caso tenha ativado a opção de contrato, você verá um aviso perguntando se deseja gerar um contrato. Caso tenha perdido esse aviso, acesse a carteirinha do passageiro e clique em 'Gerar Contrato'."
    },
    {
      question: "Como ativar a opção de contrato?",
      answer: "Na aba 'Contratos' você poderá ativar a opção."
    },
    {
      question: "Onde vejo quem está devendo?",
      answer: "Na aba 'Mensalidades', você verá uma lista organizada por status. Os atrasados ficam em destaque com cor vermelha."
    },
    {
      question: "Como enviar recibo pelo WhatsApp?",
      answer: "Ao registrar um pagamento, o sistema gera o recibo automaticamente. Basta clicar no ícone de compartilhar e escolher o WhatsApp."
    }
  ];

  const handleWhatsAppSupport = () => {
    window.open(getWhatsAppUrl(), "_blank");
  };

  return (
    <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <DrawerContent className="h-[85vh] sm:h-[70vh] rounded-t-[32px] p-0 border-0 shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col pt-4 pb-6">
          <DrawerHeader className="px-6 mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-2xl bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c]">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-black text-slate-900 text-left">Central de Ajuda</DrawerTitle>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-10">
            {/* Suporte Direto */}
            <section>
              <button
                onClick={handleWhatsAppSupport}
                className="w-full group relative flex items-center justify-between p-5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-[24px] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                    <WhatsAppIcon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-emerald-900">WhatsApp</p>
                    <p className="text-xs text-emerald-700 opacity-80 font-medium">Fale diretamente conosco</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-emerald-600 opacity-40" />
              </button>
            </section>

            {/* FAQs */}
            <section>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lightbulb className="h-3 w-3" /> Dúvidas Frequentes
              </h3>
              <div className="bg-slate-50/50 rounded-[28px] px-5 py-2">
                {faqs.map((faq, index) => (
                  <FaqItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
