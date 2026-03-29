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
    <div className="flex flex-col p-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-950 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline de Contexto + Badge Minimalista */}
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
          MENSALIDADE • {getMesNome(cobranca.mes)}
        </p>

        <div className={cn(
          "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
          isPago ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
            isAtrasado ? "bg-red-50 text-red-600 dark:bg-red-950/30" :
              "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
        )}>
          {statusLabel}
        </div>
      </div>

      {/* LINHA 2: Nome do Passageiro em Destaque (Título Central) */}
      <h1 className="text-[19px] font-black text-[#1a3a5c] dark:text-zinc-100 leading-tight tracking-tight truncate">
        {formatShortName(cobranca.passageiro?.nome, true)}
      </h1>

      {/* Info Extra de Responsável (Subtítulo Soft) */}
      {cobranca.passageiro?.nome_responsavel && (
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mt-0.5 leading-none">
          {formatFirstName(cobranca.passageiro.nome_responsavel)}
        </p>
      )}

      {/* LINHA 3: Footer com Valor e Data (Espaçamento horizontal perfeito) */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex flex-col grayscale-0">
          <div className="flex items-center gap-1.5 opacity-80">
            <Calendar className={cn("h-3 w-3", isAtrasado ? "text-red-500" : "text-amber-500")} />
            <span className="text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-tighter">
              Vence {formatDateToBR(cobranca.data_vencimento)}
            </span>
          </div>
          {isAtrasado && (
            <p className="text-[9px] font-black text-red-500 uppercase tracking-tight mt-0.5 animate-pulse">
              {formatDiasAtraso(cobranca.data_vencimento)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-none">
            {formatCurrency(cobranca.valor)}
          </span>
        </div>
      </div>
    </div>
  );
};
