import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface BenefitItemProps {
  text: string;
  description?: string;
  included?: boolean;
}

export function BenefitItem({
  text,
  description,
  included = true,
}: BenefitItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          included ? "bg-cyan-50 text-cyan-600" : "bg-red-50 text-red-500"
        )}
      >
        {included ? (
          <Check className="w-5 h-5" strokeWidth={2.5} />
        ) : (
          <X className="w-5 h-5" strokeWidth={2.5} />
        )}
      </div>
      <div className="flex-1 pt-0.5">
        <p
          className={cn(
            "text-sm font-bold leading-tight",
            included ? "text-gray-900" : "text-gray-400 line-through"
          )}
        >
          {text}
        </p>
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
