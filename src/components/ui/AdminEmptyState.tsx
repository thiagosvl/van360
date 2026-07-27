import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string | ReactNode;
  className?: string;
  iconClassName?: string;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
}: AdminEmptyStateProps) {
  return (
    <Card
      className={cn(
        "border border-dashed border-slate-800/80 bg-[#131b2e]/60 shadow-xl rounded-[2rem] overflow-hidden text-slate-100",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 shadow-inner">
          <Icon className={cn("h-7 w-7 text-slate-400", iconClassName)} />
        </div>

        <h3 className="text-xs font-headline font-black text-slate-200 uppercase tracking-widest mb-1.5">
          {title}
        </h3>

        {description && (
          <div className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
