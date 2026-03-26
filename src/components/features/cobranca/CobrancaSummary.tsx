import { StatusBadge } from "@/components/common/StatusBadge";
import { Cobranca } from "@/types/cobranca";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CobrancaTipoPagamento, CobrancaStatus } from "@/types/enums";
import { formatFirstName, formatShortName } from "@/utils/formatters";

interface CobrancaSummaryProps {
  cobranca: Cobranca;
}

// Helper para tradução do método de pagamento
const getPaymentMethodLabel = (type?: CobrancaTipoPagamento) => {
  if (!type) return "";
  const labels: Record<string, string> = {
    [CobrancaTipoPagamento.DINHEIRO]: "Dinheiro",
    [CobrancaTipoPagamento.PIX]: "PIX",
    [CobrancaTipoPagamento.TRANSFERENCIA]: "Transf.",
    [CobrancaTipoPagamento.BOLETO]: "Boleto",
    [CobrancaTipoPagamento.CARTAO_CREDITO]: "Crédito",
    [CobrancaTipoPagamento.CARTAO_DEBITO]: "Débito",
  };
  return labels[type] || type;
};

export const CobrancaSummary = ({ cobranca }: CobrancaSummaryProps) => {
  const isPaid = cobranca?.status === CobrancaStatus.PAGO;
  const passengerName = cobranca?.passageiro?.nome || "Não informado";
  const responsibleName = cobranca?.passageiro?.nome_responsavel;

  const monthYearLabel = format(parseISO(cobranca.data_vencimento), "MMMM yyyy", {
    locale: ptBR,
  });

  return (
    <div className="flex flex-col gap-2 p-5 bg-white dark:bg-zinc-800/40 rounded-[28px] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all text-left">
      {/* Linha 1: Mês e Badge */}
      <div className="flex justify-between items-center mb-0.5">
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none opacity-80">
          {monthYearLabel}
        </p>
        <StatusBadge
          status={cobranca.status}
          dataVencimento={cobranca.data_vencimento}
          className="h-4 px-2 text-[7px] font-black uppercase tracking-widest rounded-full border-none shadow-none ring-1 ring-inset ring-slate-100 dark:ring-zinc-700"
        />
      </div>

      {/* Linha 2: Nome e Valor (Aproveitamento Lateral Máximo) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0 pr-2">
          <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-200 leading-tight truncate">
            {formatShortName(passengerName)}
          </h1>
          {responsibleName && (
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium truncate">
              {formatFirstName(responsibleName)}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-end shrink-0">
          <p className="text-xl font-headline font-black text-[#1a3a5c] dark:text-zinc-100 tracking-tighter leading-none">
            {Number(cobranca.valor).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      {/* Linha 3: Rodapé com Datas e Método (Compacto e Sutil) */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-1.5 grayscale opacity-60">
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">VENC</span>
          <p className="text-[10px] font-bold text-slate-500">
            {format(parseISO(cobranca.data_vencimento), "dd/MM/yy")}
          </p>
        </div>

        {isPaid && (
          <div className="flex items-center gap-3">
             {cobranca.tipo_pagamento && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-md ring-1 ring-inset ring-emerald-100/50">
                    <span className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest">
                        {getPaymentMethodLabel(cobranca.tipo_pagamento)}
                    </span>
                </div>
             )}
             {cobranca.data_pagamento && (
               <div className="flex items-center gap-1.5">
                 <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">PAGO</span>
                 <p className="text-[10px] font-bold text-emerald-600">
                   {format(parseISO(cobranca.data_pagamento), "dd/MM/yy")}
                 </p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
