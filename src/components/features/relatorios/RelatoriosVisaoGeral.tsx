import { KPICard } from "@/components/common/KPICard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { KPICardVariant } from "@/types/enums";
import { formatCurrency } from "@/utils/formatters";
import {
  Percent,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

interface RelatoriosVisaoGeralProps {
  dados: {
    lucroEstimado: number;
    aReceber: {
      valor: number;
      passageiros: number;
    };
    custoPorPassageiro: number;
    taxaRecebimento: number;
    recebido: number;
    gasto: number;
  };
}

export const RelatoriosVisaoGeral = ({ dados }: RelatoriosVisaoGeralProps) => {
  const lucroPositivo = dados.lucroEstimado >= 0;

  // Cálculos para as barras de progresso
  const totalFinanceiro = Math.max(dados.recebido, dados.gasto);
  const percEntradas = totalFinanceiro > 0 ? (dados.recebido / totalFinanceiro) * 100 : 0;
  const percSaidas = totalFinanceiro > 0 ? (dados.gasto / totalFinanceiro) * 100 : 0;

  // Balanço relativo ao total movimentado
  const percBalanco = totalFinanceiro > 0 ? (Math.abs(dados.lucroEstimado) / totalFinanceiro) * 100 : 0;

  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-4">
        {/* Lucro Estimado */}
        <KPICard
          label="Saldo"
          icon={Wallet}
          variant={KPICardVariant.PRIMARY}
          value={formatCurrency(dados.lucroEstimado)}
          valueClassName={lucroPositivo ? "text-emerald-600" : "text-red-600"}
        />

        {/* A Receber */}
        <KPICard
          label="A Receber"
          icon={Wallet}
          variant={KPICardVariant.OUTLINE}
          value={formatCurrency(dados.aReceber.valor)}
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          label="Custo Médio por Passageiro"
          icon={Users}
          variant={KPICardVariant.OUTLINE}
          value={formatCurrency(dados.custoPorPassageiro)}
        />

        <KPICard
          label="Taxa de Recebimento"
          icon={Percent}
          variant={KPICardVariant.OUTLINE}
          value={`${Math.round(dados.taxaRecebimento)}%`}
        />
      </div>

      {/* Fluxo do Mês */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden group">
        <div className="pt-6 px-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
            <TrendingUp className="h-5 w-5 opacity-80 group-hover:opacity-100" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Fluxo do Mês
            </h3>
          </div>
        </div>

        <div className="p-6 pt-6 space-y-6">
          {/* Entradas progress */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Entradas</span>
              <span className="text-[11px] font-headline font-black text-emerald-600">
                {formatCurrency(dados.recebido)}
              </span>
            </div>
            <Progress
              value={percEntradas}
              className="h-2 bg-slate-50 rounded-full"
              indicatorClassName="bg-emerald-500 rounded-full"
            />
          </div>

          {/* Saídas progress */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Saídas</span>
              <span className="text-[11px] font-headline font-black text-rose-600">
                {formatCurrency(dados.gasto)}
              </span>
            </div>
            <Progress
              value={percSaidas}
              className="h-2 bg-slate-50 rounded-full"
              indicatorClassName="bg-rose-500 rounded-full"
            />
          </div>

          {/* Balanço progress */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Balanço (Líquido)</span>
              <span className={cn(
                "text-[11px] font-headline font-black",
                lucroPositivo ? "text-emerald-600" : "text-rose-600"
              )}>
                {lucroPositivo ? "+" : ""}{formatCurrency(dados.lucroEstimado)}
              </span>
            </div>
            <Progress
              value={percBalanco}
              className="h-2 bg-slate-50 rounded-full"
              indicatorClassName={cn(
                "rounded-full",
                lucroPositivo ? "bg-emerald-500" : "bg-rose-500"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
