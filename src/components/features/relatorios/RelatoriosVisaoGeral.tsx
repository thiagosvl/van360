import { KPICard } from "@/components/common/KPICard";
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
}: RelatoriosVisaoGeralProps) => {
  const lucroPositivo = dados.lucroEstimado >= 0;

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
             <span className={cn(
                "font-bold tracking-tight",
                lucroPositivo ? "text-emerald-600" : "text-red-600"
              )}>
               {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dados.lucroEstimado)}
             </span>
          }
          countText="Entradas - Saídas do mês"
          countVisible={true}
          className="md:col-span-1"
        />

        {/* Atrasos */}
        <KPICard
          title="Em Atraso"
          icon={AlertTriangle}
          bgClass="bg-red-50"
          colorClass="text-red-600"
          value={
             <span className="font-bold tracking-tight text-red-600">
               {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dados.atrasos.valor)}
             </span>
          }
          countText={
            <div className="inline-flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-md text-red-700">
                {dados.atrasos.passageiros} passageiros
            </div>
          }
          countVisible={true}
          className="md:col-span-1"
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
          value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dados.custoPorPassageiro)}
          countText="Média de custo por assento ocupado"
          countVisible={true}
        />

        {/* Taxa de Recebimento */}
        <KPICard
            title="Taxa de Recebimento"
            icon={Percent}
            bgClass="bg-emerald-50"
            colorClass="text-emerald-500"
            value={
                <span className="text-emerald-600">
                    {dados.taxaRecebimento}%
                </span>
            }
            countText="do previsto"
            countVisible={true}
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
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dados.recebido)}
                    </span>
                  </div>
                  <Progress
                    value={percentualEntradas}
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
                       {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(dados.gasto)}
                    </span>
                  </div>
                  <Progress
                    value={percentualSaidas}
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
