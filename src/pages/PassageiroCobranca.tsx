import CobrancaEditDialog from "@/components/CobrancaEditDialog";
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
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { supabase } from "@/integrations/supabase/client";
import { cobrancaService } from "@/services/cobrancaService";
import { Cobranca } from "@/types/cobranca";
import { CobrancaDetalhe } from "@/types/cobrancaDetalhe";
import { CobrancaNotificacao } from "@/types/cobrancaNotificacao";
import {
  disableBaixarBoleto,
  disableEnviarNotificacao,
  disableExcluirMensalidade,
  disableRegistrarPagamento,
  disableToggleLembretes,
  disableVerPaginaPagamento,
  seForPago,
} from "@/utils/disableActions";
import {
  checkCobrancaJaVenceu,
  formatCobrancaOrigem,
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
  getStatusText,
  meses,
} from "@/utils/formatters";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BellOff,
  Bot,
  Calendar,
  CalendarIcon,
  Contact,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  History as HistoryIcon,
  IdCard,
  MessageCircle,
  Pencil,
  School,
  Send,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cobrancaToEdit, setCobrancaToEdit] = useState<Cobranca | null>(null);
  const { setPageTitle, setPageSubtitle } = useLayout();
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

  const handleEditCobrancaClick = () => {
    if (cobrancaNormalizadaParaEdicao) {
      setCobrancaToEdit(cobrancaNormalizadaParaEdicao);
      setEditDialogOpen(true);
    }
  };

  const cobrancaNormalizadaParaEdicao = useMemo(() => {
    if (!cobranca) return null;

    return {
      ...cobranca,
      passageiros: {
        nome: cobranca.passageiro_nome,
        nome_responsavel: cobranca.nome_responsavel,
      },
    } as Cobranca;
  }, [cobranca]);

  const handleEnviarNotificacao = async () => {
    if (disableEnviarNotificacao(cobranca)) {
      toast({
        title: "Não foi possível enviar a notificação.",
        description:
          "Só é possível enviar para cobranças geradas automaticamente.",
        variant: "destructive",
      });
    } else {
      try {
        await cobrancaService.enviarNotificacao(cobranca);
        toast({ title: "Notificação enviada com sucesso para o responsável" });
        fetchNotificacoes();
      } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        toast({ title: "Erro ao enviar mensalidade.", variant: "destructive" });
      }
    }
  };

  const handleToggleLembretes = async () => {
    try {
      const novoStatus = await cobrancaService.toggleNotificacoes(cobranca);

      toast({
        title: `Notificações automáticas ${
          novoStatus ? "desativadas" : "ativadas"
        } com sucesso.`,
      });

      cobranca.desativar_lembretes = !cobranca.desativar_lembretes;
    } catch (error: any) {
      console.error("Erro ao alterar notificações:", error);
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
        navigate("/cobrancas");
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

  useEffect(() => {
    if (cobranca) {
      setPageTitle(`Mensalidade de ${meses[cobranca.mes - 1]}`);
      setPageSubtitle(
        `${cobranca.passageiro_nome} (${cobranca.nome_responsavel})`
      );
    }
  }, [cobranca, setPageTitle, setPageSubtitle]);

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

  const pullToRefreshReload = async () => {
    fetchCobranca();
    fetchNotificacoes();
  };

  return (
    <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-3 order-1">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  {meses[cobranca.mes - 1]}/{cobranca.ano}
                </div>
                <div className="text-4xl font-bold tracking-tight">
                  {cobranca.valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
                <div className="text-muted-foreground mt-3">
                  Vencimento em: {formatDateToBR(cobranca.data_vencimento)}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    cobranca.status,
                    cobranca.data_vencimento
                  )}`}
                >
                  {cobranca.status === "pago"
                    ? `Paga em ${formatDateToBR(cobranca.data_pagamento)}`
                    : getStatusText(cobranca.status, cobranca.data_vencimento)}
                </span>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                {!disableRegistrarPagamento(cobranca) ? (
                  <Button
                    size="lg"
                    className="w-full hover:bg-blue-600"
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
                    className="w-full border-red-600 text-red-500 hover:text-red-600"
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

          <Card className="lg:col-span-1 order-2 lg:order-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Mensalidade</CardTitle>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCobrancaClick();
                  }}
                  className="gap-2"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
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
                  variant="default"
                  onClick={() =>
                    navigate(`/passageiros/${cobranca.passageiro_id}`)
                  }
                >
                  <IdCard className="h-4 w-4 mr-2" /> Ver Carteirinha
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-green-50 border-green-500 text-green-500 hover:text-green-500 hover:bg-green-100"
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
                  <MessageCircle className="h-4 w-4 mr-2" /> Falar no WhatsApp
                </Button>
                {!seForPago(cobranca) && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleEnviarNotificacao()}
                  >
                    <Send className="h-4 w-4 mr-2" /> Enviar Notificação
                  </Button>
                )}
                {!disableToggleLembretes(cobranca) && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleToggleLembretes()}
                  >
                    {cobranca.desativar_lembretes ? (
                      <Bell className="h-4 w-4 mr-2" />
                    ) : (
                      <BellOff className="h-4 w-4 mr-2" />
                    )}
                    {cobranca.desativar_lembretes
                      ? "Ativar Notificações"
                      : "Desativar Notificações"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 order-3 lg:order-3">
            <CardHeader>
              <CardTitle className="flex items-center text-lg gap-2">
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
                  label="Notificações"
                >
                  {cobranca.desativar_lembretes ? "Desativadas" : "Ativadas"}
                </InfoItem>
                <InfoItem icon={ArrowRight} label="Origem Cadastro">
                  {formatCobrancaOrigem(cobranca.origem)}
                </InfoItem>
                {(() => {
                  let IconComponent = CalendarIcon;

                  if (seForPago(cobranca)) {
                    IconComponent = BadgeCheck;
                  } else if (checkCobrancaJaVenceu(cobranca.data_vencimento)) {
                    IconComponent = XCircle;
                  }

                  return (
                    <InfoItem icon={IconComponent} label="Pagamento">
                      {cobranca.status === "pago"
                        ? cobranca.pagamento_manual
                          ? "Registrado por você"
                          : "Registrado automaticamente"
                        : "—"}
                    </InfoItem>
                  );
                })()}
              </div>
              {!disableVerPaginaPagamento(cobranca) &&
                !disableBaixarBoleto(cobranca) && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
                    <Button
                      disabled={disableVerPaginaPagamento(cobranca)}
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        goToExternalURL(cobranca.asaas_invoice_url)
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> Ver Página de
                      Pagamento
                    </Button>
                    <Button
                      disabled={disableBaixarBoleto(cobranca)}
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        goToExternalURL(cobranca.asaas_bankslip_url)
                      }
                    >
                      <Download className="w-4 h-4 mr-2" /> Baixar Boleto
                    </Button>
                  </div>
                )}

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
                          : `+ Ver histórico completo`}
                      </Button>
                    )}
                  </>
                ) : (
                  <Alert className="py-2">
                    <AlertTitle className="text-xs font-semibold text-muted-foreground mb-0">
                      Nenhuma notificação foi enviada
                    </AlertTitle>
                  </Alert>
                )}
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
        </div>

        {paymentDialogOpen && (
          <ManualPaymentDialog
            isOpen={paymentDialogOpen}
            onClose={() => setPaymentDialogOpen(false)}
            cobrancaId={cobranca_id}
            passageiroNome={cobranca.passageiro_nome}
            responsavelNome={cobranca.nome_responsavel}
            valorOriginal={Number(cobranca.valor)}
            onPaymentRecorded={() => {
              setPaymentDialogOpen(false);
              fetchCobranca();
            }}
          />
        )}

        <ConfirmationDialog
          open={confirmDialogDesfazer.open}
          onOpenChange={(open) =>
            setConfirmDialogDesfazer({ open, cobrancaId: "" })
          }
          title="Desfazer Pagamento"
          description="Deseja realmente desfazer o pagamento desta mensalidade?"
          onConfirm={desfazerPagamento}
          variant="destructive"
          confirmText="Confirmar"
        />

        <ConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open })}
          title="Excluir"
          description="Deseja excluir permanentemente essa mensalidade?"
          onConfirm={deleteCobranca}
          confirmText="Confirmar"
          variant="destructive"
        />

        {cobrancaToEdit && (
          <CobrancaEditDialog
            isOpen={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            cobranca={cobrancaToEdit}
            onCobrancaUpdated={fetchCobranca}
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
