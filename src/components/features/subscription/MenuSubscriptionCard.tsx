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
        "group relative flex items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-[20px] border shadow-xs hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer bg-white",
        isExpired
          ? "bg-gradient-to-r from-red-50 via-red-50/50 to-white border-red-200 hover:border-red-300"
          : isAmber
            ? "bg-gradient-to-r from-amber-50 via-amber-50/50 to-white border-amber-200 hover:border-amber-300"
            : "bg-gradient-to-r from-blue-50/80 via-blue-50/30 to-white border-blue-200 hover:border-blue-300",
        className
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105",
            isExpired
              ? "bg-red-100/70 text-red-700 border-red-200"
              : isAmber
                ? "bg-amber-100/70 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-600 border-blue-200/80"
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
