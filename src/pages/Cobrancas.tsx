import ConfirmationDialog from "@/components/ConfirmationDialog";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, DollarSign, Filter, Send, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const Cobrancas = () => {
  const [cobrancasAbertas, setCobrancasAbertas] = useState<Cobranca[]>([]);
  const [cobrancasPagas, setCobrancasPagas] = useState<Cobranca[]>([]);
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const fetchCobrancas = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
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
        .eq("ano", anoFilter)
        .order("data_vencimento", { ascending: true });

      const cobrancas = data || [];

      // Separar cobranças
      const abertas = cobrancas.filter((c) => c.status !== "pago");
      const pagas = cobrancas.filter((c) => c.status === "pago");

      setCobrancasAbertas(abertas as Cobranca[]);
      setCobrancasPagas(pagas as Cobranca[]);
    } catch (error) {
      console.error("Erro ao buscar mensalidades:", error);
    } finally {
      setLoading(false);
    }
  };

  const [confirmDialogReenvio, setConfirmDialogReenvio] = useState<{
    open: boolean;
    cobrancaId: string;
    nomePassageiro: string;
  }>({ open: false, cobrancaId: "", nomePassageiro: "" });

  const [confirmDialogReverter, setConfirmDialogReverter] = useState<{
    open: boolean;
    cobrancaId: string;
  }>({ open: false, cobrancaId: "" });

  const handleReenviarClick = (cobrancaId: string, nomePassageiro: string) => {
    setConfirmDialogReenvio({ open: true, cobrancaId, nomePassageiro });
  };

  const reenviarCobranca = async () => {
    try {
      await supabase
        .from("cobrancas")
        .update({ enviado_em: new Date().toISOString() })
        .eq("id", confirmDialogReenvio.cobrancaId);

      toast({
        title: "Cobrança reenviada com sucesso para o responsável",
      });
    } catch (error) {
      console.error("Erro ao reenviar cobrança:", error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar cobrança.",
        variant: "destructive",
      });
    }
    setConfirmDialogReenvio({
      open: false,
      cobrancaId: "",
      nomePassageiro: "",
    });
  };

  const handleReverterClick = (cobrancaId: string) => {
    setConfirmDialogReverter({ open: true, cobrancaId });
  };

  const reverterPagamento = async () => {
    try {
      await supabase
        .from("cobrancas")
        .update({
          data_pagamento: null,
          tipo_pagamento: null,
          status: "pendente",
        })
        .eq("id", confirmDialogReverter.cobrancaId);

      toast({
        title: "Pagamento revertido com sucesso",
        description: "A cobrança voltou para a lista de em aberto.",
      });

      fetchCobrancas();
    } catch (error) {
      console.error("Erro ao reverter pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao reverter pagamento.",
        variant: "destructive",
      });
    }
    setConfirmDialogReverter({ open: false, cobrancaId: "" });
  };

  const getStatusText = (status: string, dataVencimento: string) => {
    if (status === "pago") return "Pago";

    const vencimento = new Date(dataVencimento + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTime = hoje.getTime() - vencimento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (vencimento < hoje) {
      return `Venceu há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    } else if (diffDays == 0) {
      return "Vence hoje";
    }

    return "A vencer";
  };

  const getStatusColor = (status: string, dataVencimento: string) => {
    if (status === "pago") return "bg-green-100 text-green-800";

    const vencimento = new Date(dataVencimento + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return vencimento < hoje
      ? "bg-red-100 text-red-800"
      : "bg-orange-100 text-orange-800";
  };

  const openPaymentDialog = (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  };

  const handlePaymentRecorded = () => {
    fetchCobrancas();
  };

  const handleViewHistory = (passageiroId: string) => {
    navigate(`/passageiros/${passageiroId}`);
  };

  const formatPaymentType = (tipo: string | undefined) => {
    if (!tipo) return "-";

    const typeMap: { [key: string]: string } = {
      dinheiro: "Dinheiro",
      "cartao-credito": "Cartão de Crédito",
      "cartao-debito": "Cartão de Débito",
      transferencia: "Transferência",
      PIX: "PIX",
    };

    return typeMap[tipo] || tipo;
  };

  useEffect(() => {
    fetchCobrancas();
  }, [mesFilter, anoFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-4 space-y-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mensalidades
            </h1>
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

          {/* Cobranças em Aberto */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                Em Aberto - {meses[mesFilter - 1]} {anoFilter}
                <span className="bg-red-600 text-white text-sm px-2 py-0.5 rounded-full">
                  {cobrancasAbertas.length}
                </span>
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
                        <th className="text-left p-3 text-sm font-medium">
                          Passageiro
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Responsável
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Vencimento
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Status
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Valor
                        </th>
                        <th className="text-center p-3 text-sm font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cobrancasAbertas.map((cobranca) => (
                        <tr
                          key={cobranca.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <span className="font-medium text-sm">
                              {cobranca.passageiros.nome}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {cobranca.passageiros.nome_responsavel || "-"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {new Date(
                                cobranca.data_vencimento + "T00:00:00"
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                cobranca.status,
                                cobranca.data_vencimento
                              )}`}
                            >
                              {getStatusText(
                                cobranca.status,
                                cobranca.data_vencimento
                              )}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-sm">
                              {Number(cobranca.valor).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Carteirinha"
                                onClick={() =>
                                  handleViewHistory(cobranca.passageiro_id)
                                }
                                className="h-8 w-8 p-0"
                              >
                                <CreditCard className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                title="Reenviar"
                                variant="outline"
                                onClick={() =>
                                  handleReenviarClick(
                                    cobranca.id,
                                    cobranca.passageiros.nome
                                  )
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Registrar Pagamento"
                                onClick={() => openPaymentDialog(cobranca)}
                                className="h-8 w-8 p-0"
                              >
                                <DollarSign className="w-3 h-3" />
                              </Button>
                            </div>
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
              <CardTitle className="text-green-600 flex items-center gap-2">
                <span>
                  Pagas - {meses[mesFilter - 1]} {anoFilter}
                </span>
                <span className="bg-green-600 text-white text-sm px-2 py-0.5 rounded-full">
                  {cobrancasPagas.length}
                </span>
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
                        <th className="text-left p-3 text-sm font-medium">
                          Passageiro
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Responsável
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Data Pagamento
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Tipo
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Valor
                        </th>
                        <th className="text-center p-3 text-sm font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cobrancasPagas.map((cobranca) => (
                        <tr
                          key={cobranca.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <span className="font-medium text-sm">
                              {cobranca.passageiros.nome}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {cobranca.passageiros.nome_responsavel || "-"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {cobranca.data_pagamento
                                ? new Date(
                                    cobranca.data_pagamento + "T00:00:00"
                                  ).toLocaleDateString("pt-BR")
                                : "-"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {formatPaymentType(cobranca.tipo_pagamento)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-sm">
                              {Number(cobranca.valor).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Carteirinha"
                                onClick={() =>
                                  handleViewHistory(cobranca.passageiro_id)
                                }
                                className="h-8 w-8 p-0"
                              >
                                <CreditCard className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Reverter"
                                onClick={() => handleReverterClick(cobranca.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Undo2 className="w-3 h-3" />
                              </Button>
                            </div>
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

      <ConfirmationDialog
        open={confirmDialogReenvio.open}
        onOpenChange={(open) =>
          setConfirmDialogReenvio({ open, cobrancaId: "", nomePassageiro: "" })
        }
        title="Reenviar Cobrança"
        description="Deseja reenviar esta cobrança para o responsável?"
        onConfirm={reenviarCobranca}
      />

      <ConfirmationDialog
        open={confirmDialogReverter.open}
        onOpenChange={(open) =>
          setConfirmDialogReverter({ open, cobrancaId: "" })
        }
        title="Reverter Pagamento"
        description="Deseja realmente reverter o pagamento desta cobrança? Essa ação moverá a cobrança de volta para a lista de em aberto."
        onConfirm={reverterPagamento}
        variant="destructive"
        confirmText="Reverter"
      />
    </div>
  );
};

export default Cobrancas;
