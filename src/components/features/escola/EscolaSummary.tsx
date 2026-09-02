import { Escola } from "@/types/escola";
import { formatarEnderecoCompleto } from "@/utils/formatters";
import { GraduationCap, MapPin, Users2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/common/StatusBadge";

interface EscolaSummaryProps {
  escola: Escola & { passageiros_ativos_count?: number };
}

export const EscolaSummary = ({ escola }: EscolaSummaryProps) => {
  const enderecoResumido = escola.endereco || formatarEnderecoCompleto(escola);

  return (
    <div className="flex flex-col p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left w-full min-w-0 overflow-hidden">

      {/* LINHA 1: Overline Categoria + Status Badge */}
      <div className="flex justify-between items-center mb-2 w-full min-w-0 gap-2">
        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider leading-none shrink-0">
          ESCOLA
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
        )}>
          <StatusBadge
            status={escola.ativo}
          />
        </div>
      </div>

      {/* LINHA 2: Nome em Destaque */}
      <div className="flex items-start gap-2 mt-0.5 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-[#1a3a5c] dark:text-zinc-100 leading-snug line-clamp-3 break-words w-full min-w-0">
          {escola.nome}
        </h1>
      </div>

      {/* Subtítulo: Endereço Resumido */}
      {enderecoResumido && (
        <div className="flex items-start gap-1.5 mt-2 w-full min-w-0">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 leading-snug break-words w-full min-w-0">
            {enderecoResumido}
          </p>
        </div>
      )}

      {/* LINHA 3: Footer com Passageiros */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 w-full min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Users2 className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-[11px] sm:text-[12px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wide truncate">
            {escola.passageiros_ativos_count ?? 0} ALUNOS ATIVOS
          </span>
        </div>
      </div>
    </div>
  );
};
