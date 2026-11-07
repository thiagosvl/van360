import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useDebounce } from "@/hooks/ui/useDebounce";
import {
  useAdminInvoices,
  useAdminInvoicesStats,
  useConfirmAdminInvoicePayment,
  useDeleteAdminInvoice,
} from "@/hooks/api/admin/useAdminInvoiceHooks";
import { AdminInvoiceItemDTO } from "@/types/dtos/admin-invoice.dto";
import { SubscriptionInvoiceStatus } from "@/types/enums";
import { moneyMask } from "@/utils/masks";
import { getNowBR } from "@/utils/dateUtils";

export function useAdminInvoicesViewModel() {
  const navigate = useNavigate();
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openImageFullscreen,
  } = useLayout();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [metodoFilter, setMetodoFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data: stats } = useAdminInvoicesStats();
  const { data, isLoading } = useAdminInvoices({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    metodo: metodoFilter || undefined,
    tipo: tipoFilter || undefined,
    vencimento_de: dataInicio || undefined,
    vencimento_ate: dataFim || undefined,
  });

  const confirmPaymentMutation = useConfirmAdminInvoicePayment();
  const deleteInvoiceMutation = useDeleteAdminInvoice();

  useEffect(() => {
    setPageTitle("Faturas");
  }, [setPageTitle]);

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const todayIso = useMemo(() => {
    const now = getNowBR();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const handleConfirmPayment = (fatura: AdminInvoiceItemDTO) => {
    openConfirmationDialog({
      title: "Registrar Pagamento Manual",
      description: `Deseja realmente confirmar e registrar o pagamento da fatura no valor de ${moneyMask(fatura.valor)}? Esta ação dará baixa na cobrança, renovará a assinatura do motorista e estenderá a validade do plano por 30 dias corridos.`,
      confirmText: "Sim, Confirmar Pagamento",
      variant: "default",
      onConfirm: async () => {
        try {
          await confirmPaymentMutation.mutateAsync(fatura.id);
          safeCloseDialog(closeConfirmationDialog);
        } catch {
        }
      },
    });
  };

  const handleDeleteInvoice = (fatura: AdminInvoiceItemDTO) => {
    openConfirmationDialog({
      title: "Excluir Fatura",
      description: `Deseja realmente excluir a fatura no valor de ${moneyMask(fatura.valor)}? Esta ação não poderá ser desfeita.`,
      confirmText: "Sim, Excluir Fatura",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteInvoiceMutation.mutateAsync(fatura.id);
          safeCloseDialog(closeConfirmationDialog);
        } catch {
        }
      },
    });
  };

  const handleCopyPix = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast.success("Código Copia e Cola do Pix copiado com sucesso!");
    } catch {
      toast.error("Não foi possível copiar o código Pix.");
    }
  };

  const pagoMesSubtext = useMemo(() => {
    const baseText = `${stats?.pagoMesQtd ?? 0} liquidadas no mês`;
    if (stats?.aguardandoRepasseValor && stats.aguardandoRepasseValor > 0) {
      return `${baseText} • +${moneyMask(stats.aguardandoRepasseValor)} em repasse (D+${stats.diasRetencaoCartao || 30})`;
    }
    return baseText;
  }, [stats]);

  const selectStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  return {
    navigate,
    openImageFullscreen,
    search,
    setSearch,
    statusFilter,
    selectStatusFilter,
    metodoFilter,
    setMetodoFilter,
    tipoFilter,
    setTipoFilter,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    page,
    setPage,
    stats,
    invoices,
    total,
    totalPages,
    isLoading,
    todayIso,
    pagoMesSubtext,
    isMutating: confirmPaymentMutation.isPending || deleteInvoiceMutation.isPending,
    handleConfirmPayment,
    handleDeleteInvoice,
    handleCopyPix,
    SubscriptionInvoiceStatus,
  };
}
