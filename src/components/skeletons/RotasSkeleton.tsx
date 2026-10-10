import { Skeleton } from "@/components/ui/skeleton";

export function RotasSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-5 text-left animate-in fade-in duration-200 pt-1 sm:pt-2 min-w-0">
      <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full">
        <div className="grid grid-cols-2 gap-1 min-h-[38px] sm:min-h-[42px] w-full">
          <div className="rounded-[18px] bg-white h-full shadow-xs flex items-center justify-center gap-2 px-3 sm:px-4 py-2 min-w-0">
            <Skeleton className="h-4 w-16 sm:w-24 rounded-[8px]" />
          </div>
          <div className="rounded-[18px] bg-transparent h-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 min-w-0">
            <Skeleton className="h-4 w-14 sm:w-20 rounded-[8px]" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full">
        <Skeleton className="h-11 flex-1 rounded-[18px]" />
        <Skeleton className="h-11 flex-1 rounded-[18px]" />
      </div>

      <div className="grid gap-3 w-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full bg-white p-3.5 sm:p-5 rounded-[24px] border border-[#e5e5e5] shadow-xs flex items-center justify-between gap-2.5 sm:gap-3.5 min-w-0"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-[18px] shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-28 sm:w-44 rounded-[8px] max-w-[80%]" />
                <Skeleton className="h-3 w-16 sm:w-28 rounded-[8px] max-w-[60%]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Skeleton className="w-16 sm:w-20 h-8 rounded-[18px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
