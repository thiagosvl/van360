import { useState, useEffect, useCallback } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { useSubscriptionInvoicesPaginated } from "@/hooks/api/useSubscription";
import { SubscriptionInvoice } from "@/types/subscription";
import { SubscriptionInvoiceCard } from "./SubscriptionInvoiceCard";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton";
import { Receipt, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

interface SubscriptionInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  copiedPixId?: string | null;
  onCopyPix?: (pixCode: string, invoiceId: string) => void;
  onRetryPayment?: (invoice?: SubscriptionInvoice) => void;
  isExpired?: boolean;
}

const INVOICES_PAGE_SIZE = 15;

export function SubscriptionInvoicesDialog({
  open,
  onOpenChange,
  userId,
  copiedPixId,
  onCopyPix,
  onRetryPayment,
  isExpired,
}: SubscriptionInvoicesDialogProps) {
  const [limit, setLimit] = useState<number>(INVOICES_PAGE_SIZE);

  const { data, isLoading, isFetching, refetch } = useSubscriptionInvoicesPaginated({
    userId,
    page: 1,
    limit,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setLimit(INVOICES_PAGE_SIZE);
      refetch();
    }
  }, [open, refetch]);

  const invoices = data?.list || [];
  const totalItems = data?.total || 0;
  const hasMore = invoices.length < totalItems;

  const handleLoadMore = useCallback(() => {
    setLimit((prev) => prev + INVOICES_PAGE_SIZE);
  }, []);

  const handleRetry = useCallback(
    (invoice: SubscriptionInvoice) => {
      safeCloseDialog(() => onOpenChange(false));
      onRetryPayment?.(invoice);
    },
    [onOpenChange, onRetryPayment]
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="2xl"
      description="Histórico completo de cobranças e faturas da assinatura"
    >
      <BaseDialog.Header
        title="Histórico de Faturas"
        icon={<Receipt className="w-5 h-5 text-primary" />}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="space-y-3 p-4 sm:p-6 bg-[#f5f5f5] min-h-[360px] max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] border border-[#e5e5e5] p-5 space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32 rounded-[12px] bg-[#e5e5e5]" />
                  <Skeleton className="h-5 w-20 rounded-[12px] bg-[#e5e5e5]" />
                </div>
                <Skeleton className="h-4 w-48 rounded-[10px] bg-[#e5e5e5]" />
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white rounded-[20px] border border-[#e5e5e5] shadow-xs">
            <div className="w-12 h-12 bg-[#f5f5f5] rounded-[16px] flex items-center justify-center mx-auto border border-[#e5e5e5]">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma fatura encontrada no histórico.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <SubscriptionInvoiceCard
                key={inv.id}
                invoice={inv}
                copiedPixId={copiedPixId}
                onCopyPix={onCopyPix}
                onRetryPayment={handleRetry}
                isExpired={isExpired}
              />
            ))}

            <LoadMoreButton
              hasMore={hasMore}
              isLoading={isFetching}
              onLoadMore={handleLoadMore}
            />
          </div>
        )}
      </BaseDialog.Body>
    </BaseDialog>
  );
}
