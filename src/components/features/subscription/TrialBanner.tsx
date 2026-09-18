import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe?: () => void;
  className?: string;
}

const BENEFICIOS_TRIAL = [
  "Cobrança automática para os pais no WhatsApp",
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

  const badgeConfig = isLastDay
    ? {
      pulseBg: "bg-rose-500",
      pingBg: "bg-rose-400",
      text: "Último dia de teste",
      styles: "bg-rose-50 text-rose-700 border-rose-200/80",
    }
    : isSingleDay
      ? {
        pulseBg: "bg-amber-500",
        pingBg: "bg-amber-400",
        text: "1 dia restante",
        styles: "bg-amber-50 text-amber-800 border-amber-200/80",
      }
      : {
        pulseBg: "bg-amber-500",
        pingBg: "bg-amber-400",
        text: `${daysLeft} dias restantes`,
        styles: "bg-amber-50/90 text-amber-900 border-amber-200/80",
      };

  const title = isLastDay
    ? "Hoje é seu último dia de teste grátis!"
    : isSingleDay
      ? "Seu teste gratuito encerra amanhã!"
      : "Gostando do app Van360?";

  const description = isLastDay
    ? "Seu teste termina hoje. Assine agora para manter o controle dos seus alunos e cobranças ativo sem travar."
    : isSingleDay
      ? "Aproveite as últimas horas de teste. Escolha seu plano agora para não perder o acesso às funcionalidades."
      : `O seu teste grátis é válido por mais ${daysLeft} dias. Escolha seu plano e garanta tudo o que o Van360 resolve na sua van:`;

  const buttonText = isLastDay
    ? "Assinar Agora"
    : isSingleDay
      ? "Garantir Assinatura"
      : "Escolher Meu Plano";

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-gradient-to-br from-white via-white to-amber-50/25 p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300",
        className
      )}
    >
      <div className="absolute right-0 top-0 w-36 h-36 bg-amber-200/15 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

      <div className="relative z-10 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs", badgeConfig.styles)}>
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", badgeConfig.pingBg)} />
                <span className={cn("relative inline-flex rounded-full h-2 w-2", badgeConfig.pulseBg)} />
              </span>
              <span>{badgeConfig.text}</span>
            </div>
          </div>

          <h3 className="font-headline font-bold text-lg sm:text-xl text-[#1a3a5c] tracking-tight leading-snug">
            {title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-100/90">
          {BENEFICIOS_TRIAL.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2.5 text-[11px] sm:text-xs text-slate-700">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2 h-2 stroke-[3]" />
              </div>
              <span className="leading-snug">{benefit}</span>
            </div>
          ))}
        </div>

        {onSubscribe && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100/90">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Seus dados ficam seguros • Suporte no WhatsApp
            </p>
            <Button
              type="button"
              onClick={onSubscribe}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#1a3a5c] hover:bg-[#142e4a] text-white font-headline font-bold text-sm shadow-md shadow-[#1a3a5c]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
