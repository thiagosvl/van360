import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="px-1 space-y-2">
        <Skeleton className="h-5 w-48 rounded-[10px] bg-[#f5f5f5]" />
        <Skeleton className="h-3.5 w-64 rounded-[8px] bg-[#f5f5f5]" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-1">
        <Skeleton className="h-32 rounded-[24px] bg-white border border-[#e5e5e5] shadow-xs" />
        <Skeleton className="h-32 rounded-[24px] bg-white border border-[#e5e5e5] shadow-xs" />
        <Skeleton className="hidden lg:block h-32 rounded-[24px] bg-white border border-[#e5e5e5] shadow-xs" />
      </div>

      <section className="space-y-4 pt-2">
        <Skeleton className="h-4 w-32 ml-1 rounded-[10px] bg-[#f5f5f5]" />
        
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2.5">
              <Skeleton className="aspect-square w-full rounded-[16px] bg-white border border-[#e5e5e5] shadow-xs" />
              <Skeleton className="h-3 w-14 rounded-[6px] bg-[#f5f5f5]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
