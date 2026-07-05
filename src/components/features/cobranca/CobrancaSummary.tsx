import { Cobranca } from "@/types/cobranca";
import { formatCurrency, formatDateToBR, formatFirstName, formatShortName, getMesNome, meses, formatDiasAtraso } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { CobrancaStatus } from "@/types/enums";
import { checkCobrancaEmAtraso } from "@/utils/formatters/cobranca";
import {
  Calendar,
  Wallet
} from "lucide-react";

interface CobrancaSummaryProps {
  cobranca: Cobranca;
}

export const CobrancaSummary = ({ cobranca }: CobrancaSummaryProps) => {
  const isPago = cobranca.status === CobrancaStatus.PAGO;
  const isPendente = cobranca.status === CobrancaStatus.PENDENTE;
  const isAtrasado = isPendente && checkCobrancaEmAtraso(cobranca.data_vencimento);

  const statusLabel = isPago ? "Pago" : isAtrasado ? "Atrasado" : "Pendente";

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline de Contexto + Badge Minimalista */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider leading-none">
          MENSALIDADE • {getMesNome(cobranca.mes)}
        </p>

        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
          isPago ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
            isAtrasado ? "bg-red-100/60 text-red-600 dark:bg-red-950/30" :
              "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
        )}>
          {statusLabel}
        </div>
      </div>

      {/* LINHA 2: Nome do Passageiro em Destaque */}
      <h1 className="text-[22px] font-semibold text-[#1a3a5c] dark:text-zinc-100 leading-tight truncate mt-1">
        {formatShortName(cobranca.passageiro?.nome, true)}
      </h1>

      {/* Info Extra de Responsável */}
      {cobranca.passageiro?.nome_responsavel && (
        <p className="text-[13px] font-medium text-slate-500 dark:text-zinc-400 uppercase mt-1 leading-none">
          {formatFirstName(cobranca.passageiro.nome_responsavel)}
        </p>
      )}

      {/* LINHA 3: Footer com Valor e Data */}
      <div className="flex items-end justify-between mt-5 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
              Vence {formatDateToBR(cobranca.data_vencimento)}
            </span>
          </div>
          {isAtrasado && (
            <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
              {formatDiasAtraso(cobranca.data_vencimento)}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <span className="text-[20px] font-semibold text-[#1a3a5c] dark:text-zinc-100 tracking-tight leading-none">
            {formatCurrency(cobranca.valor)}
          </span>
        </div>
      </div>
    </div>
  );
};
