import { apiClient } from "../client";
import {
  AdminInvoicesListResponseDTO,
  AdminInvoiceStatsResponseDTO,
  ListAdminInvoicesParams,
} from "@/types/dtos/admin-invoice.dto";

const BASE = "/admin";

export const adminInvoiceApi = {
  listInvoices: (params?: ListAdminInvoicesParams) =>
    apiClient.get<AdminInvoicesListResponseDTO>(`${BASE}/invoices`, { params }).then((r) => r.data),

  getInvoiceStats: () =>
    apiClient.get<AdminInvoiceStatsResponseDTO>(`${BASE}/invoices/stats`).then((r) => r.data),

  confirmPayment: (invoiceId: string) =>
    apiClient.post<{ success: boolean; message: string }>(`${BASE}/invoices/${invoiceId}/confirm-payment`).then((r) => r.data),

  deleteInvoice: (invoiceId: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`${BASE}/invoices/${invoiceId}`).then((r) => r.data),
};
