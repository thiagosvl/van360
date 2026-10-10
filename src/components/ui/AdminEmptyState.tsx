import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string | ReactNode;
  action?: ReactNode;
  className?: string;
  iconClassName?: string;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
}: AdminEmptyStateProps) {
  return (
    <Card
      className={cn(
        "border border-border/80 bg-card/40 shadow-xs rounded-3xl overflow-hidden text-foreground",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center mb-3.5 shadow-xs">
          <Icon className={cn("h-6 w-6 text-muted-foreground", iconClassName)} />
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight mb-1">
          {title}
        </h3>

        {description && (
          <div className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {description}
          </div>
        )}

        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}
