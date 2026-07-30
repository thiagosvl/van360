import { Skeleton } from "@/components/ui/skeleton";

interface RouteTimelineSkeletonProps {
  count?: number;
}

export function RouteTimelineSkeleton({ count = 4 }: RouteTimelineSkeletonProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300 text-left max-w-2xl mx-auto px-4">
      {/* Header Card Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* Timeline Stops Skeleton */}
      <div className="relative flex flex-col gap-3 pl-8 pb-1">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="relative w-full">
            {/* Linha vertical conectora de fundo */}
            <div className="absolute left-[-20px] top-0 bottom-0 w-[2.5px] bg-slate-200/70 z-0" />
            
            {/* Círculo da Timeline Skeleton */}
            <Skeleton className="absolute left-[-31px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 border-white shadow-sm z-10" />

            {/* Card Skeleton */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[96px] space-y-3 min-w-0 overflow-hidden">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-28 max-w-[80%] rounded-md" />
                  <Skeleton className="h-3 w-16 max-w-[60%] rounded-md" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 min-w-0">
                <Skeleton className="h-5 w-20 rounded-full shrink-0" />
                <Skeleton className="h-3 w-20 max-w-[40%] rounded-md shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
