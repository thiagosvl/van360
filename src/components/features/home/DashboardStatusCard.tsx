import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowRight, CheckCircle2, UserPlus, Wallet } from "lucide-react";

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
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      bg: "bg-gradient-to-br from-rose-50/50 to-white",
      borderColor: "border-rose-100",
      accent: "bg-rose-500",
      titleColor: "text-rose-900",
      buttonBg: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
    },
    success: {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      bg: "bg-gradient-to-br from-emerald-50/50 to-white",
      borderColor: "border-emerald-100",
      accent: "bg-emerald-500",
      titleColor: "text-emerald-900",
      buttonBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    },
    error: {
      icon: AlertCircle,
      iconBg: "bg-rose-100 text-rose-600 border-rose-200",
      bg: "bg-rose-50 text-rose-900",
      borderColor: "border-rose-200",
      accent: "bg-rose-600",
      titleColor: "text-rose-900",
      buttonBg: "bg-rose-600 hover:bg-rose-700",
    },
    info: {
      icon: UserPlus,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      bg: "bg-gradient-to-br from-blue-50/50 to-white",
      borderColor: "border-blue-100",
      accent: "bg-blue-500",
      titleColor: "text-blue-900",
      buttonBg: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    },
  };

  const style = types[type] || types.info;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "p-4 md:p-5 rounded-3xl border shadow-soft-xl overflow-hidden relative transition-all active:scale-[0.99]",
        style.bg,
        style.borderColor,
        className
      )}
    >
      <div className={cn("absolute top-0 left-0 bottom-0 w-1.5", style.accent)} />
      
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300",
            style.iconBg
          )}
        >
          <Icon className="h-5.5 w-5.5" />
        </div>
        <div className="flex-1">
          <h3 className={cn("font-headline font-black text-lg leading-tight", style.titleColor)}>
            {title}
          </h3>
          <p className="text-[13px] font-medium text-slate-500 mt-1 mb-4 leading-relaxed opacity-90">
            {description}
          </p>

          {actionLabel && (
            <Button
              size="sm"
              className={cn(
                "h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95",
                style.buttonBg,
                "text-white"
              )}
              onClick={onAction}
            >
              {actionLabel}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
