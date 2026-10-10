import { cn } from "@/lib/utils";
import { ContratoProvider, ContratoStatus } from "@/types/enums";
import { formatCurrency, formatMonthYearToBR, formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { useAppPreferences } from "@/hooks";
import { Calendar } from "lucide-react";
import { ContratoListItem } from "@/types/contract";
import { isResponsavelIncompleto } from "@/utils/domain";
import { Banner } from "@/components/ui/Banner";

interface ContratoSummaryProps {
  item: ContratoListItem;
}

export const ContratoSummary = ({ item }: ContratoSummaryProps) => {
  const { formatoNomeResponsavel } = useAppPreferences();
  const nomePassageiro = item.passageiro?.nome || item.nome;
  const respObj = item.passageiro?.responsavel_principal || item.responsavel_principal;
  const isMissingResponsible = isResponsavelIncompleto(respObj?.nome, respObj?.telefone);
  const nomeResponsavel = formatNomeResponsavelExibicao(respObj?.nome, formatoNomeResponsavel);
  const status = item.status as ContratoStatus | null;
  const isAssinado = status === ContratoStatus.ASSINADO;
  const isPendente = status === ContratoStatus.PENDENTE;
  const isSemContrato = item.tipo === "passageiro" || (!isAssinado && !isPendente && !item.provider);

  const valor =
    Number(item.dados_contrato?.valorMensal || item.valor_parcela || item.valor_cobranca) || null;

  const isImportado = item.provider === ContratoProvider.IMPORTADO;
  const statusLabel = isImportado
    ? "Assinado (Importado)"
    : isSemContrato && isMissingResponsible
      ? "Cadastro Incompleto"
      : isSemContrato
        ? "Sem Contrato"
        : formatContratoStatus(status);

  const dataExibicao = isImportado
    ? (item.assinado_em || item.created_at)
    : isAssinado
      ? (item.assinado_em || item.created_at)
      : item.created_at;

  const dataLabel = isImportado
    ? "Importado em"
    : isAssinado
      ? "Assinado em"
      : "Emitido em";

  return (
    <div className="flex flex-col p-4 sm:p-5 bg-[#fafafa] rounded-[22px] border border-[#e5e5e5] text-left w-full min-w-0 overflow-hidden shadow-2xs">
      <div className="flex justify-between items-center mb-2.5 w-full min-w-0 gap-2">
        <span className="text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em] shrink-0">
          Contrato do Aluno
        </span>

        <span
          className={cn(
            "px-2.5 py-0.5 rounded-[18px] text-[10px] font-medium tracking-tight shrink-0 border transition-colors",
            isAssinado
              ? "bg-emerald-500/[0.08] text-emerald-700 border-emerald-500/20"
              : isImportado
                ? "bg-sky-500/[0.08] text-sky-700 border-sky-500/20"
                : isPendente
                  ? "bg-amber-500/[0.08] text-amber-700 border-amber-500/20"
                  : "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-start gap-2 w-full min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight leading-snug line-clamp-2 break-words w-full min-w-0">
          {formatShortName(nomePassageiro, true)}
        </h2>
      </div>

      {nomeResponsavel ? (
        <p
          className={cn(
            "text-xs font-normal text-[#737373] mt-0.5 leading-snug w-full min-w-0",
            formatoNomeResponsavel === "completo" ? "truncate" : "line-clamp-2 break-words"
          )}
        >
          {nomeResponsavel}
        </p>
      ) : isMissingResponsible ? (
        <p className="text-xs font-normal text-[#737373] mt-0.5 leading-snug line-clamp-2 break-words w-full min-w-0">
          Responsável não cadastrado
        </p>
      ) : null}

      {isSemContrato && isMissingResponsible && (
        <div className="mt-3">
          <Banner
            variant="warning"
            title="Cadastro incompleto"
            description="Complete o cadastro do responsável para emitir o contrato."
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#e5e5e5] w-full min-w-0 gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          {(isAssinado || isPendente || isImportado) && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="h-3.5 w-3.5 text-[#737373] shrink-0" />
              <span className="text-[11px] font-medium text-[#737373] tracking-tight truncate">
                {dataLabel} {formatMonthYearToBR(dataExibicao)}
              </span>
            </div>
          )}
        </div>

        {valor && (
          <div className="flex items-baseline shrink-0">
            <span className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight leading-none">
              {formatCurrency(valor)}
            </span>
            <span className="text-[11px] font-medium text-[#737373] ml-1">/mês</span>
          </div>
        )}
      </div>
    </div>
  );
};
