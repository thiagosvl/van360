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
    if (m > 30) return { label: "Saudável", color: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20" };
    if (m > 10) return { label: "Atenção", color: "text-amber-700 bg-amber-500/10 border-amber-500/20" };
    return { label: "Crítico", color: "text-rose-700 bg-rose-500/10 border-rose-500/20" };
  };

  const status = getMargemStatus(dados.margemOperacional);

  return (
    <div className="space-y-4 px-1">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
          countLabel={
            <span className={cn("px-2 py-0.5 rounded-[18px] text-[10px] font-medium border", status.color)}>
              {status.label}
            </span>
          }
        />
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
            <TrendingDown className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
            Categorias de Gasto
          </h3>
        </div>
        <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-3">
          {dados.topCategorias.map((cat, index) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategories.has(cat.nome);
            const hasVeiculos = cat.veiculos && cat.veiculos.length > 0;

            return (
              <div
                key={index}
                className="rounded-[18px] border border-[#e5e5e5] overflow-hidden bg-[#fafafa]"
              >
                <div
                  className={cn(
                    "group flex items-center justify-between p-3.5 cursor-pointer transition-colors hover:bg-[#f5f5f5]",
                    isExpanded && "bg-[#f5f5f5]"
                  )}
                  onClick={() => toggleCategory(cat.nome)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] flex items-center justify-center border border-[#e5e5e5] bg-white text-[#0a0a0a] shrink-0">
                      <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#0a0a0a]">
                        {cat.nome}
                      </span>
                      <div className="flex items-center gap-1.5 font-semibold text-[#0a0a0a] text-sm mt-0.5">
                        {formatCurrency(cat.valor)}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#737373]">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {isExpanded && hasVeiculos && (
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[#e5e5e5] bg-white space-y-1.5">
                    {cat.veiculos.map((v, vIndex) => (
                      <div
                        key={vIndex}
                        className="flex items-center justify-between py-2 px-3 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5]/50"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#0a0a0a]">
                            {v.placa !== "-"
                              ? formatarPlacaExibicao(v.placa)
                              : v.nome}
                          </span>
                          {v.placa !== "-" && (
                            <span className="text-[10px] font-medium text-[#737373] mt-0.5">
                              {v.nome}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-xs text-[#0a0a0a]">
                            {formatCurrency(v.valor)}
                          </div>
                          <div className="text-[10px] text-[#737373]">
                            {v.count === 1 ? "1 registro" : `${v.count} registros`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {dados.topCategorias.length === 0 && (
            <div className="text-center py-8 text-[#737373] text-xs font-medium">
              Nenhuma despesa registrada no mês selecionado.
            </div>
          )}
        </div>
      </div>

      {dados.gastosPorVeiculo &&
        dados.gastosPorVeiculo.length > 0 &&
        dados.temGastosVinculados && (
          <div className="bg-white rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-4 sm:p-5 pb-0 flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] shrink-0">
                <Bus className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a] tracking-tight">
                Gastos por Veículo
              </h3>
            </div>
            <div className="p-4 sm:p-5 pt-4 sm:pt-4 space-y-3">
              {dados.gastosPorVeiculo.map((v, index) => {
                const vehicleId = v.placa !== "-" ? v.placa : v.nome;
                const isExpanded = expandedVehicles.has(vehicleId);
                const hasCategorias = (v as any).categorias && (v as any).categorias.length > 0;

                return (
                  <div key={index} className="rounded-[18px] border border-[#e5e5e5] overflow-hidden bg-[#fafafa]">
                    <div
                      className={cn(
                        "group flex flex-col p-3.5 cursor-pointer transition-colors hover:bg-[#f5f5f5] space-y-2",
                        isExpanded && "bg-[#f5f5f5]"
                      )}
                      onClick={() => toggleVehicle(vehicleId)}
                    >
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#0a0a0a]">
                            {vehicleId === v.placa ? formatarPlacaExibicao(v.placa) : v.nome}
                          </span>
                          <span className="font-semibold text-sm text-[#0a0a0a] tracking-tight mt-0.5">
                            {formatCurrency(v.valor)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-[#737373]">
                            {Math.round(v.percentual)}%
                          </span>
                          <div className="text-[#737373]">
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
                        className="h-1.5 bg-[#e5e5e5] rounded-full"
                        indicatorClassName="bg-[#0a0a0a] rounded-full"
                      />
                    </div>

                    {isExpanded && hasCategorias && (
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-[#e5e5e5] bg-white space-y-1.5">
                        {(v as any).categorias.map((cat: any, cIndex: number) => {
                          const Icon = cat.icon;
                          return (
                            <div
                              key={cIndex}
                              className="flex items-center justify-between py-2 px-3 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5]/50"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center border border-[#e5e5e5] bg-white text-[#0a0a0a] shrink-0">
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs font-semibold text-[#0a0a0a]">
                                  {cat.nome}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-xs text-[#0a0a0a]">
                                  {formatCurrency(cat.valor)}
                                </div>
                                <div className="text-[10px] text-[#737373]">
                                  {cat.count === 1 ? "1 registro" : `${cat.count} registros`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
