import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, QrCode, ShieldCheck } from "lucide-react";
import type { MeiosPagamentoBreakdown } from "@/services/api/admin/admin-financial.api";

interface AdminPaymentMethodBreakdownProps {
  data: MeiosPagamentoBreakdown;
  diasRetencaoCartao: number;
}

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      count: number;
      pct: number;
      pctValor: number;
      color: string;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-card text-foreground p-3 rounded-2xl border border-border shadow-xl text-xs space-y-1 text-left">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
          {item.name}
        </p>
        <p className="text-muted-foreground font-normal">
          {item.count} faturas ({item.pct}%)
        </p>
        <p className="text-foreground font-semibold">{formatCurrency(item.value)} ({item.pctValor}% do total)</p>
      </div>
    );
  }
  return null;
}

export function AdminPaymentMethodBreakdown({
  data,
  diasRetencaoCartao,
}: AdminPaymentMethodBreakdownProps) {
  const chartData = [
    {
      name: "Pix (D+0)",
      value: data.pix.total,
      count: data.pix.count,
      pct: data.pix.pct,
      pctValor: data.pix.pctValor,
      color: "#10b981",
    },
    {
      name: `Cartão de Crédito (D+${diasRetencaoCartao})`,
      value: data.cartao.total,
      count: data.cartao.count,
      pct: data.cartao.pct,
      pctValor: data.cartao.pctValor,
      color: "#3b82f6",
    },
    ...(data.outros.count > 0
      ? [
          {
            name: "Outros",
            value: data.outros.total,
            count: data.outros.count,
            pct: data.outros.pct,
            pctValor: data.outros.pctValor,
            color: "#64748b",
          },
        ]
      : []),
  ];

  return (
    <Card className="border border-border bg-card rounded-3xl shadow-xs overflow-hidden text-left h-full flex flex-col justify-between">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-400" />
          <span>Meios de pagamento e liquidação</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Proporção entre recebimentos imediatos e prazos de repasse
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
          <div className="bg-secondary/40 border border-emerald-500/20 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <QrCode className="h-3.5 w-3.5" />
              <span>Pix (D+0)</span>
            </div>
            <p className="text-lg font-headline font-semibold text-foreground">{data.pix.pctValor}%</p>
            <p className="text-xs text-muted-foreground font-normal">{formatCurrency(data.pix.total)} · {data.pix.count} faturas</p>
            <span className="text-[11px] text-emerald-400/80 font-normal block pt-0.5">Liquidação imediata</span>
          </div>

          <div className="bg-secondary/40 border border-blue-500/20 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Cartão (D+{diasRetencaoCartao})</span>
            </div>
            <p className="text-lg font-headline font-semibold text-foreground">{data.cartao.pctValor}%</p>
            <p className="text-xs text-muted-foreground font-normal">{formatCurrency(data.cartao.total)} · {data.cartao.count} faturas</p>
            <span className="text-[11px] text-blue-400/80 font-normal block pt-0.5">Repasse em {diasRetencaoCartao} dias</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
