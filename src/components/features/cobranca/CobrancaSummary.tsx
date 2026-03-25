import { StatusBadge } from "@/components/common/StatusBadge";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CobrancaSummaryProps {
  cobranca: Cobranca;
}

export const CobrancaSummary = ({ cobranca }: CobrancaSummaryProps) => {
  const isPaid = cobranca?.status === CobrancaStatus.PAGO;

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 mb-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Referência</p>
          <h3 className="text-base font-bold text-[#1a3a5c] dark:text-zinc-100 capitalize">
            {format(parseISO(cobranca.data_vencimento), "MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
        </div>
        <StatusBadge status={cobranca.status} dataVencimento={cobranca.data_vencimento} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-medium">Valor</p>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {Number(cobranca.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-medium">Vencimento</p>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {format(parseISO(cobranca.data_vencimento), "dd/MM/yyyy")}
          </p>
        </div>
      </div>

      {isPaid && cobranca.data_pagamento && (
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-[10px] text-zinc-500 uppercase font-medium">Pago em</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {format(parseISO(cobranca.data_pagamento), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </div>
      )}
    </div>
  );
};
