import { usePrivacy } from "@/contexts/PrivacyContext";
import { LucideIcon } from "lucide-react";

interface SecondaryKPICardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  loading?: boolean;
}

export function SecondaryKPICard({ label, value, icon: Icon, loading }: SecondaryKPICardProps) {
  const { formatPrivateNumber } = usePrivacy();

  if (loading) {
    return <div className="h-[68px] sm:h-[72px] bg-white rounded-2xl animate-pulse shadow-xs border border-slate-100" />;
  }

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100/80 flex items-center gap-3 min-h-[68px] sm:min-h-[72px]">
      {Icon && (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50/70 text-[#1a3a5c] flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[1.75]" />
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">
          {label}
        </span>
        <span className="text-[17px] sm:text-[20px] lg:text-[22px] font-bold text-slate-800 tracking-tight leading-none mt-1">
          {formatPrivateNumber(value)}
        </span>
      </div>
    </div>
  );
}
