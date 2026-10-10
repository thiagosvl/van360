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
  ArrowRight,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Smile,
  XCircle,
  RotateCw,
} from "lucide-react";
import { isNativeIos } from "@/utils/detectPlatform";
import {
  purchaseIosProduct,
  restoreIosPurchases,
  IAP_PRODUCTS,
  IapCapacityTier,
  IAP_TIER_PRICES,
} from "@/services/native/iapRevenueCat.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getWhatsAppUrl } from "@/constants";
import { openBrowserLink } from "@/utils/browser";

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
  logo?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Tio Rodrigo & Tia Paula",
    role: "Curitiba, PR • 260 alunos",
    quote:
      "Desde o mês passado já reduzi a inadimplência de 3 pais. Foram quase 700 reais que talvez eu nem fosse receber, mas o app cobrou os pais sozinho.",
    rating: "5/5",
    logo: "/assets/depoimentos/tio-rodrigo-tia-paula.png",
  },
  {
    name: "Tio Beto",
    role: "São Paulo, SP • 60 alunos",
    quote:
      "Os pais assinam o contrato direto pelo link no celular. Agora não preciso mais imprimir e levar o contrato de porta em porta dos pais.",
    rating: "5/5",
    logo: "/assets/depoimentos/tio-beto.png",
  },
  {
    name: "Escolar Tio Saulo",
    role: "Belo Horizonte, MG • 320 alunos",
    quote:
      "Deixei minhas planilhas de lado de vez. O app me mostra na hora quem já pagou o mês e quem está pendente com total clareza.",
    rating: "5/5",
    logo: "/assets/depoimentos/escolar-tio-saulo.png",
  },
  {
    name: "Tia Lu Kids",
    role: "Rio de Janeiro, RJ • 90 alunos",
    quote:
      "O suporte é rápido de verdade e o melhor é não precisar mais ficar cobrando os pais. O app avisa todo mundo certinho no WhatsApp.",
    rating: "5/5",
    logo: "/assets/depoimentos/tia-lu-kids.png",
  },
  {
    name: "Rota Alegre Transporte Escolar",
    role: "Brasília, DF • 110 alunos",
    quote:
      "Na saída da escola, poder fazer a chamada pelo app é muito mais prático do que no papel. Em um minuto já sei certinho quem embarcou.",
    rating: "5/5",
    logo: "/assets/depoimentos/rota-alegre-transporte-escolar.png",
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
      "Em qualquer lugar. Você pode acessar no navegador do celular, tablet ou computador — sem baixar nada. Se preferir, você e os responsáveis também podem baixar o aplicativo oficial na Google Play (Android) ou na App Store (iPhone).",
  },
  {
    question: "Meus dados continuam salvos se a assinatura vencer?",
    answer:
      "Sim. Todo o seu histórico de alunos, rotas, contratos e parcelas permanece guardado com total segurança no app para quando você reativar seu acesso.",
  },
  {
    question: "Como funcionam os lembretes de cobrança no WhatsApp?",
    answer:
      "O app automatiza o envio de avisos de cobrança aos responsáveis com a sua própria chave Pix configurada no app e o valor da parcela, reduzindo a inadimplência sem cobrança manual desgastante.",
  },
];

