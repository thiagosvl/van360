import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks";

export function CarteirinhaHeaderSkeleton() {
  return (
    <div className="bg-gradient-to-br from-[#122842] via-[#1a385c] to-[#0e2137] text-white rounded-[24px] relative flex flex-col items-center mb-8 shadow-sm border border-white/10 overflow-visible w-full">
      <div className="absolute top-0 left-0 w-full h-[35%] bg-white/5 rounded-t-[24px] pointer-events-none z-0" />
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-7 pb-9">
        <div className="rounded-full bg-white/10 p-1 shadow-sm shrink-0 backdrop-blur-xs">
          <div className="h-16 w-16 rounded-full bg-[#183659] border-2 border-white/20 flex items-center justify-center shadow-xs animate-pulse" />
        </div>

        <div className="text-center mt-3 w-full flex flex-col items-center space-y-2">
          <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 bg-white/20 rounded-[14px]" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <Skeleton className="h-5 w-14 bg-white/20 rounded-[18px]" />
          <Skeleton className="h-5 w-24 bg-white/20 rounded-[18px]" />
          <Skeleton className="h-5 w-28 bg-white/15 rounded-[18px]" />
        </div>
      </div>

      <div className="absolute -bottom-5 left-0 w-full flex justify-center gap-3 z-20">
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/90 shadow-md" />
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white shadow-md border border-[#e5e5e5]" />
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white shadow-md border border-[#e5e5e5]" />
      </div>
    </div>
  );
}

export function CarteirinhaSkeleton() {
  const isMobile = useIsMobile();

  const renderTopCard = () => <CarteirinhaHeaderSkeleton />;

  const renderDadosPessoais = () => (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 sm:p-6 space-y-5 w-full">
      <div className="rounded-[18px] border border-[#e5e5e5] p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3 w-full">
          <Skeleton className="w-10 h-10 rounded-[14px] shrink-0 bg-[#f5f5f5]" />
          <div className="flex-1 space-y-2 mt-0.5">
            <Skeleton className="h-4 w-28 bg-[#f5f5f5]" />
            <Skeleton className="h-3 w-48 bg-[#f5f5f5]" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-[14px] bg-[#f5f5f5]" />
      </div>

      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28 bg-[#f5f5f5]" />
          <Skeleton className="h-8 w-20 rounded-[14px] bg-[#f5f5f5]" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-[18px] bg-[#f5f5f5]" />
          <Skeleton className="h-8 w-24 rounded-[18px] bg-[#f5f5f5]" />
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-2">
            <Skeleton className="h-4 w-32 bg-[#f5f5f5]" />
            <Skeleton className="h-3.5 w-full bg-[#f5f5f5]" />
          </div>
          <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-2">
            <Skeleton className="h-4 w-24 bg-[#f5f5f5]" />
            <Skeleton className="h-3.5 w-full bg-[#f5f5f5]" />
          </div>
          <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3.5 space-y-2">
            <Skeleton className="h-4 w-20 bg-[#f5f5f5]" />
            <Skeleton className="h-10 w-full rounded-[14px] bg-[#f5f5f5]" />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <Skeleton className="h-[72px] w-full rounded-[18px] bg-[#f5f5f5]" />

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
          <Skeleton className="h-[72px] rounded-[18px] bg-[#f5f5f5]" />
        </div>
      </div>
    </div>
  );

  const renderCobrancas = () => (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32 bg-[#f5f5f5]" />
          <Skeleton className="h-3.5 w-48 bg-[#f5f5f5]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-[18px] bg-[#f5f5f5]" />
          <Skeleton className="h-10 w-36 rounded-[18px] bg-[#f5f5f5]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-20 w-full rounded-[20px] bg-[#f5f5f5]" />
        <Skeleton className="h-20 w-full rounded-[20px] bg-[#f5f5f5]" />
        <Skeleton className="h-20 w-full rounded-[20px] bg-[#f5f5f5]" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-[20px] border border-[#e5e5e5] shadow-xs flex items-center justify-between h-20"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <Skeleton className="h-11 w-11 rounded-[14px] shrink-0 bg-[#f5f5f5]" />
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-32 bg-[#f5f5f5]" />
                <Skeleton className="h-3 w-24 bg-[#f5f5f5]" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Skeleton className="h-4 w-20 bg-[#f5f5f5]" />
              <Skeleton className="h-5 w-16 rounded-[14px] bg-[#f5f5f5]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVerticalTabsSkeleton = () => (
    <div className="bg-white p-1.5 sm:p-2 rounded-[24px] border border-[#e5e5e5] shadow-xs space-y-1 w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-11 w-full rounded-[18px] bg-transparent flex items-center px-4 gap-3.5">
          <Skeleton className="h-4 w-4 rounded-[6px] bg-[#f5f5f5]" />
          <Skeleton className="h-4 w-24 rounded-[6px] bg-[#f5f5f5]" />
        </div>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-5 w-full">
        <div className="px-1 pt-1">
          {renderTopCard()}
        </div>

        <div className="w-full pt-2 space-y-4">
          <div className="bg-[#f5f5f5] p-1 rounded-[18px] border border-[#e5e5e5]">
            <div className="grid grid-cols-2 gap-1 min-h-[40px]">
              <div className="rounded-[14px] bg-white shadow-xs flex items-center justify-center">
                <Skeleton className="h-4 w-16 bg-[#f5f5f5]" />
              </div>
              <div className="flex items-center justify-center">
                <Skeleton className="h-4 w-24 bg-[#f5f5f5]" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {renderCobrancas()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-12 gap-8 items-start">
      <div className="col-span-4 space-y-6">
        {renderTopCard()}
        {renderVerticalTabsSkeleton()}
      </div>

      <div className="col-span-8 space-y-6">
        {renderCobrancas()}
      </div>
    </div>
  );
}
