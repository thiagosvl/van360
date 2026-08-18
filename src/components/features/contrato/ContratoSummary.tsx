import { cn } from "@/lib/utils";
import { ContratoProvider, ContratoStatus } from "@/types/enums";
import { formatCurrency, formatMonthYearToBR, formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { Calendar } from "lucide-react";

interface ContratoSummaryProps {
  item: any;
}

export const ContratoSummary = ({ item }: ContratoSummaryProps) => {
  const nomePassageiro = item.passageiro?.nome || item.nome;
  const nomeResponsavel = formatNomeResponsavelExibicao(item.passageiro?.responsavel_principal?.nome || item.responsavel_principal?.nome, true);
  const status = item.status as ContratoStatus | null;
  const isAssinado = status === ContratoStatus.ASSINADO;
  const isPendente = status === ContratoStatus.PENDENTE;

  const valor =
    Number(item.dados_contrato?.valorMensal || item.valor_parcela || item.valor_mensal) || null;

  const isImportado = item.provider === ContratoProvider.IMPORTADO;
  const statusLabel = isImportado ? "PDF Importado" : formatContratoStatus(status);

  const dataExibicao = isImportado
    ? (item.dados_contrato?.dataImportacao || item.assinado_em || item.created_at)
    : isAssinado
      ? (item.assinado_em || item.data_assinatura || item.updated_at || item.created_at)
      : item.created_at;

  const dataLabel = isImportado
    ? "Importado em"
    : isAssinado
      ? "Assinado em"
      : "Emitido em";

  return (
    <div className="flex flex-col p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left w-full min-w-0 overflow-hidden">

      {/* LINHA 1: Overline Categoria + Status Badge */}
      <div className="flex justify-between items-center mb-2 w-full min-w-0 gap-2">
        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider leading-none shrink-0">
          CONTRATO
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
          isImportado ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30" :
            isAssinado ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
              isPendente ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" :
                "bg-slate-50 text-slate-500 dark:bg-zinc-800"
        )}>
          {statusLabel}
        </div>
      </div>

      {/* LINHA 2: Nome em Destaque */}
      <div className="flex items-start gap-2 mt-0.5 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-[#1a3a5c] dark:text-zinc-100 leading-snug line-clamp-3 break-words w-full min-w-0">
          {formatShortName(nomePassageiro, true)}
        </h1>
      </div>

      {/* Subtítulo: Responsável */}
      {nomeResponsavel && (
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2 break-words w-full min-w-0">
          {nomeResponsavel}
        </p>
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
