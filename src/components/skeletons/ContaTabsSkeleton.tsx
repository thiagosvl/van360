import { Skeleton } from "@/components/ui/skeleton";

export function PagamentosTabSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
        <div className="hidden sm:flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 sm:w-44 rounded-[8px]" />
            <Skeleton className="h-3.5 w-60 sm:w-80 rounded-[6px]" />
          </div>
        </div>

        <div className="space-y-2.5">
          <Skeleton className="h-4.5 w-48 sm:w-60 rounded-[8px]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] border border-[#e5e5e5] bg-[#fafafa]/50 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-[12px]" />
                    <Skeleton className="h-4 w-28 sm:w-36 rounded-[6px]" />
                  </div>
                  <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full shrink-0" />
                </div>
                <Skeleton className="h-3.5 w-full rounded-[6px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 sm:w-60 rounded-[8px]" />
            <Skeleton className="h-3.5 w-64 sm:w-72 rounded-[6px]" />
          </div>
        </div>

        <Skeleton className="h-14 w-full rounded-[18px]" />

        <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-[14px]" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded-[6px]" />
              <Skeleton className="h-4.5 w-44 rounded-[8px]" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-[14px]" />
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px]" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 sm:w-48 rounded-[8px]" />
              <Skeleton className="h-3.5 w-64 sm:w-80 rounded-[6px]" />
            </div>
          </div>
          <Skeleton className="h-8 w-44 rounded-[14px]" />
        </div>

        <div className="divide-y divide-[#e5e5e5] space-y-4 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 pt-3 first:pt-0">
              <div className="space-y-1.5 flex-1 pr-4">
                <Skeleton className="h-4 w-44 sm:w-56 rounded-[8px]" />
                <Skeleton className="h-3 w-60 sm:w-80 rounded-[6px]" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PerfilTabSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 sm:w-48 rounded-[8px]" />
            <Skeleton className="h-3.5 w-60 sm:w-72 rounded-[6px]" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="space-y-2 flex-1 w-full text-center sm:text-left">
            <Skeleton className="h-4 w-48 mx-auto sm:mx-0 rounded-[8px]" />
            <Skeleton className="h-3 w-64 mx-auto sm:mx-0 rounded-[6px]" />
            <Skeleton className="h-9 w-32 mx-auto sm:mx-0 rounded-[14px] mt-2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 sm:w-44 rounded-[8px]" />
            <Skeleton className="h-3.5 w-56 sm:w-72 rounded-[6px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded-[6px]" />
              <Skeleton className="h-11 w-full rounded-[18px]" />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#e5e5e5] flex justify-end">
          <Skeleton className="h-11 w-32 rounded-[18px]" />
        </div>
      </div>
    </div>
  );
}

interface ConfiguracoesToggleTabSkeletonProps {
  cardCount?: number;
  rowCount?: number;
}

export function ConfiguracoesToggleTabSkeleton({
  cardCount = 1,
  rowCount = 3,
}: ConfiguracoesToggleTabSkeletonProps) {
  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {Array.from({ length: cardCount }).map((_, cardIdx) => (
        <div
          key={cardIdx}
          className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5"
        >
          <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
            <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px]" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 sm:w-52 rounded-[8px]" />
              <Skeleton className="h-3.5 w-60 sm:w-80 rounded-[6px]" />
            </div>
          </div>

          <div className="divide-y divide-[#e5e5e5] space-y-4 pt-1">
            {Array.from({ length: rowCount }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="flex items-center justify-between gap-3 pt-3 first:pt-0"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <Skeleton className="h-4 w-40 sm:w-56 rounded-[8px]" />
                  <Skeleton className="h-3 w-56 sm:w-72 rounded-[6px]" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PreferenciasTabSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px]" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-48 rounded-[8px]" />
          <Skeleton className="h-3.5 w-72 rounded-[6px]" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-44 rounded-[8px]" />
          <Skeleton className="h-3 w-64 rounded-[6px]" />
        </div>

        <div className="rounded-[18px] border border-[#e5e5e5] bg-white divide-y divide-[#e5e5e5] overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-[6px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
