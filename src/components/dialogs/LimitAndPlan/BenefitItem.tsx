import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface BenefitItemProps {
  text: string;
  included?: boolean;
}

export function BenefitItem({ text, included = true }: BenefitItemProps) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          included ? "bg-emerald-100/50" : "bg-red-100"
        )}
      >
        {included ? (
          <Check
            className="w-3.5 h-3.5 text-emerald-600"
            strokeWidth={3}
          />
        ) : (
          <X className="w-3.5 h-3.5 text-red-500" strokeWidth={3} />
        )}
      </div>
      <span
        className={cn(
          "text-sm leading-tight pt-0.5",
          included ? "text-gray-700 font-medium" : "text-gray-500"
        )}
      >
        {text}
      </span>
    </div>
  );
}
