import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Share2,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Gift,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  ArrowRight,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminPeriodFilter } from "@/components/ui/AdminPeriodFilter";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import { useAdminReferrals, useRemoveUserReferralAdmin } from "@/hooks/api/adminHooks";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { IndicacaoStatus, SubscriptionStatus } from "@/types/enums";
import { ROUTES } from "@/constants/routes";
import { phoneMask } from "@/utils/masks";
import { formatSafeBrazilianDate, toStartOfDayISO, toEndOfDayISO } from "@/utils/dateUtils";
import { openBrowserLink } from "@/utils/browser";
import { buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import type { ReferralItem } from "@/services/api/admin/admin-user.api";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "", label: "Todas as Indicações" },
  { value: IndicacaoStatus.PENDING, label: "Pendentes (Não Assinantes)" },
  { value: IndicacaoStatus.COMPLETED, label: "Convertidas (Assinantes)" },
];

interface ReferralDisplayInfo {
  badgeLabel: string;
  badgeClass: string;
  icon: typeof Clock;
  subtext: string;
}

function getReferralDisplayInfo(item: ReferralItem): ReferralDisplayInfo {
  const isCompleted = item.status === IndicacaoStatus.COMPLETED;
  if (isCompleted) {
    return {
      badgeLabel: "Convertido",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2,
      subtext: "+30 dias concedidos",
    };
  }

  const subStatus = item.indicado?.assinatura_status;
  const trialEndsAt = item.indicado?.assinatura_trial_ends_at;

  const isExpiredOrCanceled =
    subStatus === SubscriptionStatus.EXPIRED ||
    subStatus === SubscriptionStatus.CANCELED;

  if (isExpiredOrCanceled) {
    return {
      badgeLabel: "Ainda não assinou",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: Clock,
      subtext: subStatus === SubscriptionStatus.CANCELED ? "Assinatura cancelada" : "Teste expirado",
    };
  }

  if (subStatus === SubscriptionStatus.ACTIVE) {
    return {
      badgeLabel: "Assinante Ativo",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: CheckCircle2,
      subtext: "Assinatura ativa",
    };
  }

  const daysLeft = SubscriptionUtils.calculateTrialDaysLeft(trialEndsAt);

  if (daysLeft !== null) {
    if (daysLeft <= 0 && trialEndsAt && new Date(trialEndsAt).getTime() < Date.now()) {
      return {
        badgeLabel: "Ainda não assinou",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: Clock,
        subtext: "Teste expirado",
      };
    }

    if (daysLeft === 0) {
      return {
        badgeLabel: "Em Teste (Trial)",
        badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        icon: Clock,
        subtext: "Último dia de teste",
      };
    }

    if (daysLeft === 1) {
      return {
        badgeLabel: "Em Teste (Trial)",
        badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        icon: Clock,
        subtext: "1 dia restante de teste",
      };
    }

    return {
      badgeLabel: "Em Teste (Trial)",
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      icon: Clock,
      subtext: `${daysLeft} dias restantes de teste`,
    };
  }

  return {
    badgeLabel: "Em Teste (Trial)",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    icon: Clock,
    subtext: "Aguardando 1º pagamento",
  };
}

