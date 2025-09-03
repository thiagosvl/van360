import Navigation from "@/components/Navigation";
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
import { Calendar, DollarSign, Filter, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Passageiro {
  id: string;
  nome: string;
  endereco: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  valor_mensalidade: number;
  dia_vencimento: number;
}

interface Cobranca {
  id: string;
  passageiro_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  passageiros: Passageiro;
}

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

  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

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
      // Buscar todas as cobranças do mês/ano filtrado
      const { data: cobrancasMes } = await supabase
        .from("cobrancas")
        .select("valor, status, data_vencimento, passageiro_id")
        .eq("mes", mesFilter)
        .eq("ano", anoFilter);

      // Buscar total previsto (soma de todas as mensalidades dos passageiros)
      const { data: passageiros } = await supabase
        .from("passageiros")
        .select("valor_mensalidade");

      const totalPrevisto = cobrancasMes.reduce(
        (sum, c) => sum + Number(c.valor),
        0
      );

      const cobrancas = cobrancasMes || [];
      const totalCobrancas = cobrancas.length;

      // Classificar status considerando data de vencimento
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const cobrancasPagas = cobrancas.filter(
        (c) => c.status === "pago"
      ).length;
      const cobrancasAtrasadas = cobrancas.filter((c) => {
        if (c.status === "pago") return false;
        const vencimento = new Date(c.data_vencimento);
        return vencimento < hoje;
      }).length;
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

      // Buscar passageiros únicos com cobranças em atraso
      const passageirosAtrasados = new Set(
        cobrancas
          .filter((c) => {
            if (c.status === "pago") return false;
            const vencimento = new Date(c.data_vencimento);
            return vencimento < hoje;
          })
          .map((c) => c.passageiro_id)
      );

      setStats({
        totalPrevisto,
        totalRecebido,
        totalAReceber,
        totalCobrancas,
        cobrancasPagas,
        cobrancasPendentes,
        cobrancasAtrasadas,
        percentualRecebimento,
        passageirosComAtraso: passageirosAtrasados.size,
      });
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 space-y-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas cobranças e passageiros
            </p>
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
                    R$ {stats.totalPrevisto.toFixed(2)}
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
                    R$ {stats.totalRecebido.toFixed(2)}
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
                    R$ {stats.totalAReceber.toFixed(2)}
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
                  Total Cobranças
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

          {/* Passageiros com Atraso */}
          {stats.passageirosComAtraso > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  <span className="text-lg font-semibold text-red-800">
                    {stats.passageirosComAtraso} passageiro
                    {stats.passageirosComAtraso > 1 ? "s" : ""} com atraso
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
