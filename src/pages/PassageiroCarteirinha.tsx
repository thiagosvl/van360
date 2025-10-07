import CobrancaRetroativaDialog from "@/components/CobrancaRetroativaDialog";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { asaasService } from "@/integrations/asaasService";
import { supabase } from "@/integrations/supabase/client";
import { Cobranca } from "@/types/cobranca";
import { Passageiro } from "@/types/passageiro";
import {
  disableDesfazerPagamento,
  disableEnviarNotificacao,
  disableExcluirMensalidade,
  disableRegistrarPagamento,
  disableToggleLembretes,
} from "@/utils/disableActions";
import {
  formatDateToBR,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import {
  BellOff,
  Contact,
  Hash,
  MessageCircle,
  MoreVertical,
  Pencil,
  Plus,
  School,
  TrendingDown,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const apiKey = localStorage.getItem("asaas_api_key");

const InfoItem = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-foreground mt-1">{children || "-"}</div>
  </div>
);

const CarteirinhaSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  </div>
);

export default function PassageiroCarteirinha() {
  const { passageiro_id } = useParams<{ passageiro_id: string }>();
  const navigate = useNavigate();
  const [passageiro, setPassageiro] = useState<Passageiro | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    cobrancaId: "",
    action: "enviar",
  });
  const [retroativaDialogOpen, setRetroativaDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    cobranca: null as Cobranca | null,
  });
  const { toast } = useToast();

  const fetchPassageiro = async () => {
    if (!passageiro_id) return null;
    try {
      const { data, error } = await supabase
        .from("passageiros")
        .select("*, escolas(nome)")
        .eq("id", passageiro_id)
        .single();
      if (error) throw error;
      setPassageiro(data as Passageiro);
      return data;
    } catch (error) {
      console.error("Erro ao buscar passageiro:", error);
      toast({ title: "Passageiro não encontrado.", variant: "destructive" });
      navigate("/passageiros");
      return null;
    }
  };

  const fetchHistorico = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("cobrancas")
        .select(`*, passageiros:passageiro_id (nome, nome_responsavel)`)
        .eq("passageiro_id", id)
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .order("ano", { ascending: false })
        .order("mes", { ascending: false });
      if (error) throw error;
      setCobrancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      if (passageiro_id) {
        const p = await fetchPassageiro();
        if (p) await fetchHistorico(p.id);
      }
      setLoading(false);
    };
    fetchAllData();
  }, [passageiro_id]);

  const yearlySummary = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return cobrancas.reduce(
      (acc, c) => {
        if (c.status === "pago") {
          acc.pago += Number(c.valor);
        } else {
          acc.pendente += Number(c.valor);
          const vencimento = new Date(c.data_vencimento);
          if (vencimento < hoje) {
            acc.emAtraso += 1;
          }
        }
        return acc;
      },
      { pago: 0, pendente: 0, emAtraso: 0 }
    );
  }, [cobrancas]);

  const getMesNome = (mes: number) => {
    const nomeMes = new Date(2024, mes - 1).toLocaleDateString("pt-BR", {
      month: "long",
    });
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  };

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

      fetchHistorico(passageiro_id);
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

      fetchHistorico(passageiro_id);
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
  const handleEnviarNotificacaoClick = (cobrancaId: string) =>
    setConfirmDialog({ open: true, cobrancaId, action: "enviar" });
  const handleDesfazerClick = (cobrancaId: string) =>
    setConfirmDialog({ open: true, cobrancaId, action: "desfazer" });
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

        if (cobranca.origem === "automatica") {
          try {
            await asaasService.undoPaymentInCash(
              cobranca.asaas_payment_id,
              apiKey
            );
          } catch (asaasErr) {
            console.error("Erro ao desfazer no Asaas:", asaasErr);

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
        fetchHistorico(passageiro_id);
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
    if (passageiro_id) fetchHistorico(passageiro_id);
  };
  const handleEditClick = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de passageiro será implementada em breve.",
    });
  };

  if (loading || !passageiro) {
    return <CarteirinhaSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserCircle2 className="w-16 h-16 text-gray-300" strokeWidth={1} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {passageiro.nome}
            </h1>
            <Badge
              variant={passageiro.ativo ? "default" : "destructive"}
              className="mt-1"
            >
              {passageiro.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-start-1 lg:row-start-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Informações</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                className="h-8 w-8"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={School} label="Escola">
                {passageiro.escolas?.nome || "Não informada"}
              </InfoItem>
              <InfoItem icon={Contact} label="Responsável">
                {passageiro.nome_responsavel}
              </InfoItem>
              <InfoItem icon={MessageCircle} label="Telefone">
                {passageiro.telefone_responsavel}
              </InfoItem>
              <Button
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                disabled={!passageiro.telefone_responsavel}
                onClick={() =>
                  window.open(
                    `https://wa.me/${passageiro.telefone_responsavel?.replace(
                      /\D/g,
                      ""
                    )}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Enviar WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:row-span-2">
          {cobrancas.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Histórico de Mensalidades
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setRetroativaDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:block">
                      Registrar Retroativa
                    </span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left text-xs font-medium text-gray-600">
                          Mês/Ano
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-600">
                          Status
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-600">
                          Valor
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-600">
                          Vencimento
                        </th>
                        <th className="p-4 text-center text-xs font-medium text-gray-600">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cobrancas.map((cobranca) => (
                        <tr
                          key={cobranca.id}
                          onClick={() =>
                            navigate(
                              `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                            )
                          }
                          className="hover:bg-muted/50 cursor-pointer"
                        >
                          <td className="p-4 align-top font-medium">
                            {getMesNome(cobranca.mes)}/{cobranca.ano}
                          </td>
                          <td className="p-4 align-top">
                            <span
                              className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${getStatusColor(
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
                                <div className="text-xs text-yellow-800 mt-2 flex items-center gap-1">
                                  <BellOff className="w-3 h-3" />
                                  Lembretes suspensos
                                </div>
                              )}
                          </td>
                          <td className="p-4 align-top">
                            {cobranca.valor.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>
                          <td className="p-4 align-top">
                            {formatDateToBR(cobranca.data_vencimento)}
                          </td>
                          <td className="p-4 text-center align-top">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                                    );
                                  }}
                                >
                                  Ver Mensalidade
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableRegistrarPagamento(cobranca)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPaymentDialog(cobranca);
                                  }}
                                >
                                  Registrar Pagamento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableEnviarNotificacao(cobranca)}
                                  onClick={(e) => {
                                    handleEnviarNotificacaoClick(cobranca.id);
                                  }}
                                >
                                  Enviar Notificação
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableToggleLembretes(cobranca)}
                                  onClick={() =>
                                    handleToggleLembretes(cobranca)
                                  }
                                >
                                  {cobranca.desativar_lembretes
                                    ? "Ativar Lembretes"
                                    : "Desativar Lembretes"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={disableDesfazerPagamento(cobranca)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDesfazerClick(cobranca.id);
                                  }}
                                >
                                  Desfazer Pagamento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  disabled={disableExcluirMensalidade(cobranca)}
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
                <div className="md:hidden -mx-6 -mt-6 divide-y divide-gray-100">
                  {cobrancas.map((cobranca) => (
                    <div
                      key={cobranca.id}
                      onClick={() =>
                        navigate(
                          `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                        )
                      }
                      className="p-4 active:bg-muted/50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-gray-800">
                          {getMesNome(cobranca.mes)}/{cobranca.ano}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 -mr-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/passageiros/${passageiro.id}/mensalidade/${cobranca.id}`
                                );
                              }}
                            >
                              Ver Mensalidade
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={disableRegistrarPagamento(cobranca)}
                              onClick={(e) => {
                                e.stopPropagation();
                                openPaymentDialog(cobranca);
                              }}
                            >
                              Registrar Pagamento
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={disableDesfazerPagamento(cobranca)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDesfazerClick(cobranca.id);
                              }}
                            >
                              Desfazer Pagamento
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Vencimento: {formatDateToBR(cobranca.data_vencimento)}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span
                          className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${getStatusColor(
                            cobranca.status,
                            cobranca.data_vencimento
                          )}`}
                        >
                          {getStatusText(
                            cobranca.status,
                            cobranca.data_vencimento
                          )}
                        </span>
                        <span className="font-bold text-lg">
                          {cobranca.valor.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Resumo Financeiro do Ano
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> <span>Total Pago</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {yearlySummary.pago.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> <span>Pendente</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {yearlySummary.pendente.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4" />{" "}
                  <span>Mensalidades em Atraso</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {yearlySummary.emAtraso}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
        onCobrancaAdded={() => fetchHistorico(passageiro_id!)}
      />
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={
          confirmDialog.action === "enviar"
            ? "Enviar Notificação"
            : "Desfazer Pagamento"
        }
        description={
          confirmDialog.action === "enviar"
            ? "Deseja enviar esta notificação para o responsável?"
            : "Deseja desfazer este pagamento?"
        }
        onConfirm={handleConfirmAction}
      />
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Excluir"
        description="Deseja excluir permanentemente essa mensalidade?"
        onConfirm={handleDelete}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
