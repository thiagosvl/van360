import { Link } from "react-router-dom";
import { CheckCircle2, Trash2, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { ROUTES } from "@/constants/routes";
import { AdminInvoiceItemDTO } from "@/types/dtos/admin-invoice.dto";
import { SubscriptionInvoiceStatus, CheckoutPaymentMethod } from "@/types/enums";
import { moneyMask } from "@/utils/masks";
import { formatSafeBrazilianDate } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

interface AdminInvoicesMobileListProps {
  invoices: AdminInvoiceItemDTO[];
  todayIso: string;
  isMutating: boolean;
  onCopyPix: (pixCode: string) => void;
  onConfirmPayment: (fatura: AdminInvoiceItemDTO) => void;
  onDeleteInvoice: (fatura: AdminInvoiceItemDTO) => void;
  onViewDriverDetails: (usuarioId: string) => void;
  onOpenImage: (params: { imageUrl: string; alt: string }) => void;
}

export function AdminInvoicesMobileList({
  invoices,
  todayIso,
  isMutating,
  onCopyPix,
  onConfirmPayment,
  onDeleteInvoice,
  onViewDriverDetails,
  onOpenImage,
}: AdminInvoicesMobileListProps) {
  return (
    <div className="md:hidden space-y-3 p-4">
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
          <div key={f.id} className="p-4 bg-secondary/30 rounded-2xl border border-border/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
                <div className="min-w-0 flex-1">
                  <Link
                    to={`${ROUTES.PRIVATE.ADMIN.USERS}/${f.usuario_id}`}
                    className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors block truncate"
                  >
                    {f.usuario.apelido || f.usuario.nome}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">{f.usuario.nome}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <InvoiceStatusBadge status={f.status} />
                <SubscriptionStatusBadge status={f.assinatura?.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/50 rounded-xl border border-border/60 text-xs">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Plano</p>
                <p className="font-semibold text-foreground truncate">{f.plano?.nome || "Plano Mensal"}</p>
                <span className="text-[10px] text-primary font-medium">
                  {f.tipo_fatura === "conversao_trial" ? "Conversão trial" : "Renovação"}
                </span>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-muted-foreground font-medium">Valor</p>
                <p className="text-sm font-semibold text-foreground font-mono">{moneyMask(f.valor)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isCartao ? "Cartão" : "Pix"}</p>
              </div>

              <div className="col-span-2 pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Venc. Assinatura:</span>
                <span
                  className={cn(
                    "font-semibold font-mono text-xs",
                    isVencida ? "text-destructive" : isHoje ? "text-amber-500" : "text-foreground"
                  )}
                >
                  {formatSafeBrazilianDate(dataVencimentoAssinatura)}
                  {isVencida && " (Em atraso)"}
                  {isHoje && " (Hoje)"}
                </span>
              </div>

              {f.status === SubscriptionInvoiceStatus.PAID && f.data_pagamento && (
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pago em:</span>
                  <span className="font-semibold font-mono text-xs text-emerald-400">
                    {formatSafeBrazilianDate(f.data_pagamento)}
                  </span>
                </div>
              )}

              {isCartao && f.data_liquidacao_prevista && (
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Recebimento previsto:</span>
                  <span className="font-semibold font-mono text-xs text-sky-400">
                    {formatSafeBrazilianDate(f.data_liquidacao_prevista)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1">
              {f.pix_copy_paste && isAberto && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onCopyPix(f.pix_copy_paste!)}
                  className="h-8 px-2.5 text-xs text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 rounded-xl"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Pix
                </Button>
              )}

              {f.status !== SubscriptionInvoiceStatus.PAID && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => onConfirmPayment(f)}
                  className="h-8 px-2.5 text-xs text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl font-medium"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Baixa
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onViewDriverDetails(f.usuario_id)}
                className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10 rounded-xl"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Detalhes
              </Button>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isMutating}
                onClick={() => onDeleteInvoice(f)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
