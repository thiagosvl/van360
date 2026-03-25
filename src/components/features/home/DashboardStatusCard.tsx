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
  const getIcon = () => {
    switch (type) {
      case "pending": return Wallet;
      case "success": return CheckCircle2;
      case "error": return AlertCircle;
      case "info": return UserPlus;
      default: return AlertCircle;
    }
  };

  const Icon = getIcon();

  return (
    <div
      className={cn(
        "bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden relative",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 bg-slate-50/50 text-[#1a3a5c]",
          )}
        >
          <Icon className="h-5 w-5 opacity-70" />
        </div>
        <div className="flex-1">
          <h3 className="font-headline font-bold text-[#1a3a5c] text-lg leading-tight">
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1 mb-4 leading-relaxed opacity-80">
            {description}
          </p>

          {actionLabel && (
            <Button
              size="sm"
              className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#1a3a5c]/10"
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
