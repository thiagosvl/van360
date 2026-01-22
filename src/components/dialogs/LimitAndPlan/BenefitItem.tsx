import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface BenefitItemProps {
  text: string;
  description?: string;
  included?: boolean;
  badgeText?: string;
}

export function BenefitItem({
  text,
  description,
  included = true,
  badgeText,
}: BenefitItemProps) {
  // Cores contextuais baseadas no badge
  const iconColors = badgeText
    ? "bg-blue-50 text-blue-600"
    : included
    ? "bg-emerald-50 text-emerald-600"
    : "bg-red-50 text-red-500";

  return (
    <div className="flex items-start gap-3.5">
      {/* Ícone - Mobile First (maior e mais visível) */}
      <div
        className={cn(
          "w-8 h-8 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center shrink-0",
          iconColors
        )}
      >
        {included ? (
          <Check className="w-4.5 h-4.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
        ) : (
          <X className="w-4.5 h-4.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
        )}
      </div>

      {/* Texto - Mobile First (maior e mais legível) */}
      <div className="flex-1 pt-0.5">
        <p
          className={cn(
            "text-[15px] sm:text-sm font-semibold leading-tight",
            included ? "text-gray-900" : "text-gray-600"
          )}
        >
          {text}
        </p>
        
        {description && (
           <p className={cn("text-[13px] sm:text-xs leading-relaxed mt-1.5 block", 
             included ? "text-gray-600" : "text-gray-400"
           )}>
            {description}
          </p>
        )}

        {included && badgeText && (
          <span className="inline-block mt-2 px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-lg tracking-wide border border-blue-200">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
