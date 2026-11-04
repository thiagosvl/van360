import { Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface MenuSubscriptionCardProps {
  trialDaysLeft: number | null;
  isExpired?: boolean;
  className?: string;
}

export function MenuSubscriptionCard({
  trialDaysLeft,
  isExpired = false,
  className,
}: MenuSubscriptionCardProps) {
  const isLastDay = !isExpired && trialDaysLeft !== null && trialDaysLeft <= 1;
  const isUrgent = !isExpired && trialDaysLeft !== null && trialDaysLeft <= 3;

  const titleText = isExpired
    ? "Acesso suspenso"
    : isLastDay
      ? "Último dia grátis"
      : trialDaysLeft !== null
        ? `Restam ${trialDaysLeft} dias grátis`
        : "Acesso liberado";

  const descriptionText = isExpired
    ? "Escolha um plano"
    : isUrgent
      ? "Evite perder o acesso"
      : "Escolha seu plano";

  const buttonText = isExpired ? "Reativar" : "Planos";

  const isAmber = !isExpired && isUrgent;

  return (
    <Link
      to={ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION}
      className={cn(
        "group relative flex items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-[20px] border shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer",
        isExpired
          ? "bg-gradient-to-r from-red-500/10 via-red-500/5 to-white border-red-500/30 hover:border-red-500/40"
          : isAmber
            ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-500/30 hover:border-amber-500/40"
            : "bg-gradient-to-r from-primary/10 via-primary/5 to-white border-primary/25 hover:border-primary/40",
        className
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105",
            isExpired
              ? "bg-red-500/10 text-red-700 border-red-500/20"
              : isAmber
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
              isExpired
                ? "text-red-700"
                : isAmber
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

      <div
        className={cn(
          "inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-[12px] shadow-2xs shrink-0 transition-all",
          isExpired
            ? "bg-red-600 hover:bg-red-700 text-white"
            : isAmber
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-primary hover:bg-primary-hover text-white"
        )}
      >
        <span>{buttonText}</span>
      </div>
    </Link>
  );
}
