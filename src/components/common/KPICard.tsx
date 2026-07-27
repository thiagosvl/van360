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
  [KPICardVariant.PRIMARY]: "bg-white border-slate-100/50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]",
  [KPICardVariant.OUTLINE]: "bg-white border-slate-100/50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]",
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
    if (typeof value !== "string") return "text-[18px] sm:text-[22px]";

    const cleanValue = value.replace(/[^\d,]/g, "").replace(",", ".");
    const num = parseFloat(cleanValue);

    if (isNaN(num)) {
      if (value.length > 13) return "text-[14px] sm:text-[18px]";
      if (value.length > 10) return "text-[16px] sm:text-[20px]";
      return "text-[18px] sm:text-[22px]";
    }

    if (num <= 999.99) return "text-[20px] sm:text-[24px]";
    if (num <= 9999.99) return "text-[18px] sm:text-[22px]";
    return "text-[16px] sm:text-[20px]";
  };

  if (loading) {
    return (
      <div className={cn("p-5 rounded-3xl flex flex-col transition-all border animate-pulse min-h-[96px]", variants[variant], className)}>
        <div className="flex items-center gap-1.5 mb-1">
          {Icon && <div className="w-4 h-4 bg-slate-100 rounded-full" />}
          <div className="h-3.5 w-20 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <div className="h-6 w-28 bg-slate-100 rounded-md" />
          {countLabel && <div className="h-3 w-12 bg-slate-100 rounded-md" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-5 rounded-[24px] flex flex-col transition-all border",
        variants[variant],
        className
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <span
          className={cn(
            "text-[12px] sm:text-[13px] font-medium text-slate-600",
            labelClassName
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <h3
          className={cn(
            getDynamicFontSize(),
            "font-bold text-slate-800 tracking-tight leading-none",
            valueClassName
          )}
        >
          {value}
        </h3>
        {countLabel && (
          <span className="text-[11px] font-semibold text-slate-400">
            {countLabel}
          </span>
        )}
      </div>
    </div>
  );
}
