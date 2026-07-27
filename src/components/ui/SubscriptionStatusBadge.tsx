import { SubscriptionStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus | string | null | undefined;
  dataVencimento?: string | null;
  className?: string;
}

export type ExtendedSubscriptionStatus = SubscriptionStatus | "VITALICIO";

export interface SubscriptionStatusDetail {
  label: string;
  pluralLabel: string;
  subtext: string;
  className: string;
  color: string;
  textColor: string;
  cardBorder: string;
  iconBg: string;
}

export const SUBSCRIPTION_STATUS_DETAILS: Record<ExtendedSubscriptionStatus, SubscriptionStatusDetail> = {
  [SubscriptionStatus.ACTIVE]: {
    label: "Ativa",
    pluralLabel: "Ativas",
    subtext: "Motoristas pagantes",
    className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    cardBorder: "border-emerald-500/40 shadow-emerald-500/10",
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  [SubscriptionStatus.TRIAL]: {
    label: "Trial",
    pluralLabel: "Trial",
    subtext: "Em avaliação",
    className: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    color: "bg-sky-500",
    textColor: "text-sky-400",
    cardBorder: "border-sky-500/40 shadow-sky-500/10",
    iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  VITALICIO: {
    label: "Vitalício",
    pluralLabel: "Vitalícios",
    subtext: "Acesso ilimitado",
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    color: "bg-purple-500",
    textColor: "text-purple-400",
    cardBorder: "border-purple-500/40 shadow-purple-500/10",
    iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  [SubscriptionStatus.PAST_DUE]: {
    label: "Em Atraso",
    pluralLabel: "Em Atraso",
    subtext: "Prestes a expirar",
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    color: "bg-amber-500",
    textColor: "text-amber-400",
    cardBorder: "border-amber-500/40 shadow-amber-500/10",
    iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  [SubscriptionStatus.EXPIRED]: {
    label: "Expirada",
    pluralLabel: "Expiradas",
    subtext: "Assinaturas encerradas",
    className: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    color: "bg-orange-500",
    textColor: "text-orange-400",
    cardBorder: "border-orange-500/40 shadow-orange-500/10",
    iconBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  [SubscriptionStatus.CANCELED]: {
    label: "Cancelada",
    pluralLabel: "Canceladas",
    subtext: "Assinaturas inativas",
    className: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    color: "bg-rose-500",
    textColor: "text-rose-400",
    cardBorder: "border-rose-500/40 shadow-rose-500/10",
    iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export function getSubscriptionStatusDetails(statusKey: string | null | undefined): SubscriptionStatusDetail | null {
  if (!statusKey) return null;
  const normalizedKey = statusKey.toUpperCase() as ExtendedSubscriptionStatus;
  return SUBSCRIPTION_STATUS_DETAILS[normalizedKey] || null;
}

export function SubscriptionStatusBadge({ status, dataVencimento, className }: SubscriptionStatusBadgeProps) {
  if (!status) {
    return <span className={cn("text-xs text-slate-400", className)}>—</span>;
  }

  if (status === SubscriptionStatus.ACTIVE && dataVencimento === null) {
    const details = SUBSCRIPTION_STATUS_DETAILS.VITALICIO;
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors",
          details.className,
          className
        )}
      >
        {details.label}
      </span>
    );
  }

  const badge = getSubscriptionStatusDetails(status);
  if (!badge) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700",
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
