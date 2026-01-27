import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { NotificationTimeline } from "@/components/features/cobranca/NotificationTimeline";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { FEATURE_COBRANCA_AUTOMATICA } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCobranca,
  useCobrancaNotificacoes,
  useDeleteCobranca,
  usePermissions,
  useProfile,
  useSession
} from "@/hooks";
import { useCobrancaOperations } from "@/hooks/ui/useCobrancaActions";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaNotificacao } from "@/types/cobrancaNotificacao";
import { CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  canSendNotification,
  canViewReceipt,
  disableEditarCobranca,
  disableExcluirCobranca,
  disableRegistrarPagamento,
  seForPago,
} from "@/utils/domain/cobranca/disableActions";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import {
  formatCobrancaOrigem,
  formatDateToBR,
  formatPaymentType,
  formatarEnderecoCompleto,
  formatarTelefone,
  getStatusColor,
  getStatusText,
  meses,
} from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BellOff,
  Calendar,
  CalendarDays,
  Car,
  CheckCircle2,
  Copy,
  CopyCheck,
  CreditCard,
  History,
  IdCard,
  MapPin,
  Pencil,
  Phone,
  QrCode,
  Receipt,
  School,
  Send,
  Trash2,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
      <span className="font-medium">{label}</span>
    </div>
    <div className="font-semibold text-foreground mt-1 text-base">
      {children || "-"}
    </div>
  </div>
);

const SidebarInfoBlock = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1">
    <div className="flex items-center gap-2 text-gray-400">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </span>
    </div>
    <div className="font-bold text-gray-900 text-sm">{children || "—"}</div>
  </div>
);

