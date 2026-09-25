import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe?: () => void;
  className?: string;
}

const BENEFICIOS_TRIAL = [
  "Cobrança automática para os pais no WhatsApp",
  "Saber rapidamente quem pagou e quem não pagou",
  "Saber exatamente o lucro real que sobra no bolso",
  "Contratos digitais para todos alunos, sem papel",
  "Rotas organizadas e chamada na porta da escola",
  "Todos os alunos e escolas cadastrados sem limite",
  "Recibos prontos com apenas 1 toque na tela",
  "App para os pais com recibo, contrato e rotas",
];

export const TrialBanner = ({ daysLeft, onSubscribe, className }: TrialBannerProps) => {
  const isLastDay = daysLeft <= 0;
  const isSingleDay = daysLeft === 1;

  const trialDaysText = isLastDay
    ? "Último dia grátis"
    : isSingleDay
      ? "Resta 1 dia grátis"
      : `Restam ${daysLeft} dias grátis`;

  const title = isLastDay
    ? "Último dia de teste! Escolha seu plano"
    : "Escolha o plano ideal para a sua van";

  return (
    <div
      className={cn(
        "bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 relative w-full",
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        <div className="order-1 lg:order-1 lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 lg:gap-4">
            <div className="w-[48px] h-[48px] rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <div className="bg-[#15469C] rounded-full p-2 flex items-center justify-center shadow-xs">
                <Sparkles className="w-[18px] h-[18px] text-white fill-white" strokeWidth={1} />
              </div>
            </div>
            <div>
              <h3 className="text-[18px] sm:text-[20px] font-black text-[#15469C] leading-tight tracking-tight font-headline">
                {title}
              </h3>
            </div>
          </div>
        </div>

        {onSubscribe && (
          <div className="order-2 lg:order-2 lg:col-span-5 lg:row-span-2 flex flex-col justify-center items-center w-full p-0 lg:p-6 lg:bg-slate-50/60 lg:rounded-2xl lg:border lg:border-slate-100/80 text-center space-y-2 lg:space-y-2.5 h-full">
            <Button
              type="button"
              onClick={onSubscribe}
              className="w-full sm:w-auto lg:w-full h-11 sm:h-12 px-6 rounded-xl bg-[#15469C] hover:bg-[#10387a] text-white font-headline font-bold text-sm shadow-md shadow-[#15469C]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Planos</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p
              className={cn(
                "text-xs font-semibold tracking-tight",
                isLastDay ? "text-blue-600" : "text-amber-700"
              )}
            >
              {trialDaysText}
            </p>
          </div>
        )}

        <div className="order-3 lg:order-3 lg:col-span-7 border-t border-slate-100/90 pt-3.5 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center lg:text-left">
            Tudo o que resolvemos para você:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {BENEFICIOS_TRIAL.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-700">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2 h-2 stroke-[3]" />
                </div>
                <span className="leading-snug">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
