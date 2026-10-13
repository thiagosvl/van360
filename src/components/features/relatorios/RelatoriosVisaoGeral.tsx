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

  const totalAtual = Math.max(dados.recebido, dados.gasto);
  const percEntradasAtual = totalAtual > 0 ? (dados.recebido / totalAtual) * 100 : 0;
  const percSaidasAtual = totalAtual > 0 ? (dados.gasto / totalAtual) * 100 : 0;
  const percBalancoAtual = totalAtual > 0 ? (Math.abs(dados.lucroAtual) / totalAtual) * 100 : 0;

  const totalProjetado = Math.max(dados.previsto, dados.gasto);
  const percEntradasProjetado = totalProjetado > 0 ? (dados.previsto / totalProjetado) * 100 : 0;
  const percSaidasProjetado = totalProjetado > 0 ? (dados.gasto / totalProjetado) * 100 : 0;
  const percBalancoProjetado = totalProjetado > 0 ? (Math.abs(dados.lucroEstimado) / totalProjetado) * 100 : 0;

  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <KPICard
          label="Lucro Projetado"
          icon={Wallet}
          variant={KPICardVariant.PRIMARY}
          value={formatCurrency(dados.lucroEstimado)}
          valueClassName={lucroPositivoEstimado ? "text-emerald-600" : "text-rose-600"}
        />

        <KPICard
          label="Pendente"
          icon={Wallet}
          variant={KPICardVariant.OUTLINE}
          value={formatCurrency(dados.aReceber.valor)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <KPICard
          label="Custo Médio Aluno"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                Cenário Atual (Realizado)
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-[#737373]">Entradas (Recebido)</span>
                <span className="font-semibold text-sm sm:text-base text-emerald-600 tracking-tight">
                  {formatCurrency(dados.recebido)}
                </span>
              </div>
              <Progress
                value={percEntradasAtual}
                className="h-2 bg-[#f5f5f5] rounded-full"
                indicatorClassName="bg-emerald-500 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-[#737373]">Saídas (Gastos)</span>
                <span className="font-semibold text-sm sm:text-base text-rose-600 tracking-tight">
                  {formatCurrency(dados.gasto)}
                </span>
              </div>
              <Progress
                value={percSaidasAtual}
                className="h-2 bg-[#f5f5f5] rounded-full"
                indicatorClassName="bg-rose-500 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-[#737373]">Lucro Atual</span>
                <span className={cn(
                  "font-semibold text-sm sm:text-base tracking-tight",
                  lucroPositivoAtual ? "text-emerald-600" : "text-rose-600"
                )}>
                  {lucroPositivoAtual ? "+" : ""}{formatCurrency(dados.lucroAtual)}
                </span>
              </div>
              <Progress
                value={percBalancoAtual}
                className="h-2 bg-[#f5f5f5] rounded-full"
                indicatorClassName={cn(
                  "rounded-full",
                  lucroPositivoAtual ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                Cenário Projetado (Total)
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-[#737373]">Previsão de Entradas</span>
                <span className="font-semibold text-sm sm:text-base text-emerald-600 tracking-tight">
                  {formatCurrency(dados.previsto)}
                </span>
              </div>
              <Progress
                value={percEntradasProjetado}
                className="h-2 bg-[#f5f5f5] rounded-full"
                indicatorClassName="bg-emerald-500 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-[#737373]">Saídas (Gastos)</span>
                <span className="font-semibold text-sm sm:text-base text-rose-600 tracking-tight">
                  {formatCurrency(dados.gasto)}
                </span>
              </div>
              <Progress
                value={percSaidasProjetado}
                className="h-2 bg-[#f5f5f5] rounded-full"
                indicatorClassName="bg-rose-500 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-[#737373]">Lucro Projetado</span>
                <span className={cn(
                  "font-semibold text-sm sm:text-base tracking-tight",
                  lucroPositivoEstimado ? "text-emerald-600" : "text-rose-600"
                )}>
                  {lucroPositivoEstimado ? "+" : ""}{formatCurrency(dados.lucroEstimado)}
                </span>
              </div>
              <Progress
                value={percBalancoProjetado}
                className="h-2 bg-[#f5f5f5] rounded-full"
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
