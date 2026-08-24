import { Skeleton } from "@/components/ui/skeleton";

export function RenovacaoSkeleton() {
  return (
    <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-6 pb-36 animate-in fade-in duration-200">
      {/* 1. SKELETON DO CARD PRINCIPAL DE KPIS (100% FIEL AO TEMA LIGHT) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100/80 flex flex-col gap-4">
        {/* Linha Superior: Faturamento Projetado + Badge de Crescimento */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 min-w-0">
            <Skeleton className="h-3.5 w-36 rounded-md bg-slate-100" />
            <div className="flex items-baseline gap-2 pt-0.5">
              <Skeleton className="h-7 sm:h-8 w-44 sm:w-52 rounded-xl bg-slate-200/80" />
              <Skeleton className="h-3 w-8 rounded bg-slate-100" />
            </div>
          </div>

          <Skeleton className="h-6 w-16 rounded-full bg-emerald-50 border border-emerald-100 shrink-0 mt-0.5" />
        </div>

        {/* Barra de Progresso de Confirmações */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-3.5 rounded-full bg-emerald-100 shrink-0" />
              <Skeleton className="h-3 w-32 rounded bg-slate-100" />
            </div>
            <Skeleton className="h-3 w-8 rounded bg-slate-200" />
          </div>
          <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
        </div>

        {/* Linha Inferior com Faturamento Atual */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-28 rounded bg-slate-100" />
          <Skeleton className="h-3.5 w-32 rounded bg-slate-200/90" />
        </div>
      </div>

      {/* 2. SKELETON DAS PÍLULAS DE STATUS E TOOLBAR */}
      <div className="space-y-2.5">
        {/* Pílulas de Status com Scroll Horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Skeleton className="h-9 w-24 rounded-full bg-slate-200/70 shrink-0" />
          <Skeleton className="h-9 w-32 rounded-full bg-slate-100 shrink-0" />
          <Skeleton className="h-9 w-28 rounded-full bg-slate-100 shrink-0" />
          <Skeleton className="h-9 w-24 rounded-full bg-slate-100 shrink-0" />
        </div>

        {/* Toolbar: Busca + Filtros + Ajustes em Lote */}
        <div className="flex flex-col md:flex-row gap-2">
          <Skeleton className="h-12 md:h-14 flex-1 rounded-2xl bg-white border border-slate-100 shadow-sm" />
          <div className="grid grid-cols-2 md:flex gap-2 shrink-0">
            <Skeleton className="h-12 md:h-14 md:w-32 rounded-2xl bg-white border border-slate-100 shadow-sm" />
            <Skeleton className="h-12 md:h-14 md:w-44 rounded-2xl bg-white border border-slate-100 shadow-sm" />
          </div>
        </div>
      </div>

      {/* 3. SKELETON DOS CARDS DE PASSAGEIROS */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm space-y-3"
          >
            {/* Header: Avatar + Nome/Responsável */}
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="h-10 w-10 rounded-full bg-slate-100 shrink-0 border border-slate-200/60" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-36 sm:w-48 rounded bg-slate-200" />
                <Skeleton className="h-3 w-24 sm:w-32 rounded bg-slate-100" />
              </div>
            </div>

            {/* Bloco de Parcelas */}
            <Skeleton className="h-16 w-full rounded-xl bg-slate-50/70 border border-slate-200/70" />

            {/* Ações Secundárias (WhatsApp 50% | Editar 50%) */}
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-xl bg-slate-50 border border-slate-200/60" />
              <Skeleton className="h-10 rounded-xl bg-slate-50 border border-slate-200/60" />
            </div>

            {/* Seletor Segmentado de 3 Estados (Saída | Pendente | Confirmado) */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 gap-1">
              <Skeleton className="h-9 rounded-lg bg-slate-200/60" />
              <Skeleton className="h-9 rounded-lg bg-slate-200/60" />
              <Skeleton className="h-9 rounded-lg bg-slate-200/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
