import { SubscriptionInvoice } from "@/types/subscription";
import { SubscriptionInvoiceStatus, CheckoutPaymentMethod } from "@/types/enums";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";
import { formatCurrency } from "@/utils/formatters/currency";
import { parseLocalDate, formatLocalDate } from "@/utils/dateUtils";
import { Copy, CopyCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div
      className={cn(
        "bg-white rounded-[22px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 sm:px-6 sm:py-5">
        <div className="space-y-1.5 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base font-semibold text-primary truncate max-w-[180px] sm:max-w-none">
              Plano {planName}
            </span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 flex items-center flex-wrap gap-1">
            <span>{getDueDateLabel()}</span>
            <span>{formatLocalDate(parseLocalDate(invoice.data_vencimento))}</span>
            {invoice.metodo_pagamento && (
              <>
                <span className="text-slate-300">•</span>
                <span className="capitalize">
                  {PAYMENT_METHOD_LABELS[invoice.metodo_pagamento as CheckoutPaymentMethod] || "Boleto"}
                </span>
              </>
            )}
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
          {invoice.pix_copy_paste && invoice.status === SubscriptionInvoiceStatus.PENDING ? (
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
              Tentar Novamente
            </button>
          )}
        </div>
      )}
    </div>
  );
}
