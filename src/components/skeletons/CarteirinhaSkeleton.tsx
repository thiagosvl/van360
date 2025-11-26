// Components - UI
import { Skeleton } from "@/components/ui/skeleton";

export function CarteirinhaSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <div className="flex flex-col gap-2 overflow-hidden">
              <Skeleton className="h-7 w-full max-w-[12rem]" />
              <Skeleton className="h-5 w-full max-w-[6rem]" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

