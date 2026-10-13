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
      <div className="p-3 rounded-xl bg-card border border-border text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>Usuários ativos</span>
        </div>
        <div className="text-xl font-semibold text-foreground">
          {total}
        </div>
        <p className="text-[11px] text-muted-foreground font-normal">No período filtrado</p>
      </div>

      <div className="p-3 rounded-xl bg-card border border-border text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
          <span>Novos cadastros</span>
        </div>
        <div className="text-xl font-semibold text-emerald-400">
          {total_novos}
        </div>
        <p className="text-[11px] text-muted-foreground font-normal">Criaram conta no período</p>
      </div>

      <div className="p-3 rounded-xl bg-card border border-border text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5 text-purple-400" />
          <span>Recorrentes</span>
        </div>
        <div className="text-xl font-semibold text-foreground">
          {total_recorrentes}
        </div>
        <p className="text-[11px] text-muted-foreground font-normal">Veteranos no período</p>
      </div>

      <div className="p-3 rounded-xl bg-card border border-border text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-medium text-sky-400">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span>Em trial</span>
        </div>
        <div className="text-xl font-semibold text-sky-400">
          {total_trial}
        </div>
        <p className="text-[11px] text-muted-foreground font-normal">Foco de conversão</p>
      </div>

      <div className="p-3 rounded-xl bg-card border border-border text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Assinantes</span>
        </div>
        <div className="text-xl font-semibold text-emerald-400">
          {total_ativos}
        </div>
        <p className="text-[11px] text-muted-foreground font-normal">Assinatura ativa</p>
      </div>

      <div className="p-3 rounded-xl bg-card border border-border text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-medium text-purple-400">
          <InfinityIcon className="h-3.5 w-3.5 text-purple-400" />
          <span>Vitalícios</span>
        </div>
        <div className="text-xl font-semibold text-purple-400">
          {total_vitalicios}
        </div>
        <p className="text-[11px] text-muted-foreground font-normal">Acesso vitalício</p>
      </div>
    </div>
  );
}
