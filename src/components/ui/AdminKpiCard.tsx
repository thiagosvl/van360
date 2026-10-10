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
  cardBorder,
  iconBg,
  icon,
  onClick,
  className,
}: AdminKpiCardProps) {
  const formattedValue = typeof value === "number" ? value.toLocaleString("pt-BR") : value;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 sm:p-5 relative overflow-hidden transition-all duration-200 rounded-3xl bg-card border border-border shadow-xs",
        cardBorder,
        onClick && "cursor-pointer hover:border-primary/40 hover:scale-[1.01]",
        className
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-xs sm:text-[13px] font-medium text-muted-foreground block leading-tight truncate">
            {title}
          </span>
          <p className="text-2xl sm:text-3xl font-semibold font-headline text-foreground tracking-tight leading-none pt-0.5 truncate">
            {formattedValue}
          </p>
          {subtext && (
            <p className="text-[11px] sm:text-xs font-normal text-muted-foreground mt-1 leading-tight truncate" title={subtext}>
              {subtext}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-2xl border border-border/60 shrink-0 flex items-center justify-center bg-secondary/60 text-foreground", iconBg)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
