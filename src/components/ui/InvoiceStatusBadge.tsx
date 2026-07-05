import { SubscriptionInvoiceStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

interface InvoiceStatusBadgeProps {
  status: SubscriptionInvoiceStatus | string | null | undefined;
  className?: string;
}

export const INVOICE_STATUS_DETAILS: Record<
  SubscriptionInvoiceStatus,
  { label: string; className: string }
> = {
  [SubscriptionInvoiceStatus.PAID]: {
    label: "Pago",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-50/80",
  },
  [SubscriptionInvoiceStatus.PENDING]: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-50/80",
  },
  [SubscriptionInvoiceStatus.FAILED]: {
    label: "Falhou",
    className: "bg-rose-50 text-rose-700 border-rose-200/50 hover:bg-rose-50/80",
  },
  [SubscriptionInvoiceStatus.CANCELED]: {
    label: "Cancelado",
    className: "bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-50/80",
  },
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  if (!status) {
    return <span className={cn("text-xs text-slate-400", className)}>—</span>;
  }

  const badge = INVOICE_STATUS_DETAILS[status as SubscriptionInvoiceStatus];
  if (!badge) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-semibold normal-case tracking-normal bg-slate-50 text-slate-500 border border-slate-200/50",
          className
        )}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-semibold normal-case tracking-normal border transition-colors",
        badge.className,
        className
      )}
    >
      {badge.label}
    </span>
  );
}
