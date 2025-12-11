import { BlurredValue } from "@/components/common/BlurredValue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    AlertTriangle,
    ArrowDownCircle,
    ArrowUpCircle,
    Percent,
    Users,
    Wallet
} from "lucide-react";

interface RelatoriosVisaoGeralProps {
  dados: {
    lucroEstimado: number;
    atrasos: {
      valor: number;
      passageiros: number;
    };
    custoPorPassageiro: number;
    taxaRecebimento: number;
    recebido: number;
    gasto: number;
  };
  hasAccess: boolean;
}

export const RelatoriosVisaoGeral = ({
  dados,
  hasAccess,
}: RelatoriosVisaoGeralProps) => {
  const lucroPositivo = dados.lucroEstimado >= 0;

  // Helper for Progress Bars in No-Access State
  const getProgressValue = (realValue: number) => {
    if (hasAccess) return realValue;
    return 50; // Fixed visual percentage for "teaser" look
  };

  return (
    <div className="space-y-4 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lucro Estimado */}
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Lucro Estimado
            </CardTitle>
            <div
              className={cn(
                "p-2 rounded-full",
                lucroPositivo
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              )}
            >
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-baseline gap-2">
              <BlurredValue
                value={dados.lucroEstimado}
                visible={hasAccess}
                type="currency"
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  lucroPositivo ? "text-emerald-600" : "text-red-600"
                )}
              />
            </div>
            <p
              className={cn(
                "text-xs mt-2 font-medium",
                !hasAccess && "blur-sm select-none"
              )}
            >
              Entradas - Saídas do mês
            </p>
          </CardContent>
        </Card>

        {/* Atrasos */}
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Em Atraso
            </CardTitle>
            <div className="p-2 rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-baseline gap-2">
              <BlurredValue
                value={dados.atrasos.valor}
                visible={hasAccess}
                type="currency"
                className="text-3xl md:text-4xl font-bold tracking-tight text-red-600"
              />
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md">
              <span
                className={cn(
                  "text-xs font-medium text-red-700",
                  !hasAccess && "blur-sm select-none"
                )}
              >
                <BlurredValue
                  value={dados.atrasos.passageiros}
                  visible={hasAccess}
                  type="number"
                />{" "}
                passageiros
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Custo por Passageiro */}
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Custo por Passageiro
            </CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-gray-900">
              <BlurredValue
                value={dados.custoPorPassageiro}
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
              Média de custo por assento ocupado
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Taxa de Recebimento
            </CardTitle>
            <Percent className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6 flex items-baseline gap-2">
            <div>
              <span className="text-3xl font-bold text-emerald-600">
                <BlurredValue
                  value={dados.taxaRecebimento}
                  visible={hasAccess}
                  type="percent"
                />
              </span>
              <span
                className={cn(
                  "text-sm text-gray-400 ml-2 font-medium",
                  !hasAccess && "blur-sm select-none"
                )}
              >
                do previsto
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo Barras */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="pt-6 px-6">
          <CardTitle className="text-lg font-bold text-gray-900">
            Fluxo do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-8">
          {(() => {
            // Calcular o valor máximo entre recebido e gasto para usar como base (100%)
            const maxValor = Math.max(dados.recebido, dados.gasto);
            const percentualEntradas =
              maxValor > 0 ? (dados.recebido / maxValor) * 100 : 0;
            const percentualSaidas =
              maxValor > 0 ? (dados.gasto / maxValor) * 100 : 0;

            return (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2 font-medium">
                      <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                      Entradas
                    </span>
                    <span className="font-bold text-gray-900 text-base">
                      <BlurredValue
                        value={dados.recebido}
                        visible={hasAccess}
                        type="currency"
                      />
                    </span>
                  </div>
                  <Progress
                    value={getProgressValue(percentualEntradas)}
                    className="h-3 bg-gray-100 rounded-full"
                    indicatorClassName="bg-emerald-500 rounded-full"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2 font-medium">
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                      Saídas
                    </span>
                    <span className="font-bold text-gray-900 text-base">
                      <BlurredValue
                        value={dados.gasto}
                        visible={hasAccess}
                        type="currency"
                      />
                    </span>
                  </div>
                  <Progress
                    value={getProgressValue(percentualSaidas)}
                    className="h-3 bg-gray-100 rounded-full"
                    indicatorClassName="bg-red-500 rounded-full"
                  />
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};
