import React, { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant = "info" | "warning" | "neutral" | "success" | "danger";

export interface BannerAction {
  label: string;
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export interface BannerProps {
  variant?: BannerVariant;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode | null;
  action?: BannerAction;
  onClick?: (e?: React.MouseEvent) => void;
  onDismiss?: (e?: React.MouseEvent) => void;
  dismissPosition?: "default" | "floating";
  className?: string;
  contentClassName?: string;
}

const VARIANT_CONFIG: Record<
  BannerVariant,
  {
    container: string;
    title: string;
    description: string;
    chevron: string;
    defaultIcon: ReactNode;
    actionButton: string;
    dismissButton: string;
  }
> = {
  info: {
    container: "bg-primary/[0.06] hover:bg-primary/[0.08] dark:bg-primary/10 dark:hover:bg-primary/15 border-primary/20 dark:border-primary/30 text-foreground",
    title: "text-foreground font-semibold",
    description: "text-muted-foreground",
    chevron: "text-primary/70 group-hover:text-primary",
    defaultIcon: <Info className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-primary shrink-0" />,
    actionButton: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs",
    dismissButton: "text-primary/60 hover:text-primary hover:bg-primary/10",
  },
  warning: {
    container: "bg-amber-500/[0.08] hover:bg-amber-500/[0.11] dark:bg-amber-500/10 dark:hover:bg-amber-500/15 border-amber-500/25 dark:border-amber-500/30 text-foreground",
    title: "text-foreground font-semibold",
    description: "text-muted-foreground",
    chevron: "text-amber-600/70 group-hover:text-amber-600",
    defaultIcon: <AlertTriangle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-500 shrink-0" />,
    actionButton: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs",
    dismissButton: "text-amber-600/60 hover:text-amber-700 hover:bg-amber-500/15",
  },
  neutral: {
    container: "bg-[#f5f5f5] hover:bg-[#eeeeee] dark:bg-secondary/40 dark:hover:bg-secondary/60 border-[#e5e5e5] dark:border-border text-foreground",
    title: "text-foreground font-semibold",
    description: "text-muted-foreground",
    chevron: "text-muted-foreground group-hover:text-foreground",
    defaultIcon: <Info className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-muted-foreground shrink-0" />,
    actionButton: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs",
    dismissButton: "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
  },
  success: {
    container: "bg-emerald-500/[0.08] hover:bg-emerald-500/[0.11] dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border-emerald-500/25 dark:border-emerald-500/30 text-foreground",
    title: "text-foreground font-semibold",
    description: "text-muted-foreground",
    chevron: "text-emerald-600/70 group-hover:text-emerald-600",
    defaultIcon: <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-500 shrink-0" />,
    actionButton: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-2xs",
    dismissButton: "text-emerald-600/60 hover:text-emerald-700 hover:bg-emerald-500/15",
  },
  danger: {
    container: "bg-destructive/[0.08] hover:bg-destructive/[0.11] dark:bg-destructive/10 dark:hover:bg-destructive/15 border-destructive/25 dark:border-destructive/30 text-foreground",
    title: "text-foreground font-semibold",
    description: "text-muted-foreground",
    chevron: "text-destructive/70 group-hover:text-destructive",
    defaultIcon: <AlertCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-destructive shrink-0" />,
    actionButton: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-2xs",
    dismissButton: "text-destructive/60 hover:text-destructive hover:bg-destructive/15",
  },
};

export function Banner({
  variant = "info",
  title,
  description,
  children,
  icon,
  action,
  onClick,
  onDismiss,
  dismissPosition = "default",
  className,
  contentClassName,
}: BannerProps) {
  const config = VARIANT_CONFIG[variant];
  const renderedIcon = icon === undefined ? config.defaultIcon : icon;
  const isClickable = !action && Boolean(onClick);

  const content = (
    <>
      <div
        className={cn(
          "flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0",
          contentClassName
        )}
      >
        {renderedIcon !== null && (
          <div className="shrink-0 mt-0.5 flex items-center justify-center">
            {renderedIcon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn("text-xs sm:text-[13px] font-semibold tracking-tight leading-snug", config.title)}>
              {title}
            </p>
          )}
          {description && (
            <div className={cn("text-xs sm:text-[13px] leading-relaxed font-normal", title && "mt-0.5", config.description)}>
              {description}
            </div>
          )}
          {children}
        </div>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled || action.isLoading}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-[10px] transition-all shrink-0 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-center",
            config.actionButton,
            action.className
          )}
        >
          {action.isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            action.label
          )}
        </button>
      )}

      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(e);
          }}
          title="Fechar aviso"
          className={cn(
            "shrink-0 p-1 -mr-1 -mt-0.5 rounded-md transition-colors cursor-pointer self-start",
            config.dismissButton
          )}
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      )}

      {isClickable && (
        <div className="shrink-0 pl-0.5 self-center flex items-center">
          <ChevronRight className={cn("w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5", config.chevron)} />
        </div>
      )}
    </>
  );

  const containerClasses = cn(
    "relative py-2.5 px-3.5 sm:py-2.5 sm:px-4 rounded-[12px] border transition-all text-xs sm:text-[13px]",
    action
      ? "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3"
      : "flex flex-row items-start justify-between gap-2.5 sm:gap-3",
    isClickable && "cursor-pointer group text-left w-full active:scale-[0.99]",
    config.container,
    className
  );

  if (isClickable) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={containerClasses}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {content}
    </div>
  );
}
