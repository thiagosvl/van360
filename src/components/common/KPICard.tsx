import { cn } from "@/lib/utils";
import { KPICardVariant } from "@/types/enums";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  variant?: KPICardVariant;
  className?: string;
  countLabel?: string;
}

const variants = {
  [KPICardVariant.PRIMARY]: "bg-[#F8FAFB] border-[#1a3a5c]/10 text-[#1a3a5c] shadow-sm",
  [KPICardVariant.OUTLINE]: "bg-white border-gray-200/50 text-[#1a3a5c] shadow-diff-shadow",
};

export function KPICard({
  label,
  value,
  icon: Icon,
  variant = KPICardVariant.OUTLINE,
  countLabel,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl flex flex-col transition-all border",
        variants[variant],
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={cn("w-3.5 h-3.5 opacity-40")} />}
        <span className="text-[10px] font-headline font-bold uppercase tracking-widest opacity-40">
          {label}
        </span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-[22px] font-headline font-black leading-tight tracking-tight">
          {value}
        </h3>
        {countLabel && (
          <span className="text-[10px] font-medium opacity-30">
            {countLabel}
          </span>
        )}
      </div>
    </div>
  );
}
