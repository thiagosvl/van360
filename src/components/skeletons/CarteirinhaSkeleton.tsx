import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks";

export function CarteirinhaSkeleton() {
  const isMobile = useIsMobile();

  // 1. Dark Blue Top Card
  const renderTopCard = () => (
    <div className="bg-[#1a3a5c] rounded-[2rem] relative flex flex-col items-center mb-6 sm:mb-8 shadow-md px-4 pt-8 pb-10 w-full">
      {/* Fundo em duas cores (20% mais escuro no topo) */}
      <div className="absolute top-0 left-0 w-full h-[28%] bg-black/15 rounded-t-[2rem] z-0" />

      {/* Conteúdo */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Avatar */}
        <div className="rounded-full bg-white p-[3px] shadow-sm shrink-0">
          <div className="rounded-full bg-[#132a42] p-[4px]">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-200/20 border-[3px] border-white/20 flex items-center justify-center animate-pulse" />
          </div>
        </div>

        {/* Textos */}
        <div className="text-center mt-3 w-full flex flex-col items-center space-y-2">
          <Skeleton className="h-6 sm:h-7 w-48 sm:w-64 bg-white/20 rounded-xl" />
          <Skeleton className="h-4 w-36 sm:w-44 bg-white/10 rounded-lg" />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <Skeleton className="h-5 w-16 bg-white/15 rounded-full" />
          <Skeleton className="h-5 w-20 bg-white/15 rounded-full" />
          <Skeleton className="h-5 w-24 bg-white/15 rounded-full" />
        </div>
      </div>

      {/* Action Buttons (floating at the bottom) */}
      <div className="absolute -bottom-6 left-0 w-full flex justify-center gap-3 z-20">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-12 rounded-full shadow-md bg-slate-200" />
        ))}
      </div>
    </div>
  );

  // 2. Dados Pessoais Detailed Card
  const renderDadosPessoais = () => (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-5 sm:p-6 space-y-5 w-full">
      {/* Contrato Block */}
      <div className="rounded-2xl border border-slate-100 p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3 w-full">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 mt-0.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>

      {/* Responsáveis Section */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        {/* Selected Responsável Card */}
        <div className="space-y-2.5 pt-1">
          <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-full" />
          </div>
          <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3.5 w-full" />
          </div>
          <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Info tiles grid */}
      <div className="space-y-3 pt-1">
        {/* Escola */}
        <Skeleton className="h-[72px] w-full rounded-2xl" />

        {/* Periodo + Turma */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
        </div>

        {/* Modalidade + Veiculo */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
        </div>

        {/* Nascimento + Genero */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
        </div>

        {/* Inicio + Vencimento */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[72px] rounded-2xl" />
          <Skeleton className="h-[72px] rounded-2xl" />
        </div>
      </div>
    </div>
  );

  // 3. Cobrancas Card
  const renderCobrancas = () => (
    <div className="space-y-6 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>

      {/* Parcelas List */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-100/80 shadow-xs flex items-center justify-between h-20"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. Observacoes Card
  const renderObservacoes = () => (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-5 space-y-3 w-full">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-5 w-full">
        {/* Header Fixo */}
        <div className="px-1 pt-1">
          {renderTopCard()}
        </div>

        {/* Abas */}
        <div className="w-full pt-2 space-y-4">
          <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
            <div className="grid grid-cols-2 gap-1 min-h-[40px]">
              <div className="rounded-[1rem] bg-white shadow-sm flex items-center justify-center">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-center">
                <Skeleton className="h-4 w-24" />
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

  // Desktop view
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Lado Esquerdo */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="space-y-6">
          {renderTopCard()}
          {renderDadosPessoais()}
        </div>
        {renderObservacoes()}
      </div>

      {/* Lado Direito */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {renderCobrancas()}
      </div>
    </div>
  );
}
