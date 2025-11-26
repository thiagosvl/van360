// Components - UI
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Types
import { PaymentStats } from "@/types/paymentStats";

// Icons
import {
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Ticket,
} from "lucide-react";

interface PaymentStatsDisplayProps {
  stats: PaymentStats;
  totalRecebido: number;
  loading: boolean;
}

const paymentMethods = [
  { key: "pix", label: "PIX", icon: Smartphone, color: "bg-sky-500" },
  {
    key: "cartao",
    label: "Cartões",
    icon: CreditCard,
    color: "bg-purple-500",
  },
  { key: "boleto", label: "Boleto", icon: Ticket, color: "bg-gray-500" },
  {
    key: "dinheiro",
    label: "Dinheiro",
    icon: Banknote,
    color: "bg-green-500",
  },
  {
    key: "transferencia",
    label: "Transferência",
    icon: Landmark,
    color: "bg-blue-500",
  },
];

export function PaymentStatsDisplay({
  stats,
  totalRecebido,
  loading,
}: PaymentStatsDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const activeMethods = paymentMethods.filter(
    (method) => stats[method.key as keyof PaymentStats]?.total > 0
  );

  if (activeMethods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma cobrança recebida no mês indicado
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {activeMethods.map((methodInfo) => {
        const methodData = stats[methodInfo.key as keyof PaymentStats];
        if (!methodData) return null;

        const percentage =
          totalRecebido > 0 ? (methodData.total / totalRecebido) * 100 : 0;

        return (
          <div key={methodInfo.key}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <methodInfo.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-semibold">{methodInfo.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {methodData.count}{" "}
                    {methodData.count === 1 ? "pagamento" : "pagamentos"}
                  </div>
                </div>
              </div>
              <div className="font-bold text-lg">
                {methodData.total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
            <Progress
              value={percentage}
              className="h-2"
              indicatorClassName={methodInfo.color}
            />
          </div>
        );
      })}
    </div>
  );
}

