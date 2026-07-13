import { SubscriptionStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus | string | null | undefined;
  dataVencimento?: string | null;
  className?: string;
}

export const SUBSCRIPTION_STATUS_DETAILS: Record<SubscriptionStatus, { label: string; className: string }> = {
  [SubscriptionStatus.TRIAL]: {
    label: "Período de Teste",
    className: "bg-sky-100 text-sky-700 hover:bg-sky-100/80",
  },
  [SubscriptionStatus.ACTIVE]: {
    label: "Ativo (Em dia)",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80",
  },
  [SubscriptionStatus.PAST_DUE]: {
    label: "Atrasado (Carência)",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100/80",
  },
  [SubscriptionStatus.EXPIRED]: {
    label: "Bloqueado (Expirado)",
    className: "bg-red-100 text-red-700 hover:bg-red-100/80",
  },
  [SubscriptionStatus.CANCELED]: {
    label: "Cancelado",
    className: "bg-slate-100 text-slate-500 hover:bg-slate-100/80",
  },
};

export function SubscriptionStatusBadge({ status, dataVencimento, className }: SubscriptionStatusBadgeProps) {
  if (!status) {
    return <span className={cn("text-xs text-slate-400", className)}>—</span>;
  }

  if (status === SubscriptionStatus.ACTIVE && dataVencimento === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors",
          "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
          className
        )}
      >
        Vitalício
      </span>
    );
  }

  const badge = SUBSCRIPTION_STATUS_DETAILS[status as SubscriptionStatus];
  if (!badge) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500",
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
        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors",
        badge.className,
        className
      )}
    >
      {badge.label}
    </span>
  );
}
