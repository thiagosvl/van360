import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Smartphone, Banknote } from "lucide-react";

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
  const paymentMethods = [
    {
      key: 'pix',
      name: 'PIX',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      data: stats.pix
    },
    {
      key: 'cartao',
      name: 'Cartão',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      data: stats.cartao
    },
    {
      key: 'dinheiro',
      name: 'Dinheiro',
      icon: Banknote,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      data: stats.dinheiro
    }
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <CreditCard className="w-5 h-5" />
        Pagamentos Recebidos por Forma
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          
          return (
            <div
              key={method.key}
              className={`rounded-lg border ${method.borderColor} ${method.bgColor} p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full bg-white p-2 ${method.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{method.name}</div>
                    {loading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      <div className="text-sm text-gray-600">
                        {method.data.count} pagamento{method.data.count !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {loading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    <div className="text-lg font-bold text-gray-900">
                      {method.data.total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentStatsCard;