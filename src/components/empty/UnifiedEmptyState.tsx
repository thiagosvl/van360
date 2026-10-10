import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface UnifiedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
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
  return (
    <Card className={`rounded-[24px] border border-[#e5e5e5] bg-white shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] ${className || ""}`}>
      <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center p-6 sm:p-8">
        <div className="w-14 h-14 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center mb-4 text-[#0a0a0a]">
          <Icon className={`w-7 h-7 text-[#0a0a0a] ${iconClassName || ""}`} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight mb-1.5">{title}</h3>
        <div className="text-xs sm:text-sm text-[#737373] max-w-sm mx-auto leading-relaxed mb-6">
          {description}
        </div>
        {action && (
          <Button
            className="h-10 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm px-5 border-none shadow-xs transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
            onClick={action.onClick}
          >
            {action.icon && <action.icon className="w-4 h-4 shrink-0 text-primary-foreground" />}
            <span>{action.label}</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
