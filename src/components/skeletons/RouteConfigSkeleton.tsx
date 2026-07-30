import { Skeleton } from "@/components/ui/skeleton";

interface RouteConfigSkeletonProps {
  count?: number;
}

export function RouteConfigSkeleton({ count = 4 }: RouteConfigSkeletonProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300 text-left max-w-2xl mx-auto px-4">
      {/* Card de Configuração de Rota Skeleton */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      </div>

      {/* Header do Itinerário Skeleton */}
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>

      {/* Timeline de Paradas Configuradas Skeleton */}
      <div className="relative flex flex-col gap-3 pl-8 pb-1">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="relative w-full">
            {/* Linha vertical de fundo */}
            <div className="absolute left-[-20px] top-0 bottom-0 w-[2.5px] bg-slate-200/70 z-0" />

            {/* Círculo do número de ordem */}
            <Skeleton className="absolute left-[-31px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 border-white shadow-sm z-10" />

            {/* Card de Parada Skeleton */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-52 rounded-md" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              </div>

              {/* Tabs de Sentido (Indo / Volta) Skeleton */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                <Skeleton className="h-7 flex-1 rounded-full" />
                <Skeleton className="h-7 flex-1 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
