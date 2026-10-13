import { Skeleton } from "@/components/ui/skeleton";

interface RouteConfigSkeletonProps {
  count?: number;
}

export function RouteConfigSkeleton({ count = 4 }: RouteConfigSkeletonProps) {
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300 text-left max-w-2xl mx-auto w-full min-w-0 pt-1 sm:pt-2">
      <div className="bg-white border border-[#e5e5e5] p-3.5 sm:p-5 rounded-[24px] shadow-xs flex items-center justify-between gap-3 sm:gap-4 min-w-0">
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-36 sm:w-40 rounded-[8px]" />
          <Skeleton className="h-3.5 w-24 sm:w-28 rounded-[8px]" />
        </div>
        <Skeleton className="h-8 w-16 sm:w-20 rounded-[18px] shrink-0" />
      </div>

      <div className="flex items-center justify-between px-1 min-w-0">
        <Skeleton className="h-4 w-24 sm:w-28 rounded-[8px]" />
        <Skeleton className="h-8 w-24 sm:w-28 rounded-[18px]" />
      </div>

      <div className="relative flex flex-col gap-3 pl-8 sm:pl-10 pb-1">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="relative w-full">
            <div className="absolute left-[-22px] sm:left-[-26px] top-0 bottom-0 w-[2px] bg-[#e5e5e5] z-0" />
            <Skeleton className="absolute left-[-35px] sm:left-[-39px] top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border-2 border-white shadow-xs z-10" />

            <div className="bg-white p-3.5 sm:p-4 rounded-[24px] border border-[#e5e5e5] shadow-xs space-y-3 min-w-0 overflow-hidden">
              <div className="flex items-start justify-between gap-2.5 min-w-0">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-28 sm:w-32 max-w-[80%] rounded-[8px]" />
                  <Skeleton className="h-3 w-36 sm:w-44 max-w-[90%] rounded-[8px]" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-[#e5e5e5] min-w-0">
                <Skeleton className="h-7 flex-1 rounded-[18px]" />
                <Skeleton className="h-7 flex-1 rounded-[18px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
