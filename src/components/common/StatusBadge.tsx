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
      <span
        className={cn(
          "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold normal-case tracking-normal border transition-colors",
          "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
          className
        )}
      >
        {trueLabel}
      </span>
    ) : (
      <span
        className={cn(
          "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold normal-case tracking-normal border transition-colors",
          "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
          className
        )}
      >
        {falseLabel}
      </span>
    );
  }

  const colorClass = getStatusColor(status, dataVencimento ? dataVencimento.toString() : "");
  const text = getStatusText(status, dataVencimento ? dataVencimento.toString() : "");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold normal-case tracking-normal border transition-colors",
        colorClass,
        className
      )}
    >
      {text}
    </span>
  );
}
