import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, DollarSign, Filter, Send } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Passageiro {
  id: string;
  nome: string;
  nome_responsavel: string;
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
  data_pagamento?: string;
  tipo_pagamento?: string;
  passageiros: Passageiro;
}

interface DashboardStats {
  totalPrevisto: number;
  totalRecebido: number;
  totalAReceber: number;
  totalCobrancas: number;
  cobrancasPagas: number;
  cobrancasAVencer: number;
  cobrancasAtrasadas: number;
  percentualRecebimento: number;
}

const Cobrancas = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPrevisto: 0,
    totalRecebido: 0,
    totalAReceber: 0,
    totalCobrancas: 0,
    cobrancasPagas: 0,
    cobrancasAVencer: 0,
    cobrancasAtrasadas: 0,
    percentualRecebimento: 0,
  });
  const [cobrancasAbertas, setCobrancasAbertas] = useState<Cobranca[]>([]);
  const [cobrancasPagas, setCobrancasPagas] = useState<Cobranca[]>([]);
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
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
        .select("valor, status, data_vencimento, passageiro_id")
        .eq("mes", mesFilter)
        .eq("ano", anoFilter);

      // Buscar total previsto (soma de todas as mensalidades dos passageiros)
      const { data: passageiros } = await supabase
        .from("passageiros")
        .select("valor_mensalidade");

      const totalPrevisto = passageiros?.reduce((sum, passageiro) => sum + Number(passageiro.valor_mensalidade), 0) || 0;
      
      const cobrancas = cobrancasMes || [];
      const totalCobrancas = cobrancas.length;
      
      // Classificar status considerando data de vencimento
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const cobrancasPagas = cobrancas.filter(c => c.status === "pago").length;
      const cobrancasAtrasadas = cobrancas.filter(c => {
        if (c.status === "pago") return false;
        const vencimento = new Date(c.data_vencimento);
        return vencimento < hoje;
      }).length;
      const cobrancasAVencer = cobrancas.filter(c => {
        if (c.status === "pago") return false;
        const vencimento = new Date(c.data_vencimento);
        return vencimento >= hoje;
      }).length;
      
      const totalRecebido = cobrancas
        .filter(c => c.status === "pago")
        .reduce((sum, c) => sum + Number(c.valor), 0);
      
      const totalAReceber = totalPrevisto - totalRecebido;
      
      const percentualRecebimento = totalPrevisto > 0 ? (totalRecebido / totalPrevisto) * 100 : 0;

      setStats({
        totalPrevisto,
        totalRecebido,
        totalAReceber,
        totalCobrancas,
        cobrancasPagas,
        cobrancasAVencer,
        cobrancasAtrasadas,
        percentualRecebimento,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const fetchCobrancas = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("cobrancas")
        .select(`
          *,
          passageiros (
            id,
            nome,
            nome_responsavel,
            valor_mensalidade,
            dia_vencimento
          )
        `)
        .eq("mes", mesFilter)
        .eq("ano", anoFilter)
        .order("data_vencimento", { ascending: true });

      const cobrancas = data || [];
      
      // Separar cobranças
      const abertas = cobrancas.filter(c => c.status !== "pago");
      const pagas = cobrancas.filter(c => c.status === "pago");
      
      setCobrancasAbertas(abertas as Cobranca[]);
      setCobrancasPagas(pagas as Cobranca[]);
    } catch (error) {
      console.error("Erro ao buscar cobranças:", error);
    } finally {
      setLoading(false);
    }
  };

  const reenviarCobranca = async (cobrancaId: string, nomePassageiro: string) => {
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

  const getStatusText = (status: string, dataVencimento: string) => {
    if (status === 'pago') return 'Pago';
    
    const vencimento = new Date(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (vencimento < hoje) {
      const diffTime = hoje.getTime() - vencimento.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Atrasou há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
    
    return 'A vencer';
  };

  const getStatusColor = (status: string, dataVencimento: string) => {
    if (status === 'pago') return 'bg-green-100 text-green-800';
    
    const vencimento = new Date(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return vencimento < hoje ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cobranças</h1>
            <p className="text-muted-foreground">Gerencie todas as cobranças por período</p>
          </div>

          {/* Filtros */}
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


          {/* Cobranças em Aberto */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-red-600">
                Cobranças em Aberto - {meses[mesFilter - 1]} {anoFilter}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Carregando...
                </div>
              ) : cobrancasAbertas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma cobrança em aberto neste período
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">Passageiro</th>
                        <th className="text-left p-3 text-sm font-medium">Responsável</th>
                        <th className="text-left p-3 text-sm font-medium">Vencimento</th>
                        <th className="text-left p-3 text-sm font-medium">Status</th>
                        <th className="text-right p-3 text-sm font-medium">Valor</th>
                        <th className="text-center p-3 text-sm font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cobrancasAbertas.map((cobranca) => (
                        <tr key={cobranca.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <span className="font-medium text-sm">{cobranca.passageiros.nome}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {cobranca.passageiros.nome_responsavel || '-'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {new Date(cobranca.data_vencimento).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cobranca.status, cobranca.data_vencimento)}`}>
                              {getStatusText(cobranca.status, cobranca.data_vencimento)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-medium text-sm">
                              {Number(cobranca.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reenviarCobranca(cobranca.id, cobranca.passageiros.nome)}
                              className="gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Reenviar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cobranças Pagas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">
                Cobranças Pagas - {meses[mesFilter - 1]} {anoFilter}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Carregando...
                </div>
              ) : cobrancasPagas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma cobrança paga neste mês ainda
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium">Passageiro</th>
                        <th className="text-left p-3 text-sm font-medium">Responsável</th>
                        <th className="text-left p-3 text-sm font-medium">Data Pagamento</th>
                        <th className="text-left p-3 text-sm font-medium">Forma</th>
                        <th className="text-left p-3 text-sm font-medium">Status</th>
                        <th className="text-right p-3 text-sm font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cobrancasPagas.map((cobranca) => (
                        <tr key={cobranca.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <span className="font-medium text-sm">{cobranca.passageiros.nome}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {cobranca.passageiros.nome_responsavel || '-'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {cobranca.data_pagamento 
                                ? new Date(cobranca.data_pagamento).toLocaleDateString('pt-BR')
                                : '-'
                              }
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">{cobranca.tipo_pagamento || '-'}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Pago
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-medium text-sm">
                              {Number(cobranca.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cobrancas;