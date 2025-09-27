import ConfirmationDialog from "@/components/ConfirmationDialog";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Filter, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { asaasService } from "@/integrations/asaasService";
import { Cobranca } from "@/types/cobranca";
import {
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";

const apiKey = localStorage.getItem("asaas_api_key");

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
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("data_vencimento", { ascending: true });

      const cobrancas = data || [];

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

  const [confirmDialogDesfazer, setConfirmDialogDesfazer] = useState<{
    open: boolean;
    cobrancaId: string;
  }>({ open: false, cobrancaId: "" });

  const handleReenviarClick = (cobrancaId: string, nomePassageiro: string) => {
    setConfirmDialogReenvio({ open: true, cobrancaId, nomePassageiro });
  };

  const handleToggleLembretes = async (cobranca: Cobranca) => {
    try {
      const novoStatus = !cobranca.desativar_lembretes;

      const { error } = await supabase
        .from("cobrancas")
        .update({ desativar_lembretes: novoStatus })
        .eq("id", cobranca.id);

      if (error) throw error;

      toast({
        title: `Lembretes ${
          novoStatus ? "desativados" : "ativados"
        } com sucesso.`,
      });

      fetchCobrancas();
    } catch (err) {
      console.error("Erro ao alternar lembretes:", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status dos lembretes.",
        variant: "destructive",
      });
    }
  };

  const reenviarCobranca = async () => {
    try {
      toast({
        title: "Mensalidade reenviada com sucesso para o responsável",
      });
    } catch (error) {
      console.error("Erro ao reenviar mensalidade:", error);
      toast({
        title: "Erro ao reenviar mensalidade.",
        variant: "destructive",
      });
    }
    setConfirmDialogReenvio({
      open: false,
      cobrancaId: "",
      nomePassageiro: "",
    });
  };

  const handleDesfazerClick = (cobrancaId: string) => {
    setConfirmDialogDesfazer({ open: true, cobrancaId });
  };

  const desfazerPagamento = async () => {
    try {
      const { data: cobranca, error: fetchError } = await supabase
        .from("cobrancas")
        .select(
          "id, origem, pagamento_manual, asaas_payment_id, status, data_pagamento, tipo_pagamento"
        )
        .eq("id", confirmDialogDesfazer.cobrancaId)
        .single();

      if (fetchError || !cobranca) {
        throw new Error(
          "Não foi possível localizar a mensalidade para desfazer"
        );
      }

      // Atualiza no Supabase (reversão local)
      const { error: updateError } = await supabase
        .from("cobrancas")
        .update({
          status: "pendente",
          data_pagamento: null,
          tipo_pagamento: null,
          pagamento_manual: false,
        })
        .eq("id", confirmDialogDesfazer.cobrancaId);

      if (updateError) throw updateError;

      // Se for automática, também precisa desfazer no Asaas
      if (cobranca.origem === "automatica") {
        try {
          await asaasService.undoPaymentInCash(
            cobranca.asaas_payment_id,
            apiKey
          );
        } catch (asaasErr) {
          console.error("Erro ao desfazer no Asaas:", asaasErr);

          // Rollback no Supabase (volta para pago)
          await supabase
            .from("cobrancas")
            .update({
              status: "pago",
              data_pagamento: cobranca.data_pagamento,
              tipo_pagamento: cobranca.tipo_pagamento,
              pagamento_manual: cobranca.pagamento_manual,
            })
            .eq("id", cobranca.id);

          throw new Error("Erro ao desfazer pagamento no Asaas");
        }
      }

      toast({
        title: "Pagamento desfeito com sucesso.",
        description: "A mensalidade voltou para a lista de em aberto.",
      });

      fetchCobrancas();
    } catch (error) {
      console.error("Erro ao desfazer pagamento:", error);
      toast({
        title: "Erro ao desfazer pagamento.",
        variant: "destructive",
      });
    }

    setConfirmDialogDesfazer({ open: false, cobrancaId: "" });
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

  useEffect(() => {
    fetchCobrancas();
  }, [mesFilter, anoFilter]);

  return (
    <div className="space-y-6">
      <div className="w-full">
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

        {/* Mensalidades em Aberto */}
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
                Nenhuma mensalidade em aberto neste período
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
                        Valor
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Vencimento
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Status
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
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {cobranca.passageiros.nome_responsavel || "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {Number(cobranca.valor).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {formatDateToBR(cobranca.data_vencimento)}
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
                          {cobranca.desativar_lembretes &&
                            cobranca.status !== "pago" && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Lembretes suspensos
                              </div>
                            )}
                        </td>
                        <td className="p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/passageiros/${cobranca.passageiros.id}/mensalidade/${cobranca.id}`
                                  )
                                }
                              >
                                Mensalidade
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewHistory(cobranca.passageiro_id)
                                }
                              >
                                Carteirinha Digital
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openPaymentDialog(cobranca)}
                              >
                                Registrar Pagamento
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={cobranca.origem === "manual"}
                                onClick={() =>
                                  handleReenviarClick(
                                    cobranca.id,
                                    cobranca.passageiros.nome
                                  )
                                }
                              >
                                Reenviar Notificação
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  cobranca.status === "pago" ||
                                  cobranca.origem === "manual"
                                }
                                onClick={() => handleToggleLembretes(cobranca)}
                              >
                                {cobranca.desativar_lembretes
                                  ? "Ativar Lembretes"
                                  : "Desativar Lembretes"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mensalidades Pagas */}
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
                Nenhuma mensalidade paga neste mês ainda
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
                        Pagou em
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Valor
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Forma de Pagamento
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
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {cobranca.passageiros.nome_responsavel || "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {cobranca.data_pagamento
                              ? formatDateToBR(cobranca.data_pagamento)
                              : "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {Number(cobranca.valor).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {formatPaymentType(cobranca.tipo_pagamento)}
                          </span>
                          {cobranca.pagamento_manual && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Registrado Manualmente
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/passageiros/${cobranca.passageiros.id}/mensalidade/${cobranca.id}`
                                  )
                                }
                              >
                                Mensalidade
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewHistory(cobranca.passageiro_id)
                                }
                              >
                                Carteirinha Digital
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  cobranca.status !== "pago" ||
                                  !cobranca.pagamento_manual
                                }
                                onClick={() => handleDesfazerClick(cobranca.id)}
                              >
                                Desfazer Pagamento
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
        title="Reenviar Notificação"
        description="Deseja reenviar esta notificação para o responsável?"
        onConfirm={reenviarCobranca}
      />

      <ConfirmationDialog
        open={confirmDialogDesfazer.open}
        onOpenChange={(open) =>
          setConfirmDialogDesfazer({ open, cobrancaId: "" })
        }
        title="Desfazer Pagamento"
        description="Deseja realmente desfazer o pagamento desta mensalidade? Essa ação moverá a mensalidade de volta para a lista de em aberto."
        onConfirm={desfazerPagamento}
        variant="destructive"
        confirmText="Desfazer Pagamento"
      />
    </div>
  );
};

export default Cobrancas;
