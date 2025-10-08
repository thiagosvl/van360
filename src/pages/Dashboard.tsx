import LatePaymentsAlert from "@/components/LatePaymentsAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Cobranca } from "@/types/cobranca";
import { PaymentStats } from "@/types/paymentStats";
import { meses } from "@/utils/formatters";
import {
  Banknote,
  CalendarDays,
  CheckCircle,
  CirclePercent,
  ClipboardList,
  CreditCard,
  Hourglass,
  Landmark,
  PieChart,
  Smartphone,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalPrevisto: number;
  totalRecebido: number;
  totalAReceber: number;
  totalCobrancas: number;
  cobrancasPagas: number;
  cobrancasPendentes: number;
  cobrancasAtrasadas: number;
  percentualRecebimento: number;
}

const PaymentStatsDisplay = ({
  stats,
  totalRecebido,
  loading,
}: {
  stats: PaymentStats;
  totalRecebido: number;
  loading: boolean;
}) => {
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
        Nenhuma mensalidade recebida no mês indicado.
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
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPrevisto: 0,
    totalRecebido: 0,
    totalAReceber: 0,
    totalCobrancas: 0,
    cobrancasPagas: 0,
    cobrancasPendentes: 0,
    cobrancasAtrasadas: 0,
    percentualRecebimento: 0,
  });

  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    pix: { count: 0, total: 0 },
    cartao: { count: 0, total: 0 },
    dinheiro: { count: 0, total: 0 },
    transferencia: { count: 0, total: 0 },
    boleto: { count: 0, total: 0 },
  });

  const currentYear = new Date().getFullYear();
  const anos = [
    { value: currentYear.toString(), label: currentYear.toString() },
    {
      value: (currentYear - 1).toString(),
      label: (currentYear - 1).toString(),
    },
  ];

  const [latePayments, setLatePayments] = useState<Cobranca[]>([]);
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: cobrancasMes } = await supabase
        .from("cobrancas")
        .select(
          `*, passageiros (id, nome, nome_responsavel, valor_mensalidade, dia_vencimento)`
        )
        .eq("mes", mesFilter)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .eq("ano", anoFilter);
      const totalPrevisto =
        cobrancasMes?.reduce((sum, c) => sum + Number(c.valor), 0) || 0;
      const cobrancas = cobrancasMes || [];
      const totalCobrancas = cobrancas.length;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const cobrancasPagasList = cobrancas.filter((c) => c.status === "pago");
      const cobrancasAtrasadasList = cobrancas.filter((c) => {
        if (c.status === "pago") return false;
        const vencimento = new Date(c.data_vencimento);
        return vencimento < hoje;
      });
      const cobrancasPendentes = cobrancas.filter((c) => {
        if (c.status === "pago") return false;
        const vencimento = new Date(c.data_vencimento);
        return vencimento >= hoje;
      }).length;
      const totalRecebido = cobrancasPagasList.reduce(
        (sum, c) => sum + Number(c.valor),
        0
      );
      const totalAReceber = totalPrevisto - totalRecebido;
      const percentualRecebimento =
        totalPrevisto > 0 ? (totalRecebido / totalPrevisto) * 100 : 0;
      const paymentStatsData: PaymentStats = {
        pix: { count: 0, total: 0 },
        cartao: { count: 0, total: 0 },
        dinheiro: { count: 0, total: 0 },
        transferencia: { count: 0, total: 0 },
        boleto: { count: 0, total: 0 },
      };
      cobrancasPagasList.forEach((c) => {
        const tipo = c.tipo_pagamento?.toLowerCase() || "";
        const valor = Number(c.valor);
        if (tipo === "pix") {
          paymentStatsData.pix.count++;
          paymentStatsData.pix.total += valor;
        } else if (tipo === "cartao-credito" || tipo === "cartao-debito") {
          paymentStatsData.cartao.count++;
          paymentStatsData.cartao.total += valor;
        } else if (tipo === "dinheiro") {
          paymentStatsData.dinheiro.count++;
          paymentStatsData.dinheiro.total += valor;
        } else if (tipo === "boleto") {
          paymentStatsData.boleto.count++;
          paymentStatsData.boleto.total += valor;
        } else if (tipo === "transferencia") {
          paymentStatsData.transferencia.count++;
          paymentStatsData.transferencia.total += valor;
        }
      });
      setStats({
        totalPrevisto,
        totalRecebido,
        totalAReceber,
        totalCobrancas,
        cobrancasPagas: cobrancasPagasList.length,
        cobrancasPendentes,
        cobrancasAtrasadas: cobrancasAtrasadasList.length,
        percentualRecebimento,
      });
      setPaymentStats(paymentStatsData);
      setLatePayments(cobrancasAtrasadasList);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [mesFilter, anoFilter]);

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Tela Inicial
          </h1>
        </div>

        <Card className="mb-6">
          <CardContent className="mt-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <label htmlFor="mes-select" className="text-sm font-medium">
                Mês
              </label>
              <label htmlFor="ano-select" className="text-sm font-medium">
                Ano
              </label>
              <Select
                value={mesFilter.toString()}
                onValueChange={(value) => setMesFilter(Number(value))}
              >
                <SelectTrigger id="mes-select">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={anoFilter.toString()}
                onValueChange={(value) => setAnoFilter(Number(value))}
              >
                <SelectTrigger id="ano-select">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano.value} value={ano.value}>
                      {ano.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : latePayments.length > 0 ? (
          <LatePaymentsAlert latePayments={latePayments} />
        ) : stats.totalCobrancas > 0 ? (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="text-sm font-medium text-green-800">
              Tudo em dia! Não há mensalidades pendentes no mês indicado.
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-medium text-gray-500">
              Nenhuma mensalidade registrada para {meses[mesFilter - 1]}.
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Previsto
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.totalPrevisto.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Recebido
              </CardTitle>
              <Landmark className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.totalRecebido.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total a Receber
              </CardTitle>
              <Hourglass className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {stats.totalAReceber.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                % Recebimento
              </CardTitle>
              <CirclePercent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.percentualRecebimento.toFixed(1)}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Situação do Mês
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Mensalidades
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stats.totalCobrancas}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Pagas
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {stats.cobrancasPagas}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  A vencer
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.cobrancasPendentes}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Em Atraso
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-red-600">
                    {stats.cobrancasAtrasadas}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Origem dos Recebimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentStatsDisplay
              stats={paymentStats}
              totalRecebido={stats.totalRecebido}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