function ShowcaseFaqItem({ question, answer }: ShowcaseFaq) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#e5e5e5] last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3.5 sm:py-4 text-left group cursor-pointer"
      >
        <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300 shrink-0",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-3.5 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
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
  const isIos = isNativeIos();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionIdentifer>(SubscriptionIdentifer.MONTHLY);
  const [selectedCapacity, setSelectedCapacity] = useState<IapCapacityTier>(IapCapacityTier.TIER_110);
  const [isPurchasingIap, setIsPurchasingIap] = useState(false);
  const [isRestoringIap, setIsRestoringIap] = useState(false);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const monthlyPlan = plans?.find((p) => p.identificador === SubscriptionIdentifer.MONTHLY);
  const annualPlan = plans?.find((p) => p.identificador === SubscriptionIdentifer.YEARLY);

  const baseMonthlyPrice = pricing?.baseMonthlyPrice ?? (monthlyPlan ? Number(monthlyPlan.valor) : 0);
  const baseAnnualPrice = pricing?.baseAnnualPrice ?? (annualPlan ? Number(annualPlan.valor) : 0);
  const regularMonthlyPrice = pricing?.regularMonthlyPrice ?? baseMonthlyPrice;
  const regularAnnualPrice = pricing?.regularAnnualPrice ?? baseAnnualPrice;
  const webMonthlyPrice = pricing?.monthlyPrice ?? baseMonthlyPrice;
  const webAnnualPrice = pricing?.annualPrice ?? baseAnnualPrice;

  const isPlus250 = selectedCapacity === IapCapacityTier.TIER_PLUS_250;
  const activeIapCapacity = isPlus250 ? IapCapacityTier.TIER_110 : selectedCapacity;
  const iosMonthlyPrice = IAP_TIER_PRICES[activeIapCapacity].monthly;
  const iosAnnualPrice = IAP_TIER_PRICES[activeIapCapacity].annual;

  const monthlyPrice = isIos ? iosMonthlyPrice : webMonthlyPrice;
  const annualPrice = isIos ? iosAnnualPrice : webAnnualPrice;

  const annualMonthlyEquivalent = annualPrice > 0 ? Number((annualPrice / 12).toFixed(2)) : 0;
  const totalAnnualSavings = isIos
    ? Number(((iosMonthlyPrice * 12) - iosAnnualPrice).toFixed(2))
    : pricing?.totalAnnualSavings ?? (regularMonthlyPrice > 0 && annualPrice > 0 ? Math.max(0, Number(((regularMonthlyPrice * 12) - annualPrice).toFixed(2))) : 0);

  const hasPromoMonthly = !isIos && (pricing?.hasPromoMonthly ?? (regularMonthlyPrice < baseMonthlyPrice));
  const hasPromoAnnual = !isIos && (pricing?.hasPromoAnnual ?? (regularAnnualPrice < baseAnnualPrice));
  const hasReferralDiscount = !isIos && (pricing?.hasReferralDiscount ?? Boolean(referral?.hasActiveDiscount));

  const referralDiscountPct = pricing?.referralDiscountPct ?? (referral?.discountPct || 0);
  const freeMonths = isIos ? 2 : (pricing?.freeMonths ?? (regularMonthlyPrice > 0 && totalAnnualSavings > 0 ? Math.max(1, Math.round(totalAnnualSavings / regularMonthlyPrice)) : 2));

  const handleIosPurchase = async (period: SubscriptionIdentifer) => {
    setIsPurchasingIap(true);
    try {
      const productId = period === SubscriptionIdentifer.MONTHLY
        ? (selectedCapacity === IapCapacityTier.TIER_110 ? IAP_PRODUCTS.MENSAL_110 : IAP_PRODUCTS.MENSAL_250)
        : (selectedCapacity === IapCapacityTier.TIER_110 ? IAP_PRODUCTS.ANUAL_110 : IAP_PRODUCTS.ANUAL_250);

      const result = await purchaseIosProduct(productId);
      if (result.success) {
        toast.success("Assinatura confirmada com sucesso pela App Store!");
        await queryClient.invalidateQueries({ queryKey: ["subscription"] });
        await queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      } else if (result.userCancelled) {
        return;
      } else {
        toast.error(result.errorMessage || "Não foi possível concluir a compra.");
      }
    } catch {
      toast.error("Erro inesperado ao processar a compra.");
    } finally {
      setIsPurchasingIap(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoringIap(true);
    try {
      const res = await restoreIosPurchases();
      if (res.hasActiveSubscription) {
        toast.success("Assinatura restaurada com sucesso!");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await queryClient.invalidateQueries({ queryKey: ["subscription"] });
        await queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      } else {
        toast.info("Nenhuma assinatura ativa encontrada para este Apple ID.");
      }
    } catch {
      toast.error("Erro ao conectar com a App Store para restaurar compras.");
    } finally {
      setIsRestoringIap(false);
    }
  };

  const coreFeatures = [
    { feature: "Cobrança no WhatsApp", benefit: "lembretes com sua chave Pix, sem você ter que cobrar ninguém" },
    { feature: "Contratos digitais", benefit: "assinados no celular com validade jurídica, sem papel" },
    { feature: "Rotas e chamada", benefit: "mapa ao vivo para os pais e chamada na saída da escola" },
    { feature: "Controle financeiro e gastos", benefit: "quem pagou, quem deve e as despesas da sua van" },
    {
      feature: "Capacidade de alunos",
      benefit:
        selectedCapacity === IapCapacityTier.TIER_110
          ? "até 110 alunos cadastrados com rotas e carteirinhas"
          : selectedCapacity === IapCapacityTier.TIER_250
            ? "até 250 alunos cadastrados para frotas e equipes"
            : "mais de 250 alunos com atendimento corporativo e frotas",
    },
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
    <div className="bg-white rounded-[24px] p-5 sm:p-7 border border-[#e5e5e5] shadow-xs hover:border-[#737373] transition-all flex flex-col justify-between h-full">
      <div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight">Plano Mensal</h3>
          <p className="text-xs text-[#737373] mt-0.5">Cancele quando quiser, sem fidelidade</p>
        </div>

        {isIos && (
          <div className="mt-3.5 pt-3.5 border-t border-[#e5e5e5] space-y-1.5">
            <span className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block text-left">
              Quantidade de alunos:
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5]">
              <button
                type="button"
                onClick={() => setSelectedCapacity(IapCapacityTier.TIER_110)}
                className={cn(
                  "py-2 px-1 rounded-[14px] text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center truncate",
                  selectedCapacity === IapCapacityTier.TIER_110
                    ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                    : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                Até 110
              </button>
              <button
                type="button"
                onClick={() => setSelectedCapacity(IapCapacityTier.TIER_250)}
                className={cn(
                  "py-2 px-1 rounded-[14px] text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center truncate",
                  selectedCapacity === IapCapacityTier.TIER_250
                    ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                    : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                Até 250
              </button>
              <button
                type="button"
                onClick={() => setSelectedCapacity(IapCapacityTier.TIER_PLUS_250)}
                className={cn(
                  "py-2 px-1 rounded-[14px] text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center leading-tight truncate",
                  selectedCapacity === IapCapacityTier.TIER_PLUS_250
                    ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                    : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                250 ou mais
              </button>
            </div>
          </div>
        )}

        {isIos && isPlus250 ? (
          <div className="mt-4 space-y-1 min-h-[72px] flex flex-col justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] tracking-tight">
                Sob Consulta
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Plano corporativo personalizado para frotas e equipes acima de 250 alunos
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-0.5 min-h-[72px]">
            {(hasPromoMonthly || hasReferralDiscount) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground line-through font-medium">
                  De {SubscriptionUtils.formatCurrency(hasPromoMonthly ? baseMonthlyPrice : regularMonthlyPrice)}
                </span>
                {hasReferralDiscount && referralDiscountPct > 0 && (
                  <span className="text-xs text-emerald-600 font-semibold">
                    (-{referralDiscountPct}% por indicação)
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-semibold text-[#0a0a0a] tracking-tight tabular-nums">
                {SubscriptionUtils.formatCurrency(monthlyPrice)}
              </span>
              <span className="text-xs sm:text-sm font-normal text-[#737373] shrink-0">
                {hasReferralDiscount ? " no 1º mês" : "/mês"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium pt-0.5">
              {hasReferralDiscount
                ? `A partir do 2º mês: ${SubscriptionUtils.formatCurrency(regularMonthlyPrice)}/mês`
                : isIos
                  ? "Cobrado na sua conta Apple ID"
                  : "No Pix ou no cartão de crédito"}
            </p>
          </div>
        )}

        <div className="mt-5">
          {isIos && isPlus250 ? (
            <Button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                openBrowserLink(
                  getWhatsAppUrl(
                    "Olá! Tenho uma frota escolar com mais de 250 alunos e gostaria de um plano personalizado no Van360."
                  )
                );
              }}
              className="w-full min-h-[46px] rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Falar no WhatsApp</span>
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isPurchasingIap}
              onClick={(e) => {
                e.currentTarget.blur();
                if (isIos) {
                  void handleIosPurchase(SubscriptionIdentifer.MONTHLY);
                  return;
                }
                if (monthlyPlan?.id) {
                  onSelectPlan(monthlyPlan.id, SubscriptionIdentifer.MONTHLY);
                }
              }}
              className="w-full min-h-[46px] rounded-[18px] bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isPurchasingIap ? "Processando..." : "Assinar Plano Mensal"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="border-t border-[#e5e5e5] pt-5 mt-5 space-y-3">
          <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider">
            Tudo o que resolve na sua van:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-foreground">
            {coreFeatures.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-normal">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-foreground">{item.feature}:</strong>{" "}
                  {item.benefit}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
              className="w-full py-2.5 px-3 rounded-[18px] border border-[#e5e5e5] text-xs font-semibold text-primary hover:bg-[#f5f5f5] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isFeaturesExpanded ? "Ocultar" : "Ver mais benefícios inclusos"}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isFeaturesExpanded && "rotate-180")} />
            </button>

            {isFeaturesExpanded && (
              <ul className="space-y-2.5 pt-3 text-xs sm:text-sm text-foreground border-t border-[#e5e5e5] mt-2 animate-in fade-in duration-200">
                {additionalFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 font-normal">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      <strong className="font-semibold text-foreground">{item.feature}:</strong>{" "}
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
    <div className="relative bg-white rounded-[24px] p-5 sm:p-7 border border-[#e5e5e5] shadow-xs hover:border-[#737373] transition-all flex flex-col justify-between h-full">
      {totalAnnualSavings > 0 && (
        <div className="absolute -top-3 right-6 z-10 px-3 py-0.5 rounded-[18px] bg-emerald-50 text-emerald-700 text-xs font-medium tracking-tight border border-emerald-200 shadow-xs flex items-center gap-1.5">
          <span>Economize {SubscriptionUtils.formatCurrency(totalAnnualSavings)}</span>
        </div>
      )}

      <div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight">Plano Anual</h3>
          <p className="text-xs text-[#737373] mt-0.5">
            {freeMonths > 0
              ? `1 ano pelo preço de ${12 - freeMonths} ${12 - freeMonths === 1 ? "mês" : "meses"}`
              : "Máxima economia para a sua van o ano todo"}
          </p>
        </div>

        {isIos && (
          <div className="mt-3.5 pt-3.5 border-t border-[#e5e5e5] space-y-1.5">
            <span className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block text-left">
              Quantidade de alunos:
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5]">
              <button
                type="button"
                onClick={() => setSelectedCapacity(IapCapacityTier.TIER_110)}
                className={cn(
                  "py-2 px-1 rounded-[14px] text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center truncate",
                  selectedCapacity === IapCapacityTier.TIER_110
                    ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                    : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                Até 110
              </button>
              <button
                type="button"
                onClick={() => setSelectedCapacity(IapCapacityTier.TIER_250)}
                className={cn(
                  "py-2 px-1 rounded-[14px] text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center truncate",
                  selectedCapacity === IapCapacityTier.TIER_250
                    ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                    : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                Até 250
              </button>
              <button
                type="button"
                onClick={() => setSelectedCapacity(IapCapacityTier.TIER_PLUS_250)}
                className={cn(
                  "py-2 px-1 rounded-[14px] text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center leading-tight truncate",
                  selectedCapacity === IapCapacityTier.TIER_PLUS_250
                    ? "bg-white text-[#0a0a0a] shadow-xs font-semibold"
                    : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                250 ou mais
              </button>
            </div>
          </div>
        )}

        {isIos && isPlus250 ? (
          <div className="mt-4 space-y-1 min-h-[72px] flex flex-col justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] tracking-tight">
                Sob Consulta
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Plano corporativo personalizado para frotas e equipes acima de 250 alunos
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-0.5 min-h-[72px]">
            {(hasPromoAnnual || hasReferralDiscount || (regularMonthlyPrice * 12) > annualPrice) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground line-through font-medium">
                  De {SubscriptionUtils.formatCurrency(hasPromoAnnual ? baseAnnualPrice : (regularMonthlyPrice * 12))}
                </span>
                {hasReferralDiscount && referralDiscountPct > 0 && (
                  <span className="text-xs text-emerald-600 font-semibold">
                    (-{referralDiscountPct}% por indicação)
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-semibold text-[#0a0a0a] tracking-tight tabular-nums">
                {SubscriptionUtils.formatCurrency(annualPrice)}
              </span>
              <span className="text-xs sm:text-sm font-normal text-[#737373] shrink-0">
                /ano
              </span>
            </div>
            <p className="text-xs text-[#737373] font-normal pt-0.5">
              Equivale a <span className="font-medium text-[#0a0a0a]">{SubscriptionUtils.formatCurrency(annualMonthlyEquivalent)}/mês</span> em até 12x ou à vista
            </p>
          </div>
        )}

        <div className="mt-5">
          {isIos && isPlus250 ? (
            <Button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                openBrowserLink(
                  getWhatsAppUrl(
                    "Olá! Tenho uma frota escolar com mais de 250 alunos e gostaria de um plano personalizado no Van360."
                  )
                );
              }}
              className="w-full min-h-[46px] rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Falar no WhatsApp</span>
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isPurchasingIap}
              onClick={(e) => {
                e.currentTarget.blur();
                if (isIos) {
                  void handleIosPurchase(SubscriptionIdentifer.YEARLY);
                  return;
                }
                if (annualPlan?.id) {
                  onSelectPlan(annualPlan.id, SubscriptionIdentifer.YEARLY);
                }
              }}
              className="w-full min-h-[46px] rounded-[18px] bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isPurchasingIap ? "Processando..." : "Assinar Plano Anual"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="border-t border-[#e5e5e5] pt-5 mt-5 space-y-3">
          <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider">
            Tudo o que resolve na sua van:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-foreground">
            {coreFeatures.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-normal">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="font-semibold text-foreground">{item.feature}:</strong>{" "}
                  {item.benefit}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
              className="w-full py-2.5 px-3 rounded-[18px] border border-[#e5e5e5] text-xs font-semibold text-primary hover:bg-[#f5f5f5] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isFeaturesExpanded ? "Ocultar" : "Ver mais benefícios inclusos"}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isFeaturesExpanded && "rotate-180")} />
            </button>

            {isFeaturesExpanded && (
              <ul className="space-y-2.5 pt-3 text-xs sm:text-sm text-foreground border-t border-[#e5e5e5] mt-2 animate-in fade-in duration-200">
                {additionalFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 font-normal">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      <strong className="font-semibold text-foreground">{item.feature}:</strong>{" "}
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
    <div id="subscription-plans-showcase" className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 w-full">
      {(isCanceled || isExpired) && (
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
                <h1 className="text-2xl sm:text-3xl font-semibold font-headline text-[#0a0a0a] tracking-tight">
                  Reative seu Acesso
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
                  Seus alunos, cobranças, contratos e rotas continuam salvos com segurança. Escolha um plano abaixo para voltar a usar todas as funcionalidades.
                </p>
              </div>
            </div>
          ) : (
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
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-semibold font-headline text-[#0a0a0a] tracking-tight">
                  Regularize sua Assinatura
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
                  Seus alunos, cobranças, contratos e rotas continuam salvos com segurança. Escolha um plano abaixo para voltar a usar o Van360.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {pendingInvoicesSlot}

      {pendingInvoicesSlot && (
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ou escolha outro plano
          </span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
        </div>
      )}

      <Tabs
        value={selectedPeriod}
        onValueChange={(val) => setSelectedPeriod(val as SubscriptionIdentifer)}
        className="w-full space-y-4 sm:space-y-6"
      >
        <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x shrink-0">
          <TabsList className="bg-transparent min-h-[38px] sm:min-h-[42px] p-0 gap-1 border-0 w-full grid grid-cols-2">
            <TabsTrigger
              value={SubscriptionIdentifer.MONTHLY}
              className={cn(
                "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[38px] sm:min-h-[42px] flex items-center justify-center",
                "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
              )}
            >
              Plano Mensal
            </TabsTrigger>
            <TabsTrigger
              value={SubscriptionIdentifer.YEARLY}
              className={cn(
                "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[38px] sm:min-h-[42px] flex items-center justify-center",
                "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
              )}
            >
              Plano Anual
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div>
        {selectedPeriod === SubscriptionIdentifer.YEARLY ? renderAnnualCard() : renderMonthlyCard()}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white rounded-[24px] p-5 sm:p-7 border border-[#e5e5e5] shadow-xs space-y-4 select-none touch-pan-y w-full overflow-hidden"
      >
        <div className="space-y-4">
          <div className="text-center space-y-1 pb-1">
            <h3 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight">
              Quem usa, recomenda
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
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
                        isFilled ? "fill-amber-400 text-amber-400" : "fill-[#e5e5e5] text-[#e5e5e5]"
                      )}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-medium text-[#0a0a0a] ml-1.5">
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
                className="w-8 h-8 rounded-[12px] border border-[#e5e5e5] flex items-center justify-center text-muted-foreground hover:bg-[#f5f5f5] hover:text-foreground transition-colors cursor-pointer"
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
                className="w-8 h-8 rounded-[12px] border border-[#e5e5e5] flex items-center justify-center text-muted-foreground hover:bg-[#f5f5f5] hover:text-foreground transition-colors cursor-pointer"
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
            <p className="text-xs sm:text-sm text-foreground/80 italic leading-relaxed min-h-[44px] sm:min-h-[38px] flex items-center">
              &quot;{testimonials[activeTestimonialIdx].quote}&quot;
            </p>

            <div className="flex items-center gap-3 pt-2 border-t border-[#e5e5e5]">
              <div className="w-11 h-11 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] text-foreground flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                {testimonials[activeTestimonialIdx].logo ? (
                  <img
                    src={testimonials[activeTestimonialIdx].logo}
                    alt={testimonials[activeTestimonialIdx].name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Smile className="w-5 h-5 text-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                  {testimonials[activeTestimonialIdx].name}
                </h5>
                <p className="text-[11px] text-muted-foreground">
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
                activeTestimonialIdx === i ? "w-5 bg-primary" : "w-1.5 bg-[#e5e5e5]"
              )}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-5 sm:p-7 border border-[#e5e5e5] shadow-xs space-y-4 w-full">
        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight">
            Dúvidas Frequentes
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Perguntas comuns de quem está contratando o Van360:
          </p>
        </div>

        <div className="divide-y divide-[#e5e5e5]">
          {showcaseFaqs.map((faq, idx) => (
            <ShowcaseFaqItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {isIos && (
        <div className="bg-[#f5f5f5] rounded-[24px] p-5 sm:p-6 border border-[#e5e5e5] text-center space-y-3.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRestoringIap}
            onClick={() => void handleRestorePurchases()}
            className="rounded-[18px] border-[#e5e5e5] bg-white text-xs font-semibold text-foreground hover:bg-[#f5f5f5] cursor-pointer"
          >
            <RotateCw className={cn("w-3.5 h-3.5 mr-1.5", isRestoringIap && "animate-spin")} />
            <span>{isRestoringIap ? "Restaurando compras..." : "Restaurar Compras Anteriores"}</span>
          </Button>

          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
            O valor da assinatura será cobrado em sua conta Apple ID na confirmação da compra. A assinatura é renovada automaticamente pelo mesmo período e valor contratados, a menos que a renovação automática seja desativada com antecedência mínima de 24 horas antes do término do período vigente. Você pode gerenciar ou cancelar sua assinatura a qualquer momento nos Ajustes da sua conta na App Store.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => openBrowserLink("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}
              className="underline hover:text-primary cursor-pointer"
            >
              Termos de Uso (EULA)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openBrowserLink("https://van360.com.br/politica-de-privacidade")}
              className="underline hover:text-primary cursor-pointer"
            >
              Política de Privacidade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}