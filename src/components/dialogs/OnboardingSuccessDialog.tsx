import { useState, useRef, useEffect, ComponentType } from "react";
import confetti from "canvas-confetti";
import { safeCloseDialog } from "@/hooks";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  X,
  BadgeDollarSign,
  BellRing,
  Receipt,
  FileText,
  TrendingDown,
  Route,
  ChartArea,
  Sparkles,
  Eye,
  Cake,
  Smartphone,
  LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NextStepItem {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
  actionType?: "preview_cobranca" | "preview_recibo" | "preview_contrato" | "navigate";
  actionLabel?: string;
  route?: string;
}

const NEXT_STEPS: NextStepItem[] = [
  {
    id: "cobranca_automatica",
    title: "Cobrança Automática",
    description: "Enviamos lembretes aos pais automaticamente pelo WhatsApp sem você precisar fazer nada.",
    icon: BellRing,
    actionType: "preview_cobranca",
    actionLabel: "Ver exemplo",
  },
  {
    id: "recibos",
    title: "Recibos no WhatsApp",
    description: "Envie o comprovante digital aos pais com um toque.",
    icon: Receipt,
    actionType: "preview_recibo",
    actionLabel: "Ver exemplo",
  },
  {
    id: "contratos",
    title: "Contratos Digitais",
    description: "Gere contratos com assinatura online pelo celular e validade jurídica.",
    icon: FileText,
    actionType: "preview_contrato",
    actionLabel: "Ver exemplo",
  },
  {
    id: "parcelas",
    title: "Parcelas & Pagamentos",
    description: "Registre pagamentos e saiba quem ainda não pagou e quanto tem para receber.",
    icon: BadgeDollarSign,
    actionType: "navigate",
    route: ROUTES.PRIVATE.MOTORISTA.BILLING,
    actionLabel: "Ver agora",
  },
  {
    id: "gastos",
    title: "Gastos da Van",
    description: "Controle despesas como combustível, manutenção e mais.",
    icon: TrendingDown,
    actionType: "navigate",
    route: ROUTES.PRIVATE.MOTORISTA.EXPENSES,
    actionLabel: "Ver agora",
  },
  {
    id: "rotas",
    title: "Rotas & Chamada",
    description: "Organize paradas e faça a chamada dos alunos na palma da mão.",
    icon: Route,
    actionType: "navigate",
    route: ROUTES.PRIVATE.MOTORISTA.ROUTES,
    actionLabel: "Ver agora",
  },
  {
    id: "lucro",
    title: "Lucro Real da Van",
    description: "Relatórios completos para acompanhar o lucro real do seu transporte.",
    icon: ChartArea,
    actionType: "navigate",
    route: ROUTES.PRIVATE.MOTORISTA.REPORTS,
    actionLabel: "Ver agora",
  },
  {
    id: "app_pais",
    title: "Aplicativo dos Pais",
    description: "Acessar a carteirinha do aluno, ver recibos, registrar ausências e acompanhar a van.",
    icon: Smartphone,
  },
  {
    id: "aniversariantes",
    title: "Aniversariantes",
    description: "Acompanhe os aniversários do mês para parabenizar seus alunos.",
    icon: Cake,
    actionType: "navigate",
    route: ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS,
    actionLabel: "Ver agora",
  },
  {
    id: "muito_mais",
    title: "E muito mais...",
    description: "Gestão de equipe, relatórios completos e controle total.",
    icon: Sparkles,
  },
];

export interface OnboardingSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPassageiro: () => void;
  onOpenWhatsAppPreview?: () => void;
  onOpenContratoPreview?: () => void;
  onOpenReciboPreview?: () => void;
  passageiroNome?: string;
}

export function OnboardingSuccessDialog({
  isOpen,
  onClose,
  onNavigateToPassageiro,
  onOpenWhatsAppPreview,
  onOpenContratoPreview,
  onOpenReciboPreview,
  passageiroNome: _passageiroNome,
}: OnboardingSuccessDialogProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cardWidth = 200;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), NEXT_STEPS.length - 1));
  };

  useEffect(() => {
    if (!isOpen) return;

    const duration = 0.45 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 50,
        origin: { x: 0 },
        colors: ["#10b981", "#34d399", "#1a3a5c", "#3b82f6"],
        zIndex: 99999,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 50,
        origin: { x: 1 },
        colors: ["#10b981", "#34d399", "#1a3a5c", "#3b82f6"],
        zIndex: 99999,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoToCarteirinha = () => {
    safeCloseDialog(() => {
      onClose();
      onNavigateToPassageiro();
    });
  };

  const handleItemClick = (step: NextStepItem) => {
    if (step.actionType === "preview_cobranca" && onOpenWhatsAppPreview) {
      onOpenWhatsAppPreview();
    } else if (step.actionType === "preview_recibo" && onOpenReciboPreview) {
      onOpenReciboPreview();
    } else if (step.actionType === "preview_contrato" && onOpenContratoPreview) {
      onOpenContratoPreview();
    } else if (step.actionType === "navigate" && step.route) {
      safeCloseDialog(() => {
        onClose();
        navigate(step.route!);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start sm:justify-center bg-slate-900/95 backdrop-blur-md text-white p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-300 py-12 sm:py-8">
      <button
        type="button"
        onClick={() => safeCloseDialog(onClose)}
        className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
        aria-label="Fechar"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="my-auto flex flex-col items-center w-full max-w-sm text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center animate-ping absolute inset-0" />
          <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-headline text-white text-center mb-2 tracking-tight">
          Parabéns pelo primeiro aluno! 🎉
        </h2>

        <p className="text-sm font-medium text-slate-300 text-center max-w-sm mb-6 leading-relaxed">
          Veja o que você já pode fazer:
        </p>

        <div className="w-full mb-6">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pt-0.5 px-0.5 touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {NEXT_STEPS.map((step) => {
              const Icon = step.icon;
              const hasAction = Boolean(
                (step.actionType === "preview_cobranca" && onOpenWhatsAppPreview) ||
                (step.actionType === "preview_recibo" && onOpenReciboPreview) ||
                (step.actionType === "preview_contrato" && onOpenContratoPreview) ||
                (step.actionType === "navigate" && step.route)
              );

              return (
                <div
                  key={step.id}
                  onClick={hasAction ? () => handleItemClick(step) : undefined}
                  role={hasAction ? "button" : undefined}
                  tabIndex={hasAction ? 0 : undefined}
                  className={cn(
                    "w-[200px] shrink-0 snap-start flex flex-col justify-between text-left p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-xs transition-all select-none",
                    hasAction && "cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800 active:scale-95 group"
                  )}
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-snug mt-1">
                      {step.description}
                    </p>
                  </div>
                  {step.actionLabel && hasAction && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      <span>{step.actionLabel}</span>
                      {step.actionType === "navigate" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-2">
            {NEXT_STEPS.map((step, idx) => (
              <span
                key={step.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === activeIndex
                    ? "w-4 bg-emerald-400"
                    : "w-1.5 bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>

        <div className="w-full space-y-2.5">
          <Button
            type="button"
            onClick={handleGoToCarteirinha}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 border-none cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Ver Carteirinha do Aluno</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => safeCloseDialog(onClose)}
            className="w-full h-11 text-slate-300 hover:text-white hover:bg-slate-800/80 font-bold text-sm rounded-xl transition-all active:scale-95 border border-slate-700/60 cursor-pointer"
          >
            <span>Continuar explorando</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
export default OnboardingSuccessDialog;
