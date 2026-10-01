import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminInvoiceApi } from "@/services/api/admin/admin-invoice.api";
import { ListAdminInvoicesParams } from "@/types/dtos/admin-invoice.dto";

export const ADMIN_INVOICE_KEYS = {
  all: ["admin", "invoices"] as const,
  list: (params?: ListAdminInvoicesParams) => ["admin", "invoices", "list", params] as const,
  stats: () => ["admin", "invoices", "stats"] as const,
};

export function useAdminInvoices(params?: ListAdminInvoicesParams) {
  return useQuery({
    queryKey: ADMIN_INVOICE_KEYS.list(params),
    queryFn: () => adminInvoiceApi.listInvoices(params),
  });
}

export function useAdminInvoicesStats() {
  return useQuery({
    queryKey: ADMIN_INVOICE_KEYS.stats(),
    queryFn: adminInvoiceApi.getInvoiceStats,
  });
}

export function useConfirmAdminInvoicePayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => adminInvoiceApi.confirmPayment(invoiceId),
    onSuccess: async () => {
      toast.success("Pagamento confirmado e assinatura renovada com sucesso!");
      await qc.invalidateQueries({ queryKey: ADMIN_INVOICE_KEYS.all });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { error?: string; message?: string } } };
      const msg =
        apiError?.response?.data?.error ||
        apiError?.response?.data?.message ||
        "Erro ao confirmar pagamento da fatura.";
      toast.error(msg);
    },
  });
}

export function useDeleteAdminInvoice() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => adminInvoiceApi.deleteInvoice(invoiceId),
    onSuccess: async () => {
      toast.success("Fatura excluída com sucesso.");
      await qc.invalidateQueries({ queryKey: ADMIN_INVOICE_KEYS.all });
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { error?: string; message?: string } } };
      const msg =
        apiError?.response?.data?.error ||
        apiError?.response?.data?.message ||
        "Erro ao excluir fatura.";
      toast.error(msg);
    },
  });
}
