import { SubscriptionInvoice } from "@/types/subscription";
import { SubscriptionInvoiceStatus, CheckoutPaymentMethod } from "@/types/enums";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatMonthYearAbbr } from "@/utils/formatters/date";
import { Copy, CopyCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionInvoiceCardProps {
  invoice: SubscriptionInvoice;
  copiedPixId?: string | null;
  onCopyPix?: (pixCode: string, invoiceId: string) => void;
  onRetryPayment?: (invoice: SubscriptionInvoice) => void;
  isExpired?: boolean;
  className?: string;
}

export function SubscriptionInvoiceCard({
  invoice,
  copiedPixId,
  onCopyPix,
  onRetryPayment,
  isExpired,
  className,
}: SubscriptionInvoiceCardProps) {
  const planName = invoice.planos?.nome || invoice.assinaturas?.planos?.nome || "Assinatura";
  const amount = invoice.valor_total || invoice.valor;
  const isCopied = copiedPixId === invoice.id;
  const showActions =
    invoice.status === SubscriptionInvoiceStatus.FAILED ||
    invoice.status === SubscriptionInvoiceStatus.PENDING;

  return (
    <div
      className={cn(
        "bg-white rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-200 hover:border-[#737373]/30",
        className
      )}
    >
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[#0a0a0a] text-sm tracking-tight truncate">
              Plano {planName}
            </span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#737373] font-normal">
            <span>
              {invoice.metodo_pagamento
                ? PAYMENT_METHOD_LABELS[invoice.metodo_pagamento as CheckoutPaymentMethod] || invoice.metodo_pagamento
                : "Não informado"}
            </span>
            <span>•</span>
            <span>
              {`${formatMonthYearAbbr(invoice.data_vencimento || invoice.created_at)}`}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 text-right">
          <div className="text-sm font-medium text-[#0a0a0a] tracking-tight tabular-nums whitespace-nowrap">
            {formatCurrency(amount)}
          </div>
          {invoice.parcelas && invoice.parcelas > 1 && (
            <span className="text-[11px] text-[#737373] font-normal whitespace-nowrap">
              {invoice.parcelas}x de {formatCurrency(invoice.valor_parcela || Math.round((amount / invoice.parcelas) * 100) / 100)}
            </span>
          )}
        </div>
      </div>

      {showActions && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
          {invoice.pix_copy_paste && invoice.status === SubscriptionInvoiceStatus.PENDING ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                className="w-full sm:flex-1 h-10 flex justify-center items-center gap-2 text-xs sm:text-sm font-medium text-white hover:bg-primary-hover bg-primary px-4 rounded-[18px] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-xs"
                onClick={() => onCopyPix?.(invoice.pix_copy_paste!, invoice.id)}
              >
                {isCopied ? (
                  <>
                    <CopyCheck className="w-4 h-4 animate-in zoom-in duration-200" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar código Pix</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="w-full sm:flex-1 h-10 flex justify-center items-center gap-2 text-xs sm:text-sm font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] bg-white px-4 rounded-[18px] border border-[#e5e5e5] transition-all active:scale-[0.98] cursor-pointer"
                onClick={() => onRetryPayment?.(invoice)}
              >
                Trocar forma de pagamento
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full h-10 bg-primary text-white text-xs sm:text-sm font-medium rounded-[18px] hover:bg-primary-hover transition-all shadow-xs active:scale-[0.98] text-center flex justify-center items-center cursor-pointer"
              onClick={() => onRetryPayment?.(invoice)}
            >
              Pagar Fatura
            </button>
          )}
        </div>
      )}
    </div>
  );
}
