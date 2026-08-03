import { Skeleton } from "@/components/ui/skeleton";

export function RotasSkeleton() {
  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 text-left animate-in fade-in duration-200">
      {/* Container das Tabs (Segmented Control) */}
      <div className="bg-slate-200/50 p-1 rounded-[1.25rem] w-full">
        <div className="grid grid-cols-2 gap-1 min-h-[40px] w-full">
          <div className="rounded-[1rem] bg-white h-full shadow-2xs flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 min-w-0">
            <Skeleton className="h-4 w-20 sm:w-24 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-md shrink-0" />
          </div>
          <div className="rounded-[1rem] bg-transparent h-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 min-w-0">
            <Skeleton className="h-4 w-16 sm:w-20 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-md shrink-0" />
          </div>
        </div>
      </div>

      {/* Subcabeçalho ("Suas Rotas" + "+ Nova Rota") */}
      <div className="flex items-center justify-between gap-2 px-1 w-full">
        <Skeleton className="h-5 w-24 sm:w-28 rounded-md shrink-0" />
        <Skeleton className="h-10 sm:h-12 w-28 sm:w-32 rounded-2xl shrink-0" />
      </div>

      {/* Lista de Cards de Rota */}
      <div className="grid gap-3 w-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2.5 sm:gap-3"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-28 sm:w-40 rounded-md max-w-[80%]" />
                <Skeleton className="h-3 w-20 sm:w-28 rounded-md max-w-[60%]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
              <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
