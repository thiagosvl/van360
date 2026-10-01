import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CheckCircle2,
  Trash2,
  Eye,
  QrCode,
  Copy,
  Clock,
  AlertTriangle,
  Calendar,
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { Banner } from "@/components/ui/Banner";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { ROUTES } from "@/constants/routes";
import { useDebounce } from "@/hooks/ui/useDebounce";
import {
  useAdminInvoices,
  useAdminInvoicesStats,
  useConfirmAdminInvoicePayment,
  useDeleteAdminInvoice,
} from "@/hooks/api/admin/useAdminInvoiceHooks";
import { AdminInvoiceItemDTO } from "@/types/dtos/admin-invoice.dto";
import { SubscriptionInvoiceStatus, CheckoutPaymentMethod } from "@/types/enums";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";
import { moneyMask, phoneMask } from "@/utils/masks";
import { formatSafeBrazilianDate, getNowBR } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_FILTERS = [
  { value: "open", label: "Em Aberto" },
  { value: "vencidas", label: "Vencidas" },
  { value: "hoje", label: "Vencem Hoje" },
  { value: "", label: "Todas" },
  { value: SubscriptionInvoiceStatus.PAID, label: "Pagas" },
  { value: SubscriptionInvoiceStatus.FAILED, label: "Falhas" },
  { value: SubscriptionInvoiceStatus.CANCELED, label: "Canceladas" },
];

const METODO_OPTIONS = [
  { value: "", label: "Todos os Métodos" },
  { value: CheckoutPaymentMethod.PIX, label: "Pix" },
  { value: CheckoutPaymentMethod.CREDIT_CARD, label: "Cartão de Crédito" },
];

const TIPO_OPTIONS = [
  { value: "", label: "Todos os Tipos" },
  { value: "conversao_trial", label: "Conversão Trial (Manual)" },
  { value: "renovacao", label: "Renovação de Assinatura" },
];

