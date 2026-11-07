import { useMemo } from "react";
import { Receipt, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { Banner } from "@/components/ui/Banner";
import { ROUTES } from "@/constants/routes";
import { useAdminInvoicesViewModel } from "@/hooks";
import { moneyMask } from "@/utils/masks";
import { AdminInvoicesFilters } from "@/components/features/admin/invoices/AdminInvoicesFilters";
import { AdminInvoicesTable } from "@/components/features/admin/invoices/AdminInvoicesTable";

export default function AdminInvoices() {
  const vm = useAdminInvoicesViewModel();
  const { stats, statusFilter, SubscriptionInvoiceStatus } = vm;

  const kpiCards = useMemo(() => {
    const proximos7DiasTexto = stats?.proximos7DiasQtd
      ? ` • ${moneyMask(stats.proximos7DiasValor)} próx. 7 dias (${stats.proximos7DiasQtd})`
      : "";

    return [
      {
        key: "pago_mes",
        title: "Recebido no mês",
        value: moneyMask(stats?.pagoMesValor ?? 0),
        subtext: vm.pagoMesSubtext,
        cardBorder:
          statusFilter === SubscriptionInvoiceStatus.PAID
            ? "border-emerald-500 shadow-xs ring-2 ring-emerald-500/80"
            : "border-emerald-500/30 shadow-xs",
        iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: <CheckCircle className="h-5 w-5" />,
        onClick: () => vm.selectStatusFilter(SubscriptionInvoiceStatus.PAID),
      },
      {
        key: "open",
        title: "A receber em aberto",
        value: moneyMask(stats?.totalAbertoValor ?? 0),
        subtext: `${stats?.totalAbertoQtd ?? 0} faturas pendentes`,
        cardBorder:
          statusFilter === "open"
            ? "border-primary shadow-xs ring-2 ring-primary/80"
            : "border-border shadow-xs",
        iconBg: "bg-primary/10 text-primary border-primary/20",
        icon: <Clock className="h-5 w-5" />,
        onClick: () => vm.selectStatusFilter("open"),
      },
      {
        key: "hoje",
        title: "Vencem hoje",
        value: moneyMask(stats?.vencemHojeValor ?? 0),
        subtext: `${stats?.vencemHojeQtd ?? 0} hoje${proximos7DiasTexto}`,
        cardBorder:
          statusFilter === "hoje"
            ? "border-amber-500 shadow-xs ring-2 ring-amber-500/80"
            : "border-amber-500/30 shadow-xs",
        iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: <Receipt className="h-5 w-5" />,
        onClick: () => vm.selectStatusFilter("hoje"),
      },
      {
        key: "vencidas",
        title: "Em atraso (vencidas)",
        value: moneyMask(stats?.totalVencidasValor ?? 0),
        subtext: `${stats?.totalVencidasQtd ?? 0} faturas vencidas`,
        cardBorder:
          statusFilter === "vencidas"
            ? "border-destructive shadow-xs ring-2 ring-destructive/80"
            : "border-destructive/30 shadow-xs",
        iconBg: "bg-destructive/10 text-destructive border-destructive/20",
        icon: <AlertTriangle className="h-5 w-5" />,
        onClick: () => vm.selectStatusFilter("vencidas"),
      },
    ];
  }, [stats, statusFilter, vm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground tracking-tight flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-primary" />
            Faturas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestão operacional de cobranças de assinaturas e recebíveis pré-pagos
          </p>
        </div>
      </div>

      {stats && stats.totalVencidasQtd > 0 && (
        <Banner
          variant="danger"
          description={`Há ${stats.totalVencidasQtd} fatura(s) em atraso totalizando ${moneyMask(stats.totalVencidasValor)} aguardando baixa ou contato.`}
        />
      )}

      <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0 lg:mb-0 touch-pan-x">
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

      <AdminInvoicesFilters
        search={vm.search}
        onSearchChange={(val) => {
          vm.setSearch(val);
          vm.setPage(1);
        }}
        statusFilter={vm.statusFilter}
        onStatusFilterChange={vm.selectStatusFilter}
        metodoFilter={vm.metodoFilter}
        onMetodoFilterChange={(val) => {
          vm.setMetodoFilter(val);
          vm.setPage(1);
        }}
        tipoFilter={vm.tipoFilter}
        onTipoFilterChange={(val) => {
          vm.setTipoFilter(val);
          vm.setPage(1);
        }}
        dataInicio={vm.dataInicio}
        dataFim={vm.dataFim}
        onPeriodChange={(start, end) => {
          vm.setDataInicio(start);
          vm.setDataFim(end);
          vm.setPage(1);
        }}
      />

      <AdminInvoicesTable
        invoices={vm.invoices}
        isLoading={vm.isLoading}
        todayIso={vm.todayIso}
        page={vm.page}
        totalPages={vm.totalPages}
        total={vm.total}
        isMutating={vm.isMutating}
        onPageChange={vm.setPage}
        onCopyPix={vm.handleCopyPix}
        onConfirmPayment={vm.handleConfirmPayment}
        onDeleteInvoice={vm.handleDeleteInvoice}
        onViewDriverDetails={(usuarioId) =>
          vm.navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${usuarioId}?tab=cobrancas`)
        }
        onOpenImage={vm.openImageFullscreen}
      />
    </div>
  );
}
