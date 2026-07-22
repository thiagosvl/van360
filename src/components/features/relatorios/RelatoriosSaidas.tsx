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
  Bus,
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
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(
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

  const toggleVehicle = (vehicleId: string) => {
    const newSet = new Set(expandedVehicles);
    if (newSet.has(vehicleId)) {
      newSet.delete(vehicleId);
    } else {
      newSet.add(vehicleId);
    }
    setExpandedVehicles(newSet);
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
          valueClassName="text-rose-600"
        />

        <KPICard
          label="Margem Operacional"
          icon={BarChart3}
          variant={KPICardVariant.OUTLINE}
          value={`${Math.round(dados.margemOperacional)}%`}
          valueClassName={dados.margemOperacional > 0 ? "text-emerald-600" : dados.margemOperacional < 0 ? "text-rose-600" : undefined}
        />
      </div>

      {/* Categorias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden">
        <div className="pt-6 px-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
            <TrendingDown className="h-5 w-5 opacity-80 group-hover:opacity-100" />
          </div>
          <h3 className="text-[13px] font-bold text-slate-800">
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
                className="rounded-xl border border-slate-100/50 overflow-hidden bg-slate-100/50"
              >
                <div
                  className={cn(
                    "group flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-slate-50",
                    isExpanded && "bg-slate-50"
                  )}
                  onClick={() => toggleCategory(cat.nome)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:shadow-md",
                      cat.bg || "bg-slate-50",
                      cat.color || "text-[#1a3a5c]",
                      "border-transparent"
                    )}>
                      <Icon className="h-5 w-5 opacity-90" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-slate-600">
                        {cat.nome}
                      </span>
                      <div className="flex items-center gap-1.5 font-headline font-black text-[#1a3a5c] text-sm">
                        {formatCurrency(cat.valor)}
                        <span className="text-[10px] text-slate-300">•</span>
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
                            <span className="text-[12px] font-bold text-slate-700">
                              {v.placa !== "-"
                                ? formatarPlacaExibicao(v.placa)
                                : v.nome}
                            </span>
                            {v.placa !== "-" && (
                              <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                {v.nome}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[12px] text-slate-600">
                              {formatCurrency(v.valor)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {v.count === 1 ? "1 registro" : `${v.count} registros`}
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
            <div className="text-center py-8 text-slate-500 text-[13px]">
              Nenhuma despesa registrada no mês selecionado.
            </div>
          )}
        </div>
      </div>

      {/* Gastos por Veículo */}
      {dados.gastosPorVeiculo &&
        dados.gastosPorVeiculo.length > 0 &&
        dados.temGastosVinculados && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-diff-shadow overflow-hidden">
            <div className="pt-6 px-6 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white border border-slate-100/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-slate-100">
                <Bus className="h-5 w-5 opacity-80 group-hover:opacity-100" />
              </div>
              <h3 className="text-[13px] font-bold text-slate-800">
                Gastos por Veículo
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {dados.gastosPorVeiculo.map((v, index) => {
                const vehicleId = v.placa !== "-" ? v.placa : v.nome;
                const isExpanded = expandedVehicles.has(vehicleId);
                const hasCategorias = (v as any).categorias && (v as any).categorias.length > 0;

                return (
                  <div key={index} className="rounded-xl border border-slate-100/50 overflow-hidden bg-slate-50/30">
                    <div
                      className={cn(
                        "group flex flex-col p-3 cursor-pointer transition-colors hover:bg-slate-50 space-y-2",
                        isExpanded && "bg-slate-50"
                      )}
                      onClick={() => toggleVehicle(vehicleId)}
                    >
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-medium text-slate-600">
                            {vehicleId === v.placa ? formatarPlacaExibicao(v.placa) : v.nome}
                          </span>
                          <span className="font-headline font-black text-[#1a3a5c] text-sm mt-0.5">
                            {formatCurrency(v.valor)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400">
                            {Math.round(v.percentual)}%
                          </span>
                          <div className="text-slate-300">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={Math.max(2, v.percentual)}
                        className="h-1.5 bg-slate-100 rounded-full"
                        indicatorClassName="bg-[#1a3a5c] rounded-full"
                      />
                    </div>

                    {isExpanded && hasCategorias && (
                      <div className="px-3 pb-3 border-t border-slate-100/50 bg-white">
                        <div className="space-y-1 mt-3">
                          {(v as any).categorias.map((cat: any, cIndex: number) => {
                            const Icon = cat.icon;
                            return (
                              <div
                                key={cIndex}
                                className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center border border-transparent/10",
                                    cat.bg || "bg-slate-50",
                                    cat.color || "text-[#1a3a5c]"
                                  )}>
                                    <Icon className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="text-[12px] font-bold text-slate-700">
                                    {cat.nome}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-[12px] text-slate-600">
                                    {formatCurrency(cat.valor)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {cat.count === 1 ? "1 registro" : `${cat.count} registros`}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
};
