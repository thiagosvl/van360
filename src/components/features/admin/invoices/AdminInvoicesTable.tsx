import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  CheckCircle2,
  Trash2,
  Eye,
  QrCode,
  Copy,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { ROUTES } from "@/constants/routes";
import { AdminInvoiceItemDTO } from "@/types/dtos/admin-invoice.dto";
import { SubscriptionInvoiceStatus, CheckoutPaymentMethod } from "@/types/enums";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";
import { moneyMask, phoneMask } from "@/utils/masks";
import { formatSafeBrazilianDate } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { AdminInvoicesMobileList } from "./AdminInvoicesMobileList";

interface AdminInvoicesTableProps {
  invoices: AdminInvoiceItemDTO[];
  isLoading: boolean;
  todayIso: string;
  page: number;
  totalPages: number;
  total: number;
  isMutating: boolean;
  onPageChange: (newPage: number) => void;
  onCopyPix: (pixCode: string) => void;
  onConfirmPayment: (fatura: AdminInvoiceItemDTO) => void;
  onDeleteInvoice: (fatura: AdminInvoiceItemDTO) => void;
  onViewDriverDetails: (usuarioId: string) => void;
  onOpenImage: (params: { imageUrl: string; alt: string }) => void;
}

export function AdminInvoicesTable({
  invoices,
  isLoading,
  todayIso,
  page,
  totalPages,
  total,
  isMutating,
  onPageChange,
  onCopyPix,
  onConfirmPayment,
  onDeleteInvoice,
  onViewDriverDetails,
  onOpenImage,
}: AdminInvoicesTableProps) {
  return (
    <Card className="border border-border bg-card shadow-xs rounded-3xl overflow-hidden">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Carregando faturas...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={Receipt}
              title="Nenhuma fatura encontrada"
              description="Não há faturas correspondentes aos filtros selecionados no momento."
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">Motorista</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground text-center">Conta</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">Tipo & plano</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">Método</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">Venc. / Liquidação</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground text-right">Valor</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground text-center">Status</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-muted-foreground text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((f) => {
                    const dataVencimentoAssinatura =
                      f.assinatura?.data_vencimento || f.assinatura?.trial_ends_at || f.data_vencimento;
                    const vencimentoYmd = dataVencimentoAssinatura ? dataVencimentoAssinatura.slice(0, 10) : "";
                    const isAberto =
                      f.status === SubscriptionInvoiceStatus.PENDING ||
                      f.status === SubscriptionInvoiceStatus.FAILED;
                    const isVencida = isAberto && vencimentoYmd < todayIso;
                    const isHoje = isAberto && vencimentoYmd === todayIso;
                    const isCartao = f.metodo_pagamento === CheckoutPaymentMethod.CREDIT_CARD;

                    return (
                      <tr key={f.id} className="border-b border-border/40 hover:bg-secondary/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {f.usuario.logo_url?.trim() ? (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => onOpenImage({ imageUrl: f.usuario.logo_url!, alt: f.usuario.nome })}
                                className="h-10 w-10 rounded-xl bg-card border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                              >
                                <img
                                  src={f.usuario.logo_url}
                                  alt={f.usuario.nome}
                                  className="h-full w-full object-contain"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 text-muted-foreground font-semibold text-xs shadow-xs">
                                {(f.usuario.apelido || f.usuario.nome || "M").slice(0, 2)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link
                                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${f.usuario_id}`}
                                className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors block truncate max-w-[200px]"
                              >
                                {f.usuario.apelido || f.usuario.nome}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                                {f.usuario.nome}
                              </p>
                              {f.usuario.telefone && (
                                <p className="text-[11px] text-muted-foreground/80 font-mono">
                                  {phoneMask(f.usuario.telefone)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <SubscriptionStatusBadge status={f.assinatura?.status} />
                        </td>

                        <td className="py-3.5 px-4">
                          <div>
                            <p className="text-xs font-semibold text-foreground">{f.plano?.nome || "Plano Mensal"}</p>
                            <span
                              className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium mt-0.5",
                                f.tipo_fatura === "conversao_trial"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-primary/10 text-primary border border-primary/20"
                              )}
                            >
                              {f.tipo_fatura === "conversao_trial" ? "Conversão trial" : "Renovação"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs text-foreground/80 flex items-center gap-1.5">
                            {isCartao ? (
                              <CreditCard className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                            {PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] || f.metodo_pagamento}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span
                              className={cn(
                                "text-xs font-semibold block font-mono",
                                isVencida ? "text-destructive" : isHoje ? "text-amber-500" : "text-foreground/80"
                              )}
                            >
                              {formatSafeBrazilianDate(dataVencimentoAssinatura)}
                            </span>
                            {f.status === SubscriptionInvoiceStatus.PAID && f.data_pagamento && (
                              <span className="block text-[10px] font-medium text-emerald-400 font-mono">
                                Pago em: {formatSafeBrazilianDate(f.data_pagamento)}
                              </span>
                            )}
                            {isCartao && f.data_liquidacao_prevista && (
                              <span className="block text-[10px] font-medium text-sky-400 font-mono">
                                Recebimento: {formatSafeBrazilianDate(f.data_liquidacao_prevista)}
                              </span>
                            )}
                            {isVencida && (
                              <span className="inline-block text-[10px] font-medium text-destructive">Em atraso</span>
                            )}
                            {isHoje && (
                              <span className="inline-block text-[10px] font-medium text-amber-500">Vence hoje</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="text-sm font-semibold text-foreground font-mono">
                            {moneyMask(f.valor)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <InvoiceStatusBadge status={f.status} />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {f.pix_copy_paste && isAberto && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                title="Copiar código Pix"
                                onClick={() => onCopyPix(f.pix_copy_paste!)}
                                className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}

                            {f.status !== SubscriptionInvoiceStatus.PAID && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                title="Registrar pagamento (dar baixa)"
                                disabled={isMutating}
                                onClick={() => onConfirmPayment(f)}
                                className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              title="Ver detalhes do motorista"
                              onClick={() => onViewDriverDetails(f.usuario_id)}
                              className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-xl"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              title="Excluir fatura"
                              disabled={isMutating}
                              onClick={() => onDeleteInvoice(f)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <AdminInvoicesMobileList
              invoices={invoices}
              todayIso={todayIso}
              isMutating={isMutating}
              onCopyPix={onCopyPix}
              onConfirmPayment={onConfirmPayment}
              onDeleteInvoice={onDeleteInvoice}
              onViewDriverDetails={onViewDriverDetails}
              onOpenImage={onOpenImage}
            />

            <div className="p-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                Mostrando {invoices.length} de {total} faturas (Página {page} de {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  className="border-border bg-background text-foreground hover:bg-secondary rounded-lg h-9 px-3 text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                  className="border-border bg-background text-foreground hover:bg-secondary rounded-lg h-9 px-3 text-xs"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
