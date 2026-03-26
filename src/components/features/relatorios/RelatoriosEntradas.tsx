import { KPICard } from "@/components/common/KPICard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { KPICardVariant } from "@/types/enums";
import { formatCurrency } from "@/utils/formatters";
import { Coins, TrendingUp, CreditCard } from "lucide-react";

interface RelatoriosEntradasProps {
  dados: {
    realizado: number;
    ticketMedio: number;
    formasPagamento: {
      metodo: string;
      valor: number;
      percentual: number;
      color: string;
    }[];
  };
}

export const RelatoriosEntradas = ({ dados }: RelatoriosEntradasProps) => {
  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          label="Receita no Mês"
          icon={TrendingUp}
          variant={KPICardVariant.PRIMARY}
          value={formatCurrency(dados.realizado)}
        />

        <KPICard
          label="Ticket Médio"
          icon={Coins}
          variant={KPICardVariant.OUTLINE}
          value={formatCurrency(dados.ticketMedio)}
        />
      </div>

      {/* Formas de Pagamento */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden">
        <div className="pt-6 px-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
            <CreditCard className="h-5 w-5 opacity-80 group-hover:opacity-100" />
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Formas de Pagamento
          </h3>
        </div>
        <div className="p-6 pt-4 space-y-6">
          <div className="space-y-4">
            {dados.formasPagamento.map((forma, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#1a3a5c] uppercase tracking-wider">
                      {forma.metodo}
                    </span>
                    <span className="font-headline font-black text-[#1a3a5c] text-base mt-0.5">
                      {formatCurrency(forma.valor)}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 mb-1">
                    {Math.round(forma.percentual)}%
                  </span>
                </div>
                <Progress
                  value={Math.max(2, forma.percentual)}
                  className="h-2 bg-slate-50 rounded-full"
                  indicatorClassName="bg-[#1a3a5c] rounded-full"
                />
              </div>
            ))}

            {dados.formasPagamento.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                Nenhum pagamento registrado neste mês.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
