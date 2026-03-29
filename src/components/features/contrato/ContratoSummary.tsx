import { cn } from "@/lib/utils";
import { ContratoStatus } from "@/types/enums";
import { formatCurrency, formatDateToBR, formatFirstName, formatShortName } from "@/utils/formatters";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { Calendar, Wallet, FileCheck2, FileClock, FileQuestion } from "lucide-react";

interface ContratoSummaryProps {
  item: any;
}

export const ContratoSummary = ({ item }: ContratoSummaryProps) => {
  const nomePassageiro = item.passageiro?.nome || item.nome || "Não informado";
  const nomeResponsavel = item.passageiro?.nome_responsavel || item.nome_responsavel;
  const status = item.status as ContratoStatus | null;
  const isAssinado = status === ContratoStatus.ASSINADO;
  const isPendente = status === ContratoStatus.PENDENTE;

  const valor =
    Number(item.dados_contrato?.valorMensal || item.valor_parcela || item.valor_mensal) || null;

  const statusLabel = formatContratoStatus(status);

  return (
    <div className="flex flex-col p-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-950 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">

      {/* LINHA 1: Overline Categoria + Status Badge */}
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
          CONTRATO
        </p>

        <div className={cn(
          "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
          isAssinado ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" :
            isPendente ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" :
              "bg-slate-50 text-slate-500 dark:bg-zinc-800"
        )}>
          {statusLabel}
        </div>
      </div>

      {/* LINHA 2: Nome em Destaque */}
      <div className="flex items-center gap-2">
        <h1 className="text-[19px] font-black text-[#1a3a5c] dark:text-zinc-100 leading-tight tracking-tight truncate">
          {formatShortName(nomePassageiro, true)}
        </h1>
      </div>

      {/* Subtítulo: Responsável */}
      {nomeResponsavel && (
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mt-0.5 leading-none">
          {formatFirstName(nomeResponsavel)}
        </p>
      )}

      {/* LINHA 3: Footer com Valor e Data */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 grayscale-0 opacity-80">
          {(isAssinado || isPendente) && (
            <>
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-tighter">
                {isAssinado ? "ASSINADO EM" : "GERADO EM"}{" "}
                {formatDateToBR(isAssinado ? (item.data_assinatura || item.updated_at) : item.created_at)}
              </span>
            </>
          )}
        </div>

        {valor && (
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-black text-[#1a3a5c] dark:text-zinc-100 tracking-tight leading-none">
              {formatCurrency(valor)}
              <span className="text-[8px] font-bold text-slate-400 ml-0.5">/MÊS</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
