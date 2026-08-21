import { SubscriptionInvoice } from "@/types/subscription";
import { SubscriptionInvoiceStatus, CheckoutPaymentMethod } from "@/types/enums";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";
import { formatCurrency } from "@/utils/formatters/currency";
import { parseLocalDate, formatLocalDate } from "@/utils/dateUtils";
import { Copy, CopyCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";

interface SubscriptionInvoiceCardProps {
  invoice: SubscriptionInvoice;
  copiedPixId?: string | null;
  onCopyPix?: (pixCode: string, invoiceId: string) => void;
  onRetryPayment?: (invoice: SubscriptionInvoice) => void;
  className?: string;
}

export function SubscriptionInvoiceCard({
  invoice,
  copiedPixId,
  onCopyPix,
  onRetryPayment,
  className,
}: SubscriptionInvoiceCardProps) {
  const planName = invoice.planos?.nome || invoice.assinaturas?.planos?.nome || "Assinatura";
  const amount = invoice.valor_total || invoice.valor;
  const isCopied = copiedPixId === invoice.id;
  const showActions =
    invoice.status === SubscriptionInvoiceStatus.FAILED ||
    invoice.status === SubscriptionInvoiceStatus.PENDING;

  const getDueDateLabel = () => {
    if (invoice.status === SubscriptionInvoiceStatus.PAID) return "Válido até:";
    if (invoice.status === SubscriptionInvoiceStatus.PENDING) return "Vence em:";
    return "Venceu em:";
  };

  const isNative = Capacitor.isNativePlatform();

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300",
        className
      )}
    >
      <div className="p-4 sm:p-6 flex items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-slate-800 text-sm sm:text-base truncate">
              Plano {planName}
            </span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>
              {invoice.metodo_pagamento
                ? PAYMENT_METHOD_LABELS[invoice.metodo_pagamento as CheckoutPaymentMethod] || invoice.metodo_pagamento
                : "Não informado"}
            </span>
            <span>•</span>
            <span>
              Vencimento: {invoice.data_vencimento ? formatLocalDate(parseLocalDate(invoice.data_vencimento)) : "N/D"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 text-right">
          <div className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
            {formatCurrency(amount)}
          </div>
          {invoice.parcelas && invoice.parcelas > 1 && (
            <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
              {invoice.parcelas}x de {formatCurrency(invoice.valor_parcela || Math.round((amount / invoice.parcelas) * 100) / 100)}
            </span>
          )}
        </div>
      </div>

      {showActions && (
        <div className="px-4 pb-4 sm:px-6 sm:pb-5 pt-0">
          {!isNative && invoice.pix_copy_paste && invoice.status === SubscriptionInvoiceStatus.PENDING ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                className="w-full sm:flex-1 flex justify-center items-center gap-2 text-[13px] font-bold text-white hover:bg-primary/90 bg-primary px-4 py-3 rounded-xl border border-primary-400/40 transition-all duration-300 active:scale-95"
                onClick={() => onCopyPix?.(invoice.pix_copy_paste!, invoice.id)}
              >
                {isCopied ? (
                  <>
                    <CopyCheck className="w-4 h-4 animate-in zoom-in duration-200" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar código PIX
                  </>
                )}
              </button>
              <button
                type="button"
                className="w-full sm:flex-1 flex justify-center items-center gap-2 text-[13px] font-bold text-primary hover:bg-primary/10 bg-primary/5 px-4 py-3 rounded-xl border border-primary/10 transition-all active:scale-95"
                onClick={() => onRetryPayment?.(invoice)}
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full px-4 py-3 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary-100 active:scale-95 text-center flex justify-center items-center"
              onClick={() => onRetryPayment?.(invoice)}
            >
              {invoice.status === SubscriptionInvoiceStatus.PENDING ? "Pagar Fatura" : "Tentar Novamente"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
