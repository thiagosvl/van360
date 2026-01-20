import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowRight, CheckCircle2, UserPlus, Wallet } from "lucide-react";

interface DashboardStatusCardProps {
  type: "pending" | "success" | "error" | "info";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  // Removed progress/steps props as they belong to QuickStartCard
  className?: string;
}

export const DashboardStatusCard = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: DashboardStatusCardProps) => {
  const styles = {
    pending: {
      bg: "bg-orange-50",
      border: "border-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      titleColor: "text-orange-900",
      descColor: "text-orange-700",
      btnVariant: "default",
      btnClass: "bg-orange-500 hover:bg-orange-600 text-white border-none",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      descColor: "text-emerald-700",
      btnVariant: "outline",
      btnClass: "border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      descColor: "text-red-700",
      btnVariant: "destructive",
      btnClass: "bg-red-600 hover:bg-red-700 text-white border-none",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      descColor: "text-blue-700",
      btnVariant: "default",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white border-none",
    },
  };

  const style = styles[type];

  if (!style) {
    console.error(`StatusCard: Invalid type "${type}"`);
    return null;
  }

  return (
    <Card
      className={cn(
        "border shadow-sm rounded-2xl overflow-hidden",
        style.bg,
        style.border
      )}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              style.iconBg,
              style.iconColor
            )}
          >
            {type === "pending" && <Wallet className="h-5 w-5" />}
            {type === "success" && <CheckCircle2 className="h-5 w-5" />}
            {type === "error" && <AlertCircle className="h-5 w-5" />}
            {type === "info" && <UserPlus className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                "font-bold text-lg leading-tight",
                style.titleColor
              )}
            >
              {title}
            </h3>
            <p className={cn("text-sm mt-1 mb-3", style.descColor)}>
              {description}
            </p>

            {actionLabel && (
              <Button
                size="sm"
                variant={
                  style.btnVariant as
                    | "default"
                    | "destructive"
                    | "outline"
                    | "secondary"
                    | "ghost"
                    | "link"
                }
                className={cn(
                  "h-9 px-4 rounded-xl font-semibold",
                  style.btnClass
                )}
                onClick={onAction}
              >
                {actionLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
