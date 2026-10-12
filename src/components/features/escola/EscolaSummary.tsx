import { Escola } from "@/types/escola";
import { formatarEnderecoCompleto } from "@/utils/formatters";
import { MapPin, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscolaSummaryProps {
  escola: Escola & { passageiros_ativos_count?: number };
}

export const EscolaSummary = ({ escola }: EscolaSummaryProps) => {
  const enderecoResumido = escola.endereco || formatarEnderecoCompleto(escola);

  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="flex justify-between items-center mb-1.5 w-full min-w-0 gap-2">
        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none truncate">
          Escola
        </span>

        <div
          className={cn(
            "px-2 py-0.5 rounded-[12px] text-[10px] font-semibold uppercase tracking-wider shrink-0 border transition-colors",
            escola.ativo
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
          )}
        >
          {escola.ativo ? "Ativo" : "Inativo"}
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight line-clamp-2 break-words w-full min-w-0 mt-0.5">
        {escola.nome}
      </h2>

      {enderecoResumido && (
        <div className="flex items-start gap-1 mt-1 w-full min-w-0">
          <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0 mt-0.5" />
          <p className="text-xs font-normal text-[#737373] leading-snug break-words w-full min-w-0">
            {enderecoResumido}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e5e5e5]/80 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 text-[#737373]">
          <Users2 className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-normal text-[#737373] truncate">
            Alunos ativos
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight leading-none">
            {escola.passageiros_ativos_count ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};
