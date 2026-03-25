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
  [KPICardVariant.PRIMARY]: "bg-[#f4f7f9] border-[#1a3a5c]/10 text-[#1a3a5c] shadow-sm",
  [KPICardVariant.OUTLINE]: "bg-white border-gray-100/50 text-[#1a3a5c] shadow-diff-shadow",
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
  return (
    <div
      className={cn(
        "p-4 rounded-xl flex flex-col transition-all border",
        variants[variant],
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon className={cn("w-3 h-3 opacity-30")} />}
        <span className={cn("text-[10px] font-headline font-bold uppercase tracking-[0.15em] opacity-40", labelClassName)}>
          {label}
        </span>
      </div>
      
      <div className="flex items-baseline gap-2">
        {loading ? (
          <div className="h-7 w-24 bg-gray-100 animate-pulse rounded-lg mt-1" />
        ) : (
          <h3 className={cn("text-[22px] font-headline font-black leading-tight tracking-tight", valueClassName)}>
            {value}
          </h3>
        )}
        {countLabel && !loading && (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-40">
            {countLabel}
          </span>
        )}
      </div>
    </div>
  );
}
