import { BlurredValue } from "@/components/common/BlurredValue";
import { LockOverlay } from "@/components/common/LockOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
  hasAccess: boolean;
}

export const RelatoriosSaidas = ({
  dados,
  hasAccess,
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
              <BlurredValue
                value={dados.total}
                visible={hasAccess}
                type="currency"
              />
            </div>
            <p
              className={cn(
                "text-xs text-gray-400 mt-1",
                !hasAccess && "blur-sm select-none"
              )}
            >
              Acumulado no mês
            </p>
            {!hasAccess && (
                <LockOverlay className="bottom-4 right-7" />
            )}
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
                <BlurredValue
                  value={dados.margemOperacional}
                  visible={hasAccess}
                  type="percent"
                />
              </div>
              {hasAccess && (
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
              )}
            </div>
            <p
              className={cn(
                "text-xs text-gray-400 mt-1",
                !hasAccess && "blur-sm select-none"
              )}
            >
              Quanto sobra de cada real
            </p>
            {!hasAccess && (
                <LockOverlay className="bottom-4 right-7" />
            )}
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
                            <BlurredValue
                              value={cat.valor}
                              visible={hasAccess}
                              type="currency"
                            />
                          </span>
                          <span>•</span>
                          <span>
                            <BlurredValue
                              value={cat.count}
                              visible={hasAccess}
                              type="number"
                            />{" "}
                            <span
                              className={cn(
                                "text-xs text-gray-400 mt-1",
                                !hasAccess && "blur-sm select-none"
                              )}
                            >
                              {cat.count === 1 ? "registro" : "registros"}
                            </span>
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
                                            {v.placa !== "-" ? v.placa : v.nome}
                                         </span>
                                         {v.placa !== "-" && (
                                             <span className="text-[10px] text-gray-500">{v.nome}</span>
                                         )}
                                     </div>
                                     <div className="text-right">
                                         <div className="text-sm font-medium text-gray-900">
                                            <BlurredValue
                                                value={v.valor}
                                                visible={hasAccess}
                                                type="currency"
                                            />
                                         </div>
                                         <div className={cn(
                                            "text-[10px] text-gray-400",
                                            !hasAccess && "blur-sm select-none"
                                         )}>
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
            
            {/* Restricted Empty State: Dummy List */}
            {dados.topCategorias.length === 0 && !hasAccess && (
               <div className="space-y-4 opacity-50 blur-[2px] select-none pointer-events-none" aria-hidden="true">
                   {[
                       { name: "Combustível", val: "R$ 1.250,00", count: "8 registros", bg: "bg-orange-100", text: "text-orange-600", Icon: TrendingDown },
                       { name: "Manutenção", val: "R$ 450,00", count: "2 registros", bg: "bg-blue-100", text: "text-blue-600", Icon: BarChart3 },
                       { name: "Alimentação", val: "R$ 120,00", count: "4 registros", bg: "bg-purple-100", text: "text-purple-600", Icon: TrendingDown }
                   ].map((item, i) => (
                       <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                           <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", item.bg, item.text)}>
                                    <item.Icon className="h-5 w-5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{item.name}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <span className="font-bold text-gray-900">{item.val}</span>
                                      <span>•</span>
                                      <span>{item.count}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="text-gray-400">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                           </div>
                       </div>
                   ))}
               </div>
            )}

            {dados.topCategorias.length === 0 && hasAccess && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma despesa registrada neste mês.
              </div>
            )}

            {!hasAccess && (
                <LockOverlay className="bottom-4 right-7" />
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
                       <span className="font-bold text-gray-900">{v.placa !== "-" ? v.placa : v.nome}</span>
                       {v.placa !== "-" && <span className="text-xs text-gray-500 font-normal">{v.nome}</span>}
                    </div>
                    <span className="font-bold text-gray-900">
                      <BlurredValue
                        value={v.valor}
                        visible={hasAccess}
                        type="currency"
                      />
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${hasAccess ? v.percentual : 50}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      <BlurredValue
                        value={v.count}
                        visible={hasAccess}
                        type="number"
                      />{" "}
                      registro{v.count === 1 ? "" : "s"}
                    </span>
                    <span>
                      <BlurredValue
                        value={v.percentual}
                        visible={hasAccess}
                        type="percent"
                      />{" "}
                      do total
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
