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
          "inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium normal-case tracking-normal border transition-colors",
          "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          className
        )}
      >
        {trueLabel}
      </span>
    ) : (
      <span
        className={cn(
          "inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium normal-case tracking-normal border transition-colors",
          "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]",
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
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium normal-case tracking-normal border transition-colors",
        colorClass,
        className
      )}
    >
      {text}
    </span>
  );
}
