import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusText } from "@/utils/formatters";

interface StatusBadgeProps {
  status: boolean | string;
  
  dataVencimento?: string | Date;

  trueLabel?: string;
  falseLabel?: string;

  className?: string;
}

export function StatusBadge({
  status,
  dataVencimento,
  trueLabel = "Ativo",
  falseLabel = "Inativo",
  className,
}: StatusBadgeProps) {

  if (typeof status === "boolean") {
    return status ? (
      <Badge
        variant="outline"
        className={cn(
          "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 font-medium",
          className
        )}
      >
        {trueLabel}
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className={cn(
          "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium",
          className
        )}
      >
        {falseLabel}
      </Badge>
    );
  }

  const colorClass = getStatusColor(status, dataVencimento ? dataVencimento.toString() : "");
  const text = getStatusText(status, dataVencimento ? dataVencimento.toString() : "");

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", colorClass, className)}
    >
      {text}
    </Badge>
  );
}
