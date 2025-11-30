import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, DollarSign } from "lucide-react";

interface YearlySummary {
  qtdPago: number;
  valorPago: number;
  qtdPendente: number;
  valorPendente: number;
  qtdEmAtraso: number;
  valorEmAtraso: number;
}

interface CarteirinhaResumoFinanceiroProps {
  yearlySummary: YearlySummary;
}

export const CarteirinhaResumoFinanceiro = ({
  yearlySummary,
}: CarteirinhaResumoFinanceiroProps) => {
  // Animações dos valores
  const animatedValorPago = useAnimatedNumber(yearlySummary.valorPago, 1000);
  const animatedValorPendente = useAnimatedNumber(
    yearlySummary.valorPendente,
    1000
  );
  const animatedValorEmAtraso = useAnimatedNumber(
    yearlySummary.valorEmAtraso,
    1000
  );

  // Animações dos contadores
  const animatedQtdPago = useAnimatedNumber(yearlySummary.qtdPago, 1000);
  const animatedQtdPendente = useAnimatedNumber(
    yearlySummary.qtdPendente,
    1000
  );
  const animatedQtdEmAtraso = useAnimatedNumber(
    yearlySummary.qtdEmAtraso,
    1000
  );

  const totalValor = yearlySummary.valorPago + yearlySummary.valorPendente;
  const percentualPago =
    totalValor > 0 ? (yearlySummary.valorPago / totalValor) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-0 shadow-lg ring-1 ring-black/5 bg-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Resumo Financeiro do Ano
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">Progresso de Pagamentos</span>
              <span className="text-gray-900">
                {Math.round(percentualPago)}%
              </span>
            </div>
            <Progress
              value={percentualPago}
              className="h-2 bg-gray-100"
              indicatorClassName="bg-green-500"
            />
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-green-50 rounded-xl p-4 border border-green-100"
            >
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pago
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {animatedValorPago.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className="text-xs text-green-600 mt-1 font-medium">
                {`${
                  yearlySummary.qtdPago === 1
                    ? "1 cobrança"
                    : `${yearlySummary.qtdPago} cobranças`
                }`}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-orange-50 rounded-xl p-4 border border-orange-100"
            >
              <div className="flex items-center gap-2 text-orange-800 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pendente
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {animatedValorPendente.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className="text-xs text-orange-800 mt-1 font-medium">
                {`${
                  yearlySummary.qtdPendente === 1
                    ? "1 cobrança"
                    : `${yearlySummary.qtdPendente} cobranças`
                }`}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-red-50 rounded-xl p-4 border border-red-100"
            >
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Em Atraso
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {animatedValorEmAtraso.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className="text-xs text-red-600 mt-1 font-medium">
                {`${
                  yearlySummary.qtdEmAtraso === 1
                    ? "1 cobrança"
                    : `${yearlySummary.qtdEmAtraso} cobranças`
                }`}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
