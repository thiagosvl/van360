import { ActivityTimeline } from "@/components/common/ActivityTimeline";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useCobranca, useDeleteCobranca } from "@/hooks";
import { useCobrancaOperations } from "@/hooks/ui/useCobrancaActions";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { AtividadeEntidadeTipo, CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  canSendNotification,
  canViewReceipt,
  disableEditarCobranca,
  disableExcluirCobranca,
  disableRegistrarPagamento,
} from "@/utils/domain/cobranca/disableActions";
import {
  formatCobrancaOrigem,
  formatDateToBR,
  formatPaymentType,
  getStatusText,
  meses,
} from "@/utils/formatters";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  Loader2,
  Pencil,
  Receipt,
  Send,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ── Local components ────────────────────────────────────────────────────────

/**
 * Chip de ação secundária. Usa forwardRef para compatibilidade com
 * DialogTrigger / Slot do Radix (ex: ReceiptDialog).
 */
const ActionChip = React.forwardRef<
  HTMLButtonElement,
  {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
  }
>(({ icon: Icon, label, onClick, disabled = false, loading = false, className }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full rounded-xl border border-gray-200 bg-white",
      "hover:bg-gray-50 hover:border-gray-300 active:scale-95",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      "transition-all text-gray-600",
      className,
    )}
  >
    {loading ? (
      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    ) : (
      <Icon className="w-5 h-5" />
    )}
    <span className="text-xs font-medium">{label}</span>
  </button>
));
ActionChip.displayName = "ActionChip";

// ── Skeleton ────────────────────────────────────────────────────────────────

const CobrancaSkeleton = () => (
  <div className="max-w-lg mx-auto space-y-4">
    <Skeleton className="h-72 w-full rounded-2xl" />
    <Skeleton className="h-14 w-full rounded-2xl" />
    <Skeleton className="h-24 w-full rounded-2xl" />
    <Skeleton className="h-16 w-full rounded-2xl" />
    <Skeleton className="h-8 w-32 mx-auto rounded-xl" />
  </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────

export default function PassageiroCobranca() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cobranca_id } = useParams() as { cobranca_id: string };

  const {
    setPageTitle,
    openCobrancaEditDialog,
    openCobrancaDeleteDialog,
    openManualPaymentDialog,
  } = useLayout();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const deleteCobranca = useDeleteCobranca();

  const {
    data: cobrancaData,
    isLoading: isCobrancaLoading,
    isError: isCobrancaError,
    error: cobrancaError,
    refetch: refetchCobranca,
  } = useCobranca(cobranca_id, { enabled: !!cobranca_id && !isDeleting });

  const cobranca = cobrancaData as Cobranca | null;
  const cobrancaTyped = cobranca;

  // ── Redirect on 404 ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!cobranca_id || isCobrancaLoading || isDeleting) return;
    const isNotFound =
      isCobrancaError &&
      ((cobrancaError as any)?.response?.status === 404 ||
        (cobrancaError as any)?.status === 404);

    if (isNotFound || (!isCobrancaError && !cobranca)) {
      queryClient.removeQueries({ queryKey: ["cobranca", cobranca_id] });
      queryClient.removeQueries({ queryKey: ["cobranca-notificacoes", cobranca_id] });
      if (cobranca?.passageiro_id) {
        navigate(
          ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
            ":passageiro_id",
            cobranca.passageiro_id,
          ),
          { replace: true },
        );
      } else {
        navigate(ROUTES.PRIVATE.MOTORISTA.BILLING, { replace: true });
      }
    }
  }, [isCobrancaLoading, isCobrancaError, cobrancaError, cobranca, cobranca_id, navigate, queryClient, isDeleting]);

  // ── Page title ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (cobranca) {
      setPageTitle(`Mensalidade · ${cobranca.passageiro.nome.split(" ")[0]}`);
    }
  }, [cobranca, setPageTitle]);

  // ── Operations ───────────────────────────────────────────────────────────
  const {
    handleToggleLembretes,
    handleEnviarNotificacao,
    handleDesfazerPagamento,
    isActionLoading: originalIsActionLoading,
    isTogglingNotificacoes,
    isSendingNotification,
    isDesfazendoPagamento,
  } = useCobrancaOperations({ cobranca: cobranca! });

  const isActionLoading = originalIsActionLoading || isDeleting;

  const handleEditCobrancaClick = () => {
    if (cobrancaTyped) openCobrancaEditDialog({ cobranca: cobrancaTyped });
  };

  const handleDeleteCobranca = async () => {
    if (!cobranca) return;
    const passageiroIdCapturado = cobranca.passageiro_id;
    openCobrancaDeleteDialog({
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteCobranca.mutateAsync(cobranca.id);
          if (window.history.length > 2) {
            navigate(-1);
          } else if (passageiroIdCapturado) {
            navigate(
              ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
                ":passageiro_id",
                passageiroIdCapturado,
              ),
              { replace: true },
            );
          } else {
            navigate(ROUTES.PRIVATE.MOTORISTA.BILLING, { replace: true });
          }
        } catch {
          setIsDeleting(false);
          throw new Error("delete failed");
        }
      },
      onEdit: () => openCobrancaEditDialog({ cobranca }),
    });
  };

  // ── Guards ───────────────────────────────────────────────────────────────
  const isNotFound =
    isCobrancaError &&
    ((cobrancaError as any)?.response?.status === 404 ||
      (cobrancaError as any)?.status === 404);

  if (!isCobrancaLoading && (isNotFound || (!isCobrancaError && !cobranca && cobranca_id))) {
    return null;
  }

  if (isCobrancaLoading) return <CobrancaSkeleton />;
  if (!cobranca || !cobrancaTyped) return null;

  // ── Derived data ─────────────────────────────────────────────────────────
  const passageiro = cobrancaTyped.passageiro as Passageiro;
  const isPago = cobrancaTyped.status === CobrancaStatus.PAGO;
  const statusText = getStatusText(cobrancaTyped.status, cobrancaTyped.data_vencimento);
  const diaVencimento = Number(cobrancaTyped.data_vencimento?.split("-")[2] ?? 0);
  const mesNome = meses[cobrancaTyped.mes - 1];
  const showRecibo = canViewReceipt(cobrancaTyped);
  const showDesfazer = cobrancaTyped.status === CobrancaStatus.PAGO && cobrancaTyped.pagamento_manual;

  // Tema visual baseado no status — cor pontual, onde faz sentido
  const theme = isPago
    ? {
        badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
        primaryCls: "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200/60",
        StatusIcon: CheckCircle2,
        accentBar: "bg-emerald-500",
      }
    : statusText === "Em atraso"
    ? {
        badgeCls: "bg-red-100 text-red-700 border-red-200",
        primaryCls: "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200/60",
        StatusIcon: AlertCircle,
        accentBar: "bg-red-500",
      }
    : statusText === "Vence hoje"
    ? {
        badgeCls: "bg-orange-100 text-orange-700 border-orange-200",
        primaryCls: "bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200/60",
        StatusIcon: Clock,
        accentBar: "bg-orange-500",
      }
    : {
        badgeCls: "bg-blue-100 text-blue-700 border-blue-200",
        primaryCls: "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/60",
        StatusIcon: Clock,
        accentBar: "bg-blue-500",
      };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <PullToRefreshWrapper onRefresh={() => refetchCobranca()}>
        <div className="max-w-lg mx-auto space-y-3 pb-10">

          {/* ── Hero Card ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Barra de acento colorida — cor pontual, minimalista */}
              <div className={cn("h-1 w-full", theme.accentBar)} />

              <div className="p-5 space-y-5">
                {/* Passageiro + Referência */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                      Passageiro
                    </p>
                    <p className="font-bold text-gray-900 text-base leading-snug truncate">
                      {passageiro.nome}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {passageiro.nome_responsavel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                      Referência
                    </p>
                    <p className="font-bold text-gray-900 text-base leading-snug">
                      {mesNome}
                    </p>
                    <p className="text-sm text-gray-500">{cobrancaTyped.ano}</p>
                  </div>
                </div>

                {/* Status badge */}
                <div>
                  <Badge
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border cursor-default",
                      theme.badgeCls,
                    )}
                  >
                    <theme.StatusIcon className="w-3.5 h-3.5" />
                    {statusText}
                  </Badge>
                </div>

                {/* Valor — protagonista visual */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl text-gray-400 font-medium self-start mt-2.5">
                    R$
                  </span>
                  <span className="text-6xl font-black text-gray-900 tracking-tighter leading-none">
                    {cobrancaTyped.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Informação-chave: data + forma (se pago) */}
                <div
                  className={cn(
                    "grid gap-2",
                    isPago && cobrancaTyped.tipo_pagamento ? "grid-cols-2" : "grid-cols-1",
                  )}
                >
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                      {isPago ? "Pago em" : "Vencimento"}
                    </p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {isPago
                        ? formatDateToBR(cobrancaTyped.data_pagamento)
                        : `Dia ${diaVencimento} de ${mesNome}`}
                    </p>
                  </div>

                  {isPago && cobrancaTyped.tipo_pagamento && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                        Forma
                      </p>
                      <p className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {formatPaymentType(cobrancaTyped.tipo_pagamento)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Ação Primária: Registrar Pagamento ─────────────────────── */}
          {!disableRegistrarPagamento(cobrancaTyped) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.07 }}
            >
              <Button
                className={cn(
                  "w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-[0.98] text-white",
                  theme.primaryCls,
                )}
                onClick={() =>
                  openManualPaymentDialog({
                    cobrancaId: cobrancaTyped.id,
                    passageiroNome: cobrancaTyped.passageiro.nome,
                    responsavelNome: cobrancaTyped.passageiro.nome_responsavel,
                    valorOriginal: Number(cobrancaTyped.valor),
                    status: cobrancaTyped.status,
                    dataVencimento: cobrancaTyped.data_vencimento,
                    onPaymentRecorded: () => {
                      refetchCobranca();
                    },
                  })
                }
              >
                <BadgeCheck className="w-5 h-5 mr-2" />
                Registrar Pagamento
              </Button>
            </motion.div>
          )}

          {/* ── Desfazer Pagamento (só se manual) ──────────────────────── */}
          {showDesfazer && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.07 }}
            >
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl font-semibold border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                onClick={handleDesfazerPagamento}
                disabled={isActionLoading}
              >
                {isDesfazendoPagamento ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <History className="w-4 h-4 mr-2" />
                )}
                Desfazer Pagamento
              </Button>
            </motion.div>
          )}

          {/* ── Card de Detalhes ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
          >
            <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-gray-500">Origem</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatCobrancaOrigem(cobrancaTyped.origem)}
                </span>
              </div>

              {!isPago && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-gray-500">Lembretes automáticos</span>
                  <button
                    type="button"
                    onClick={handleToggleLembretes}
                    disabled={isTogglingNotificacoes}
                    className="flex items-center gap-1.5 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isTogglingNotificacoes ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : cobrancaTyped.desativar_lembretes ? (
                      <BellOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Bell className="w-4 h-4 text-blue-500" />
                    )}
                    <span
                      className={
                        cobrancaTyped.desativar_lembretes
                          ? "text-gray-400"
                          : "text-blue-600"
                      }
                    >
                      {cobrancaTyped.desativar_lembretes ? "Desativados" : "Ativos"}
                    </span>
                  </button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── Ações Secundárias ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.17 }}
          >
            <div
              className={cn(
                "grid gap-2",
                showRecibo ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              <ActionChip
                icon={Pencil}
                label="Editar"
                onClick={handleEditCobrancaClick}
                disabled={disableEditarCobranca(cobrancaTyped) || isActionLoading}
              />

              <ActionChip
                icon={Send}
                label="WhatsApp"
                onClick={handleEnviarNotificacao}
                disabled={!canSendNotification(cobrancaTyped) || isActionLoading}
                loading={isSendingNotification}
              />

              {showRecibo && (
                <ReceiptDialog
                  url={cobrancaTyped.recibo_url}
                  trigger={<ActionChip icon={Receipt} label="Recibo" />}
                />
              )}
            </div>
          </motion.div>

          {/* ── Rodapé: Histórico + Excluir ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            className="flex flex-col items-center gap-2 pt-2"
          >
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors py-1.5"
            >
              <History className="w-4 h-4" />
              Ver histórico
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDeleteCobranca}
              disabled={disableExcluirCobranca(cobrancaTyped) || isActionLoading}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors py-1.5"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Excluir mensalidade
            </button>
          </motion.div>
        </div>
      </PullToRefreshWrapper>

      {/* ── Dialog: Histórico ──────────────────────────────────────────── */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Histórico da Mensalidade
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="px-5 py-4">
              {isHistoryOpen && cobrancaTyped && (
                <ActivityTimeline
                  entidadeTipo={AtividadeEntidadeTipo.COBRANCA}
                  entidadeId={cobrancaTyped.id}
                  limit={10}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
