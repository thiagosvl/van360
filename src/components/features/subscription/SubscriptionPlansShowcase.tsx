import { useState } from "react";
import { SaaSPlan, Subscription, ReferralData, SubscriptionPricingSummary } from "@/types/subscription";
import { SubscriptionIdentifer } from "@/types/enums";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { WhatsAppSupportButton } from "@/components/ui/WhatsAppSupportButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Tag,
  ArrowRight,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Smile,
  XCircle,
} from "lucide-react";

interface SubscriptionPlansShowcaseProps {
  plans: SaaSPlan[];
  pricing?: SubscriptionPricingSummary | null;
  isPromotionActive?: boolean;
  subscription?: Subscription | null;
  referral?: ReferralData | null;
  trialDaysLeft?: number | null;
  isTrial?: boolean;
  isExpired?: boolean;
  isCanceled?: boolean;
  onSelectPlan: (planId?: string, identifier?: SubscriptionIdentifer) => void;
  pendingInvoicesSlot?: React.ReactNode;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Tio Marcos",
    role: "Transporte Escolar na Zona Sul de SP • 67 alunos",
    quote:
      "Desde o mês passado já reduzi a inadimplência de 3 pais. Foram quase 700 reais que talvez eu nem fosse receber, mas o app cobrou os pais sozinho.",
    rating: "5/5",
  },
  {
    name: "Tia Cláudia",
    role: "Transporte Escolar em Belo Horizonte/MG • 54 alunos",
    quote:
      "Os pais assinam o contrato direto pelo link no celular. Agora não preciso mais imprimir e levar o contrato de porta em porta dos pais.",
    rating: "5/5",
  },
  {
    name: "Tio Roberto",
    role: "Transporte Escolar em Curitiba/PR • 112 alunos",
    quote:
      "Na saída da escola, poder fazer a chamada pelo app é muito mais prático do que no papel. Em um minuto já sei certinho quem embarcou.",
    rating: "5/5",
  },
  {
    name: "Tia Valéria",
    role: "Transporte Escolar na Zona Norte do RJ • 51 alunos",
    quote:
      "Deixei minhas planilhas de lado de vez. O app me mostra na hora quem já pagou o mês e quem está pendente com total clareza.",
    rating: "5/5",
  },
  {
    name: "Tio Anderson",
    role: "Transporte Escolar em Brasília/DF • 63 alunos",
    quote:
      "O suporte é rápido de verdade e o melhor é não precisar mais ficar cobrando os pais. O app avisa todo mundo certinho no WhatsApp.",
    rating: "5/5",
  },
];

interface ShowcaseFaq {
  question: string;
  answer: string;
}

const showcaseFaqs: ShowcaseFaq[] = [
  {
    question: "Qual é a diferença entre o Plano Mensal e o Plano Anual?",
    answer:
      "Os benefícios são exatamente os mesmos em ambos os planos. A diferença é a economia que você terá contratando o Plano Anual (1 ano pelo preço de 10 meses), além da tranquilidade de não precisar se preocupar todo mês em renovar a assinatura da sua van.",
  },
  {
    question: "Quais são as formas de pagamento disponíveis?",
    answer:
      "O Plano Anual pode ser pago à vista no Pix ou parcelado em até 12x no cartão de crédito. O Plano Mensal é cobrado mês a mês no cartão de crédito ou Pix.",
  },
  {
    question: "Como funciona o cancelamento? Existe fidelidade?",
    answer:
      "No Plano Mensal, você não tem carência, fidelidade ou multa: pode cancelar quando quiser com total liberdade pelo app. No Plano Anual, o acesso é garantido pelo período contratado de 12 meses.",
  },
  {
    question: "Existe limite de alunos, rotas ou escolas?",
    answer:
      "Não há nenhum limite. Em ambos os planos você pode cadastrar quantos alunos, responsáveis, rotas, escolas e vans precisar sem custos adicionais.",
  },
  {
    question: "Onde posso usar o Van360?",
    answer:
      "Em qualquer lugar. Você pode acessar no navegador do celular, tablet ou computador — sem baixar nada. Se preferir, temos também o app Android na Google Play, super leve e rápido. No iPhone, funciona com total desempenho diretamente pelo navegador.",
  },
  {
    question: "Meus dados continuam salvos se a assinatura vencer?",
    answer:
      "Sim. Todo o seu histórico de alunos, rotas, contratos e parcelas permanece guardado com total segurança no sistema para quando você reativar seu acesso.",
  },
  {
    question: "Como funcionam os lembretes de cobrança no WhatsApp?",
    answer:
      "O sistema automatiza o envio de avisos de cobrança aos responsáveis com a sua própria chave Pix configurada no app e o valor da parcela, reduzindo a inadimplência sem cobrança manual desgastante.",
  },
];

