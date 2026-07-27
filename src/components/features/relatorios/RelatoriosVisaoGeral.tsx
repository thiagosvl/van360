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
    lucroAtual: number;
    aReceber: {
      valor: number;
      passageiros: number;
    };
    custoPorPassageiro: number;
    taxaRecebimento: number;
    previsto: number;
    recebido: number;
    gasto: number;
  };
}

export const RelatoriosVisaoGeral = ({ dados }: RelatoriosVisaoGeralProps) => {
  const lucroPositivoEstimado = dados.lucroEstimado >= 0;
  const lucroPositivoAtual = dados.lucroAtual >= 0;

  // Cálculos para o Cenário Atual
  const totalAtual = Math.max(dados.recebido, dados.gasto);
  const percEntradasAtual = totalAtual > 0 ? (dados.recebido / totalAtual) * 100 : 0;
  const percSaidasAtual = totalAtual > 0 ? (dados.gasto / totalAtual) * 100 : 0;
  const percBalancoAtual = totalAtual > 0 ? (Math.abs(dados.lucroAtual) / totalAtual) * 100 : 0;

  // Cálculos para o Cenário Projetado
  const totalProjetado = Math.max(dados.previsto, dados.gasto);
  const percEntradasProjetado = totalProjetado > 0 ? (dados.previsto / totalProjetado) * 100 : 0;
  const percSaidasProjetado = totalProjetado > 0 ? (dados.gasto / totalProjetado) * 100 : 0;
  const percBalancoProjetado = totalProjetado > 0 ? (Math.abs(dados.lucroEstimado) / totalProjetado) * 100 : 0;

  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-4">
        {/* Lucro Estimado */}
        <KPICard
          label="Lucro Projetado"
          icon={Wallet}
          variant={KPICardVariant.PRIMARY}
          value={formatCurrency(dados.lucroEstimado)}
          valueClassName={lucroPositivoEstimado ? "text-emerald-600" : "text-red-600"}
        />

        {/* A Receber */}
        <KPICard
          label="Pendente"
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

      {/* Cenários do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cenário Atual (Realizado) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden group">
          <div className="pt-6 px-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
              <TrendingUp className="h-5 w-5 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-bold text-slate-800">
                Cenário Atual (Realizado)
              </h3>
            </div>
          </div>

          <div className="p-6 pt-6 space-y-6">
            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-slate-600">Entradas (Recebido)</span>
                <span className="font-headline font-black text-sm text-emerald-600">
                  {formatCurrency(dados.recebido)}
                </span>
              </div>
              <Progress
                value={percEntradasAtual}
                className="h-2 bg-slate-50 rounded-full"
                indicatorClassName="bg-emerald-500 rounded-full"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-slate-600">Saídas (Gastos)</span>
                <span className="font-headline font-black text-sm text-rose-600">
                  {formatCurrency(dados.gasto)}
                </span>
              </div>
              <Progress
                value={percSaidasAtual}
                className="h-2 bg-slate-50 rounded-full"
                indicatorClassName="bg-rose-500 rounded-full"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-slate-600">Lucro Atual</span>
                <span className={cn(
                  "font-headline font-black text-sm",
                  lucroPositivoAtual ? "text-emerald-600" : "text-rose-600"
                )}>
                  {lucroPositivoAtual ? "+" : ""}{formatCurrency(dados.lucroAtual)}
                </span>
              </div>
              <Progress
                value={percBalancoAtual}
                className="h-2 bg-slate-50 rounded-full"
                indicatorClassName={cn(
                  "rounded-full",
                  lucroPositivoAtual ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
            </div>
          </div>
        </div>

        {/* Cenário Projetado (Final do Mês) */}
        <div className="bg-white rounded-2xl border border-emerald-100/50 shadow-diff-shadow overflow-hidden group">
          <div className="pt-6 px-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white border border-emerald-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-100">
              <TrendingUp className="h-5 w-5 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-bold text-slate-800">
                Cenário Projetado (Total)
              </h3>
            </div>
          </div>

          <div className="p-6 pt-6 space-y-6">
            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-slate-600">Previsão de Entradas</span>
                <span className="font-headline font-black text-sm text-emerald-600">
                  {formatCurrency(dados.previsto)}
                </span>
              </div>
              <Progress
                value={percEntradasProjetado}
                className="h-2 bg-slate-50 rounded-full"
                indicatorClassName="bg-emerald-500 rounded-full"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-slate-600">Saídas (Gastos)</span>
                <span className="font-headline font-black text-sm text-rose-600">
                  {formatCurrency(dados.gasto)}
                </span>
              </div>
              <Progress
                value={percSaidasProjetado}
                className="h-2 bg-slate-50 rounded-full"
                indicatorClassName="bg-rose-500 rounded-full"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[12px] font-medium text-slate-600">Lucro Projetado</span>
                <span className={cn(
                  "font-headline font-black text-sm",
                  lucroPositivoEstimado ? "text-emerald-600" : "text-rose-600"
                )}>
                  {lucroPositivoEstimado ? "+" : ""}{formatCurrency(dados.lucroEstimado)}
                </span>
              </div>
              <Progress
                value={percBalancoProjetado}
                className="h-2 bg-slate-50 rounded-full"
                indicatorClassName={cn(
                  "rounded-full",
                  lucroPositivoEstimado ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
