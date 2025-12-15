import { BlurredValue } from "@/components/common/BlurredValue";
import { LockOverlay } from "@/components/common/LockOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Coins, TrendingUp } from "lucide-react";

interface RelatoriosEntradasProps {
  dados: {
    realizado: number;
    ticketMedio: number;
    formasPagamento: {
      metodo: string;
      valor: number;
      percentual: number;
      color: string;
    }[];
  };
  hasAccess: boolean;
}

export const RelatoriosEntradas = ({
  dados,
  hasAccess,
}: RelatoriosEntradasProps) => {
  // Helper for Progress Bars in No-Access State
  const getProgressValue = (realValue: number) => {
    if (hasAccess) return realValue;
    return 50; // Fixed visual percentage for "teaser" look
  };

  return (
    <div className="space-y-4 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Receita Realizada
            </CardTitle>
            <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative">
            <div className="text-3xl font-bold text-gray-900">
              <BlurredValue
                value={dados.realizado}
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
              Total recebido no mês
            </p>
            {!hasAccess && (
                <LockOverlay className="bottom-4 right-7" />
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Ticket Médio
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative">
            <div className="text-3xl font-bold text-gray-900">
              <BlurredValue
                value={dados.ticketMedio}
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
              Valor médio por passageiro
            </p>
             {!hasAccess && (
                <LockOverlay className="bottom-4 right-7" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formas de Pagamento */}
      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="pt-6 px-6">
          <CardTitle className="text-lg font-bold text-gray-900">
            Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-8 relative">
          <div className="space-y-4">
            {dados.formasPagamento.map((forma, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {forma.metodo}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      <BlurredValue
                        value={forma.valor}
                        visible={hasAccess}
                        type="currency"
                      />
                    </span>
                    <span className="text-gray-400 text-xs w-10 text-right">
                      <BlurredValue
                        value={forma.percentual}
                        visible={hasAccess}
                        type="percent"
                      />
                    </span>
                  </div>
                </div>
                <Progress
                  value={getProgressValue(forma.percentual)}
                  className="h-2 bg-gray-100 rounded-full"
                  indicatorClassName={cn(forma.color, "rounded-full")}
                />
              </div>
            ))}
            
            {/* Restricted Empty State: Show Dummy Data to tempt user */}
            {dados.formasPagamento.length === 0 && !hasAccess && (
               <div className="space-y-4 opacity-50 blur-[2px] select-none pointer-events-none" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">Pagamento {i}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">R$ 150,00</span>
                                <span className="text-gray-400 text-xs w-10 text-right">33%</span>
                            </div>
                        </div>
                        <Progress value={40} className="h-2 bg-gray-100 rounded-full" indicatorClassName="bg-gray-400 rounded-full" />
                      </div>
                  ))}
               </div>
            )}

            {dados.formasPagamento.length === 0 && hasAccess && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhum pagamento registrado neste mês.
              </div>
            )}
            
     {!hasAccess && (
        <LockOverlay className="bottom-2 right-7" />
     )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
