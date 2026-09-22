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
      pulseBg: "bg-blue-500",
      pingBg: "bg-blue-400",
      text: "Último dia de teste",
      styles: "bg-blue-50 text-blue-700 border-blue-200/80",
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
    ? "Continue usando o Van360 sem interrupções"
    : isSingleDay
      ? "Garanta o plano ideal para a sua rotina"
      : "Gostando da facilidade do Van360?";

  const description = isLastDay
    ? "Escolha seu plano e mantenha suas cobranças no WhatsApp, contratos digitais e controle de alunos sempre ativos."
    : isSingleDay
      ? "Mantenha suas cobranças automáticas e o controle de alunos funcionando sem pausas no seu dia a dia."
      : "Conheça nossos planos e garanta que sua van continue com cobranças automáticas, contratos sem papel e total controle financeiro.";

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-gradient-to-br from-white via-white p-5 sm:p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300",
        isLastDay ? "to-blue-50/20" : "to-amber-50/25",
        className
      )}
    >
      <div
        className={cn(
          "absolute right-0 top-0 w-36 h-36 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10",
          isLastDay ? "bg-blue-200/15" : "bg-amber-200/15"
        )}
      />

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

        {onSubscribe && (
          <div className="pt-1">
            <Button
              type="button"
              onClick={onSubscribe}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#1a3a5c] hover:bg-[#142e4a] text-white font-headline font-bold text-sm shadow-md shadow-[#1a3a5c]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Planos</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="border-t border-slate-100/90 pt-3.5 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tudo o que resolvemos para você:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {BENEFICIOS_TRIAL.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2.5 text-[11px] sm:text-xs text-slate-700">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2 h-2 stroke-[3]" />
                </div>
                <span className="leading-snug">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100/90 pt-2.5">
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
            Seus dados ficam seguros • Suporte no WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
};
