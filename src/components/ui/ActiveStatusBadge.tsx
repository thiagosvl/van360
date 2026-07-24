import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActiveStatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export function ActiveStatusBadge({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
  className,
}: ActiveStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 shrink-0",
        active
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-rose-500/10 text-rose-400 border-rose-500/30",
        className
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