function ShowcaseFaqItem({ question, answer }: ShowcaseFaq) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3.5 sm:py-4 text-left group cursor-pointer"
      >
        <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#002444] transition-colors leading-snug pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-300 shrink-0",
            isOpen && "rotate-180 text-[#002444]"
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-3.5 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
          {answer}
        </div>
      )}
    </div>
  );
}

export function SubscriptionPlansShowcase({
  plans,
  pricing,
  isPromotionActive = false,
  subscription,
  referral,
  trialDaysLeft,
  isTrial = false,
  isExpired = false,
  isCanceled = false,
  onSelectPlan,
  pendingInvoicesSlot,
}: SubscriptionPlansShowcaseProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionIdentifer>(SubscriptionIdentifer.MONTHLY);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const monthlyPlan = plans?.find((p) => p.identificador === SubscriptionIdentifer.MONTHLY);
  const annualPlan = plans?.find((p) => p.identificador === SubscriptionIdentifer.YEARLY);

  const baseMonthlyPrice = pricing?.baseMonthlyPrice ?? (monthlyPlan ? Number(monthlyPlan.valor) : 0);
  const baseAnnualPrice = pricing?.baseAnnualPrice ?? (annualPlan ? Number(annualPlan.valor) : 0);
  const regularMonthlyPrice = pricing?.regularMonthlyPrice ?? baseMonthlyPrice;
  const regularAnnualPrice = pricing?.regularAnnualPrice ?? baseAnnualPrice;
  const monthlyPrice = pricing?.monthlyPrice ?? baseMonthlyPrice;
  const annualPrice = pricing?.annualPrice ?? baseAnnualPrice;
  const annualMonthlyEquivalent = pricing?.annualMonthlyEquivalent ?? (annualPrice > 0 ? Number((annualPrice / 12).toFixed(2)) : 0);
  const totalAnnualSavings = pricing?.totalAnnualSavings ?? (regularMonthlyPrice > 0 && annualPrice > 0 ? Math.max(0, Number(((regularMonthlyPrice * 12) - annualPrice).toFixed(2))) : 0);
  const hasPromoMonthly = pricing?.hasPromoMonthly ?? (regularMonthlyPrice < baseMonthlyPrice);
  const hasPromoAnnual = pricing?.hasPromoAnnual ?? (regularAnnualPrice < baseAnnualPrice);
  const hasReferralDiscount = pricing?.hasReferralDiscount ?? Boolean(referral?.hasActiveDiscount);
  const referralDiscountPct = pricing?.referralDiscountPct ?? (referral?.discountPct || 0);
  const freeMonths = pricing?.freeMonths ?? (regularMonthlyPrice > 0 && totalAnnualSavings > 0 ? Math.max(1, Math.round(totalAnnualSavings / regularMonthlyPrice)) : 2);

  const discountPercent = regularAnnualPrice > 0
    ? Math.max(1, Math.round(((regularMonthlyPrice * 12 - annualPrice) / (regularMonthlyPrice * 12)) * 100))
    : 34;

  const activePlan = selectedPeriod === SubscriptionIdentifer.YEARLY ? annualPlan : monthlyPlan;
  const isAnual = selectedPeriod === SubscriptionIdentifer.YEARLY;

  const coreFeatures = [
    { feature: "Cobrança no WhatsApp", benefit: "lembretes com sua chave Pix, sem você ter que cobrar ninguém" },
    { feature: "Contratos digitais", benefit: "assinados no celular com validade jurídica, sem papel" },
    { feature: "Rotas e chamada", benefit: "mapa ao vivo para os pais e chamada na saída da escola" },
    { feature: "Controle financeiro e gastos", benefit: "quem pagou, quem deve e as despesas da sua van" },
    { feature: "Alunos ilimitados", benefit: "todos os alunos no app, com dados, escola e responsáveis, sem papel" },
  ];

  const additionalFeatures = [
    { feature: "Relatórios do seu negócio", benefit: "saiba exatamente quanto faturou, gastou e o lucro real do mês" },
    { feature: "Motoristas e monitores", benefit: "cadastre sua equipe com acesso às rotas e carteirinhas dos alunos" },
    { feature: "Carteirinha do aluno", benefit: "parcelas, contrato e dados do aluno guardados no celular, sem papel" },
    { feature: "App dos pais", benefit: "acompanham a rota, veem recibos, contratos e registram ausências" },
    { feature: "Cadastro de alunos", benefit: "os pais preenchem pelo link ou você cadastra, sem limite" },
    { feature: "Recibos em PDF", benefit: "comprovante profissional gerado e enviado em 1 toque" },
    { feature: "Aniversariantes do mês", benefit: "aviso automático para você não perder a data dos alunos" },
    { feature: "Acesso de qualquer lugar", benefit: "pelo celular, tablet ou computador, sempre sincronizado" },
    { feature: "Suporte humano no WhatsApp", benefit: "atendimento real, rápido e disponível mesmo à noite" },
  ];

  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 35;

  const handlePrevTestimonial = () => {
    setSlideDirection("prev");
    setActiveTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setSlideDirection("next");
    setActiveTestimonialIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX;
    const resisted = Math.sign(diff) * Math.min(65, Math.abs(diff) * 0.6);
    setTouchDeltaX(resisted);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX < -minSwipeDistance) {
        handleNextTestimonial();
      } else if (touchDeltaX > minSwipeDistance) {
        handlePrevTestimonial();
      }
    }
    setIsSwiping(false);
    setTouchDeltaX(0);
    setTouchStartX(null);
  };

  const renderMonthlyCard = () => (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between h-full">
      <div>
        <div>
          <h3 className="text-xl font-bold text-[#002444]">Plano Mensal</h3>
          <p className="text-xs text-slate-500 mt-1">Cancele quando quiser, sem fidelidade</p>
        </div>

        <div className="mt-4 space-y-0.5">
          {(hasPromoMonthly || hasReferralDiscount) && (
            <p className="text-xs text-slate-400 line-through font-medium">
              De {SubscriptionUtils.formatCurrency(hasPromoMonthly ? baseMonthlyPrice : regularMonthlyPrice)}
            </p>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#002444] tracking-tight">
              {SubscriptionUtils.formatCurrency(monthlyPrice)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 shrink-0">
              {hasReferralDiscount ? " no 1º mês" : "/mês"}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium pt-0.5">
            {hasReferralDiscount
              ? `A partir do 2º mês: ${SubscriptionUtils.formatCurrency(regularMonthlyPrice)}/mês`
              : "No Pix ou no cartão de crédito"}
          </p>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              if (monthlyPlan?.id) {
                onSelectPlan(monthlyPlan.id, SubscriptionIdentifer.MONTHLY);
              }
            }}
            className="w-full min-h-[46px] rounded-xl bg-[#002444] hover:bg-[#00172e] text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Assinar Plano Mensal</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="border-t border-slate-100 pt-5 mt-5 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tudo o que resolve na sua van:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {coreFeatures.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-normal">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-600">
                  <strong className="font-semibold text-slate-900">{item.feature}:</strong>{" "}
                  {item.benefit}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#002444] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isFeaturesExpanded ? "Ocultar" : "Ver mais benefícios inclusos"}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isFeaturesExpanded && "rotate-180")} />
            </button>

            {isFeaturesExpanded && (
              <ul className="space-y-2.5 pt-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 mt-2 animate-in fade-in duration-200">
                {additionalFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 font-normal">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-600">
                      <strong className="font-semibold text-slate-900">{item.feature}:</strong>{" "}
                      {item.benefit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnnualCard = () => (
    <div className="relative bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between h-full">
      {totalAnnualSavings > 0 && (
        <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-tight border border-emerald-200/90 shadow-xs flex items-center gap-1.5">
          <span>Economize {SubscriptionUtils.formatCurrency(totalAnnualSavings)}</span>
        </div>
      )}

      <div>
        <div>
          <h3 className="text-xl font-bold text-[#002444]">Plano Anual</h3>
          <p className="text-xs text-slate-500 mt-1">
            {freeMonths > 0
              ? `1 ano pelo preço de ${12 - freeMonths} ${12 - freeMonths === 1 ? "mês" : "meses"}`
              : "Máxima economia para a sua van o ano todo"}
          </p>
        </div>

        <div className="mt-4 space-y-0.5">
          {(hasPromoAnnual || hasReferralDiscount || (regularMonthlyPrice * 12) > annualPrice) && (
            <p className="text-xs text-slate-400 line-through font-medium">
              De {SubscriptionUtils.formatCurrency(hasPromoAnnual ? baseAnnualPrice : (regularMonthlyPrice * 12))}
            </p>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#002444] tracking-tight">
              {SubscriptionUtils.formatCurrency(annualPrice)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 shrink-0">
              /ano
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium pt-0.5">
            Equivale a <span className="font-bold text-slate-900">{SubscriptionUtils.formatCurrency(annualMonthlyEquivalent)}/mês</span> em até 12x ou à vista
          </p>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              if (annualPlan?.id) {
                onSelectPlan(annualPlan.id, SubscriptionIdentifer.YEARLY);
              }
            }}
            className="w-full min-h-[46px] rounded-xl bg-[#002444] hover:bg-[#00172e] text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Assinar Plano Anual</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="border-t border-slate-100 pt-5 mt-5 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tudo o que resolve na sua van:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {coreFeatures.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-normal">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-600">
                  <strong className="font-semibold text-slate-900">{item.feature}:</strong>{" "}
                  {item.benefit}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-[#002444] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isFeaturesExpanded ? "Ocultar" : "Ver mais benefícios inclusos"}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isFeaturesExpanded && "rotate-180")} />
            </button>

            {isFeaturesExpanded && (
              <ul className="space-y-2.5 pt-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 mt-2 animate-in fade-in duration-200">
                {additionalFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 font-normal">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-600">
                      <strong className="font-semibold text-slate-900">{item.feature}:</strong>{" "}
                      {item.benefit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 w-full">
      <div className="text-center space-y-2">
        {isCanceled ? (
          <div className="space-y-4 w-full pt-1">
            <Banner
              variant="warning"
              icon={<XCircle className="w-4 h-4 text-amber-600" />}
              title="Assinatura cancelada"
              description="Sua assinatura anterior foi cancelada e o acesso está suspenso."
              className="text-left w-full"
            />
            <WhatsAppSupportButton
              subtitle="Tire dúvidas sobre os planos ou reativação"
              message="Olá! Estou na tela de assinatura do Van360 e gostaria de tirar uma dúvida."
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-headline text-[#002444] tracking-tight">
                Reative seu Acesso
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                Seus alunos, cobranças, contratos e rotas continuam salvos com segurança. Escolha um plano abaixo para voltar a usar todas as funcionalidades.
              </p>
            </div>
          </div>
        ) : isExpired ? (
          <div className="space-y-4 w-full pt-1">
            <Banner
              variant="danger"
              icon={<Lock className="w-4 h-4 text-rose-600" />}
              title="Acesso suspenso"
              description="Seus dados continuam salvos com segurança."
              className="text-left w-full"
            />
            <WhatsAppSupportButton
              subtitle="Tire dúvidas sobre os planos ou reativação"
              message="Olá! Estou na tela de assinatura do Van360 e gostaria de tirar uma dúvida."
            />
          </div>
        ) : (
          <div className="space-y-2">
            {isTrial && trialDaysLeft !== null && trialDaysLeft !== undefined && (
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full text-xs font-normal border border-emerald-200/80 bg-emerald-50/80 text-emerald-800 mb-2 sm:mb-3">
                <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-500/25" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006039]" />
                </span>
                <span>
                  {trialDaysLeft === 0
                    ? "Hoje é o seu último dia de teste gratuito"
                    : trialDaysLeft === 1
                      ? "1 dia de teste gratuito restante"
                      : `${trialDaysLeft} dias de teste gratuitos restantes`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {pendingInvoicesSlot}

      {pendingInvoicesSlot && (
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
            ou escolha outro plano
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
      )}

      {hasReferralDiscount && (
        <div className="w-full">
          <Banner
            variant="success"
            icon={<Tag className="w-5 h-5" />}
            title={`Desconto de ${referralDiscountPct}% por indicação aplicado!`}
            description="O valor com desconto já está calculado nos planos abaixo."
            className="w-full"
          />
        </div>
      )}

      <div className="max-w-sm sm:max-w-md mx-auto w-full pt-1">
        <Tabs
          value={selectedPeriod}
          onValueChange={(val) => setSelectedPeriod(val as SubscriptionIdentifer)}
          className="w-full"
        >
          <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
            <TabsList className="grid grid-cols-2 w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
              <TabsTrigger
                value={SubscriptionIdentifer.MONTHLY}
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
              >
                Plano Mensal
              </TabsTrigger>
              <TabsTrigger
                value={SubscriptionIdentifer.YEARLY}
                className="relative rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
              >
                <span>Plano Anual</span>
                <span className="absolute -top-3 right-2 sm:right-1 px-2.5 py-0.5 rounded-full bg-[#002444] text-white text-[8px] font-black uppercase tracking-tight shadow-xs whitespace-nowrap flex items-center gap-1">
                  mais popular
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      <div>
        {selectedPeriod === SubscriptionIdentifer.YEARLY ? renderAnnualCard() : renderMonthlyCard()}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 select-none touch-pan-y w-full overflow-hidden"
      >
        <div className="space-y-4">
          <div className="text-center space-y-1 pb-1">
            <h3 className="text-base sm:text-lg font-bold text-[#002444] tracking-tight">
              Quem usa, recomenda
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Veja o que motoristas de van de todo o Brasil dizem sobre o Van360:
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                  const numRating = parseInt(testimonials[activeTestimonialIdx].rating.split("/")[0]) || 5;
                  const isFilled = i < numRating;
                  return (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        isFilled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-300"
                      )}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-bold text-slate-700 ml-1.5">
                {testimonials[activeTestimonialIdx].rating}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevTestimonial();
                }}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextTestimonial();
                }}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            transform: `translateX(${touchDeltaX}px)`,
            transition: isSwiping ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className="space-y-4"
        >
          <div
            key={activeTestimonialIdx}
            className={cn(
              "space-y-4",
              slideDirection === "next"
                ? "animate-in fade-in slide-in-from-right-4 duration-300"
                : "animate-in fade-in slide-in-from-left-4 duration-300"
            )}
          >
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed min-h-[44px] sm:min-h-[38px] flex items-center">
              &quot;{testimonials[activeTestimonialIdx].quote}&quot;
            </p>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-[#002444] flex items-center justify-center shrink-0 shadow-xs">
                <Smile className="w-5 h-5 text-[#002444]" />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs sm:text-sm font-bold text-[#002444]">
                  {testimonials[activeTestimonialIdx].name}
                </h5>
                <p className="text-[11px] text-slate-500">
                  {testimonials[activeTestimonialIdx].role}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-1">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideDirection(i > activeTestimonialIdx ? "next" : "prev");
                setActiveTestimonialIdx(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                activeTestimonialIdx === i ? "w-5 bg-[#002444]" : "w-1.5 bg-slate-200"
              )}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 w-full">
        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-[#002444] tracking-tight">
            Dúvidas Frequentes
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Perguntas comuns de quem está contratando o Van360:
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {showcaseFaqs.map((faq, idx) => (
            <ShowcaseFaqItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}