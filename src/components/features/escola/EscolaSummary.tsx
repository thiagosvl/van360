import { Escola } from "@/types/escola";
import { formatarEnderecoCompleto } from "@/utils/formatters";
import { GraduationCap, MapPin, Users2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

interface EscolaSummaryProps {
  escola: Escola & { passageiros_ativos_count?: number };
}

export const EscolaSummary = ({ escola }: EscolaSummaryProps) => {
  const enderecoResumido = escola.endereco || formatarEnderecoCompleto(escola);

  return (
    <div className="flex flex-col p-4 sm:p-5 bg-[#fafafa] rounded-[22px] border border-[#e5e5e5] shadow-2xs text-left w-full min-w-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2.5 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-5 rounded-[8px] bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
            <GraduationCap className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em] leading-none">
            Escola
          </span>
        </div>

        <StatusBadge status={escola.ativo} />
      </div>

      <div className="flex items-start gap-2 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight leading-snug line-clamp-3 break-words w-full min-w-0">
          {escola.nome}
        </h1>
      </div>

      {enderecoResumido && (
        <div className="flex items-start gap-1.5 mt-1.5 w-full min-w-0">
          <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0 mt-0.5" />
          <p className="text-xs font-normal text-[#737373] leading-snug break-words w-full min-w-0">
            {enderecoResumido}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e5e5e5] w-full min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Users2 className="h-4 w-4 text-[#737373] shrink-0" />
          <span className="text-xs font-medium text-[#737373] truncate">
            <strong className="text-[#0a0a0a] font-semibold">
              {escola.passageiros_ativos_count ?? 0}
            </strong>{" "}
            {(escola.passageiros_ativos_count ?? 0) === 1 ? "aluno ativo" : "alunos ativos"}
          </span>
        </div>
      </div>
    </div>
  );
};