export default function AdminInvoices() {
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

  const kpiCards = useMemo(() => {
    return [
      {
        key: "open",
        title: "A RECEBER EM ABERTO",
        value: moneyMask(stats?.totalAbertoValor ?? 0),
        subtext: `${stats?.totalAbertoQtd ?? 0} faturas pendentes`,
        cardBorder:
          statusFilter === "open"
            ? "border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/80"
            : "border-blue-500/40 shadow-blue-500/10",
        iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: <Clock className="h-5 w-5" />,
        isSelected: statusFilter === "open",
        onClick: () => {
          setStatusFilter("open");
          setPage(1);
        },
      },
      {
        key: "vencidas",
        title: "EM ATRASO (VENCIDAS)",
        value: moneyMask(stats?.totalVencidasValor ?? 0),
        subtext: `${stats?.totalVencidasQtd ?? 0} faturas vencidas`,
        cardBorder:
          statusFilter === "vencidas"
            ? "border-rose-500 shadow-rose-500/20 ring-2 ring-rose-500/80"
            : "border-rose-500/40 shadow-rose-500/10",
        iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        icon: <AlertTriangle className="h-5 w-5" />,
        isSelected: statusFilter === "vencidas",
        onClick: () => {
          setStatusFilter("vencidas");
          setPage(1);
        },
      },
      {
        key: "hoje",
        title: "VENCEM HOJE",
        value: moneyMask(stats?.vencemHojeValor ?? 0),
        subtext: `${stats?.vencemHojeQtd ?? 0} faturas hoje`,
        cardBorder:
          statusFilter === "hoje"
            ? "border-amber-500 shadow-amber-500/20 ring-2 ring-amber-500/80"
            : "border-amber-500/40 shadow-amber-500/10",
        iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: <Receipt className="h-5 w-5" />,
        isSelected: statusFilter === "hoje",
        onClick: () => {
          setStatusFilter("hoje");
          setPage(1);
        },
      },
      {
        key: "proximos7dias",
        title: "PRÓXIMOS 7 DIAS",
        value: moneyMask(stats?.proximos7DiasValor ?? 0),
        subtext: `${stats?.proximos7DiasQtd ?? 0} faturas a vencer`,
        cardBorder:
          statusFilter === "proximos7dias"
            ? "border-sky-500 shadow-sky-500/20 ring-2 ring-sky-500/80"
            : "border-sky-500/40 shadow-sky-500/10",
        iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        icon: <ShieldCheck className="h-5 w-5" />,
        isSelected: statusFilter === "proximos7dias",
        onClick: () => {
          setStatusFilter("proximos7dias");
          setPage(1);
        },
      },
      {
        key: "pago_mes",
        title: "RECEBIDO NO MÊS",
        value: moneyMask(stats?.pagoMesValor ?? 0),
        subtext: `${stats?.pagoMesQtd ?? 0} faturas quitadas`,
        cardBorder:
          statusFilter === SubscriptionInvoiceStatus.PAID
            ? "border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/80"
            : "border-emerald-500/40 shadow-emerald-500/10",
        iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: <CheckCircle className="h-5 w-5" />,
        isSelected: statusFilter === SubscriptionInvoiceStatus.PAID,
        onClick: () => {
          setStatusFilter(SubscriptionInvoiceStatus.PAID);
          setPage(1);
        },
      },
    ];
  }, [stats, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-blue-400" />
            Faturas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestão operacional de cobranças de assinaturas e recebíveis pré-pagos
          </p>
        </div>
      </div>

      {stats && stats.totalVencidasQtd > 0 && (
        <Banner variant="warning" className="border-rose-500/30 bg-rose-500/10 text-rose-300">
          Há {stats.totalVencidasQtd} fatura(s) em atraso totalizando {moneyMask(stats.totalVencidasValor)} aguardando baixa ou contato.
        </Banner>
      )}

      <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 lg:grid lg:grid-cols-5 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0 lg:mb-0 touch-pan-x">
        {kpiCards.map((card) => (
          <div
            key={card.key}
            className="w-[185px] sm:w-[200px] shrink-0 lg:w-auto lg:shrink flex flex-col"
          >
            <AdminKpiCard
              title={card.title}
              value={card.value}
              subtext={card.subtext}
              cardBorder={card.cardBorder}
              iconBg={card.iconBg}
              icon={card.icon}
              onClick={card.onClick}
              className="h-full flex flex-col justify-between"
            />
          </div>
        ))}
      </div>

      <Card className="border-slate-800/80 bg-[#131b2e]/60 shadow-xl backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por motorista, apelido, telefone ou email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-9 h-11 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-3 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(f.value);
                    setPage(1);
                  }}
                  className={`rounded-xl text-xs font-bold whitespace-nowrap h-9 px-3 transition-all ${
                    statusFilter === f.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30"
                      : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <select
                value={metodoFilter}
                onChange={(e) => {
                  setMetodoFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900/90 border border-slate-800 text-slate-200 text-xs h-9 rounded-xl px-3 outline-none focus:border-blue-500 w-full sm:w-auto"
              >
                {METODO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={tipoFilter}
                onChange={(e) => {
                  setTipoFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900/90 border border-slate-800 text-slate-200 text-xs h-9 rounded-xl px-3 outline-none focus:border-blue-500 w-full sm:w-auto"
              >
                {TIPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-slate-400 text-xs w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-[10px]">Vencimento:</span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => {
                    setDataInicio(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-900/90 border-slate-800 text-white text-xs h-9 rounded-xl w-full sm:w-32 focus-visible:ring-0"
                />
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => {
                    setDataFim(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-900/90 border-slate-800 text-white text-xs h-9 rounded-xl w-full sm:w-32 focus-visible:ring-0"
                />
                {(dataInicio || dataFim) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDataInicio("");
                      setDataFim("");
                      setPage(1);
                    }}
                    className="col-span-2 sm:col-span-1 h-8 px-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800/80 bg-[#131b2e]/60 shadow-xl backdrop-blur-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-400">Carregando faturas...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8">
              <AdminEmptyState
                icon={Receipt}
                title="Nenhuma fatura encontrada"
                description="Não há faturas correspondentes aos filtros selecionados no momento."
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/40">
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Motorista
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                        Conta
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tipo & Plano
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Método
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Vencimento
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                        Valor
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                        Status
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((f) => {
                      const vencimentoYmd = f.data_vencimento ? f.data_vencimento.slice(0, 10) : "";
                      const isAberto =
                        f.status === SubscriptionInvoiceStatus.PENDING ||
                        f.status === SubscriptionInvoiceStatus.FAILED;
                      const isVencida = isAberto && vencimentoYmd < todayIso;
                      const isHoje = isAberto && vencimentoYmd === todayIso;

                      return (
                        <tr
                          key={f.id}
                          className="border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {f.usuario.logo_url?.trim() ? (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() =>
                                    openImageFullscreen({
                                      imageUrl: f.usuario.logo_url!,
                                      alt: f.usuario.nome,
                                    })
                                  }
                                  className="h-10 w-10 rounded-xl bg-white border border-slate-700/50 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm cursor-pointer"
                                >
                                  <img
                                    src={f.usuario.logo_url}
                                    alt={f.usuario.nome}
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400 font-bold text-xs uppercase shadow-sm">
                                  {(f.usuario.apelido || f.usuario.nome || "M").slice(0, 2)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-100 truncate max-w-[200px]">
                                  {f.usuario.apelido || f.usuario.nome}
                                </p>
                                <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate max-w-[200px]">
                                  {f.usuario.nome}
                                </p>
                                {f.usuario.telefone && (
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    {phoneMask(f.usuario.telefone)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <SubscriptionStatusBadge status={f.assinatura?.status} />
                          </td>

                          <td className="py-3.5 px-4">
                            <div>
                              <p className="text-xs font-bold text-slate-200">
                                {f.plano?.nome || "Plano Mensal"}
                              </p>
                              <span
                                className={cn(
                                  "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider mt-0.5",
                                  f.tipo_fatura === "conversao_trial"
                                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                )}
                              >
                                {f.tipo_fatura === "conversao_trial"
                                  ? "Conversão Trial"
                                  : "Renovação"}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs text-slate-300 flex items-center gap-1.5">
                              {f.metodo_pagamento === CheckoutPaymentMethod.CREDIT_CARD ? (
                                <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                              ) : (
                                <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                              )}
                              {PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] ||
                                f.metodo_pagamento.toUpperCase()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span
                                className={cn(
                                  "text-xs font-bold block",
                                  isVencida
                                    ? "text-rose-400"
                                    : isHoje
                                    ? "text-amber-400"
                                    : "text-slate-300"
                                )}
                              >
                                {formatSafeBrazilianDate(f.data_vencimento)}
                              </span>
                              {isVencida && (
                                <span className="inline-block text-[9px] font-black uppercase text-rose-400">
                                  Em atraso
                                </span>
                              )}
                              {isHoje && (
                                <span className="inline-block text-[9px] font-black uppercase text-amber-400">
                                  Vence hoje
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span className="text-sm font-black text-white">
                              {moneyMask(f.valor)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <InvoiceStatusBadge status={f.status} />
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {f.pix_copy_paste && isAberto && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  title="Copiar código Pix"
                                  onClick={() => handleCopyPix(f.pix_copy_paste!)}
                                  className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}

                              {f.status !== SubscriptionInvoiceStatus.PAID && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  title="Registrar pagamento (Dar baixa)"
                                  disabled={
                                    confirmPaymentMutation.isPending ||
                                    deleteInvoiceMutation.isPending
                                  }
                                  onClick={() => handleConfirmPayment(f)}
                                  className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                title="Ver detalhes do motorista"
                                onClick={() =>
                                  navigate(
                                    `${ROUTES.PRIVATE.ADMIN.USERS}/${f.usuario_id}?tab=cobrancas`
                                  )
                                }
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                title="Excluir fatura"
                                disabled={
                                  deleteInvoiceMutation.isPending ||
                                  confirmPaymentMutation.isPending
                                }
                                onClick={() => handleDeleteInvoice(f)}
                                className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-slate-800/80">
                {invoices.map((f) => {
                  const vencimentoYmd = f.data_vencimento ? f.data_vencimento.slice(0, 10) : "";
                  const isAberto =
                    f.status === SubscriptionInvoiceStatus.PENDING ||
                    f.status === SubscriptionInvoiceStatus.FAILED;
                  const isVencida = isAberto && vencimentoYmd < todayIso;
                  const isHoje = isAberto && vencimentoYmd === todayIso;

                  return (
                    <div key={f.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {f.usuario.logo_url?.trim() ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                openImageFullscreen({
                                  imageUrl: f.usuario.logo_url!,
                                  alt: f.usuario.nome,
                                })
                              }
                              className="h-10 w-10 rounded-xl bg-white border border-slate-700/50 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
                            >
                              <img
                                src={f.usuario.logo_url}
                                alt={f.usuario.nome}
                                className="h-full w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400 font-bold text-xs uppercase shadow-sm">
                              {(f.usuario.apelido || f.usuario.nome || "M").slice(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-100 truncate">
                              {f.usuario.apelido || f.usuario.nome}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 truncate">
                              {f.usuario.nome}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <InvoiceStatusBadge status={f.status} />
                          <SubscriptionStatusBadge status={f.assinatura?.status} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Plano</p>
                          <p className="font-bold text-slate-200 truncate">
                            {f.plano?.nome || "Plano Mensal"}
                          </p>
                          <span className="text-[9px] text-blue-400 font-medium">
                            {f.tipo_fatura === "conversao_trial" ? "Conversão Trial" : "Renovação"}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Valor</p>
                          <p className="text-sm font-black text-white">{moneyMask(f.valor)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {f.metodo_pagamento === CheckoutPaymentMethod.CREDIT_CARD ? "Cartão" : "Pix"}
                          </p>
                        </div>

                        <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Vencimento:</span>
                          <span
                            className={cn(
                              "font-bold",
                              isVencida
                                ? "text-rose-400"
                                : isHoje
                                ? "text-amber-400"
                                : "text-slate-300"
                            )}
                          >
                            {formatSafeBrazilianDate(f.data_vencimento)}
                            {isVencida && " (Em atraso)"}
                            {isHoje && " (Hoje)"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        {f.pix_copy_paste && isAberto && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyPix(f.pix_copy_paste!)}
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
                            disabled={
                              confirmPaymentMutation.isPending || deleteInvoiceMutation.isPending
                            }
                            onClick={() => handleConfirmPayment(f)}
                            className="h-8 px-2.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl font-bold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Baixa
                          </Button>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${f.usuario_id}?tab=cobrancas`)
                          }
                          className="h-8 px-2.5 text-xs text-blue-400 hover:bg-blue-500/10 rounded-xl"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Detalhes
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={
                            deleteInvoiceMutation.isPending || confirmPaymentMutation.isPending
                          }
                          onClick={() => handleDeleteInvoice(f)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                  Mostrando {invoices.length} de {total} faturas (Página {page} de {totalPages})
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl h-8 px-3"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
