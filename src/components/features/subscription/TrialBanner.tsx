import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe?: () => void;
  className?: string;
}

export const TrialBanner = ({ daysLeft, onSubscribe, className }: TrialBannerProps) => {
  const isLastDay = daysLeft <= 1;
  const isUrgent = daysLeft <= 3;

  const titleText = isLastDay
    ? "Último dia grátis"
    : `Restam ${daysLeft} dias grátis`;

  const descriptionText = isUrgent
    ? "Evite perder o acesso"
    : "Escolha seu plano";

  const isAmber = isUrgent;

  return (
    <div
      className={cn(
        "rounded-[20px] p-3 sm:p-3.5 shadow-xs border transition-all relative w-full flex items-center justify-between gap-2.5 sm:gap-3",
        isAmber
          ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-500/30"
          : "bg-gradient-to-r from-primary/10 via-primary/5 to-white border-primary/25",
        className
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] flex items-center justify-center shrink-0 border transition-transform duration-200",
            isAmber
              ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
              : "bg-primary/10 text-primary border-primary/20"
          )}
        >
          <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="flex flex-col min-w-0 text-left">
          <span
            className={cn(
              "text-xs sm:text-[13px] font-bold tracking-tight leading-tight whitespace-nowrap",
              isAmber
                ? "text-amber-800"
                : "text-[#0a0a0a]"
            )}
          >
            {titleText}
          </span>

          <p className="text-[11px] sm:text-xs text-[#737373] font-normal leading-tight mt-0.5 whitespace-nowrap">
            {descriptionText}
          </p>
        </div>
      </div>

      {onSubscribe && (
        <Button
          type="button"
          onClick={onSubscribe}
          className={cn(
            "h-auto px-3 py-1.5 rounded-[12px] font-semibold text-xs shadow-2xs active:scale-[0.98] transition-all flex items-center justify-center shrink-0 cursor-pointer",
            isAmber
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-primary hover:bg-primary-hover text-white"
          )}
        >
          <span>Planos</span>
        </Button>
      )}
    </div>
  );
};
