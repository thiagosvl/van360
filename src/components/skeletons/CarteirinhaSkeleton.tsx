import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CarteirinhaSkeleton() {
  return (
    <div className="space-y-6">
      {/* 1. Header Card (CarteirinhaHeader mock) */}
      <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow overflow-hidden relative">
        {/* Header gradient mock */}
        <div className="bg-slate-100 h-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 opacity-50" />
        </div>
        
        <div className="px-6 pb-6 relative">
          {/* Avatar Area */}
          <div className="flex flex-col items-center -mt-12 mb-4">
            <div className="h-24 w-24 rounded-[2rem] bg-white p-1.5 shadow-xl">
              <Skeleton className="h-full w-full rounded-[1.6rem]" />
            </div>
            
            {/* Name & Subtitle */}
            <div className="text-center mt-3 space-y-2 flex flex-col items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 opacity-60" />
              
              {/* Badges */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-11 w-11 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Content Area (Tabs + Info/Billing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo (ou Aba Dados) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tabs List Toggle (Mobile context) */}
          <div className="bg-slate-100/50 p-1 rounded-[1.25rem]">
            <div className="grid grid-cols-2 gap-1 h-[52px]">
              <Skeleton className="h-full rounded-[1rem] bg-white shadow-sm" />
              <div className="h-full" />
            </div>
          </div>

          {/* Info Tiles Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-[72px] rounded-2xl" />
              <Skeleton className="h-[72px] rounded-2xl" />
            </div>
            
            <Skeleton className="h-[64px] rounded-2xl" />
            
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-[72px] rounded-2xl" />
              <Skeleton className="h-[72px] rounded-2xl" />
            </div>

            {/* Address/Rep Card */}
            <div className="space-y-4 pt-4">
              <Skeleton className="h-20 w-full rounded-2xl opacity-80" />
              <Skeleton className="h-24 w-full rounded-2xl opacity-80" />
            </div>
          </div>
        </div>

        {/* Lado Direito (ou Aba Mensalidades) - Shown on desktop skeleton to match side-by-side structure */}
        <div className="hidden lg:block lg:col-span-8 space-y-5">
           <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-32 rounded-2xl" />
           </div>
           
           <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
           </div>

           <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
           </div>
        </div>
      </div>
    </div>
  );
}

