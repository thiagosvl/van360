import { Users, UserPlus, RotateCcw, Sparkles, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";

interface ActivityMetricsSummaryProps {
  total?: number;
  total_novos?: number;
  total_recorrentes?: number;
  total_trial?: number;
  total_ativos?: number;
  total_vitalicios?: number;
}

export function ActivityMetricsSummary({
  total,
  total_novos = 0,
  total_recorrentes = 0,
  total_trial = 0,
  total_ativos = 0,
  total_vitalicios = 0,
}: ActivityMetricsSummaryProps) {
  if (total === undefined) {
    return null;
  }

  return (
    <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 pb-2 mb-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-6 touch-pan-x">
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          <span>Usuários Ativos</span>
        </div>
        <div className="text-xl font-headline font-black text-white">
          {total}
        </div>
        <p className="text-[10px] text-slate-500 font-medium">No período filtrado</p>
      </div>

      <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
          <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
          <span>Novos Cadastros</span>
        </div>
        <div className="text-xl font-headline font-black text-emerald-200">
          {total_novos}
        </div>
        <p className="text-[10px] text-emerald-400/70 font-medium">Criaram conta no período</p>
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          <RotateCcw className="h-3.5 w-3.5 text-purple-400" />
          <span>Recorrentes</span>
        </div>
        <div className="text-xl font-headline font-black text-white">
          {total_recorrentes}
        </div>
        <p className="text-[10px] text-slate-500 font-medium">Não assinantes cadastrados antes</p>
      </div>

      <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span>Em Trial</span>
        </div>
        <div className="text-xl font-headline font-black text-sky-200">
          {total_trial}
        </div>
        <p className="text-[10px] text-sky-400/70 font-medium">Foco de conversão</p>
      </div>

      <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Assinantes</span>
        </div>
        <div className="text-xl font-headline font-black text-emerald-200">
          {total_ativos}
        </div>
        <p className="text-[10px] text-emerald-400/70 font-medium">Assinatura ativa</p>
      </div>

      <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
          <InfinityIcon className="h-3.5 w-3.5 text-purple-400" />
          <span>Vitalícios</span>
        </div>
        <div className="text-xl font-headline font-black text-purple-200">
          {total_vitalicios}
        </div>
        <p className="text-[10px] text-purple-400/70 font-medium">Acesso vitalício</p>
      </div>
    </div>
  );
}
