import CobrancaRetroativaDialog from "@/components/CobrancaRetroativaDialog";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoreVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { asaasService } from "@/integrations/asaasService";
import { Cobranca } from "@/types/cobranca";
import { Passageiro } from "@/types/passageiro";
import {
  formatDateToBR,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";

const apiKey = localStorage.getItem("asaas_api_key");

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
    action: "enviar" | "desfazer";
  }>({ open: false, cobrancaId: "", action: "enviar" });
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
    cobranca: Cobranca;
  }>({
    open: false,
    cobranca: null,
  });

  const handleDeleteClick = (cobranca: Cobranca) => {
    setDeleteDialog({ open: true, cobranca });
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
      if (
        deleteDialog.cobranca.origem === "automatica" &&
        deleteDialog.cobranca.asaas_payment_id
      ) {
        await asaasService.deletePayment(
          deleteDialog.cobranca.asaas_payment_id,
          apiKey
        );
      }

      const { error } = await supabase
        .from("cobrancas")
        .delete()
        .eq("id", deleteDialog.cobranca.id);

      if (error) throw error;

      toast({
        title: "Mensalidade excluida com sucesso.",
      });

      fetchHistorico();
    } catch (error) {
      console.error("Erro ao excluir mensalidade:", error);
      toast({
        title: "Erro ao excluir mensalidade.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, cobranca: null });
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
        .select(
          `
          *,
          passageiros:passageiro_id (
            nome,
            nome_responsavel
          )
        `
        )
        .eq("passageiro_id", passageiro_id)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
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

  const getMesNome = (mes: number) => {
    const nomeMes = new Date(2024, mes - 1).toLocaleDateString("pt-BR", {
      month: "long",
    });
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  };

  const handleEnviarNotificacaoClick = (cobrancaId: string) => {
    setConfirmDialog({ open: true, cobrancaId, action: "enviar" });
  };

  const handleDesfazerClick = (cobrancaId: string) => {
    setConfirmDialog({ open: true, cobrancaId, action: "desfazer" });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === "enviar") {
        toast({
          title: "Notificação enviada com sucesso para o responsável",
        });
      } else if (confirmDialog.action === "desfazer") {
        const { data: cobranca, error: fetchError } = await supabase
          .from("cobrancas")
          .select(
            "id, origem, pagamento_manual, asaas_payment_id, status, data_pagamento, tipo_pagamento"
          )
          .eq("id", confirmDialog.cobrancaId)
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
          .eq("id", confirmDialog.cobrancaId);

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
          title: "Pagamento revertido com sucesso.",
        });
        fetchHistorico();
      }
    } catch (error) {
      console.error("Erro ao desfazer pagamento:", error);
      toast({
        title: "Erro ao desfazer pagamento.",
        variant: "destructive",
      });
    }
    setConfirmDialog({ open: false, cobrancaId: "", action: "enviar" });
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
      <div className="space-y-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl ml-3 sm:text-3xl font-bold text-foreground">
            {passageiro.nome} - Carteirinha
          </h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mensalidades</CardTitle>
              <Button size="sm" onClick={() => setRetroativaDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Mensalidade Retroativa
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
                        Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Valor
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Vencimento
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Pagou em
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
                          {cobranca.desativar_lembretes &&
                            cobranca.status !== "pago" && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Lembretes suspensos
                              </div>
                            )}
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
                          <span className="text-sm">
                            {formatDateToBR(cobranca.data_vencimento)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {cobranca.data_pagamento
                              ? formatDateToBR(cobranca.data_pagamento)
                              : ""}
                          </span>
                        </td>
                        <td className="p-3">
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
                                    `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                                  )
                                }
                              >
                                Mensalidade
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={cobranca.status === "pago"}
                                onClick={() => openPaymentDialog(cobranca)}
                              >
                                Registrar Pagamento
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
                              <DropdownMenuItem
                                disabled={
                                  cobranca.status === "pago" ||
                                  cobranca.origem === "manual"
                                }
                                onClick={() => handleEnviarNotificacaoClick(cobranca.id)}
                              >
                                Enviar Notificação
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
                              <DropdownMenuItem
                                className="text-red-600"
                                disabled={
                                  cobranca.status === "pago" ||
                                  cobranca.origem === "automatica"
                                }
                                onClick={() => handleDeleteClick(cobranca)}
                              >
                                Excluir Mensalidade
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
            setConfirmDialog({ open, cobrancaId: "", action: "enviar" })
          }
          title={
            confirmDialog.action === "enviar"
              ? "Enviar Notificação"
              : "Desfazer Pagamento"
          }
          description={
            confirmDialog.action === "enviar"
              ? "Deseja enviar esta notificação para o responsável?"
              : "Deseja desfazer este pagamento? A mensalidade voltará ao status pendente."
          }
          onConfirm={handleConfirmAction}
        />

        <ConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, cobranca: null })}
          title="Excluir"
          description="Deseja excluir permanentemente essa mensalidade? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </div>
  );
}
