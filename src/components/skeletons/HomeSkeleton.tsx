import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Contextual (Saudação/Status) */}
      <div className="px-1 space-y-2">
        <Skeleton className="h-5 w-48 rounded-lg bg-slate-200/60" />
        <Skeleton className="h-3 w-64 rounded-lg bg-slate-100/60" />
      </div>

      {/* Placeholder para os KPIs (Financeiro/Indicadores) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-1">
        <Skeleton className="h-32 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100" />
        <Skeleton className="h-32 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100" />
        <Skeleton className="hidden lg:block h-32 rounded-2xl bg-white border border-slate-100 shadow-sm shadow-slate-100" />
      </div>

      {/* Seção de Atalhos (Grid de ícones) */}
      <section className="space-y-4 pt-2">
        <Skeleton className="h-4 w-32 ml-1 rounded-lg bg-slate-100/80" />
        
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl bg-white border border-slate-100/50 shadow-sm shadow-slate-100/30" />
              <Skeleton className="h-3 w-14 rounded-md bg-slate-100/60" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
