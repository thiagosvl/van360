import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type UnifiedEmptyStateActionVariant = "tonal" | "neutral" | "primary";

export interface UnifiedEmptyStateAction {
  label: string;
  onClick: (e?: React.MouseEvent) => void;
  icon?: LucideIcon;
  variant?: UnifiedEmptyStateActionVariant;
  className?: string;
}

export interface UnifiedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  action?: UnifiedEmptyStateAction;
  className?: string;
  iconClassName?: string;
}

export function UnifiedEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
}: UnifiedEmptyStateProps) {
  const variant = action?.variant || "tonal";

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary hover:bg-primary-hover text-primary-foreground font-semibold border-none shadow-xs";
      case "neutral":
        return "bg-white dark:bg-card text-[#0a0a0a] dark:text-foreground border border-[#e5e5e5] dark:border-border hover:bg-[#fafafa] dark:hover:bg-accent/80 hover:border-[#737373]/40 font-medium shadow-xs";
      case "tonal":
      default:
        return "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/15 shadow-2xs font-medium";
    }
  };

  return (
    <Card
      className={cn(
        "rounded-[24px] border border-[#e5e5e5] bg-white shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center p-6 sm:p-8">
        <div className="w-14 h-14 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center mb-4 text-[#0a0a0a]">
          <Icon className={cn("w-7 h-7 text-[#0a0a0a]", iconClassName)} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight mb-1.5">
          {title}
        </h3>
        <div className="text-xs sm:text-sm text-[#737373] max-w-sm mx-auto leading-relaxed mb-6">
          {description}
        </div>
        {action && (
          <Button
            type="button"
            onClick={action.onClick}
            className={cn(
              "h-9 sm:h-10 rounded-[18px] text-xs sm:text-sm px-4 sm:px-5 transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 group",
              getVariantStyles(),
              action.className
            )}
          >
            {action.icon && (
              <action.icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  variant === "neutral"
                    ? "text-[#737373] dark:text-muted-foreground"
                    : "text-current"
                )}
              />
            )}
            <span>{action.label}</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
