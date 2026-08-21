import { useState, useEffect, useCallback } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { useSubscriptionInvoicesPaginated } from "@/hooks/api/useSubscription";
import { SubscriptionInvoice } from "@/types/subscription";
import { SubscriptionInvoiceCard } from "./SubscriptionInvoiceCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  copiedPixId?: string | null;
  onCopyPix?: (pixCode: string, invoiceId: string) => void;
  onRetryPayment?: (invoice?: SubscriptionInvoice) => void;
}

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100, 500];

export function SubscriptionInvoicesDialog({
  open,
  onOpenChange,
  userId,
  copiedPixId,
  onCopyPix,
  onRetryPayment,
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
      onOpenChange(false);
      onRetryPayment?.(invoice);
    },
    [onOpenChange, onRetryPayment]
  );

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="2xl"
      description="Histórico completo de cobranças e faturas da assinatura"
    >
      <BaseDialog.Header
        title="Histórico de Faturas"
        icon={<Receipt className="w-5 h-5 text-primary" />}
        onClose={() => onOpenChange(false)}
      />

      <BaseDialog.Body className="space-y-3 p-4 sm:p-6 bg-slate-50/50 min-h-[360px] max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[22px] border border-slate-100 p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-5 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-48 rounded-lg" />
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white rounded-[22px] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
              <Clock className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">
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
              />
            ))}
          </div>
        )}
      </BaseDialog.Body>

      {totalItems > 0 && (
        <BaseDialog.Footer className="flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 bg-white border-t border-slate-100">
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Exibindo <strong className="text-[#1a3a5c] font-bold">{from}–{to}</strong> de{" "}
              <strong className="text-[#1a3a5c] font-bold">{totalItems}</strong>
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Por página:</span>
              <Select
                value={String(limit)}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[72px] text-xs font-bold text-[#1a3a5c] border-slate-200 bg-slate-50/50 rounded-lg focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder={String(limit)} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-lg">
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={String(opt)} className="text-xs font-medium cursor-pointer">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrevious || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-[#1a3a5c] hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
              Anterior
            </Button>

            <span className="text-[11px] font-bold text-[#1a3a5c] px-2 py-1 rounded-md bg-slate-100/70">
              {page} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-[#1a3a5c] hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40"
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
