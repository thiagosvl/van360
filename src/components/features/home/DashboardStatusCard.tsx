import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, UserPlus, Wallet } from "lucide-react";

interface DashboardStatusCardProps {
  type: "pending" | "success" | "error" | "info";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const DashboardStatusCard = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: DashboardStatusCardProps) => {
  const types = {
    pending: {
      icon: Wallet,
      wrapperBg: "bg-rose-50",
      borderColor: "border-rose-200",
      iconWrapperBg: "bg-rose-100",
      iconColor: "text-rose-600",
      titleColor: "text-rose-900",
      descColor: "text-rose-700",
      buttonBg: "bg-rose-600 hover:bg-rose-600/90 shadow-rose-200",
    },
    success: {
      icon: CheckCircle2,
      wrapperBg: "bg-emerald-50",
      borderColor: "border-emerald-200",
      iconWrapperBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-700",
      buttonBg: "bg-emerald-600 hover:bg-emerald-600/90 shadow-emerald-200",
    },
    error: {
      icon: AlertCircle,
      wrapperBg: "bg-rose-50",
      borderColor: "border-rose-200",
      iconWrapperBg: "bg-rose-100",
      iconColor: "text-rose-600",
      titleColor: "text-rose-900",
      descColor: "text-rose-700",
      buttonBg: "bg-rose-600 hover:bg-rose-600/90 shadow-rose-200",
    },
    info: {
      icon: UserPlus,
      wrapperBg: "bg-blue-50",
      borderColor: "border-blue-200",
      iconWrapperBg: "bg-blue-100",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      descColor: "text-blue-700",
      buttonBg: "bg-blue-600 hover:bg-blue-600/90 shadow-blue-200",
    },
  };

  const style = types[type] || types.info;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "mb-6 border rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500",
        style.wrapperBg,
        style.borderColor,
        className
      )}
    >
      <div
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-xl shrink-0",
          style.iconWrapperBg,
          style.iconColor
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className={cn("text-xs font-bold", style.titleColor)}>{title}</p>
        <p className={cn("text-[11px]", style.descColor)}>{description}</p>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className={cn(
            "px-4 py-2 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm shrink-0 active:scale-95 flex items-center gap-1",
            style.buttonBg
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

