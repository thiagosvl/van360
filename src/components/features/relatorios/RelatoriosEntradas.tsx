import { KPICard } from "@/components/common/KPICard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { KPICardVariant } from "@/types/enums";
import { formatCurrency } from "@/utils/formatters";
import { Coins, TrendingUp, CreditCard, Wallet, Calendar } from "lucide-react";

interface RelatoriosEntradasProps {
  dados: {
    previsto: number;
    realizado: number;
    pendente: number;
    ticketMedio: number;
    formasPagamento: {
      metodo: string;
      valor: number;
      count?: number;
      percentual: number;
      color: string;
    }[];
    vencimentosPorDia?: {
      dia: number;
      titulo: string;
      valor: number;
      count: number;
      percentual: number;
    }[];
  };
}

export const RelatoriosEntradas = ({ dados }: RelatoriosEntradasProps) => {
  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <KPICard
          label="Faturamento Projetado"
          icon={TrendingUp}
          variant={KPICardVariant.PRIMARY}
          value={formatCurrency(dados.previsto)}
          valueClassName={dados.previsto > 0 ? "text-emerald-600" : undefined}
        />

        <KPICard
          label="Recebido no Mês"
          icon={Coins}
          variant={KPICardVariant.OUTLINE}
          value={formatCurrency(dados.realizado)}
          valueClassName={dados.realizado > 0 ? "text-emerald-600" : undefined}
        />

        <KPICard
          label="Pendente"
          icon={Wallet}
          variant={KPICardVariant.OUTLINE}
          value={formatCurrency(dados.pendente)}
        />

        <KPICard
          label="Ticket Médio"
          icon={Coins}
          variant={KPICardVariant.OUTLINE}
          value={formatCurrency(dados.ticketMedio)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
              <CreditCard className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
              Formas de Pagamento
            </h3>
          </div>
          <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-4">
            <div className="space-y-4">
              {dados.formasPagamento.map((forma, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#737373]">
                        {forma.metodo}
                      </span>
                      <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight mt-0.5">
                        {formatCurrency(forma.valor)}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#737373] mb-1">
                      {forma.count !== undefined
                        ? `${forma.count} ${forma.count === 1 ? "parcela" : "parcelas"} (${Math.round(forma.percentual)}%)`
                        : `${Math.round(forma.percentual)}%`}
                    </span>
                  </div>
                  <Progress
                    value={Math.max(2, forma.percentual)}
                    className="h-2 bg-[#f5f5f5] rounded-full"
                    indicatorClassName="bg-[#0a0a0a] rounded-full"
                  />
                </div>
              ))}

              {dados.formasPagamento.length === 0 && (
                <div className="text-center py-8 text-[#737373] text-xs font-medium">
                  Nenhum pagamento registrado no mês selecionado.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
              <Calendar className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
              Recebimentos por Dia de Vencimento
            </h3>
          </div>
          <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-4">
            <div className="space-y-4">
              {dados.vencimentosPorDia && dados.vencimentosPorDia.map((item) => (
                <div key={item.dia} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#737373]">
                        {item.titulo}
                      </span>
                      <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight mt-0.5">
                        {formatCurrency(item.valor)}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#737373] mb-1">
                      {item.count} {item.count === 1 ? "aluno" : "alunos"} ({Math.round(item.percentual)}%)
                    </span>
                  </div>
                  <Progress
                    value={Math.max(2, item.percentual)}
                    className="h-2 bg-[#f5f5f5] rounded-full"
                    indicatorClassName="bg-[#0a0a0a] rounded-full"
                  />
                </div>
              ))}

              {(!dados.vencimentosPorDia || dados.vencimentosPorDia.length === 0) && (
                <div className="text-center py-8 text-[#737373] text-xs font-medium">
                  Nenhum vencimento com valor registrado para alunos ativos.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
