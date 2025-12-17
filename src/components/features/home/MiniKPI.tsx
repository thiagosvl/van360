import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MiniKPIProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: any;
  colorClass?: string;
  bgClass?: string;
  loading?: boolean;
  className?: string;
}

export const MiniKPI = ({
  label,
  value,
  subtext,
  icon: Icon,
  colorClass = "text-gray-600",
  bgClass = "bg-gray-50",
  loading = false,
  className = "",
}: MiniKPIProps) => (
  <Card
    className={cn(
      "border-none shadow-sm bg-white rounded-2xl overflow-hidden relative",
      className
    )}
  >
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-7 w-24 mb-1" />
        ) : (
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
            {value}
          </h3>
        )}
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center",
          bgClass,
          colorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);
