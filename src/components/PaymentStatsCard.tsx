import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";

interface PaymentStats {
  pix: { count: number; total: number };
  cartao: { count: number; total: number };
  dinheiro: { count: number; total: number };
}

interface PaymentStatsCardProps {
  stats: PaymentStats;
  loading: boolean;
}

const PaymentStatsCard = ({ stats, loading }: PaymentStatsCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Pagamentos Recebidos por Forma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-muted-foreground">PIX</div>
            {loading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <div className="text-lg font-bold">
                {stats.pix.count} pagamento{stats.pix.count !== 1 ? "s" : ""}
              </div>
            )}
            {loading ? (
              <Skeleton className="h-6 w-24 mx-auto" />
            ) : (
              <div className="text-sm text-muted-foreground">
                R$ {stats.pix.total.toFixed(2)}
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Cartão</div>
            {loading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <div className="text-lg font-bold">
                {stats.cartao.count} pagamento{stats.cartao.count !== 1 ? "s" : ""}
              </div>
            )}
            {loading ? (
              <Skeleton className="h-6 w-24 mx-auto" />
            ) : (
              <div className="text-sm text-muted-foreground">
                R$ {stats.cartao.total.toFixed(2)}
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Dinheiro</div>
            {loading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <div className="text-lg font-bold">
                {stats.dinheiro.count} pagamento{stats.dinheiro.count !== 1 ? "s" : ""}
              </div>
            )}
            {loading ? (
              <Skeleton className="h-6 w-24 mx-auto" />
            ) : (
              <div className="text-sm text-muted-foreground">
                R$ {stats.dinheiro.total.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatsCard;