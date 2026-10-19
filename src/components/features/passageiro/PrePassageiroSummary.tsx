import { PrePassageiro } from "@/types/prePassageiro";
import { formatRelativeTime, formatarTelefone } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { useAppPreferences } from "@/hooks";
import { Clock, Phone, User2 } from "lucide-react";

interface PrePassageiroSummaryProps {
  prePassageiro: PrePassageiro;
}

export const PrePassageiroSummary = ({ prePassageiro }: PrePassageiroSummaryProps) => {
  const { formatoNomeResponsavel, formatAlunoNome } = useAppPreferences();
  const respName = formatNomeResponsavelExibicao(prePassageiro.nome_responsavel, formatoNomeResponsavel);

  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="flex justify-between items-center mb-1.5 w-full min-w-0 gap-2">
        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none truncate">
          Solicitação
        </span>

        <div className="px-2 py-0.5 rounded-[12px] text-[10px] font-semibold uppercase tracking-wider shrink-0 border bg-amber-50 text-amber-700 border-amber-200/70">
          Pendente
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight line-clamp-2 break-words w-full min-w-0 mt-0.5">
        {formatAlunoNome(prePassageiro.nome)}
      </h2>

      {prePassageiro.created_at && (
        <div className="flex items-center gap-1.5 mt-1 w-full min-w-0 text-[#737373]">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <p className="text-xs font-normal leading-snug truncate">
            Enviada {formatRelativeTime(prePassageiro.created_at)}
          </p>
        </div>
      )}

      {respName && (
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e5e5e5]/80 w-full min-w-0 gap-2">
          <div className="flex items-center gap-1.5 min-w-0 text-[#737373]">
            <User2 className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-normal truncate">
              {respName}
            </span>
          </div>

          {prePassageiro.telefone_responsavel && (
            <div className="flex items-center gap-1 shrink-0 text-[#737373]">
              <Phone className="h-3 w-3" />
              <span className="text-xs font-normal tabular-nums">
                {formatarTelefone(prePassageiro.telefone_responsavel)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
