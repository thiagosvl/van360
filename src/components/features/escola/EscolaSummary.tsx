import { Escola } from "@/types/escola";
import { formatarEnderecoCompleto } from "@/utils/formatters";
import { GraduationCap, MapPin, Users2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/common/StatusBadge";

interface EscolaSummaryProps {
  escola: Escola & { passageiros_ativos_count?: number };
}

export const EscolaSummary = ({ escola }: EscolaSummaryProps) => {
  const isAtivo = escola.ativo;

  const enderecoResumido = escola.endereco || formatarEnderecoCompleto(escola);

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline Categoria + Status Badge */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider leading-none">
          ESCOLA
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
        )}>
          <StatusBadge
            status={escola.ativo}
          />
        </div>
      </div>

      {/* LINHA 2: Nome em Destaque */}
      <div className="flex items-start gap-2 mt-1">
        <h1 className="text-[22px] font-semibold text-[#1a3a5c] dark:text-zinc-100 leading-tight line-clamp-3 break-words">
          {escola.nome}
        </h1>
      </div>

      {/* Subtítulo: Endereço Resumido */}
      {enderecoResumido && (
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <p className="text-[13px] font-medium text-slate-500 dark:text-zinc-400 uppercase leading-none truncate">
            {enderecoResumido}
          </p>
        </div>
      )}

      {/* LINHA 3: Footer com Passageiros */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Users2 className="h-4 w-4 text-slate-400" />
          <span className="text-[12px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
            <strong className="text-slate-600 dark:text-zinc-300 font-semibold">{escola.passageiros_ativos_count ?? 0}</strong> PASSAGEIROS ATIVOS
          </span>
        </div>
      </div>
    </div>
  );
};
