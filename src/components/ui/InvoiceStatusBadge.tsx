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
    className: "bg-emerald-500/[0.08] text-emerald-700 border-emerald-500/20",
  },
  [SubscriptionInvoiceStatus.PENDING]: {
    label: "Pendente",
    className: "bg-amber-500/[0.08] text-amber-700 border-amber-500/20",
  },
  [SubscriptionInvoiceStatus.FAILED]: {
    label: "Falhou",
    className: "bg-[#e7000b]/[0.08] text-[#e7000b] border-[#e7000b]/20",
  },
  [SubscriptionInvoiceStatus.CANCELED]: {
    label: "Cancelado",
    className: "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]",
  },
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  if (!status) {
    return <span className={cn("text-xs text-[#737373]", className)}>—</span>;
  }

  const badge = INVOICE_STATUS_DETAILS[status as SubscriptionInvoiceStatus];
  if (!badge) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium normal-case tracking-normal bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]",
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
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium normal-case tracking-normal border transition-colors",
        badge.className,
        className
      )}
    >
      {badge.label}
    </span>
  );
}
