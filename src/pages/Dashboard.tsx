import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, DollarSign, Calendar, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface Aluno {
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
  aluno_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  alunos: Aluno;
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
  alunosComAtraso: number;
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
    alunosComAtraso: 0,
  });
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const fetchStats = async () => {
    try {
      // Buscar todas as cobranças do mês/ano filtrado
      const { data: cobrancasMes } = await supabase
        .from("cobrancas")
        .select("valor, status")
        .eq("mes", mesFilter)
        .eq("ano", anoFilter);

      // Buscar total previsto (soma de todas as mensalidades dos alunos)
      const { data: alunos } = await supabase
        .from("alunos")
        .select("valor_mensalidade");

      const totalPrevisto = alunos?.reduce((sum, aluno) => sum + Number(aluno.valor_mensalidade), 0) || 0;
      
      const cobrancas = cobrancasMes || [];
      const totalCobrancas = cobrancas.length;
      
      const cobrancasPagas = cobrancas.filter(c => c.status === "em_dia").length;
      const cobrancasPendentes = cobrancas.filter(c => c.status === "pendente").length;
      const cobrancasAtrasadas = cobrancas.filter(c => c.status === "atrasado").length;
      
      const totalRecebido = cobrancas
        .filter(c => c.status === "em_dia")
        .reduce((sum, c) => sum + Number(c.valor), 0);
      
      const totalAReceber = totalPrevisto - totalRecebido;
      
      const percentualRecebimento = totalPrevisto > 0 ? (totalRecebido / totalPrevisto) * 100 : 0;
      
      // Buscar alunos únicos com cobranças em atraso
      const { data: alunosAtrasados } = await supabase
        .from("cobrancas")
        .select("aluno_id")
        .eq("mes", mesFilter)
        .eq("ano", anoFilter)
        .eq("status", "atrasado");

      const alunosComAtraso = new Set(alunosAtrasados?.map(c => c.aluno_id)).size;

      setStats({
        totalPrevisto,
        totalRecebido,
        totalAReceber,
        totalCobrancas,
        cobrancasPagas,
        cobrancasPendentes,
        cobrancasAtrasadas,
        percentualRecebimento,
        alunosComAtraso,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const fetchCobrancas = async () => {
    try {
      const { data } = await supabase
        .from("cobrancas")
        .select(`
          *,
          alunos (
            id,
            nome,
            endereco,
            nome_responsavel,
            telefone_responsavel,
            valor_mensalidade,
            dia_vencimento
          )
        `)
        .eq("mes", mesFilter)
        .eq("ano", anoFilter)
        .in("status", ["pendente", "atrasado"])
        .order("data_vencimento", { ascending: true });

      setCobrancas((data || []) as Cobranca[]);
    } catch (error) {
      console.error("Erro ao buscar cobranças:", error);
    }
  };

  const reenviarCobranca = async (cobrancaId: string, nomeAluno: string) => {
    try {
      await supabase
        .from("cobrancas")
        .update({ enviado_em: new Date().toISOString() })
        .eq("id", cobrancaId);

      toast({
        title: "Cobrança reenviada com sucesso para o responsável",
      });
    } catch (error) {
      console.error("Erro ao reenviar cobrança:", error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar cobrança",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_dia":
        return "text-green-600 bg-green-50";
      case "pendente":
        return "text-yellow-600 bg-yellow-50";
      case "atrasado":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em_dia":
        return "Em dia";
      case "pendente":
        return "Pendente";
      case "atrasado":
        return "Atrasado";
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCobrancas();
  }, [mesFilter, anoFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 space-y-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Gerencie suas cobranças e passageiros</p>
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
                <Select value={mesFilter.toString()} onValueChange={(value) => setMesFilter(Number(value))}>
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
                <Select value={anoFilter.toString()} onValueChange={(value) => setAnoFilter(Number(value))}>
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
              <CardTitle className="text-sm font-medium">Total Previsto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalPrevisto.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {stats.totalRecebido.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {stats.totalAReceber.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% Recebimento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.percentualRecebimento.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cobranças</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCobrancas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.cobrancasPagas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.cobrancasPendentes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cobrancasAtrasadas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Passageiros com Atraso */}
        {stats.alunosComAtraso > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                <span className="text-lg font-semibold text-red-800">
                  {stats.alunosComAtraso} passageiro{stats.alunosComAtraso > 1 ? 's' : ''} com atraso
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Cobranças */}
        <Card>
          <CardHeader>
            <CardTitle>Cobranças - {meses[mesFilter - 1]} {anoFilter}</CardTitle>
          </CardHeader>
          <CardContent>
            {cobrancas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma cobrança pendente ou atrasada para este período
              </div>
            ) : (
              <div className="space-y-3">
                {cobrancas.map((cobranca) => (
                  <div
                    key={cobranca.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{cobranca.alunos.nome}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {cobranca.alunos.nome_responsavel}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Venc: {new Date(cobranca.data_vencimento).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cobranca.status)}`}>
                        {getStatusText(cobranca.status)}
                      </span>
                      <span className="font-medium">R$ {Number(cobranca.valor).toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reenviarCobranca(cobranca.id, cobranca.alunos.nome)}
                        className="w-full sm:w-auto"
                      >
                        Reenviar Cobrança
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;