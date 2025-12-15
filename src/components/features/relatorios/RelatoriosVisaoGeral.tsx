import { BlurredValue } from "@/components/common/BlurredValue";
import { KPICard } from "@/components/common/KPICard";
import { LockOverlay } from "@/components/common/LockOverlay";
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
        <KPICard
          title="Lucro Estimado"
          icon={Wallet}
          bgClass={lucroPositivo ? "bg-emerald-50" : "bg-red-50"}
          colorClass={lucroPositivo ? "text-emerald-600" : "text-red-600"}
          value={
            <BlurredValue
              value={dados.lucroEstimado}
              visible={hasAccess}
              type="currency"
              className={cn(
                "font-bold tracking-tight", // KPICard handles size, but we can override
                lucroPositivo ? "text-emerald-600" : "text-red-600"
              )}
            />
          }
          countText="Entradas - Saídas do mês"
          countVisible={hasAccess}
          className="md:col-span-1"
          restricted={!hasAccess}
        />

        {/* Atrasos */}
        <KPICard
          title="Em Atraso"
          icon={AlertTriangle}
          bgClass="bg-red-50"
          colorClass="text-red-600"
          value={
            <BlurredValue
              value={dados.atrasos.valor}
              visible={hasAccess}
              type="currency"
              className="font-bold tracking-tight text-red-600"
            />
          }
          countText={
            <div className="inline-flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md text-red-700">
                <BlurredValue
                  value={dados.atrasos.passageiros}
                  visible={hasAccess}
                  type="number"
                />{" "}
                passageiros
            </div>
          }
          countVisible={hasAccess}
          className="md:col-span-1"
          restricted={!hasAccess}
        />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Custo por Passageiro */}
        <KPICard
          title="Custo por Passageiro"
          icon={Users}
          bgClass="bg-orange-50"
          colorClass="text-orange-500"
          value={
              <BlurredValue
                value={dados.custoPorPassageiro}
                visible={hasAccess}
                type="currency"
              />
          }
          countText="Média de custo por assento ocupado"
          countVisible={hasAccess}
          restricted={!hasAccess}
        />

        {/* Taxa de Recebimento */}
        <KPICard
            title="Taxa de Recebimento"
            icon={Percent}
            bgClass="bg-emerald-50"
            colorClass="text-emerald-500"
            value={
                <span className="text-emerald-600">
                    <BlurredValue
                      value={dados.taxaRecebimento}
                      visible={hasAccess}
                      type="percent"
                    />
                </span>
            }
            countText="do previsto"
            countVisible={hasAccess}
            restricted={!hasAccess}
        />
      </div>

      {/* Comparativo Barras */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="pt-6 px-6">
          <CardTitle className="text-lg font-bold text-gray-900">
            Fluxo do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-6 pb-8 relative">
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
          {!hasAccess && (
            <LockOverlay className="bottom-1.5 right-4" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
