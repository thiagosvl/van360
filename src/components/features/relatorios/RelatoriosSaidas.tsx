import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatarPlacaExibicao } from "@/utils/domain";
import { BarChart3, ChevronDown, ChevronRight, TrendingDown } from "lucide-react";
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

export const RelatoriosSaidas = ({
  dados,
}: RelatoriosSaidasProps) => {
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

  return (
    <div className="space-y-4 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total de Despesas
            </CardTitle>
            <div className="p-2 rounded-full bg-red-50 text-red-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative">
            <div className="text-3xl font-bold text-gray-900">
               {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dados.total)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Acumulado no mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Margem Operacional
            </CardTitle>
            <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative">
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-gray-900">
                 {Math.round(dados.margemOperacional)}%
              </div>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                    dados.margemOperacional > 30
                      ? "bg-emerald-100 text-emerald-700"
                      : dados.margemOperacional > 10
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {dados.margemOperacional > 30
                    ? "Saudável"
                    : dados.margemOperacional > 10
                    ? "Atenção"
                    : "Crítico"}
                </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Quanto sobra de cada real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onde gastei mais */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="pt-6 px-6">
          <CardTitle className="text-lg font-bold text-gray-900">
            Onde gastei mais?
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-8 relative">
          <div className="space-y-4">
            {dados.topCategorias.map((cat, index) => {
              const Icon = cat.icon;
              const isExpanded = expandedCategories.has(cat.nome);
              const hasVeiculos = cat.veiculos && cat.veiculos.length > 0;

              return (
                <div
                  key={index}
                  className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden"
                >
                  <div 
                    className={cn(
                        "flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-gray-100",
                        isExpanded ? "bg-gray-100" : ""
                    )}
                    onClick={() => toggleCategory(cat.nome)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                          cat.bg,
                          cat.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {cat.nome}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="font-bold text-gray-900">
                             {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cat.valor)}
                          </span>
                          <span>•</span>
                          <span>
                            {cat.count} <span className="text-gray-400 font-normal">registro{cat.count === 1 ? "" : "s"}</span>
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Seta indicativa */}
                    <div className="text-gray-400">
                        {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                        ) : (
                            <ChevronRight className="h-5 w-5" />
                        )}
                    </div>
                  </div>

                  {/* Conteúdo Expandido (Detalhamento por Veículo) */}
                  {isExpanded && hasVeiculos && (
                      <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-white">
                          <div className="space-y-2 mt-2">
                             {cat.veiculos.map((v, vIndex) => (
                                 <div key={vIndex} className="flex items-center justify-between py-1 px-2 rounded">
                                     <div className="flex flex-col">
                                         <span className="text-sm font-semibold text-gray-800">
                                            {v.placa !== "-" ? formatarPlacaExibicao(v.placa) : v.nome}
                                         </span>
                                         {v.placa !== "-" && (
                                             <span className="text-[10px] text-gray-500">{v.nome}</span>
                                         )}
                                     </div>
                                     <div className="text-right">
                                         <div className="text-sm font-medium text-gray-900">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v.valor)}
                                         </div>
                                         <div className="text-[10px] text-gray-400">
                                            {v.count} registro{v.count === 1 ? "" : "s"}
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
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma despesa registrada neste mês.
              </div>
            )}
           
          </div>
        </CardContent>
      </Card>


      {/* Gastos por Veículo - Visão Geral */}
      {dados.gastosPorVeiculo && 
       dados.gastosPorVeiculo.length > 0 && 
       (dados.veiculosCount || 0) > 1 && 
       dados.temGastosVinculados && (
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="pt-6 px-6">
            <CardTitle className="text-lg font-bold text-gray-900">
              Gastos por Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <div className="space-y-4">
              {dados.gastosPorVeiculo.map((v, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                       <span className="font-bold text-gray-900">{v.placa !== "-" ? formatarPlacaExibicao(v.placa) : v.nome}</span>
                       {v.placa !== "-" && <span className="text-xs text-gray-500 font-normal">{v.nome}</span>}
                    </div>
                    <span className="font-bold text-gray-900">
                       {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v.valor)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${v.percentual}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {v.count} registro{v.count === 1 ? "" : "s"}
                    </span>
                    <span>
                      {Math.round(v.percentual)}% do total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
