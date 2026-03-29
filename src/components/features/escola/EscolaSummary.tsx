import { Escola } from "@/types/escola";
import { GraduationCap, MapPin, Users2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscolaSummaryProps {
  escola: Escola & { passageiros_ativos_count?: number };
}

export const EscolaSummary = ({ escola }: EscolaSummaryProps) => {
  const isAtivo = escola.ativo;
  const statusLabel = isAtivo ? "Ativa" : "Inativa";

  const enderecoResumido = escola.endereco ||
    `${escola.logradouro || ""}${escola.numero ? `, ${escola.numero}` : ""}${escola.bairro ? ` - ${escola.bairro}` : ""}`;

  return (
    <div className="flex flex-col p-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-950 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline Categoria + Status Badge */}
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
          Escola
        </p>
      </div>

      {/* LINHA 2: Nome em Destaque */}
      <div className="flex items-center gap-2">
        <h1 className="text-[19px] font-black text-[#1a3a5c] dark:text-zinc-100 leading-tight tracking-tight">
          {escola.nome}
        </h1>
        <GraduationCap className="h-4 w-4 text-slate-300 dark:text-zinc-700 ml-auto opacity-50" />
      </div>

      {/* Subtítulo: Endereço Resumido */}
      {enderecoResumido && (
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="h-2.5 w-2.5 text-slate-400" />
          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase leading-none truncate pr-4">
            {enderecoResumido}
          </p>
        </div>
      )}

      {/* LINHA 3: Footer com Passageiros e Contato */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 grayscale-0 opacity-80">
          <Users2 className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-tighter">
            {escola.passageiros_ativos_count ?? 0} Passageiros Ativos
          </span>
        </div>

        <div className={cn(
          "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
          isAtivo ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-slate-50 text-slate-500 dark:bg-zinc-800"
        )}>
          {statusLabel}
        </div>
      </div>
    </div>
  );
};
