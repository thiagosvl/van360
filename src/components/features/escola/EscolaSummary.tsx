import { Escola } from "@/types/escola";
import { GraduationCap, MapPin, Phone, Users2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface EscolaSummaryProps {
  escola: Escola & { passageiros_ativos_count?: number };
}

export const EscolaSummary = ({ escola }: EscolaSummaryProps) => {
  return (
    <div className="flex flex-col gap-3 p-5 bg-white dark:bg-zinc-800/40 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">
      {/* Cabeçalho com Nome e Status */}
      <div className="flex justify-between items-start mb-0.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-10 w-10 bg-slate-50 border border-slate-100 dark:bg-zinc-900/40 dark:border-zinc-800 rounded-xl shrink-0">
            <GraduationCap className="h-5 w-5 text-[#1a3a5c] dark:text-zinc-200" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
              Escola
            </p>
            <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-200 leading-tight">
              {escola.nome}
            </h1>
          </div>
        </div>
      </div>

      {/* Endereço */}
      {(escola.endereco || escola.logradouro) && (
        <div className="p-3 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl border border-slate-100/50 dark:border-zinc-800/50 flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
            {escola.endereco ||
              `${escola.logradouro}${escola.numero ? `, ${escola.numero}` : ""}${escola.bairro ? ` - ${escola.bairro}` : ""}${escola.cidade ? ` - ${escola.cidade}` : ""}`
            }
          </p>
        </div>
      )}

      {/* Rodapé com Passageiros e Telefone */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-1.5 ">
          <Users2 className="h-3 w-3 text-slate-400" />
          <div className="flex items-center gap-1">
            <span className="text-[12px] font-black text-[#1a3a5c] dark:text-zinc-100 leading-none">
              {escola.passageiros_ativos_count ?? 0}
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none ml-1">
              Passageiros Ativos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {escola.telefone && (
            <div className="flex items-center gap-1.5 opacity-70">
              <Phone className="h-3 w-3 text-slate-400" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {escola.telefone}
              </p>
            </div>
          )}
          <StatusBadge
            status={escola.ativo}
            className={cn(
              "font-bold text-[8px] h-3.5 px-1.5 rounded-sm border-none shadow-none uppercase tracking-widest leading-none",
              escola.ativo ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
            )}
          />
        </div>
      </div>
    </div>
  );
};
