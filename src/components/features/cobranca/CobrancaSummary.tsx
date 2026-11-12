import { Cobranca } from "@/types/cobranca";
import { formatCurrency, formatDateToBR, formatDiasAtraso, getMesAbreviado } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { useAppPreferences } from "@/hooks";
import { cn } from "@/lib/utils";
import { CobrancaStatus } from "@/types/enums";
import {
  checkCobrancaEmAtraso,
  getCobrancaValorExibicao,
  isCobrancaRepasseAutomatico,
} from "@/utils/formatters/cobranca";
import {
  Calendar,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Banner } from "@/components/ui/Banner";

interface CobrancaSummaryProps {
  cobranca: Cobranca;
  isMotorista?: boolean;
}

export const CobrancaSummary = ({ cobranca, isMotorista = true }: CobrancaSummaryProps) => {
  const { formatoNomeResponsavel, formatAlunoNome } = useAppPreferences();
  const isProjection = cobranca.isProjection === true;
  const isCancelada = !isProjection && cobranca.status === CobrancaStatus.CANCELADA;
  const isPago = !isProjection && !isCancelada && cobranca.status === CobrancaStatus.PAGO;
  const isRepasse = isPago && isCobrancaRepasseAutomatico(cobranca);
  const isParcial = isPago && cobranca.valor_pago !== null && cobranca.valor_pago !== undefined && Number(cobranca.valor_pago) < Number(cobranca.valor);
  const isAtrasado = !isPago && !isCancelada && checkCobrancaEmAtraso(cobranca.data_vencimento);

  const isRepasseEmProcessamento = !isPago && !isCancelada && !!cobranca.repasse_em_processamento;

  const statusLabel = isRepasseEmProcessamento
    ? "Repasse em Processamento"
    : isCancelada
      ? "Cancelada"
      : isParcial
        ? "Parcial"
        : isPago
          ? "Pago"
          : isAtrasado
            ? "Em Atraso"
            : "Pendente";

  const mesAbreviado = cobranca.mes ? getMesAbreviado(cobranca.mes) : "--";
  const anoFormatado = cobranca.ano ? String(cobranca.ano).slice(-2) : "--";

  return (
    <div className="flex flex-col text-left w-full min-w-0 px-0.5 pt-0.5 pb-1">
      <div className="pr-8">
        <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] tracking-tight leading-tight line-clamp-2 break-words w-full min-w-0">
          {formatAlunoNome(cobranca.passageiro?.nome)}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-1.5 w-full min-w-0">
        <div className={cn(
          "px-2 py-0.5 rounded-[12px] text-[10px] font-semibold uppercase tracking-wider shrink-0 border",
          isRepasseEmProcessamento ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
            isCancelada ? "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]" :
              isParcial ? "bg-amber-50 text-amber-700 border-amber-200/60" :
                isPago ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  isAtrasado ? "bg-red-50 text-[#e7000b] border-red-200/60" :
                    "bg-amber-50 text-amber-600 border-amber-100"
        )}>
          {statusLabel}
        </div>

        <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-[0.05em] leading-none shrink-0">
          Parcela de {mesAbreviado}/{anoFormatado}
        </span>

        {cobranca.passageiro?.responsavel_principal?.nome && (
          <div className="flex items-center gap-1.5 min-w-0 text-[#737373] flex-1">
            <span className="text-xs text-[#737373]/60">•</span>
            <p className={cn(
              "text-xs font-normal leading-snug truncate",
              formatoNomeResponsavel === "completo" ? "truncate" : "line-clamp-1"
            )}>
              {formatNomeResponsavelExibicao(cobranca.passageiro.responsavel_principal.nome, formatoNomeResponsavel)}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#e5e5e5]/80 w-full min-w-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-[#737373]" />
          <span className="text-xs font-normal text-[#737373] truncate">
            {isCancelada
              ? `Vencimento ${formatDateToBR(cobranca.data_vencimento)}`
              : isPago
                ? (cobranca.data_pagamento ? `Pago em ${formatDateToBR(cobranca.data_pagamento)}` : `Vencimento ${formatDateToBR(cobranca.data_vencimento)}`)
                : isAtrasado
                  ? formatDiasAtraso(cobranca.data_vencimento)
                  : `Vence ${formatDateToBR(cobranca.data_vencimento)}`}
          </span>
          {isPago && isMotorista && (
            isRepasse ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[6px] border border-emerald-200/70 shrink-0 leading-none">
                <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600 shrink-0" />
                <span>Repasse</span>
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-medium text-[#737373] bg-[#f5f5f5] px-1.5 py-0.5 rounded-[6px] border border-[#e5e5e5] shrink-0 leading-none">
                Baixa Manual
              </span>
            )
          )}
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight leading-none">
            {formatCurrency(getCobrancaValorExibicao(cobranca))}
          </span>
        </div>
      </div>

      {isMotorista && cobranca.observacao?.trim() && (
        <div className="mt-2.5 p-2.5 rounded-[14px] bg-[#f5f5f5]/80 border border-[#e5e5e5]/60 flex items-start gap-2">
          <MessageSquare className="h-3.5 w-3.5 text-[#737373] mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#737373] leading-none mb-1">
              Observação
            </p>
            <p className="text-xs text-[#0a0a0a] font-normal whitespace-pre-wrap break-words leading-relaxed">
              {cobranca.observacao.trim()}
            </p>
          </div>
        </div>
      )}

      {isRepasseEmProcessamento && (
        <Banner
          variant="info"
          title="Repasse em andamento"
          description="Pagamento recebido. O repasse está sendo enviado para sua conta bancária via Pix."
          className="mt-2.5"
        />
      )}
    </div>
  );
};
