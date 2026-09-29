import { cn } from "@/lib/utils";
import { ContratoProvider, ContratoStatus } from "@/types/enums";
import { formatCurrency, formatMonthYearToBR, formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { AlertCircle, Calendar } from "lucide-react";

import { ContratoListItem } from "@/types/contract";
import { isResponsavelIncompleto } from "@/utils/domain";

interface ContratoSummaryProps {
  item: ContratoListItem;
}

export const ContratoSummary = ({ item }: ContratoSummaryProps) => {
  const nomePassageiro = item.passageiro?.nome || item.nome;
  const respObj = item.passageiro?.responsavel_principal || item.responsavel_principal;
  const isMissingResponsible = isResponsavelIncompleto(respObj?.nome, respObj?.telefone);
  const nomeResponsavel = formatNomeResponsavelExibicao(respObj?.nome, true);
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
    <div className="flex flex-col p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left w-full min-w-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2 w-full min-w-0 gap-2">
        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider leading-none shrink-0">
          CONTRATO
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
          isImportado ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30" :
            isAssinado ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
              isPendente ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" :
                isSemContrato && isMissingResponsible ? "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/30" :
                  "bg-slate-50 text-slate-500 dark:bg-zinc-800"
        )}>
          {statusLabel}
        </div>
      </div>

      <div className="flex items-start gap-2 mt-0.5 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-[#1a3a5c] dark:text-zinc-100 leading-snug line-clamp-3 break-words w-full min-w-0">
          {formatShortName(nomePassageiro, true)}
        </h1>
      </div>

      {nomeResponsavel ? (
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2 break-words w-full min-w-0">
          {nomeResponsavel}
        </p>
      ) : isMissingResponsible ? (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1 leading-snug line-clamp-2 break-words w-full min-w-0">
          Responsável não cadastrado
        </p>
      ) : null}

      {isSemContrato && isMissingResponsible && (
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            Para emitir o contrato, cadastre o responsável. Ao salvar, a emissão do contrato será iniciada automaticamente.
          </p>
        </div>
      )}

      {/* LINHA 3: Footer com Valor e Data */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 w-full min-w-0 gap-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          {(isAssinado || isPendente || isImportado) && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="max-[320px]:text-[10px] text-[11px] sm:text-[12px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wide truncate">
                {dataLabel} {formatMonthYearToBR(dataExibicao)}
              </span>
            </div>
          )}
        </div>

        {valor && (
          <div className="flex items-center shrink-0">
            <span className="max-[320px]:text-sm text-lg sm:text-[20px] font-bold text-[#1a3a5c] dark:text-zinc-100 tracking-tight leading-none">
              {formatCurrency(valor)}
              <span className="text-[11px] font-bold text-slate-400 ml-0.5">/MÊS</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
