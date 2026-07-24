import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AdminKpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  cardBorder?: string;
  iconBg?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AdminKpiCard({
  title,
  value,
  subtext,
  cardBorder = "border-slate-800 shadow-slate-900/50",
  iconBg = "bg-slate-800 text-slate-300 border-slate-700",
  icon,
  onClick,
  className,
}: AdminKpiCardProps) {
  const formattedValue = typeof value === "number" ? value.toLocaleString("pt-BR") : value;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "border rounded-2xl bg-[#131b2e] p-3.5 sm:p-5 relative overflow-hidden transition-all duration-200",
        cardBorder,
        onClick && "cursor-pointer hover:scale-[1.01] hover:brightness-110",
        className
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-tight">
            {title}
          </span>
          <p className="text-xl sm:text-3xl font-headline font-black text-white tracking-tight leading-none pt-0.5 break-words">
            {formattedValue}
          </p>
          {subtext && (
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-1 leading-tight">
              {subtext}
            </p>
          )}
        </div>
        <div className={cn("p-1.5 sm:p-2.5 rounded-xl border shrink-0 flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
