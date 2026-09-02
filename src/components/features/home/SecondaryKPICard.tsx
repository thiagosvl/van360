import { usePrivacy } from "@/contexts/PrivacyContext";
import { ChevronRight, LucideIcon } from "lucide-react";

interface SecondaryKPICardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  onClick?: () => void;
  loading?: boolean;
}

export function SecondaryKPICard({ label, value, icon: Icon, onClick, loading }: SecondaryKPICardProps) {
  const { formatPrivateNumber } = usePrivacy();

  if (loading) {
    return <div className="h-[72px] bg-white rounded-2xl animate-pulse shadow-xs border border-slate-100" />;
  }

  const content = (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50/80 text-[#1a3a5c] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-100/80 transition-all">
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight group-hover:text-slate-700 transition-colors">
            {label}
          </span>
          <span className="text-[18px] sm:text-[22px] font-bold text-slate-800 tracking-tight leading-none mt-1">
            {formatPrivateNumber(value)}
          </span>
        </div>
      </div>

      {onClick && (
        <div className="hidden sm:flex shrink-0 pl-1">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-[#1a3a5c] group-hover:translate-x-0.5 transition-all" />
        </div>
      )}
    </div>
  );

  const cardClasses = "bg-white rounded-2xl p-3 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100/80 flex items-center min-h-[72px] transition-all duration-200";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${cardClasses} w-full text-left cursor-pointer group hover:shadow-md hover:border-slate-200/80 active:scale-[0.99]`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cardClasses}>
      {content}
    </div>
  );
}
