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
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 border",
        active
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : "bg-rose-500/15 text-rose-400 border-rose-500/30",
        className
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
