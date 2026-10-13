import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  count?: number;
  className?: string;
}

export function ListSkeleton({ count = 5, className }: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className || ""}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-3.5 rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center gap-3"
        >
          <Skeleton className="flex-shrink-0 w-9 h-9 rounded-[10px] bg-[#f5f5f5]" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-1/2 rounded-[8px] bg-[#f5f5f5]" />
            <Skeleton className="h-3 w-1/3 rounded-[8px] bg-[#f5f5f5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

