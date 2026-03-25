import { cn } from "@/lib/utils";
import { memo } from "react";

export enum KPICardVariant {
  PRIMARY = "primary",
  OUTLINE = "outline"
}

interface KPICardProps {
  title: string;
  value: number;
  count: number;
  variant?: KPICardVariant;
  className?: string;
}

export const KPICard = memo(function KPICard({
  title,
  value,
  variant = KPICardVariant.OUTLINE,
  className,
}: KPICardProps) {
  const isPrimary = variant === KPICardVariant.PRIMARY;

  return (
    <div
      className={cn(
        "rounded-2xl px-5 py-6 flex flex-col justify-center gap-1 transition-all duration-300",
        isPrimary 
          ? "bg-[#1a3a5c] text-white shadow-lg shadow-navy/20" 
          : "bg-white text-gray-900 shadow-diff-shadow border border-gray-100/50",
        className
      )}
    >
      <p className={cn(
          "text-[9px] font-bold uppercase tracking-[0.1em] mb-1 opacity-70",
          isPrimary ? "text-white" : "text-gray-400"
      )}>
        {title}
      </p>

      <span className="text-xl font-headline font-extrabold leading-tight tracking-tight">
        {Number(value).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </span>
    </div>
  );
});
