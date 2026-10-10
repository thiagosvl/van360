import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe?: () => void;
  className?: string;
}

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
        "bg-white rounded-[24px] p-4 sm:p-5 lg:p-6 shadow-xs border border-[#e5e5e5] relative w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
        <div className="w-[48px] h-[48px] rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <div className="bg-primary rounded-full p-2 flex items-center justify-center shadow-xs">
            <Sparkles className="w-[18px] h-[18px] text-white fill-white" strokeWidth={1} />
          </div>
        </div>
        <div>
          <h3 className="text-[17px] sm:text-[19px] font-semibold text-[#0a0a0a] leading-tight tracking-tight font-headline">
            {title}
          </h3>
          <p
            className={cn(
              "text-xs font-semibold tracking-tight mt-1",
              isLastDay ? "text-[#e7000b]" : "text-amber-700"
            )}
          >
            {trialDaysText}
          </p>
        </div>
      </div>

      {onSubscribe && (
        <div className="w-full sm:w-auto shrink-0">
          <Button
            type="button"
            onClick={onSubscribe}
            className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-[18px] bg-primary hover:bg-primary-hover text-white font-headline font-semibold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ver Planos</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

