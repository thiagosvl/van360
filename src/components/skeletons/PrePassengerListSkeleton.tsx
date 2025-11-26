// Components - UI
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
    <div className={`space-y-3 mt-8 ${className || ""}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