export default function AdminReferrals() {
  const navigate = useNavigate();
  const {
    setPageTitle,
    openAdminConfigureReferralDialog,
    openConfirmationDialog,
    openImageFullscreen,
  } = useLayout();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data, isLoading, isFetching, refetch } = useAdminReferrals({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: (statusFilter as IndicacaoStatus) || undefined,
    data_inicio: dataInicio ? toStartOfDayISO(dataInicio) : undefined,
    data_fim: dataFim ? toEndOfDayISO(dataFim) : undefined,
  });

  const removeReferralMutation = useRemoveUserReferralAdmin();

  useEffect(() => {
    setPageTitle("Indicações");
  }, [setPageTitle]);

  const referrals = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const stats = data?.stats ?? {
    total: 0,
    concluidas: 0,
    pendentes: 0,
    taxaConversao: 0,
    diasBonusConcedidos: 0,
  };

  const kpiCards = useMemo(() => {
    const isTotalSelected = statusFilter === "";
    const isPendingSelected = statusFilter === IndicacaoStatus.PENDING;
    const isCompletedSelected = statusFilter === IndicacaoStatus.COMPLETED;

    return [
      {
        key: "total",
        title: "Total de indicações",
        value: stats.total,
        subtext: "Cadastros realizados via convite",
        cardBorder: isTotalSelected
          ? "border-primary shadow-xs ring-2 ring-primary/80"
          : "border-border shadow-xs",
        iconBg: "bg-primary/10 text-primary border-primary/20",
        icon: <Share2 className="h-5 w-5" />,
        isSelected: isTotalSelected,
        onClick: () => {
          setStatusFilter("");
          setPage(1);
        },
      },
      {
        key: "pending",
        title: "Em teste / não assinantes",
        value: stats.pendentes,
        subtext: "Aguardando 1ª mensalidade",
        cardBorder: isPendingSelected
          ? "border-amber-500 shadow-xs ring-2 ring-amber-500/80"
          : "border-amber-500/30 shadow-xs",
        iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: <Clock className="h-5 w-5" />,
        isSelected: isPendingSelected,
        onClick: () => {
          setStatusFilter(IndicacaoStatus.PENDING);
          setPage(1);
        },
      },
      {
        key: "completed",
        title: "Convertidos em assinantes",
        value: stats.concluidas,
        subtext: "Pagaram a 1ª mensalidade",
        cardBorder: isCompletedSelected
          ? "border-emerald-500 shadow-xs ring-2 ring-emerald-500/80"
          : "border-emerald-500/30 shadow-xs",
        iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: <CheckCircle2 className="h-5 w-5" />,
        isSelected: isCompletedSelected,
        onClick: () => {
          setStatusFilter(IndicacaoStatus.COMPLETED);
          setPage(1);
        },
      },
      {
        key: "taxa",
        title: "Taxa de conversão",
        value: `${stats.taxaConversao}%`,
        subtext: `${stats.concluidas} de ${stats.total} indicados convertidos`,
        cardBorder: "border-sky-500/30 shadow-xs",
        iconBg: "bg-sky-500/10 text-sky-500 border-sky-500/20",
        icon: <UserPlus className="h-5 w-5" />,
        isSelected: false,
      },
      {
        key: "bonus",
        title: "Bônus gerado",
        value: `${stats.diasBonusConcedidos} dias`,
        subtext:
          stats.diasBonusConcedidos === 0
            ? "0 meses grátis acumulados"
            : `~${Math.round(stats.diasBonusConcedidos / 30)} meses grátis aos motoristas`,
        cardBorder: "border-purple-500/30 shadow-xs",
        iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        icon: <Gift className="h-5 w-5" />,
        isSelected: false,
      },
    ];
  }, [stats, statusFilter]);

  const handleOpenWhatsApp = (phone?: string | null, name?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    const message = name ? `Olá ${name}!` : "Olá!";
    openBrowserLink(buildWhatsAppUrl(cleanPhone, message));
  };

  const handleUnlinkReferral = (indicadoId: string, indicadoNome: string) => {
    openConfirmationDialog({
      title: "Desvincular Indicador",
      description: `Tem certeza que deseja remover o vínculo de indicação de ${indicadoNome}?`,
      confirmText: "Sim, Desvincular",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await removeReferralMutation.mutateAsync(indicadoId);
      },
    });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground tracking-tight flex items-center gap-2.5">
            <Share2 className="h-6 w-6 text-primary" />
            <span>Indicações</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
            Gestão unificada de quem indicou, quem foi indicado, situação cadastral e bonificações.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-9 px-3.5 rounded-lg border-border bg-card text-foreground hover:bg-secondary text-xs font-medium gap-2 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin text-primary")} />
          <span>Atualizar</span>
        </Button>
      </div>

      <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 lg:grid lg:grid-cols-5 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0 lg:mb-0 touch-pan-x">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.key}
            onClick={kpi.onClick}
            className={cn(
              "w-[185px] sm:w-[200px] shrink-0 lg:w-auto lg:shrink flex flex-col",
              kpi.onClick && "cursor-pointer transition-transform hover:scale-[1.02]"
            )}
          >
            <AdminKpiCard
              title={kpi.title}
              value={kpi.value}
              subtext={kpi.subtext}
              cardBorder={kpi.cardBorder}
              iconBg={kpi.iconBg}
              icon={kpi.icon}
              className="h-full flex flex-col justify-between"
            />
          </div>
        ))}
      </div>

      <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou email do indicador ou indicado..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-9 h-9 w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="w-full">
                <AdminPeriodFilter
                  defaultPreset="tudo"
                  startDate={dataInicio}
                  endDate={dataFim}
                  onChange={(start, end) => {
                    setDataInicio(start);
                    setDataFim(end);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(f.value);
                    setPage(1);
                  }}
                  className={`rounded-lg text-xs font-medium whitespace-nowrap h-9 px-3 transition-all ${
                    statusFilter === f.value
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-xs font-semibold text-slate-400">Carregando indicações...</p>
            </div>
          ) : referrals.length === 0 ? (
            <AdminEmptyState
              icon={Share2}
              title="Nenhuma indicação encontrada"
              description={
                search || statusFilter !== "" || dataInicio || dataFim
                  ? "Nenhum registro corresponde aos filtros ou busca selecionados."
                  : "Ainda não há indicações registradas no app."
              }
            />
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto [scrollbar-width:thin]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground">
                      <th className="pb-3 px-2">Motorista indicador (quem indicou)</th>
                      <th className="pb-3 text-center w-8">
                        <ArrowRight className="h-4 w-4 text-muted-foreground/60 mx-auto" />
                      </th>
                      <th className="pb-3 px-2">Motorista indicado (quem foi indicado)</th>
                      <th className="pb-3 px-2">Data</th>
                      <th className="pb-3 px-2">Status da indicação</th>
                      <th className="pb-3 px-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((item) => {
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-border/40 hover:bg-secondary/40 transition-colors"
                        >
                          <td className="py-3.5 px-2">
                            {item.indicador ? (
                              <div className="flex items-center gap-3">
                                {item.indicador.logo_url?.trim() ? (
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                      openImageFullscreen({
                                        imageUrl: item.indicador!.logo_url!,
                                        alt: item.indicador!.nome,
                                      })
                                    }
                                    className="h-10 w-10 rounded-xl bg-card border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                                  >
                                    <img
                                      src={item.indicador.logo_url}
                                      alt={item.indicador.nome}
                                      className="h-full w-full object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                                    {item.indicador.nome.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <Link
                                    to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicador.id}`}
                                    className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors block truncate max-w-[200px]"
                                  >
                                    {item.indicador.nome}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      {phoneMask(item.indicador.telefone) || "—"}
                                    </span>
                                    {item.indicador.telefone && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenWhatsApp(item.indicador!.telefone, item.indicador!.nome)
                                        }
                                        className="text-[#25D366] hover:opacity-80 transition-opacity p-0.5 cursor-pointer"
                                        title="Abrir WhatsApp"
                                      >
                                        <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Indicador não identificado</span>
                            )}
                          </td>

                          <td className="py-3.5 text-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground/60 mx-auto" />
                          </td>

                          <td className="py-3.5 px-2">
                            {item.indicado ? (
                              <div className="flex items-center gap-3">
                                {item.indicado.logo_url?.trim() ? (
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                      openImageFullscreen({
                                        imageUrl: item.indicado!.logo_url!,
                                        alt: item.indicado!.nome,
                                      })
                                    }
                                    className="h-10 w-10 rounded-xl bg-card border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                                  >
                                    <img
                                      src={item.indicado.logo_url}
                                      alt={item.indicado.nome}
                                      className="h-full w-full object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-xl bg-secondary border border-border text-muted-foreground font-semibold text-xs flex items-center justify-center shrink-0">
                                    {item.indicado.nome.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado.id}`}
                                      className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors block truncate max-w-[200px]"
                                    >
                                      {item.indicado.nome}
                                    </Link>
                                    {item.indicado.assinatura_status && (
                                      <SubscriptionStatusBadge
                                        status={item.indicado.assinatura_status as SubscriptionStatus}
                                        dataVencimento={item.indicado.assinatura_data_vencimento}
                                      />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      {phoneMask(item.indicado.telefone) || "—"}
                                    </span>
                                    {item.indicado.telefone && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenWhatsApp(item.indicado!.telefone, item.indicado!.nome)
                                        }
                                        className="text-[#25D366] hover:opacity-80 transition-opacity p-0.5 cursor-pointer"
                                        title="Abrir WhatsApp"
                                      >
                                        <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Indicado não identificado</span>
                            )}
                          </td>

                          <td className="py-3.5 px-2">
                            <span className="text-xs text-muted-foreground font-mono block">
                              {formatSafeBrazilianDate(item.created_at)}
                            </span>
                          </td>

                          <td className="py-3.5 px-2">
                            {(() => {
                              const statusInfo = getReferralDisplayInfo(item);
                              const StatusIcon = statusInfo.icon;
                              return (
                                <div className="space-y-0.5">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border",
                                      statusInfo.badgeClass
                                    )}
                                  >
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    <span>{statusInfo.badgeLabel}</span>
                                  </span>
                                  <span className="block text-[11px] text-muted-foreground font-medium">
                                    {statusInfo.subtext}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.indicado && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      openAdminConfigureReferralDialog({
                                        userId: item.indicado!.id,
                                        userName: item.indicado!.nome,
                                        currentIndicadorId: item.indicador?.id,
                                        currentIndicadorNome: item.indicador?.nome,
                                      })
                                    }
                                    className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary text-xs"
                                    title="Alterar indicador"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnlinkReferral(item.indicado!.id, item.indicado!.nome)}
                                    className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
                                    title="Desvincular indicação"
                                    disabled={removeReferralMutation.isPending}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado!.id}`)
                                    }
                                    className="h-8 w-8 p-0 rounded-xl text-primary hover:text-primary/80 hover:bg-primary/10 text-xs"
                                    title="Ver detalhes do motorista"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-3">
                {referrals.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-secondary/30 rounded-2xl border border-border/80 space-y-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                        <div>
                          <span className="text-[11px] font-medium text-muted-foreground block">
                            Data da indicação
                          </span>
                          <span className="text-xs font-mono text-foreground font-medium">
                            {formatSafeBrazilianDate(item.created_at)}
                          </span>
                        </div>

                        <div>
                          {(() => {
                            const statusInfo = getReferralDisplayInfo(item);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <div className="flex flex-col items-end">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-medium border",
                                    statusInfo.badgeClass
                                  )}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  <span>{statusInfo.badgeLabel}</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                  {statusInfo.subtext}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-secondary/60 border border-border/60 space-y-1.5">
                          <span className="text-[11px] font-medium text-primary">
                            Quem indicou (indicador)
                          </span>
                          {item.indicador ? (
                            <div>
                              <Link
                                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicador.id}`}
                                className="font-semibold text-sm text-foreground hover:text-primary block truncate"
                              >
                                {item.indicador.nome}
                              </Link>
                              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground font-mono">
                                <span>{phoneMask(item.indicador.telefone) || "—"}</span>
                                {item.indicador.telefone && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenWhatsApp(item.indicador!.telefone, item.indicador!.nome)
                                    }
                                    className="text-[#25D366] hover:opacity-80 p-1 cursor-pointer"
                                  >
                                    <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic block">Não identificado</span>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-secondary/60 border border-border/60 space-y-1.5">
                          <span className="text-[11px] font-medium text-primary">
                            Quem foi indicado (novo motorista)
                          </span>
                          {item.indicado ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado.id}`}
                                  className="font-semibold text-sm text-foreground hover:text-primary block truncate"
                                >
                                  {item.indicado.nome}
                                </Link>
                                {item.indicado.assinatura_status && (
                                  <SubscriptionStatusBadge
                                    status={item.indicado.assinatura_status as SubscriptionStatus}
                                    dataVencimento={item.indicado.assinatura_data_vencimento}
                                  />
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground font-mono">
                                <span>{phoneMask(item.indicado.telefone) || "—"}</span>
                                {item.indicado.telefone && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenWhatsApp(item.indicado!.telefone, item.indicado!.nome)
                                    }
                                    className="text-[#25D366] hover:opacity-80 p-1 cursor-pointer"
                                  >
                                    <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic block">Não identificado</span>
                          )}
                        </div>
                      </div>

                      {item.indicado && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openAdminConfigureReferralDialog({
                                userId: item.indicado!.id,
                                userName: item.indicado!.nome,
                                currentIndicadorId: item.indicador?.id,
                                currentIndicadorNome: item.indicador?.nome,
                              })
                            }
                            className="h-8 px-2.5 rounded-xl border-border bg-card text-xs font-medium text-foreground gap-1.5"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Alterar</span>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnlinkReferral(item.indicado!.id, item.indicado!.nome)}
                            disabled={removeReferralMutation.isPending}
                            className="h-8 px-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-xs font-medium gap-1.5"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Desvincular</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado!.id}`)}
                            className="h-8 px-2.5 rounded-xl text-primary hover:bg-primary/10 text-xs font-medium gap-1.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Ver perfil</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted-foreground">
                  <span>
                    Página {page} de {totalPages} ({total} indicações no total)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-9 px-3 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-9 px-3 rounded-lg border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40 text-xs"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
