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
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "w-7 h-7 rounded-xl flex items-center justify-center shrink-0",
          included ? "bg-cyan-50 text-cyan-600" : "bg-red-50 text-red-500"
        )}
      >
        {included ? (
          <Check className="w-4 h-4" strokeWidth={2.5} />
        ) : (
          <X className="w-4 h-4" strokeWidth={2.5} />
        )}
      </div>
      <div className="flex-1 pt-0.5">
        <p
          className={cn(
            "text-sm font-semibold leading-tight",
            included ? "text-gray-900" : "text-gray-600"
          )}
        >
          {text}
        </p>
        
        {description && (
           <p className={cn("text-xs leading-relaxed mt-1 block", 
             included ? "text-gray-500" : "text-gray-400"
           )}>
            {description}
          </p>
        )}

        {included && badgeText && (
          <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase rounded-md tracking-wide border border-gray-200">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
