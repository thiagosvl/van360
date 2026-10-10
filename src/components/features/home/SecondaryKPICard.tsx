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
    return <div className="h-full min-h-[72px] sm:min-h-[84px] bg-white rounded-[24px] animate-pulse shadow-xs border border-[#e5e5e5]" />;
  }

  return (
    <div className="bg-white rounded-[24px] p-3 sm:p-4 lg:p-5 shadow-xs border border-[#e5e5e5] flex items-center min-h-[72px] sm:min-h-[84px] h-full transition-all duration-200 w-full">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-full">
        {Icon && (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] bg-primary/10 text-primary border border-primary/15 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-xs sm:text-[13px] font-medium text-[#737373] leading-tight whitespace-nowrap">
            {label}
          </span>
          <span className="text-lg sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none mt-1">
            {formatPrivateNumber(value)}
          </span>
        </div>
      </div>
    </div>
  );
}

