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
          className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 border border-gray-100/50"
        >
          <Skeleton className="flex-shrink-0 w-9 h-9 rounded-lg" />
          <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3 opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}

