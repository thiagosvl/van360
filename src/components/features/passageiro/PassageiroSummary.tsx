import { Passageiro } from "@/types/passageiro";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { formatPeriodo } from "@/utils/formatters/periodo";
import { formatarTelefoneExibicao } from "@/utils/formatters/phone";
import { useAppPreferences } from "@/hooks";
import { GraduationCap, Phone, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PassageiroSummaryProps {
  passageiro: Passageiro;
}

export const PassageiroSummary = ({ passageiro }: PassageiroSummaryProps) => {
  const { formatoNomeResponsavel, formatAlunoNome } = useAppPreferences();
  const respName = formatNomeResponsavelExibicao(passageiro.responsavel_principal?.nome, formatoNomeResponsavel);
  const respTelefone = passageiro.responsavel_principal?.telefone;

  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="flex justify-between items-center mb-1.5 w-full min-w-0 gap-2">
        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none truncate">
          Aluno
        </span>

        <div
          className={cn(
            "px-2 py-0.5 rounded-[12px] text-[10px] font-semibold uppercase tracking-wider shrink-0 border transition-colors",
            passageiro.ativo
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
          )}
        >
          {passageiro.ativo ? "Ativo" : "Inativo"}
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight line-clamp-2 break-words w-full min-w-0 mt-0.5">
        {formatAlunoNome(passageiro.nome)}
      </h2>

      {passageiro.escola?.nome && (
        <div className="flex items-center gap-1.5 mt-1 w-full min-w-0 text-[#737373]">
          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
          <p className="text-xs font-normal leading-snug truncate">
            {passageiro.escola.nome}
            {passageiro.periodo ? ` • ${formatPeriodo(passageiro.periodo)}` : ""}
            {passageiro.turma ? ` • ${passageiro.turma}` : ""}
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

          {respTelefone && (
            <div className="flex items-center gap-1 shrink-0 text-[#737373]">
              <Phone className="h-3 w-3" />
              <span className="text-xs font-normal tabular-nums">
                {formatarTelefoneExibicao(respTelefone)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
