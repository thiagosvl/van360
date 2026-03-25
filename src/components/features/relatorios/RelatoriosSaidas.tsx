import { KPICard } from "@/components/common/KPICard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { KPICardVariant } from "@/types/enums";
import { formatarPlacaExibicao } from "@/utils/domain";
import { formatCurrency } from "@/utils/formatters";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";

interface RelatoriosSaidasProps {
  dados: {
    total: number;
    margemOperacional: number;
    topCategorias: {
      nome: string;
      valor: number;
      count: number;
      icon: any;
      bg: string;
      color: string;
      veiculos: {
        id: string;
        nome: string;
        placa: string;
        valor: number;
        count: number;
      }[];
    }[];
    gastosPorVeiculo?: {
      nome: string;
      placa: string;
      valor: number;
      count: number;
      percentual: number;
    }[];
    veiculosCount?: number;
    temGastosVinculados?: boolean;
  };
}

export const RelatoriosSaidas = ({ dados }: RelatoriosSaidasProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (catName: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(catName)) {
      newSet.delete(catName);
    } else {
      newSet.add(catName);
    }
    setExpandedCategories(newSet);
  };

  const getMargemStatus = (m: number) => {
    if (m > 30) return { label: "Saudável", color: "text-emerald-600 bg-emerald-50" };
    if (m > 10) return { label: "Atenção", color: "text-amber-600 bg-amber-50" };
    return { label: "Crítico", color: "text-red-600 bg-red-50" };
  };

  const status = getMargemStatus(dados.margemOperacional);

  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          label="Total de Despesas"
          icon={TrendingDown}
          variant={KPICardVariant.PRIMARY}
          value={formatCurrency(dados.total)}
        />

        <KPICard
          label="Margem Operacional"
          icon={BarChart3}
          variant={KPICardVariant.OUTLINE}
          value={`${Math.round(dados.margemOperacional)}%`}
          valueClassName={dados.margemOperacional > 10 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      {/* Categorias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden">
        <div className="pt-6 px-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Categorias de Gasto
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {dados.topCategorias.map((cat, index) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategories.has(cat.nome);
            const hasVeiculos = cat.veiculos && cat.veiculos.length > 0;

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-100/50 overflow-hidden bg-slate-50/30"
              >
                <div
                  className={cn(
                    "group flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-slate-50",
                    isExpanded && "bg-slate-50"
                  )}
                  onClick={() => toggleCategory(cat.nome)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
                  <Icon className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[#1a3a5c] uppercase tracking-wider">
                        {cat.nome}
                      </span>
                      <div className="flex items-center gap-1.5 font-headline font-black text-[#1a3a5c] text-sm">
                        {formatCurrency(cat.valor)}
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {cat.count} reg.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-300">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {isExpanded && hasVeiculos && (
                  <div className="px-3 pb-3 border-t border-slate-100/50 bg-white">
                    <div className="space-y-1 mt-3">
                      {cat.veiculos.map((v, vIndex) => (
                        <div
                          key={vIndex}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50/50"
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#1a3a5c] uppercase tracking-wider">
                              {v.placa !== "-"
                                ? formatarPlacaExibicao(v.placa)
                                : v.nome}
                            </span>
                            {v.placa !== "-" && (
                              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                {v.nome}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-black text-[#1a3a5c]">
                              {formatCurrency(v.valor)}
                            </div>
                            <div className="text-[9px] font-bold text-slate-300 uppercase">
                              {v.count} reg.
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {dados.topCategorias.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
              Nenhuma despesa registrada neste mês.
            </div>
          )}
        </div>
      </div>

      {/* Gastos por Veículo */}
      {dados.gastosPorVeiculo &&
        dados.gastosPorVeiculo.length > 0 &&
        (dados.veiculosCount || 0) > 1 &&
        dados.temGastosVinculados && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden">
            <div className="pt-6 px-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Gastos por Veículo
              </h3>
            </div>
            <div className="p-6 pt-4 space-y-6">
              {dados.gastosPorVeiculo.map((v, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[#1a3a5c] uppercase tracking-wider">
                        {v.placa !== "-"
                          ? formatarPlacaExibicao(v.placa)
                          : v.nome}
                      </span>
                      <span className="font-headline font-black text-[#1a3a5c] text-base mt-0.5">
                        {formatCurrency(v.valor)}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 mb-1">
                      {Math.round(v.percentual)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.max(2, v.percentual)}
                    className="h-2 bg-slate-50 rounded-full"
                    indicatorClassName="bg-[#1a3a5c] rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
