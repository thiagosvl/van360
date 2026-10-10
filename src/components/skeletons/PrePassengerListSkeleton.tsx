import { Skeleton } from "@/components/ui/skeleton";

interface PrePassengerListSkeletonProps {
  count?: number;
  className?: string;
}

export function PrePassengerListSkeleton({
  count = 5,
  className,
}: PrePassengerListSkeletonProps) {
  return (
    <div className={`space-y-3 mt-6 ${className || ""}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3.5 sm:p-4 border border-[#e5e5e5] rounded-[18px] bg-white shadow-xs"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-[8px] bg-[#f5f5f5]" />
            <Skeleton className="h-3 w-1/2 rounded-[6px] bg-[#f5f5f5]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-[12px] bg-[#f5f5f5]" />
        </div>
      ))}
    </div>
  );
}
