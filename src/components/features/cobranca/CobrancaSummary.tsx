import { Cobranca } from "@/types/cobranca";
import { formatCurrency, formatDateToBR, formatShortName, getMesNome, formatDiasAtraso } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { cn } from "@/lib/utils";
import { CobrancaStatus } from "@/types/enums";
import { checkCobrancaEmAtraso, getCobrancaValorExibicao } from "@/utils/formatters/cobranca";
import {
  Calendar,
} from "lucide-react";

interface CobrancaSummaryProps {
  cobranca: Cobranca;
}

export const CobrancaSummary = ({ cobranca }: CobrancaSummaryProps) => {
  const isProjection = cobranca.isProjection === true;
  const isPago = !isProjection && cobranca.status === CobrancaStatus.PAGO;
  const isPendente = (isProjection || cobranca.status === CobrancaStatus.PENDENTE) && !isPago;
  const isAtrasado = isPendente && checkCobrancaEmAtraso(cobranca.data_vencimento);

  const statusLabel = isPago ? "Pago" : isAtrasado ? "Em Atraso" : "Pendente";

  return (
    <div className="flex flex-col p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left w-full min-w-0 overflow-hidden">

      {/* LINHA 1: Overline de Contexto + Badge Minimalista */}
      <div className="flex justify-between items-center mb-2 w-full min-w-0 gap-2">
        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider leading-none shrink-0">
          PARCELA DE {getMesNome(cobranca.mes)}
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
          isPago ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
            isAtrasado ? "bg-red-100/60 text-red-600 dark:bg-red-950/30" :
              "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
        )}>
          {statusLabel}
        </div>
      </div>

      {/* LINHA 2: Nome do Passageiro em Destaque */}
      <div className="flex items-start gap-2 mt-0.5 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-[#1a3a5c] dark:text-zinc-100 leading-snug line-clamp-3 break-words w-full min-w-0">
          {formatShortName(cobranca.passageiro?.nome, true)}
        </h1>
      </div>

      {/* Info Extra de Responsável */}
      {cobranca.passageiro?.responsavel_principal?.nome && (
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2 break-words w-full min-w-0">
          {formatNomeResponsavelExibicao(cobranca.passageiro.responsavel_principal.nome)}
        </p>
      )}

      {/* LINHA 3: Footer com Valor e Data */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 w-full min-w-0 gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className={cn("h-4 w-4 shrink-0", isAtrasado ? "text-red-500 dark:text-red-400" : "text-slate-400")} />
            <span
              className={cn(
                "max-[320px]:text-[10px] text-[11px] sm:text-[12px] font-bold uppercase tracking-wide truncate",
                isAtrasado
                  ? "text-red-600 dark:text-red-400 font-extrabold"
                  : "text-slate-400 dark:text-zinc-400"
              )}
            >
              {isAtrasado
                ? formatDiasAtraso(cobranca.data_vencimento)
                : `Vence ${formatDateToBR(cobranca.data_vencimento)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-lg sm:text-[20px] font-bold text-[#1a3a5c] dark:text-zinc-100 tracking-tight leading-none">
            {formatCurrency(getCobrancaValorExibicao(cobranca))}
          </span>
        </div>
      </div>
    </div>
  );
};
