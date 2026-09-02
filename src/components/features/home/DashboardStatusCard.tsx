import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ChevronRight, UserPlus, Wallet } from "lucide-react";

interface DashboardStatusCardProps {
  type: "pending" | "success" | "error" | "info";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onClick?: () => void;
  className?: string;
}

export const DashboardStatusCard = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  onClick,
  className,
}: DashboardStatusCardProps) => {
  const types = {
    pending: {
      icon: AlertCircle,
      wrapperBg: "bg-rose-50/90 hover:bg-rose-50",
      borderColor: "border-rose-200/80",
      iconWrapperBg: "bg-rose-100",
      iconColor: "text-rose-600",
      titleColor: "text-rose-900",
      descColor: "text-rose-700/90",
      chevronColor: "text-rose-400 group-hover:text-rose-600",
      buttonBg: "bg-rose-600 hover:bg-rose-600/90 shadow-rose-600/20",
    },
    success: {
      icon: CheckCircle2,
      wrapperBg: "bg-emerald-50/90 hover:bg-emerald-50",
      borderColor: "border-emerald-200/80",
      iconWrapperBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-700",
      chevronColor: "text-emerald-400 group-hover:text-emerald-600",
      buttonBg: "bg-emerald-600 hover:bg-emerald-600/90 shadow-emerald-600/20",
    },
    error: {
      icon: AlertCircle,
      wrapperBg: "bg-rose-50/90 hover:bg-rose-50",
      borderColor: "border-rose-200/80",
      iconWrapperBg: "bg-rose-100",
      iconColor: "text-rose-600",
      titleColor: "text-rose-900",
      descColor: "text-rose-700",
      chevronColor: "text-rose-400 group-hover:text-rose-600",
      buttonBg: "bg-rose-600 hover:bg-rose-600/90 shadow-rose-600/20",
    },
    info: {
      icon: UserPlus,
      wrapperBg: "bg-blue-50/90 hover:bg-blue-50 shadow-xs",
      borderColor: "border-blue-100",
      iconWrapperBg: "bg-blue-100/50 border border-blue-200/50",
      iconColor: "text-[#1a3a5c]",
      titleColor: "text-[#1a3a5c] tracking-tight",
      descColor: "text-slate-600 leading-relaxed",
      chevronColor: "text-slate-400 group-hover:text-[#1a3a5c]",
      buttonBg: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 shadow-[#1a3a5c]/20",
    },
  };

  const style = types[type] || types.info;
  const Icon = style.icon;
  const handleClick = onAction || onClick;
  const isClickableCard = !actionLabel && Boolean(handleClick);

  const cardContent = (
    <>
      <div className="flex items-center gap-3.5 sm:gap-4 flex-1 w-full min-w-0">
        <div
          className={cn(
            "h-10 w-10 flex items-center justify-center rounded-xl shrink-0 transition-transform",
            isClickableCard && "group-hover:scale-105",
            style.iconWrapperBg,
            style.iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-[13px] font-bold leading-snug", style.titleColor)}>{title}</p>
          {description && (
            <p className={cn("text-[11px] mt-0.5 leading-tight", style.descColor)}>{description}</p>
          )}
        </div>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "h-11 px-4 md:px-5 text-white text-[13px] font-bold rounded-xl transition-all shadow-xs shrink-0 active:scale-95 flex items-center justify-center w-full sm:w-auto",
            style.buttonBg
          )}
        >
          {actionLabel}
        </button>
      )}

      {isClickableCard && (
        <div className="shrink-0 pl-1 flex items-center">
          <ChevronRight
            className={cn(
              "w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5",
              style.chevronColor
            )}
          />
        </div>
      )}
    </>
  );

  const containerClasses = cn(
    "border rounded-2xl p-4 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 animate-in fade-in slide-in-from-top-2",
    isClickableCard && "cursor-pointer group hover:shadow-xs active:scale-[0.99] text-left w-full",
    style.wrapperBg,
    style.borderColor,
    className
  );

  if (isClickableCard) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={containerClasses}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={containerClasses}>
      {cardContent}
    </div>
  );
};

