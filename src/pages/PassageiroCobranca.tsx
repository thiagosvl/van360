import ConfirmationDialog from "@/components/ConfirmationDialog";
import ManualPaymentDialog from "@/components/ManualPaymentDialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cobrancaService } from "@/services/cobrancaService";
import { CobrancaDetalhe } from "@/types/cobrancaDetalhe";
import { CobrancaNotificacao } from "@/types/cobrancaNotificacao";
import {
  disableBaixarBoleto,
  disableEnviarNotificacao,
  disableExcluirMensalidade,
  disableRegistrarPagamento,
  disableToggleLembretes,
  disableVerPaginaPagamento,
} from "@/utils/disableActions";
import {
  formatCobrancaOrigem,
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BellOff,
  Bot,
  Calendar,
  Contact,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  History as HistoryIcon,
  IdCard,
  MessageCircle,
  School,
  Send,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const InfoItem = ({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-foreground mt-1">{children || "-"}</div>
  </div>
);

const CobrancaDetalheSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Skeleton className="lg:col-span-3 h-32 w-full" />
      <Skeleton className="lg:col-span-2 h-64 w-full" />
      <Skeleton className="lg:col-span-1 h-64 w-full" />
    </div>
  </div>
);

const NotificationTimeline = ({ items }: { items: CobrancaNotificacao[] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "auto":
        return <Bot className="h-5 w-5 text-muted-foreground" />;
      case "manual":
        return <User className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Bot className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getEventDescription = (tipoEvento: string): string => {
    if (tipoEvento === "REENVIO_MANUAL") {
      return "Cobrança enviada manualmente por você";
    }

    const atrasoMatch = tipoEvento.match(/^LEMBRETE_ATRASO_(\d+)$/);
    if (atrasoMatch) {
      const numeroLembrete = atrasoMatch[1];

      return `${numeroLembrete}ª lembrete de atraso enviado`;
    }

    switch (tipoEvento) {
      case "AVISO_VENCIMENTO":
        return "Cobrança enviada no vencimento";
      case "AVISO_ANTECIPADO":
        return "Aviso de mensalidade já disponível para pagamento";
      default:
        return `Ação de Notificação: ${tipoEvento} (Tipo desconhecido)`;
    }
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {getIcon(item.tipo_origem)}
            </div>
            {index < items.length - 1 && (
              <div className="absolute top-11 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">
              {getEventDescription(item.tipo_evento)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(item.data_envio).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function PassageiroCobranca() {
  const navigate = useNavigate();
  const params = useParams();
  const { passageiro_id, cobranca_id } = params as {
    passageiro_id: string;
    cobranca_id: string;
  };
  const [notificacoes, setNotificacoes] = useState<CobrancaNotificacao[]>([]);
  const [confirmDialogDesfazer, setConfirmDialogDesfazer] = useState({
    open: false,
    cobrancaId: "",
  });
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cobranca, setCobranca] = useState<CobrancaDetalhe | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
  });
  const { toast } = useToast();

  const goToExternalURL = (url: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEnviarNotificacao = async () => {
    try {
      await cobrancaService.enviarNotificacao(cobranca);
      toast({ title: "Notificação enviada com sucesso para o responsável" });
      fetchNotificacoes();
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast({ title: "Erro ao enviar mensalidade.", variant: "destructive" });
    }
  };

  const handleToggleLembretes = async () => {
    try {
      const novoStatus = await cobrancaService.toggleNotificacoes(cobranca);

      toast({
        title: `Notificações ${
          novoStatus ? "desativadas" : "ativadas"
        } com sucesso.`,
      });

      cobranca.desativar_lembretes = !cobranca.desativar_lembretes;
    } catch (error: any) {
      console.error("Erro ao alterar lembretes:", error);
      toast({
        title: "Erro ao alterar notificações.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    }
  };

  const fetchNotificacoes = async () => {
    cobrancaService
      .getNotificacoesByCobrancaId(cobranca_id)
      .then((data) => {
        setNotificacoes(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar as notifica;'oes:", error);
      });
  };

  const fetchCobranca = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vw_cobrancas_detalhes")
        .select("*")
        .eq("id", cobranca_id)
        .single();
      if (error || !data) {
        toast({
          title: "Mensalidade não encontrada.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      setCobranca(data as CobrancaDetalhe);
    } catch (error) {
      console.error("Erro ao buscar detalhes da cobrança:", error);
    } finally {
      setLoading(false);
    }
  };

  const desfazerPagamento = async () => {
    try {
      await cobrancaService.desfazerPagamento(cobranca_id);

      toast({
        title: "Pagamento desfeito com sucesso.",
      });
      fetchCobranca();
    } catch (error: any) {
      console.error("Erro ao desfazer pagamento:", error);
      toast({
        title: "Erro ao desfazer pagamento.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setConfirmDialogDesfazer({ open: false, cobrancaId: "" });
    }
  };

  useEffect(() => {
    fetchCobranca();
    fetchNotificacoes();
  }, [cobranca_id, navigate, toast]);

  if (loading) return <CobrancaDetalheSkeleton />;

  if (!cobranca) return null;

  const deleteCobranca = async () => {
    try {
      await cobrancaService.excluirCobranca(cobranca);

      toast({
        title: "Mensalidade excluída com sucesso.",
      });
      navigate(`/passageiros/${cobranca.passageiro_id}`);
    } catch (error: any) {
      console.error("Erro ao excluir mensalidade:", error);
      toast({
        title: "Erro ao excluir mensalidade.",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Detalhes da Mensalidade
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-3 order-1">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Valor da Mensalidade
              </div>
              <div className="text-4xl font-bold tracking-tight">
                {cobranca.valor.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className="text-muted-foreground mt-1">
                Vencimento em: {formatDateToBR(cobranca.data_vencimento)}
              </div>
              {cobranca.status !== "pago" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    cobranca.status,
                    cobranca.data_vencimento
                  )}`}
                >
                  {getStatusText(cobranca.status, cobranca.data_vencimento)}
                </span>
              )}
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              {!disableRegistrarPagamento(cobranca) ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaymentDialogOpen(true);
                  }}
                >
                  <BadgeCheck className="w-5 h-5 mr-2" /> Registrar Pagamento
                </Button>
              ) : cobranca.pagamento_manual ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setConfirmDialogDesfazer({
                      open: true,
                      cobrancaId: cobranca_id,
                    })
                  }
                >
                  <XCircle className="w-5 h-5 mr-2" /> Desfazer Pagamento
                </Button>
              ) : (
                <div
                  className={`flex items-center justify-center px-4 py-2 rounded-md text-base font-medium ${getStatusColor(
                    cobranca.status,
                    cobranca.data_vencimento
                  )}`}
                >
                  {getStatusText(cobranca.status, cobranca.data_vencimento)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 order-3 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes da Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/50">
              <InfoItem icon={CreditCard} label="Forma de Pagamento">
                {formatPaymentType(cobranca.tipo_pagamento)}
              </InfoItem>
              <InfoItem icon={Calendar} label="Data do Pagamento">
                {cobranca.data_pagamento
                  ? formatDateToBR(cobranca.data_pagamento)
                  : "-"}
              </InfoItem>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <InfoItem
                icon={cobranca.desativar_lembretes ? BellOff : Bell}
                label="Notificações Automáticas"
              >
                {cobranca.desativar_lembretes ? "Desativadas" : "Ativadas"}
              </InfoItem>
              <InfoItem icon={ArrowRight} label="Quem gerou a mensalidade?">
                {formatCobrancaOrigem(cobranca.origem)}
              </InfoItem>
              <InfoItem icon={BadgeCheck} label="Quem registrou o pagamento?">
                {cobranca.status === "pago" ? cobranca.pagamento_manual ? "Você" : "Sistema" : "Ainda não foi paga"}
              </InfoItem>
            </div>
            <div className="pt-6 border-t">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <HistoryIcon className="w-4 h-4" />
                Histórico de Notificações
              </h4>

              {notificacoes && notificacoes.length > 0 ? (
                <>
                  <NotificationTimeline items={[notificacoes[0]]} />

                  {showFullHistory && notificacoes.length > 1 && (
                    <div className="mt-6">
                      <NotificationTimeline items={notificacoes.slice(1)} />
                    </div>
                  )}

                  {notificacoes.length > 1 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs mt-4"
                      onClick={() => setShowFullHistory(!showFullHistory)}
                    >
                      {showFullHistory
                        ? "Ocultar histórico"
                        : `+ Ver mais ${notificacoes.length - 1} evento${
                            notificacoes.length > 1 ? "s" : ""
                          }`}
                    </Button>
                  )}
                </>
              ) : (
                <Alert className="py-2">
                  <AlertTitle className="text-sm font-semibold mb-0">
                    Nenhuma notificação foi enviada
                  </AlertTitle>
                </Alert>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
              <Button
                disabled={disableVerPaginaPagamento(cobranca)}
                variant="outline"
                className="flex-1"
                onClick={() => goToExternalURL(cobranca.asaas_invoice_url)}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Ver Página de
                Pagamento
              </Button>
              <Button
                disabled={disableBaixarBoleto(cobranca)}
                variant="outline"
                className="flex-1"
                onClick={() => goToExternalURL(cobranca.asaas_bankslip_url)}
              >
                <Download className="w-4 h-4 mr-2" /> Baixar Boleto
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={disableExcluirMensalidade(cobranca)}
              onClick={() => setDeleteDialog({ open: true })}
            >
              <Trash2 className="w-3 h-3 mr-2" /> Excluir Mensalidade
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-1 order-2 lg:order-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contact className="w-5 h-5" />
              Contato e Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InfoItem icon={User} label="Passageiro">
              {cobranca.passageiro_nome}
            </InfoItem>
            <InfoItem icon={Contact} label="Responsável">
              {cobranca.nome_responsavel}
            </InfoItem>
            <InfoItem icon={School} label="Escola">
              {cobranca.escola_nome}
            </InfoItem>

            <div className="space-y-2 pt-6 border-t">
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  navigate(`/passageiros/${cobranca.passageiro_id}`)
                }
              >
                <IdCard className="h-4 w-4 mr-2" /> Ver Carteirinha
              </Button>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!cobranca.telefone_responsavel}
                onClick={() =>
                  window.open(
                    `https://wa.me/${cobranca.telefone_responsavel?.replace(
                      /\D/g,
                      ""
                    )}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Enviar WhatsApp
              </Button>
              <Button
                className="w-full"
                variant="outline"
                disabled={disableEnviarNotificacao(cobranca)}
                onClick={() => handleEnviarNotificacao()}
              >
                <Send className="h-4 w-4 mr-2" /> Enviar Notificação
              </Button>
              <Button
                className="w-full"
                variant="outline"
                disabled={disableToggleLembretes(cobranca)}
                onClick={() => handleToggleLembretes()}
              >
                {cobranca.desativar_lembretes ? (
                  <Bell className="h-4 w-4 mr-2" />
                ) : (
                  <BellOff className="h-4 w-4 mr-2" />
                )}
                {cobranca.desativar_lembretes
                  ? "Ativar Lembretes"
                  : "Desativar Lembretes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ManualPaymentDialog
        isOpen={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        cobrancaId={cobranca_id}
        passageiroNome={cobranca.passageiro_nome}
        valorOriginal={Number(cobranca.valor)}
        onPaymentRecorded={() => {
          setPaymentDialogOpen(false);
          fetchCobranca();
        }}
      />

      <ConfirmationDialog
        open={confirmDialogDesfazer.open}
        onOpenChange={(open) =>
          setConfirmDialogDesfazer({ open, cobrancaId: "" })
        }
        title="Desfazer Pagamento"
        description="Deseja realmente desfazer o pagamento desta mensalidade?"
        onConfirm={desfazerPagamento}
        variant="destructive"
        confirmText="Desfazer Pagamento"
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Excluir"
        description="Deseja excluir permanentemente essa mensalidade?"
        onConfirm={deleteCobranca}
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
