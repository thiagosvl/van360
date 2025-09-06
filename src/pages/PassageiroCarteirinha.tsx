import CobrancaRetroativaDialog from "@/components/CobrancaRetroativaDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Bell,
  BellOff,
  DollarSign,
  Plus,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Cobranca } from "@/types/cobranca";
import { Passageiro } from "@/types/passageiro";
import { formatDate, formatDateToBR } from "@/utils/formatters";

export default function PassageiroCarteirinha() {
  const { passageiro_id } = useParams<{ passageiro_id: string }>();
  const navigate = useNavigate();
  const [passageiro, setPassageiro] = useState<Passageiro | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    cobrancaId: string;
    action: "reenviar" | "reverter";
  }>({ open: false, cobrancaId: "", action: "reenviar" });
  const [retroativaDialogOpen, setRetroativaDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (passageiro_id) {
      fetchPassageiro();
      fetchHistorico();
    }
  }, [passageiro_id]);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    cobrancaId: string;
  }>({
    open: false,
    cobrancaId: "",
  });

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, cobrancaId: id });
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

      fetchHistorico();
    } catch (err) {
      console.error("Erro ao alternar lembretes:", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status dos lembretes.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("cobrancas")
        .delete()
        .eq("id", deleteDialog.cobrancaId);

      if (error) throw error;

      toast({
        title: "Cobrança removida com sucesso.",
      });

      fetchHistorico();
    } catch (error) {
      console.error("Erro ao excluir cobrança:", error);
      toast({
        title: "Erro ao remover cobrança.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, cobrancaId: "" });
    }
  };

  const fetchPassageiro = async () => {
    if (!passageiro_id) return;

    try {
      const { data, error } = await supabase
        .from("passageiros")
        .select("*")
        .eq("id", passageiro_id)
        .single();

      if (error) throw error;
      setPassageiro(data);
    } catch (error) {
      console.error("Erro ao buscar passageiro:", error);
      toast({
        title: "Passageiro não encontrado.",
        variant: "destructive",
      });
      navigate("/passageiros");
    }
  };

  const fetchHistorico = async () => {
    if (!passageiro_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cobrancas")
        .select("*")
        .eq("passageiro_id", passageiro_id)
        .order("ano", { ascending: false })
        .order("mes", { ascending: false });

      if (error) throw error;
      setCobrancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, dataVencimento: string) => {
    if (status === "pago") return "bg-green-100 text-green-800";

    const vencimento = formatDate(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return vencimento < hoje
      ? "bg-red-100 text-red-800"
      : "bg-orange-100 text-orange-800";
  };

  const getStatusText = (status: string, dataVencimento: string) => {
    if (status === "pago") return "Pago";

    const vencimento = formatDate(dataVencimento);
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

  const getMesNome = (mes: number) => {
    const nomeMes = new Date(2024, mes - 1).toLocaleDateString("pt-BR", {
      month: "long",
    });
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  };

  const handleReenviarClick = (cobrancaId: string) => {
    setConfirmDialog({ open: true, cobrancaId, action: "reenviar" });
  };

  const handleReverterClick = (cobrancaId: string) => {
    setConfirmDialog({ open: true, cobrancaId, action: "reverter" });
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

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === "reenviar") {
        await supabase
          .from("cobrancas")
          .update({ enviado_em: new Date().toISOString() })
          .eq("id", confirmDialog.cobrancaId);

        toast({
          title: "Cobrança reenviada com sucesso para o responsável.",
        });
      } else if (confirmDialog.action === "reverter") {
        await supabase
          .from("cobrancas")
          .update({
            status: "pendente",
            data_pagamento: null,
            tipo_pagamento: null,
            pagamento_manual: false,
          })
          .eq("id", confirmDialog.cobrancaId);

        toast({
          title: "Pagamento revertido com sucesso.",
        });
        fetchHistorico();
      }
    } catch (error) {
      console.error("Erro ao reverter pagamento:", error);
      toast({
        title: "Erro ao reverter pagamento.",
        variant: "destructive",
      });
    }
    setConfirmDialog({ open: false, cobrancaId: "", action: "reenviar" });
  };

  const openPaymentDialog = (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  };

  const handlePaymentRecorded = () => {
    fetchHistorico();
  };

  if (!passageiro) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/passageiros")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {passageiro.nome} - Carteirinha
          </h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mensalidades</CardTitle>
              <Button size="sm" onClick={() => setRetroativaDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Cobrança Retroativa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando histórico...</div>
            ) : cobrancas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma mensalidade encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium">
                        Mês/Ano
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Valor
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Vencimento
                      </th>
                      <th className="text-center p-3 text-sm font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobrancas.map((cobranca) => (
                      <tr
                        key={cobranca.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-3">
                          <span className="font-medium text-sm">
                            {getMesNome(cobranca.mes)}/{cobranca.ano}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">
                            {cobranca.valor.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              cobranca.status,
                              cobranca.data_vencimento
                            )}`}
                          >
                            {getStatusText(
                              cobranca.status,
                              cobranca.data_vencimento
                            )}
                          </span>
                          {cobranca.tipo_pagamento &&
                            cobranca.data_pagamento && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatPaymentType(cobranca.tipo_pagamento)} em{" "}
                                {formatDateToBR(cobranca.data_pagamento)}
                              </div>
                            )}
                          {cobranca.desativar_lembretes &&
                            cobranca.status !== "pago" && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Lembretes suspensos
                              </div>
                            )}
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {formatDateToBR(cobranca.data_vencimento)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-center">
                            {cobranca.status !== "pago" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleReenviarClick(cobranca.id)
                                  }
                                  className="h-8 w-8 p-0"
                                  title="Reenviar Cobrança"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPaymentDialog(cobranca)}
                                  className="h-8 w-8 p-0"
                                  title="Registrar Pagamento"
                                >
                                  <DollarSign className="w-3 h-3" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteClick(cobranca.id)}
                                  className="h-8 w-8 p-0"
                                  title="Remover Cobrança"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              cobranca.pagamento_manual && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleReverterClick(cobranca.id)
                                  }
                                  className="h-8 w-8 p-0"
                                  title="Reverter Pagamento"
                                >
                                  <Undo2 className="w-3 h-3" />
                                </Button>
                              )
                            )}
                            {cobranca.status !== "pago" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleLembretes(cobranca)}
                                className="h-8 w-8 p-0"
                                title={
                                  cobranca.desativar_lembretes
                                    ? "Ativar lembretes automáticos"
                                    : "Desativar lembretes automáticos"
                                }
                              >
                                {cobranca.desativar_lembretes ? (
                                  <BellOff className="w-3 h-3" />
                                ) : (
                                  <Bell className="w-3 h-3" />
                                )}
                              </Button>
                            )}
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

        {selectedCobranca && (
          <ManualPaymentDialog
            isOpen={paymentDialogOpen}
            onClose={() => setPaymentDialogOpen(false)}
            cobrancaId={selectedCobranca.id}
            passageiroNome={passageiro.nome}
            valorOriginal={Number(selectedCobranca.valor)}
            onPaymentRecorded={handlePaymentRecorded}
          />
        )}

        <CobrancaRetroativaDialog
          isOpen={retroativaDialogOpen}
          onClose={() => setRetroativaDialogOpen(false)}
          passageiroId={passageiro.id}
          passageiroNome={passageiro.nome}
          passageiroResponsavelNome={passageiro.nome_responsavel}
          valorMensalidade={passageiro.valor_mensalidade}
          diaVencimento={passageiro.dia_vencimento}
          onCobrancaAdded={fetchHistorico}
        />

        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, cobrancaId: "", action: "reenviar" })
          }
          title={
            confirmDialog.action === "reenviar"
              ? "Reenviar Cobrança"
              : "Reverter Pagamento"
          }
          description={
            confirmDialog.action === "reenviar"
              ? "Deseja reenviar esta cobrança para o responsável?"
              : "Deseja reverter este pagamento? A cobrança voltará ao status pendente."
          }
          onConfirm={handleConfirmAction}
        />

        <ConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, cobrancaId: "" })}
          title="Remover cobrança"
          description="Deseja remover permanentemente esta cobrança? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          confirmText="Remover"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </div>
  );
}
