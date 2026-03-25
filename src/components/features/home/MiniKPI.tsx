import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MiniKPIProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: any;
  loading?: boolean;
  className?: string;
}

export const MiniKPI = ({
  label,
  value,
  subtext,
  icon: Icon,
  loading = false,
  className = "",
}: MiniKPIProps) => (
  <div
    className={cn(
      "p-4 bg-white rounded-2xl border border-gray-100/50 shadow-diff-shadow flex items-center justify-between relative",
      className
    )}
  >
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-7 w-24 mb-1" />
      ) : (
        <h3 className="text-xl md:text-2xl font-headline font-bold text-[#1a3a5c] leading-none tracking-tight">
          {value}
        </h3>
      )}
      {subtext && (
        <p className="text-[10px] text-slate-400 font-medium mt-1.5 opacity-60">
          {subtext}
        </p>
      )}
    </div>
    <div
      className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 bg-slate-50/50 text-[#1a3a5c]",
      )}
    >
      <Icon className="h-5 w-5 opacity-60" />
    </div>
  </div>
);
