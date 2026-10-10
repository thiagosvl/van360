import { useState, useEffect, useCallback } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { useSubscriptionInvoicesPaginated } from "@/hooks/api/useSubscription";
import { SubscriptionInvoice } from "@/types/subscription";
import { SubscriptionInvoiceCard } from "./SubscriptionInvoiceCard";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Receipt, ChevronLeft, ChevronRight, Clock } from "lucide-react";
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

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100, 500];

export function SubscriptionInvoicesDialog({
  open,
  onOpenChange,
  userId,
  copiedPixId,
  onCopyPix,
  onRetryPayment,
  isExpired,
}: SubscriptionInvoicesDialogProps) {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);

  const { data, isLoading, isFetching, refetch } = useSubscriptionInvoicesPaginated({
    userId,
    page,
    limit,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setPage(1);
      refetch();
    }
  }, [open, refetch]);

  const invoices = data?.list || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || Math.max(1, Math.ceil(totalItems / limit));

  const from = Math.min((page - 1) * limit + 1, totalItems);
  const to = Math.min(page * limit, totalItems);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

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
          </div>
        )}
      </BaseDialog.Body>

      {totalItems > 0 && (
        <BaseDialog.Footer className="flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 bg-[#f5f5f5]/80 border-t border-[#e5e5e5]">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              Exibindo <strong className="text-[#0a0a0a] font-semibold">{from}–{to}</strong> de{" "}
              <strong className="text-[#0a0a0a] font-semibold">{totalItems}</strong>
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">Por página:</span>
              <NativeSelect
                value={String(limit)}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-8 w-[72px] text-xs font-medium text-[#0a0a0a] border-[#e5e5e5] bg-white rounded-[14px] pr-7 shadow-xs"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={String(opt)}>
                    {opt}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrevious || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 rounded-[14px] border-[#e5e5e5] bg-white text-xs font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] active:scale-95 transition-all disabled:opacity-40 shadow-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
              Anterior
            </Button>

            <span className="text-[11px] font-medium text-[#0a0a0a] px-2.5 py-1 rounded-[10px] bg-white border border-[#e5e5e5] shadow-xs">
              {page} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 rounded-[14px] border-[#e5e5e5] bg-white text-xs font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] active:scale-95 transition-all disabled:opacity-40 shadow-xs"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
            </Button>
          </div>
        </BaseDialog.Footer>
      )}
    </BaseDialog>
  );
}
