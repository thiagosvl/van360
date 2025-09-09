import LatePaymentsAlert from "@/components/LatePaymentsAlert";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import PaymentStatsCard from "@/components/PaymentStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CreditCard, DollarSign, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Cobranca } from "@/types/cobranca";
import { PaymentStats } from "@/types/paymentStats";

interface DashboardStats {
  totalPrevisto: number;
  totalRecebido: number;
  totalAReceber: number;
  totalCobrancas: number;
  cobrancasPagas: number;
  cobrancasPendentes: number;
  cobrancasAtrasadas: number;
  percentualRecebimento: number;
  passageirosComAtraso: number;
}

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
    passageirosComAtraso: 0,
  });

  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    pix: { count: 0, total: 0 },
    cartao: { count: 0, total: 0 },
    dinheiro: { count: 0, total: 0 },
    transferencia: { count: 0, total: 0 },
  });

  const [latePayments, setLatePayments] = useState<Cobranca[]>([]);
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );

  const navigate = useNavigate();

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: cobrancasMes } = await supabase
        .from("cobrancas")
        .select(
          `
          *,
          passageiros (
            id,
            nome,
            nome_responsavel,
            valor_mensalidade,
            dia_vencimento
          )
        `
        )
        .eq("mes", mesFilter)
        .eq("ano", anoFilter);

      const totalPrevisto =
        cobrancasMes?.reduce((sum, c) => sum + Number(c.valor), 0) || 0;

      const cobrancas = cobrancasMes || [];
      const totalCobrancas = cobrancas.length;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const cobrancasPagas = cobrancas.filter(
        (c) => c.status === "pago"
      ).length;

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

      const totalRecebido = cobrancas
        .filter((c) => c.status === "pago")
        .reduce((sum, c) => sum + Number(c.valor), 0);

      const totalAReceber = totalPrevisto - totalRecebido;

      const percentualRecebimento =
        totalPrevisto > 0 ? (totalRecebido / totalPrevisto) * 100 : 0;

      const passageirosAtrasados = new Set(
        cobrancasAtrasadasList.map((c) => c.passageiro_id)
      );

      const cobrancasPagasData = cobrancas.filter((c) => c.status === "pago");
      const paymentStatsData: PaymentStats = {
        pix: { count: 0, total: 0 },
        cartao: { count: 0, total: 0 },
        dinheiro: { count: 0, total: 0 },
        transferencia: { count: 0, total: 0 },
      };

      cobrancasPagasData.forEach((c) => {
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
        } else if (tipo === "transferencia") {
          if (!paymentStatsData.transferencia) {
            paymentStatsData.transferencia = { count: 0, total: 0 };
          }
          paymentStatsData.transferencia.count++;
          paymentStatsData.transferencia.total += valor;
        }
      });

      setStats({
        totalPrevisto,
        totalRecebido,
        totalAReceber,
        totalCobrancas,
        cobrancasPagas,
        cobrancasPendentes,
        cobrancasAtrasadas: cobrancasAtrasadasList.length,
        percentualRecebimento,
        passageirosComAtraso: passageirosAtrasados.size,
      });

      setPaymentStats(paymentStatsData);
      setLatePayments(cobrancasAtrasadasList);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const reenviarCobranca = async (
    cobrancaId: string,
    nomePassageiro: string
  ) => {
    try {
      await supabase
        .from("cobrancas")
        .update({ enviado_em: new Date().toISOString() })
        .eq("id", cobrancaId);

      fetchStats();
    } catch (error) {
      console.error("Erro ao reenviar cobrança:", error);
    }
  };

  const openPaymentDialog = (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  };

  const handlePaymentRecorded = () => {
    fetchStats();
    setPaymentDialogOpen(false);
  };

  const handleViewHistory = (passageiroId: string) => {
    navigate(`/passageiros/${passageiroId}`);
  };

  useEffect(() => {
    fetchStats();
  }, [mesFilter, anoFilter]);

  return (
    <div className="space-y-6">
      <div className="w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Tela Inicial
            </h1>
          </div>

          {/* Filtros no topo */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Mês</label>
                  <Select
                    value={mesFilter.toString()}
                    onValueChange={(value) => setMesFilter(Number(value))}
                  >
                    <SelectTrigger>
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
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Ano</label>
                  <Select
                    value={anoFilter.toString()}
                    onValueChange={(value) => setAnoFilter(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2023, 2024, 2025, 2026].map((ano) => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerta de Mensalidades em Atraso */}
          <LatePaymentsAlert
            latePayments={latePayments}
            loading={loading}
            totalCobrancas={stats.totalCobrancas}
            selectedMonth={mesFilter}
            onReenviarCobranca={reenviarCobranca}
            onPayment={openPaymentDialog}
            onViewHistory={handleViewHistory}
            onRefresh={fetchStats}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Previsto
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold">
                    {Number(stats.totalPrevisto).toLocaleString("pt-BR", {
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
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {Number(stats.totalRecebido).toLocaleString("pt-BR", {
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
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {Number(stats.totalAReceber).toLocaleString("pt-BR", {
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
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stats.percentualRecebimento.toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mensalidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stats.totalCobrancas}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    {stats.cobrancasPagas}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A vencer</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.cobrancasPendentes}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-red-600">
                    {stats.cobrancasAtrasadas}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Card de Mensalidades por Tipo */}
          {stats.totalRecebido > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Soma de Valores Recebidos por Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentStatsCard stats={paymentStats} loading={loading} />
              </CardContent>
        </Card>
      )}
    </div>

      {/* Manual Payment Dialog */}
      {selectedCobranca && (
        <ManualPaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          cobrancaId={selectedCobranca.id}
          passageiroNome={selectedCobranca.passageiros.nome}
          valorOriginal={Number(selectedCobranca.valor)}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </div>
  );
};

export default Dashboard;