const CobrancaSkeleton = () => (
  <div className="space-y-6 w-full ">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-96 w-full" />
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

export default function PassageiroCobranca() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams();
  const { cobranca_id } = params as {
    cobranca_id: string;
  };

  const {
    setPageTitle,
    openCobrancaEditDialog,
    openCobrancaPixDrawer,
    openManualPaymentDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();

  const { user } = useSession();
  const { plano } = useProfile(user?.id);
  const permissions = usePermissions();

  const [isCopiedEndereco, setIsCopiedEndereco] = useState(false);
  const [isCopiedTelefone, setIsCopiedTelefone] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCobranca = useDeleteCobranca();

  const {
    data: cobrancaData,
    isLoading: isCobrancaLoading,
    isError: isCobrancaError,
    error: cobrancaError,
    refetch: refetchCobranca,
  } = useCobranca(cobranca_id, {
    enabled: !!cobranca_id && !isDeleting,
  });

  const { data: notificacoesData } = useCobrancaNotificacoes(cobranca_id, {
    enabled: !!cobranca_id && !isDeleting,
  });

  const cobranca = cobrancaData as Cobranca | null;
  const cobrancaTyped = cobranca;
  const notificacoes = (notificacoesData || []) as CobrancaNotificacao[];

  const loading = isCobrancaLoading;

  useEffect(() => {
    if (!cobranca_id) return;

    if (isCobrancaLoading) return;
    if (isDeleting) return; // Fix: Prevent race condition during deletion

    const isNotFoundError =
      isCobrancaError &&
      ((cobrancaError as any)?.response?.status === 404 ||
        (cobrancaError as any)?.status === 404);

    if (isNotFoundError || (!isCobrancaError && !cobranca)) {
      queryClient.removeQueries({ queryKey: ["cobranca", cobranca_id] });
      queryClient.removeQueries({
        queryKey: ["cobranca-notificacoes", cobranca_id],
      });

      if (cobranca?.passageiro_id) {
        navigate(
          ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
            ":passageiro_id",
            cobranca.passageiro_id,
          ),
          {
            replace: true,
          },
        );
      } else {
        navigate(ROUTES.PRIVATE.MOTORISTA.BILLING, { replace: true });
      }
    }
  }, [
    isCobrancaLoading,
    isCobrancaError,
    cobrancaError,
    cobranca,
    cobranca_id,
    navigate,
    queryClient,
    isDeleting, // Add dependency
  ]);

  const handleEditCobrancaClick = () => {
    if (cobrancaNormalizadaParaEdicao) {
      openCobrancaEditDialog({
        cobranca: cobrancaNormalizadaParaEdicao,
      });
    }
  };

  const cobrancaNormalizadaParaEdicao = useMemo(() => {
    if (!cobranca) return null;
    return cobranca;
  }, [cobranca]);



  const {
    handleToggleLembretes,
    handleEnviarNotificacao,
    handleDesfazerPagamento,
    // handleDeleteCobranca, // We overlap this one
    handleUpgrade,
    isActionLoading: originalIsActionLoading,
  } = useCobrancaOperations({
    cobranca: cobranca!,
    plano: plano,
  });

  const isActionLoading = originalIsActionLoading || isDeleting;

  // Wrapper para adicionar navegação após exclusão
  const handleDeleteCobranca = async () => {
    if (!cobranca) return;
    
    // Captura o ID antes da mutação pois o objeto pode ser limpo do cache (Success -> removeQueries)
    const passageiroIdCapturado = cobranca.passageiro_id;
    openConfirmationDialog({
      title: "Excluir mensalidade?",
      description: "Tem certeza que deseja excluir esta mensalidade? Essa ação não poderá ser desfeita.",
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
         setIsDeleting(true);
         try {
            await deleteCobranca.mutateAsync(cobranca.id);
            
            closeConfirmationDialog();

            // Lógica solicitada: Tenta VOLTAR (-1). Se não houver histórico, usa condicional.
            if (window.history.length > 2) { 
              navigate(-1);
            } else if (passageiroIdCapturado) {
              navigate(
                ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
                  ":passageiro_id",
                  passageiroIdCapturado,
                ),
                { replace: true }
              );
            } else {
              navigate(ROUTES.PRIVATE.MOTORISTA.BILLING, { replace: true });
            }
         } catch (error) {
            console.error("[DeleteFlow] Erro durante o fluxo:", error);
            setIsDeleting(false);
         }
      }
    });
  };

  const handleCopyEndereco = async () => {
    if (!passageiroCompleto) return;
    const passageiroSemReferencia = {
      ...passageiroCompleto,
      referencia: "",
    };
    const enderecoCompleto = formatarEnderecoCompleto(
      passageiroSemReferencia as Passageiro,
    );
    try {
      await navigator.clipboard.writeText(enderecoCompleto);
      setIsCopiedEndereco(true);
      setTimeout(() => setIsCopiedEndereco(false), 1000);
    } catch (err) {
      toast.error("Erro ao copiar endereço.");
    }
  };

  const handleCopyTelefone = async () => {
    if (!passageiroCompleto?.telefone_responsavel) return;
    try {
      await navigator.clipboard.writeText(
        formatarTelefone(passageiroCompleto.telefone_responsavel),
      );
      setIsCopiedTelefone(true);
      setTimeout(() => setIsCopiedTelefone(false), 1000);
    } catch (err) {
      toast.error("Erro ao copiar telefone.");
    }
  };

  useEffect(() => {
    if (cobranca) {
      setPageTitle(`Mensalidade de ${cobranca.passageiro.nome.split(" ")[0]}`);
    }
  }, [cobranca, setPageTitle]);

  const isNotFoundError =
    isCobrancaError &&
    ((cobrancaError as any)?.response?.status === 404 ||
      (cobrancaError as any)?.status === 404);

  if (
    !loading &&
    (isNotFoundError || (!isCobrancaError && !cobranca && cobranca_id))
  ) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full h-full">
        <CobrancaSkeleton />
      </div>
    );
  }

  if (!cobranca || !cobrancaTyped) return null;
  const passageiroCompleto = cobrancaTyped?.passageiro as Passageiro;

  const pullToRefreshReload = async () => {
    await refetchCobranca();
  };

  const isPago = cobrancaTyped?.status === CobrancaStatus.PAGO;
  const statusText = getStatusText(
    cobrancaTyped?.status,
    cobrancaTyped?.data_vencimento,
  );
  const statusColorClass = getStatusColor(
    cobrancaTyped?.status,
    cobrancaTyped?.data_vencimento,
  );

  let headerBg =
    "bg-gradient-to-r from-blue-100 via-blue-50 to-white border-b border-blue-100";
  let StatusIcon = Wallet;
  let paymentButtonClass =
    "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_12px_30px_-20px_rgba(37,99,235,0.7)]";

  if (isPago) {
    headerBg =
      "bg-gradient-to-r from-green-100 via-emerald-50 to-white border-b border-green-100";
    StatusIcon = CheckCircle2;
    paymentButtonClass =
      "bg-green-600 hover:bg-green-700 text-white shadow-[0_12px_30px_-20px_rgba(16,185,129,0.6)]";
  } else if (statusText === "Em atraso") {
    headerBg =
      "bg-gradient-to-r from-red-100 via-rose-50 to-white border-b border-red-100";
    StatusIcon = XCircle;
    paymentButtonClass =
      "bg-red-600 hover:bg-red-700 text-white shadow-[0_12px_30px_-20px_rgba(248,113,113,0.6)]";
  } else if (statusText === "Vence hoje") {
    headerBg =
      "bg-gradient-to-r from-white to-red-200 hover:bg-inherit border-b border-red-100";
    StatusIcon = Wallet;
    paymentButtonClass =
      "bg-gradient-to-r from-orange-500 via-red-600 to-red-600 hover:bg-orange-700 text-white shadow-[0_12px_30px_-20px_rgba(251,146,60,0.7)]";
  } else {
    headerBg =
      "bg-gradient-to-r from-orange-100 via-orange-50 to-white border-b border-orange-100";
    StatusIcon = Wallet;
    paymentButtonClass =
      "bg-yellow-500 hover:bg-yellow-600 text-white shadow-[0_12px_30px_-20px_rgba(37,99,235,0.7)]";
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className=" space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* --- SIDEBAR: PASSENGER CARD --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-1 order-2 lg:order-1"
            >
              <Card className="bg-white border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-8 flex flex-col items-center text-center border-b border-gray-50 relative">
                  <div className="relative mb-4">
                    <div
                      className={cn(
                        "h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-sm",
                        passageiroCompleto.ativo
                          ? "ring-2 ring-offset-2 ring-green-500"
                          : "ring-2 ring-offset-2 ring-red-500",
                      )}
                    >
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                    <div
                      className={cn(
                        "absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white",
                        passageiroCompleto.ativo
                          ? "bg-green-500"
                          : "bg-red-500",
                      )}
                      title={passageiroCompleto.ativo ? "Ativo" : "Desativado"}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {passageiroCompleto.nome}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {passageiroCompleto.nome_responsavel}
                  </p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Contato Rápido */}
                  <div className="">
                    <p className="text-sm font-medium text-muted-foreground">
                      Contato Rápido
                    </p>

                    <AnimatePresence>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              WhatsApp
                            </div>
                            <div className="font-semibold text-foreground">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {formatarTelefone(
                                    passageiroCompleto.telefone_responsavel,
                                  )}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shrink-0"
                                  onClick={handleCopyTelefone}
                                  title="Copiar telefone"
                                >
                                  {isCopiedTelefone ? (
                                    <CopyCheck className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Endereço
                            </div>
                            <div className="font-semibold text-foreground mt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {formatarEnderecoCompleto(passageiroCompleto)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 shrink-0"
                                  onClick={handleCopyEndereco}
                                  title="Copiar endereço"
                                >
                                  {isCopiedEndereco ? (
                                    <CopyCheck className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Info Grid - Blocos Estilizados */}
                  <div className="grid grid-cols-2 gap-3">
                    <SidebarInfoBlock icon={School} label="Escola">
                      {passageiroCompleto.escola.nome}
                    </SidebarInfoBlock>
                    <SidebarInfoBlock icon={Car} label="Veículo">
                      {formatarPlacaExibicao(passageiroCompleto.veiculo.placa)}
                    </SidebarInfoBlock>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      className="w-full h-10 rounded-xl text-gray-500 hover:bg-transparent hover:text-primary font-medium"
                      onClick={() =>
                        navigate(`/passageiros/${cobrancaTyped?.passageiro_id}`)
                      }
                    >
                      <IdCard className="h-4 w-4 mr-2" /> Ver Carteirinha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* --- MAIN CONTENT --- */}
            <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
              {/* FINANCIAL SUMMARY CARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="bg-white border border-gray-100 shadow-lg overflow-hidden relative flex flex-col">
                  {/* Header Limpo: Sem botão de edição e Data Simplificada */}
                  <div
                    className={cn(
                      "px-6 py-5 flex items-start justify-between relative min-h-[84px]",
                      headerBg,
                    )}
                  >
                    {/* Lado Esquerdo: Referência */}
                    <div className="flex flex-col gap-1.5 z-10">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                        Referência
                      </span>
                      {/* Valor em destaque */}
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 opacity-80" />
                        <span className="text-base sm:text-xl font-bold tracking-tight text-gray-900">
                          {meses[cobrancaTyped?.mes - 1]}
                        </span>
                      </div>
                    </div>

                    {/* Lado Direito: Vencimento (Dia XX) ou Pagamento Completo */}
                    <div className="flex flex-col items-end gap-1.5 text-right z-10">
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                        {isPago ? "Pago em" : "Vencimento"}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        {isPago
                          ? formatDateToBR(cobrancaTyped?.data_pagamento).split(
                              "/",
                            )[0] +
                            "/" +
                            formatDateToBR(cobrancaTyped?.data_pagamento).split(
                              "/",
                            )[1]
                          : `Dia ${
                              cobrancaTyped?.data_vencimento.split("-")[2]
                            }`}
                      </span>
                    </div>
                  </div>

                  {/* ALERTA DE LEMBRETES DESATIVADOS (NOVO) */}
                  {cobrancaTyped?.desativar_lembretes && !isPago && (
                    <div className="bg-orange-50 border-b border-orange-100 px-6 py-2 flex items-center justify-center gap-2 text-xs font-medium text-orange-700 animate-in fade-in slide-in-from-top-2">
                      <BellOff className="w-3.5 h-3.5 text-orange-700" />
                      <span>Notificações desativadas para esta mensalidade.</span>
                    </div>
                  )}

                  <div className="p-8 md:p-10 text-center flex-1 flex flex-col justify-center">
                    {/* Value Section */}
                    <div className="mb-8">
                      <Badge
                        className={cn(
                          "px-4 py-1.5 mb-3 text-xs font-bold shadow-sm rounded-full border transition-all hover:scale-105 cursor-default",
                          statusColorClass,
                        )}
                      >
                        <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                        {statusText}
                      </Badge>

                      <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl text-gray-400 font-medium mt-1">
                          R$
                        </span>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tighter">
                          {cobrancaTyped?.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </h1>
                      </div>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex flex-wrap flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto mb-8 w-full">
                      {cobrancaTyped?.txid_pix &&
                        cobrancaTyped?.qr_code_payload &&
                        !isPago && (
                          <Button
                            className="h-12 px-8 rounded-xl font-bold text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto min-w-[200px]"
                            onClick={() =>
                              openCobrancaPixDrawer({
                                qrCodePayload:
                                  cobrancaTyped.qr_code_payload || "",
                                valor: Number(cobrancaTyped.valor),
                                passageiroNome: cobrancaTyped.passageiro.nome,
                                mes: cobrancaTyped.mes,
                                ano: cobrancaTyped.ano,
                              })
                            }
                          >
                            <QrCode className="w-5 h-5 mr-2" />
                            Ver PIX
                          </Button>
                        )}
                      {!disableRegistrarPagamento(cobrancaTyped) && (
                        <Button
                          className={cn(
                            "h-12 px-8 rounded-xl font-bold text-base shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto min-w-[200px]",
                            paymentButtonClass,
                          )}
                          onClick={() =>
                            openManualPaymentDialog({
                              cobrancaId: cobrancaTyped.id,
                              passageiroNome: cobrancaTyped.passageiro.nome,
                              responsavelNome:
                                cobrancaTyped.passageiro.nome_responsavel,
                              valorOriginal: Number(cobrancaTyped.valor),
                              status: cobrancaTyped.status,
                              dataVencimento: cobrancaTyped.data_vencimento,
                              onPaymentRecorded: () => {
                                refetchCobranca();
                                // Upsell Check
                                if (!permissions.canUseAutomatedCharges) {
                                  handleUpgrade(
                                    FEATURE_COBRANCA_AUTOMATICA,
                                    "Pagamento registrado! Sabia que o sistema pode dar baixa automática para você?",
                                    "Cobrança Automática",
                                  );
                                }
                              },
                            })
                          }
                        >
                          <BadgeCheck className="w-5 h-5 mr-2" />
                          Registrar Pagamento
                        </Button>
                      )}
                      {cobrancaTyped.status === CobrancaStatus.PAGO &&
                        cobrancaTyped.pagamento_manual && (
                          <>
                            <Button
                              size="lg"
                              variant="outline"
                              className="h-12 px-8 rounded-xl border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 w-full sm:w-auto min-w-[200px]"
                              onClick={handleDesfazerPagamento}
                            >
                              <History className="w-4 h-4 mr-2" />
                              Desfazer Pagamento
                            </Button>
                            <p className="text-muted-foreground w-full text-xs">
                              Pagamento registrado manualmente.
                            </p>
                          </>
                        )}
                      {cobrancaTyped.status === CobrancaStatus.PAGO &&
                        !cobrancaTyped.pagamento_manual && (
                          <>
                            <div className="px-6 py-4 rounded-xl bg-green-50 border border-green-100 text-green-800 font-medium text-sm flex items-center justify-center gap-2 w-full">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span>Pago via cobrança automática</span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              Não é possível desfazer um pagamento feito via
                              cobrança automática.
                            </p>
                          </>
                        )}
                    </div>

                    {/* Secondary Actions - Vertical Stack */}
                    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mb-6">
                      {/* Botão Editar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-9 px-4 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors border border-transparent hover:border-gray-200"
                        onClick={handleEditCobrancaClick}
                        disabled={disableEditarCobranca(cobrancaTyped)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-9 px-4 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors border border-transparent hover:border-gray-200"
                        disabled={!canSendNotification(cobrancaTyped)}
                        onClick={handleEnviarNotificacao}
                      >
                        <Send className="w-3.5 h-3.5 mr-2" /> Cobrar via WhatsApp
                      </Button>

                      {canViewReceipt(cobrancaTyped) && (
                        <ReceiptDialog
                          url={cobrancaTyped?.recibo_url}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-9 px-4 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors border border-transparent hover:border-gray-200"
                            >
                              <Receipt className="w-3.5 h-3.5 mr-2" /> Ver
                              Recibo
                            </Button>
                          }
                        />
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-9 px-4 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors border border-transparent hover:border-gray-200"
                        disabled={seForPago(cobrancaTyped)}
                        onClick={handleToggleLembretes}
                      >
                        {cobrancaTyped?.desativar_lembretes ? (
                          <>
                            <Bell className="w-3.5 h-3.5 mr-2" /> Ativar
                            Notificações
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3.5 h-3.5 mr-2" /> Pausar
                            Notificações
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Delete Action (Separado por borda para segurança) */}
                    <div className="pt-6 border-t border-gray-50 mt-auto w-full flex justify-center">
                      <Button
                        variant="ghost"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 font-medium text-xs h-8 px-3 rounded-md transition-colors"
                        disabled={disableExcluirCobranca(cobrancaTyped)}
                        onClick={handleDeleteCobranca}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir mensalidade
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* DETAILS & TIMELINE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Details Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card className="h-full bg-white border border-gray-100 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                        Detalhes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem icon={CreditCard} label="Forma de Pagamento">
                          {formatPaymentType(cobrancaTyped?.tipo_pagamento)}
                        </InfoItem>
                        <InfoItem icon={Calendar} label="Data do Pagamento">
                          {cobrancaTyped?.data_pagamento
                            ? formatDateToBR(cobrancaTyped?.data_pagamento)
                            : "—"}
                        </InfoItem>
                        <InfoItem icon={ArrowRight} label="Origem da Mensalidade">
                          {formatCobrancaOrigem(cobrancaTyped?.origem)}
                        </InfoItem>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Timeline Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="h-full bg-white border border-gray-100 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                        Histórico de Lembretes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 px-2 sm:pr-4">
                      {notificacoes && notificacoes.length > 0 ? (
                        <NotificationTimeline items={notificacoes} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-400 font-medium">
                            Nenhum lembrete enviado.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>

          <LoadingOverlay active={isActionLoading} />
        </div>
      </PullToRefreshWrapper>
    </>
  );
}
