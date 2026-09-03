import React, { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, Info, Loader2, X, XCircle } from "lucide-react";
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
  className?: string;
  contentClassName?: string;
}

const VARIANT_CONFIG: Record<
  BannerVariant,
  {
    container: string;
    iconBox: string;
    title: string;
    description: string;
    chevron: string;
    defaultIcon: ReactNode;
    actionButton: string;
    dismissButton: string;
  }
> = {
  info: {
    container: "bg-blue-50/80 border-blue-100/90 text-blue-900",
    iconBox: "bg-blue-100/60 text-[#1a3a5c] border-blue-200/60",
    title: "text-[#1a3a5c]",
    description: "text-slate-600",
    chevron: "text-blue-400 group-hover:text-[#1a3a5c]",
    defaultIcon: <Info className="w-5 h-5" />,
    actionButton: "bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90 shadow-xs shadow-[#1a3a5c]/20",
    dismissButton: "text-blue-400 hover:text-blue-700 hover:bg-blue-100/60",
  },
  warning: {
    container: "bg-amber-50/90 border-amber-200/80 text-amber-950",
    iconBox: "bg-amber-100/80 text-amber-600 border-amber-200/60",
    title: "text-amber-950",
    description: "text-amber-900/80",
    chevron: "text-amber-400 group-hover:text-amber-600",
    defaultIcon: <AlertTriangle className="w-5 h-5" />,
    actionButton: "bg-amber-500 text-white hover:bg-amber-600 shadow-xs shadow-amber-200/50",
    dismissButton: "text-amber-400 hover:text-amber-700 hover:bg-amber-100/60",
  },
  neutral: {
    container: "bg-slate-50 border-slate-200 text-slate-900",
    iconBox: "bg-slate-200/80 text-slate-600 border-slate-300/50",
    title: "text-slate-900",
    description: "text-slate-600",
    chevron: "text-slate-400 group-hover:text-slate-600",
    defaultIcon: <AlertCircle className="w-5 h-5" />,
    actionButton: "bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90 shadow-xs shadow-slate-200/50",
    dismissButton: "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
  },
  success: {
    container: "bg-emerald-50/90 border-emerald-200/80 text-emerald-950",
    iconBox: "bg-emerald-100/80 text-emerald-600 border-emerald-200/60",
    title: "text-emerald-950",
    description: "text-emerald-800",
    chevron: "text-emerald-400 group-hover:text-emerald-600",
    defaultIcon: <CheckCircle2 className="w-5 h-5" />,
    actionButton: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs shadow-emerald-200/50",
    dismissButton: "text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100/60",
  },
  danger: {
    container: "bg-rose-50/90 border-rose-200/80 text-rose-950",
    iconBox: "bg-rose-100/80 text-rose-600 border-rose-200/60",
    title: "text-rose-900",
    description: "text-rose-700/90",
    chevron: "text-rose-400 group-hover:text-rose-600",
    defaultIcon: <AlertCircle className="w-5 h-5" />,
    actionButton: "bg-rose-600 text-white hover:bg-rose-700 shadow-xs shadow-rose-200/50",
    dismissButton: "text-rose-400 hover:text-rose-700 hover:bg-rose-100/60",
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
  className,
  contentClassName,
}: BannerProps) {
  const config = VARIANT_CONFIG[variant];
  const renderedIcon = icon === undefined ? config.defaultIcon : icon;

  const isClickable = !action && Boolean(onClick);

  const content = (
    <>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(e);
          }}
          title="Fechar aviso"
          className={cn(
            "absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-lg transition-colors z-10 cursor-pointer",
            config.dismissButton
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div
        className={cn(
          "flex items-center gap-3.5 flex-1 w-full min-w-0",
          onDismiss && "pr-6 sm:pr-8",
          contentClassName
        )}
      >
        {renderedIcon !== null && (
          <div
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-xl shrink-0 border transition-transform",
              isClickable && "group-hover:scale-105",
              config.iconBox
            )}
          >
            {renderedIcon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn("text-[13px] font-bold tracking-tight leading-snug", config.title)}>
              {title}
            </p>
          )}
          {description && (
            <div className={cn("text-[11px] leading-tight font-medium mt-0.5", config.description)}>
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
            "h-11 px-4 md:px-5 text-xs sm:text-[13px] font-bold rounded-xl transition-all shadow-xs shrink-0 active:scale-95 w-full sm:w-auto flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            onDismiss && "sm:mr-8",
            config.actionButton,
            action.className
          )}
        >
          {action.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            action.label
          )}
        </button>
      )}

      {isClickable && (
        <div className="shrink-0 pl-1 flex items-center">
          <ChevronRight className={cn("w-5 h-5 transition-all duration-200 group-hover:translate-x-0.5", config.chevron)} />
        </div>
      )}
    </>
  );

  const containerClasses = cn(
    "relative p-4 rounded-2xl border shadow-xs animate-in fade-in slide-in-from-top-2 duration-500",
    action
      ? "flex flex-col sm:flex-row items-start sm:items-center gap-4"
      : "flex flex-row items-center justify-between gap-3 sm:gap-4",
    isClickable && "cursor-pointer group hover:shadow-xs active:scale-[0.99] text-left w-full",
    config.container,
    className
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={containerClasses}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={containerClasses}>
      {content}
    </div>
  );
}
