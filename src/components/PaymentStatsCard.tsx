import { Skeleton } from "@/components/ui/skeleton";
import { PaymentStats } from "@/types/paymentStats";
import { Banknote, CreditCard, Smartphone } from "lucide-react";


interface PaymentStatsCardProps {
  stats: PaymentStats;
  loading: boolean;
}

const PaymentStatsCard = ({ stats, loading }: PaymentStatsCardProps) => {
  const allPaymentMethods = [
    {
      key: "pix",
      name: "PIX",
      icon: Smartphone,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      key: "cartao",
      name: "Cartões (crédito e débito)",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      key: "dinheiro",
      name: "Dinheiro",
      icon: Banknote,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      key: "transferencia",
      name: "Transferência",
      icon: Banknote,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {allPaymentMethods
          .filter((method) => stats[method.key]?.count > 0)
          .map((method) => {
            const IconComponent = method.icon;
            const data = stats[method.key];

            return (
              <div
                key={method.key}
                className={`rounded-lg border ${method.borderColor} ${method.bgColor} p-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full bg-white p-2 ${method.color}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.name}
                      </div>
                      {loading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : (
                        <div className="text-sm text-gray-600">
                          {data.count} pagamento{data.count !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {loading ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <div className="text-lg font-bold text-gray-900">
                        {data.total.toLocaleString("pt-BR", {
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
