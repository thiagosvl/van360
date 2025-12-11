import { BlurredValue } from "@/components/common/BlurredValue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingDown } from "lucide-react";

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
    }[];
  };
  hasAccess: boolean;
}

export const RelatoriosSaidas = ({
  dados,
  hasAccess,
}: RelatoriosSaidasProps) => {
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
          <CardContent className="px-6 pb-6">
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
          <CardContent className="px-6 pb-6">
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
        <CardContent className="px-6 pb-8">
          <div className="space-y-4">
            {dados.topCategorias.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
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
    </div>
  );
};
