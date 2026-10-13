import { Skeleton } from "@/components/ui/skeleton";

interface RouteTimelineSkeletonProps {
  count?: number;
}

export function RouteTimelineSkeleton({ count = 4 }: RouteTimelineSkeletonProps) {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300 text-left max-w-2xl mx-auto w-full min-w-0 pt-1 sm:pt-2">
      <div className="bg-white p-3.5 sm:p-5 rounded-[24px] border border-[#e5e5e5] shadow-xs space-y-3.5 min-w-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <Skeleton className="h-5 w-36 sm:w-44 rounded-[8px]" />
          <Skeleton className="h-5 w-16 sm:w-20 rounded-[18px]" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-11 w-full rounded-[18px]" />
      </div>

      <div className="relative flex flex-col gap-6 pl-8 sm:pl-10 pb-1">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="relative w-full">
            <div className="absolute left-[-22px] sm:left-[-26px] top-0 bottom-0 w-[2px] bg-[#e5e5e5] z-0" />
            <Skeleton className="absolute left-[-35px] sm:left-[-39px] top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border-2 border-white shadow-xs z-10" />

            <div className="bg-white p-3.5 sm:p-4 rounded-[24px] border border-[#e5e5e5] shadow-xs flex flex-col justify-between min-h-[96px] space-y-3 min-w-0 overflow-hidden">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-28 sm:w-36 max-w-[80%] rounded-[8px]" />
                  <Skeleton className="h-3 w-36 sm:w-48 max-w-[60%] rounded-[8px]" />
                </div>
                <Skeleton className="h-8 w-8 rounded-[12px] shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e5e5e5] min-w-0">
                <Skeleton className="h-8 w-16 sm:w-20 rounded-[14px] shrink-0" />
                <Skeleton className="h-8 w-20 sm:w-24 rounded-[18px] shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
