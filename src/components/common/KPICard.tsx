import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { cn } from "@/lib/utils";
import React from "react";

interface KPICardProps {
  title: string;
  value: number;
  count: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  className?: string;
  countLabel?: string;
}

export function KPICard({
  title,
  value,
  count,
  icon: Icon,
  colorClass,
  bgClass,
  className,
  countLabel = "Passageiro",
}: KPICardProps) {
  const animatedValue = useAnimatedNumber(value, 1000);
  const animatedCount = useAnimatedNumber(count, 1000);

  return (
    <div
      className={cn(
        "bg-white p-2 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 flex-1 min-w-[140px]",
        className
      )}
    >
      <div
        className={cn(
          "h-5 w-5 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <Icon className={cn("h-3 w-3 sm:h-5 sm:w-5", colorClass)} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
          {animatedValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
          {Math.round(animatedCount)}{" "}
          {Math.round(animatedCount) === 1 ? countLabel : `${countLabel}s`}
        </p>
      </div>
    </div>
  );
}
