import { Cobranca } from "@/types/cobranca";
import { formatCurrency, formatDateToBR, formatShortName, formatDiasAtraso, getMesAbreviado } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { useAppPreferences } from "@/hooks";
import { cn } from "@/lib/utils";
import { CobrancaStatus } from "@/types/enums";
import { checkCobrancaEmAtraso, getCobrancaValorExibicao } from "@/utils/formatters/cobranca";
import {
  Calendar,
  MessageSquare
} from "lucide-react";
import { Banner } from "@/components/ui/Banner";

interface CobrancaSummaryProps {
  cobranca: Cobranca;
  isMotorista?: boolean;
}

export const CobrancaSummary = ({ cobranca, isMotorista = true }: CobrancaSummaryProps) => {
  const { formatoNomeResponsavel } = useAppPreferences();
  const isProjection = cobranca.isProjection === true;
  const isCancelada = !isProjection && cobranca.status === CobrancaStatus.CANCELADA;
  const isPago = !isProjection && !isCancelada && cobranca.status === CobrancaStatus.PAGO;
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
    <div className="flex flex-col p-4 sm:p-5 bg-[#fafafa] rounded-[22px] border border-[#e5e5e5] shadow-2xs transition-all text-left w-full min-w-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2 w-full min-w-0 gap-2">
        <p className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em] leading-none truncate min-w-0">
          PARCELA DE {mesAbreviado}/{anoFormatado}
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium uppercase tracking-wider shrink-0",
          isRepasseEmProcessamento ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse" :
            isCancelada ? "bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]" :
              isParcial ? "bg-amber-50 text-amber-700 border border-amber-200/60" :
                isPago ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  isAtrasado ? "bg-red-50 text-[#e7000b] border border-red-200/60" :
                    "bg-amber-50 text-amber-600 border border-amber-100"
        )}>
          {statusLabel}
        </div>
      </div>

      <div className="flex items-start gap-2 mt-0.5 w-full min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#0a0a0a] leading-snug line-clamp-3 break-words w-full min-w-0">
          {formatShortName(cobranca.passageiro?.nome, true)}
        </h1>
      </div>

      {cobranca.passageiro?.responsavel_principal?.nome && (
        <p className={cn(
          "text-xs font-normal text-[#737373] mt-1 leading-snug w-full min-w-0",
          formatoNomeResponsavel === "completo" ? "truncate" : "line-clamp-2 break-words"
        )}>
          {formatNomeResponsavelExibicao(cobranca.passageiro.responsavel_principal.nome, formatoNomeResponsavel)}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e5e5e5] w-full min-w-0 gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className={cn("h-4 w-4 shrink-0", isAtrasado ? "text-[#e7000b]" : "text-[#737373]")} />
            <span
              className={cn(
                "text-xs uppercase tracking-wide truncate",
                isAtrasado
                  ? "text-[#e7000b] font-semibold"
                  : "text-[#737373] font-medium"
              )}
            >
              {isCancelada
                ? `Vencimento ${formatDateToBR(cobranca.data_vencimento)}`
                : isAtrasado
                  ? formatDiasAtraso(cobranca.data_vencimento)
                  : `Vence ${formatDateToBR(cobranca.data_vencimento)}`}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight leading-none">
            {formatCurrency(getCobrancaValorExibicao(cobranca))}
          </span>
        </div>
      </div>

      {isMotorista && cobranca.observacao?.trim() && (
        <div className="mt-3 pt-2.5 border-t border-[#e5e5e5] flex items-start gap-2 bg-[#f5f5f5] rounded-[16px] p-3 border border-[#e5e5e5]">
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
          className="mt-3"
        />
      )}
    </div>
  );
};
