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
      buttonBg: "bg-rose-600 hover:bg-rose-600/90 shadow-rose-600/20",
    },
    success: {
      icon: CheckCircle2,
      wrapperBg: "bg-emerald-50",
      borderColor: "border-emerald-200",
      iconWrapperBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-700",
      buttonBg: "bg-emerald-600 hover:bg-emerald-600/90 shadow-emerald-600/20",
    },
    error: {
      icon: AlertCircle,
      wrapperBg: "bg-rose-50",
      borderColor: "border-rose-200",
      iconWrapperBg: "bg-rose-100",
      iconColor: "text-rose-600",
      titleColor: "text-rose-900",
      descColor: "text-rose-700",
      buttonBg: "bg-rose-600 hover:bg-rose-600/90 shadow-rose-600/20",
    },
    info: {
      icon: UserPlus,
      wrapperBg: "bg-blue-50 shadow-sm",
      borderColor: "border-blue-100",
      iconWrapperBg: "bg-blue-100/50 border border-blue-200/50",
      iconColor: "text-[#1a3a5c]",
      titleColor: "text-[#1a3a5c] tracking-tight",
      descColor: "text-slate-600 leading-relaxed",
      buttonBg: "bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 shadow-[#1a3a5c]/20",
    },
  };

  const style = types[type] || types.info;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "mb-6 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500",
        style.wrapperBg,
        style.borderColor,
        className
      )}
    >
      <div className="flex items-center gap-4 flex-1 w-full">
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
          <p className={cn("text-[11px] mt-0.5", style.descColor)}>{description}</p>
        </div>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className={cn(
            "h-11 px-4 md:px-5 text-white text-[13px] font-bold rounded-xl transition-all shadow-sm shrink-0 active:scale-95 flex items-center justify-center w-full sm:w-auto",
            style.buttonBg
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

