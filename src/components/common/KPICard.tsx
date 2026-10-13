import { cn } from "@/lib/utils";
import { KPICardVariant } from "@/types/enums";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface KPICardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  variant?: KPICardVariant;
  className?: string;
  countLabel?: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  loading?: boolean;
}

const variants = {
  [KPICardVariant.PRIMARY]: "bg-white border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]",
  [KPICardVariant.OUTLINE]: "bg-white border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]",
};

export function KPICard({
  label,
  value,
  icon: Icon,
  variant = KPICardVariant.OUTLINE,
  countLabel,
  className,
  labelClassName,
  valueClassName,
  loading = false,
}: KPICardProps) {
  const getDynamicFontSize = () => {
    if (typeof value !== "string") return "text-[18px] sm:text-[22px] md:text-[24px]";

    const cleanValue = value.replace(/[^\d,]/g, "").replace(",", ".");
    const num = parseFloat(cleanValue);

    if (isNaN(num)) {
      if (value.length > 13) return "text-[13px] sm:text-[16px]";
      if (value.length > 10) return "text-[15px] sm:text-[18px] md:text-[20px]";
      return "text-[17px] sm:text-[20px] md:text-[22px]";
    }

    if (num <= 999.99) return "text-[20px] sm:text-[24px] md:text-[26px]";
    if (num <= 9999.99) return "text-[18px] sm:text-[22px] md:text-[24px]";
    return "text-[16px] sm:text-[19px] md:text-[22px]";
  };

  if (loading) {
    return (
      <div className={cn("p-3.5 sm:p-5 rounded-[24px] flex flex-col justify-between transition-all border animate-pulse min-h-[96px]", variants[variant], className)}>
        <div className="flex items-start justify-between gap-1.5 mb-2 min-h-[30px] sm:min-h-[34px]">
          <div className="h-3.5 w-20 bg-[#f5f5f5] rounded-[6px]" />
          {Icon && <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#f5f5f5] rounded-[8px] sm:rounded-[10px] shrink-0 mt-0.5" />}
        </div>
        <div className="flex items-baseline justify-between gap-2 mt-1">
          <div className="h-7 w-24 bg-[#f5f5f5] rounded-[10px]" />
          {countLabel && <div className="h-3 w-10 bg-[#f5f5f5] rounded-[6px]" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-3.5 sm:p-5 rounded-[24px] flex flex-col justify-between transition-all border",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-1.5 mb-2 min-h-[30px] sm:min-h-[34px]">
        <span
          className={cn(
            "text-[10px] sm:text-[11px] font-medium text-[#737373] uppercase tracking-[0.03em] leading-snug line-clamp-2",
            labelClassName
          )}
        >
          {label}
        </span>
        {Icon && (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] sm:rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] shrink-0 mt-0.5">
            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-1.5">
        <h3
          className={cn(
            getDynamicFontSize(),
            "font-semibold text-[#0a0a0a] tracking-tight leading-none whitespace-nowrap",
            valueClassName
          )}
        >
          {value}
        </h3>
        {countLabel && (
          <div className="shrink-0">
            {countLabel}
          </div>
        )}
      </div>
    </div>
  );
}
