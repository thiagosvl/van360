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
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import { useAdminReferrals, useRemoveUserReferralAdmin } from "@/hooks/api/adminHooks";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { IndicacaoStatus, SubscriptionStatus } from "@/types/enums";
import { ROUTES } from "@/constants/routes";
import { phoneMask } from "@/utils/masks";
import { formatSafeBrazilianDate } from "@/utils/dateUtils";
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
    data_inicio: dataInicio ? `${dataInicio}T00:00:00` : undefined,
    data_fim: dataFim ? `${dataFim}T23:59:59` : undefined,
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
        title: "TOTAL DE INDICAÇÕES",
        value: stats.total,
        subtext: "Cadastros realizados via convite",
        cardBorder: isTotalSelected
          ? "border-purple-500 shadow-purple-500/20 ring-2 ring-purple-500/80"
          : "border-purple-500/40 shadow-purple-500/10",
        iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        icon: <Share2 className="h-5 w-5" />,
        isSelected: isTotalSelected,
        onClick: () => {
          setStatusFilter("");
          setPage(1);
        },
      },
      {
        key: "pending",
        title: "EM TESTE / NÃO ASSINANTES",
        value: stats.pendentes,
        subtext: "Aguardando 1ª mensalidade",
        cardBorder: isPendingSelected
          ? "border-amber-500 shadow-amber-500/20 ring-2 ring-amber-500/80"
          : "border-amber-500/40 shadow-amber-500/10",
        iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: <Clock className="h-5 w-5" />,
        isSelected: isPendingSelected,
        onClick: () => {
          setStatusFilter(IndicacaoStatus.PENDING);
          setPage(1);
        },
      },
      {
        key: "completed",
        title: "CONVERTIDOS EM ASSINANTES",
        value: stats.concluidas,
        subtext: "Pagaram a 1ª mensalidade",
        cardBorder: isCompletedSelected
          ? "border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/80"
          : "border-emerald-500/40 shadow-emerald-500/10",
        iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: <CheckCircle2 className="h-5 w-5" />,
        isSelected: isCompletedSelected,
        onClick: () => {
          setStatusFilter(IndicacaoStatus.COMPLETED);
          setPage(1);
        },
      },
      {
        key: "taxa",
        title: "TAXA DE CONVERSÃO",
        value: `${stats.taxaConversao}%`,
        subtext: `${stats.concluidas} de ${stats.total} indicados convertidos`,
        cardBorder: "border-blue-500/40 shadow-blue-500/10",
        iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: <UserPlus className="h-5 w-5" />,
        isSelected: false,
      },
      {
        key: "bonus",
        title: "BÔNUS GERADO",
        value: `${stats.diasBonusConcedidos} Dias`,
        subtext:
          stats.diasBonusConcedidos === 0
            ? "0 meses grátis acumulados"
            : `~${Math.round(stats.diasBonusConcedidos / 30)} meses grátis aos motoristas`,
        cardBorder: "border-fuchsia-500/40 shadow-fuchsia-500/10",
        iconBg: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
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
          <h1 className="text-xl sm:text-2xl font-black font-headline text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Share2 className="h-6 w-6 text-purple-400" />
            <span>Indicações</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
            Gestão unificada de quem indicou, quem foi indicado, situação cadastral e bonificações.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 px-4 rounded-xl border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold gap-2 self-start sm:self-auto shadow-md"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin text-purple-400")} />
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

      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar por nome, telefone ou email do indicador ou indicado..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-11 pr-10 h-11 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-0 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white p-0.5 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(f.value);
                    setPage(1);
                  }}
                  className={`rounded-xl text-xs font-bold whitespace-nowrap ${statusFilter === f.value
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                      : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="h-4 w-4 text-purple-400 shrink-0" />
              <span className="font-bold">Indicados entre:</span>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9 rounded-xl w-full sm:w-36"
              />
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border-slate-800 text-white text-xs h-9 rounded-xl w-full sm:w-36"
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
                  className="col-span-2 sm:col-span-1 h-9 px-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                >
                  Limpar Datas
                </Button>
              )}
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
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="pb-3">Motorista Indicador (Quem Indicou)</th>
                      <th className="pb-3 text-center w-8">
                        <ArrowRight className="h-4 w-4 text-slate-600 mx-auto" />
                      </th>
                      <th className="pb-3">Motorista Indicado (Quem Foi Indicado)</th>
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Status da Indicação</th>
                      <th className="pb-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((item) => {
                      const isCompleted = item.status === IndicacaoStatus.COMPLETED;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4">
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
                                    className="h-10 w-10 rounded-xl bg-white border border-slate-700/50 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm cursor-pointer"
                                  >
                                    <img
                                      src={item.indicador.logo_url}
                                      alt={item.indicador.nome}
                                      className="h-full w-full object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-xs flex items-center justify-center shrink-0">
                                    {item.indicador.nome.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <Link
                                    to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicador.id}`}
                                    className="text-sm font-bold text-slate-100 hover:text-purple-400 hover:underline transition-colors block truncate max-w-[200px]"
                                  >
                                    {item.indicador.nome}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {phoneMask(item.indicador.telefone) || "—"}
                                    </span>
                                    {item.indicador.telefone && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenWhatsApp(item.indicador!.telefone, item.indicador!.nome)
                                        }
                                        className="text-[#25D366] hover:opacity-80 transition-opacity p-0.5"
                                        title="Abrir WhatsApp"
                                      >
                                        <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Indicador não identificado</span>
                            )}
                          </td>

                          <td className="py-4 text-center">
                            <ArrowRight className="h-4 w-4 text-purple-500/60 mx-auto" />
                          </td>

                          <td className="py-4">
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
                                    className="h-10 w-10 rounded-xl bg-white border border-slate-700/50 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm cursor-pointer"
                                  >
                                    <img
                                      src={item.indicado.logo_url}
                                      alt={item.indicado.nome}
                                      className="h-full w-full object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                                    {item.indicado.nome.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado.id}`}
                                      className="text-sm font-bold text-slate-100 hover:text-blue-400 hover:underline transition-colors block truncate max-w-[200px]"
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
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {phoneMask(item.indicado.telefone) || "—"}
                                    </span>
                                    {item.indicado.telefone && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenWhatsApp(item.indicado!.telefone, item.indicado!.nome)
                                        }
                                        className="text-[#25D366] hover:opacity-80 transition-opacity p-0.5"
                                        title="Abrir WhatsApp"
                                      >
                                        <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Indicado não identificado</span>
                            )}
                          </td>

                          <td className="py-4">
                            <span className="text-xs text-slate-300 font-mono block">
                              {formatSafeBrazilianDate(item.created_at)}
                            </span>
                          </td>

                          <td className="py-4">
                            {(() => {
                              const statusInfo = getReferralDisplayInfo(item);
                              const StatusIcon = statusInfo.icon;
                              return (
                                <div className="space-y-0.5">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
                                      statusInfo.badgeClass
                                    )}
                                  >
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    <span>{statusInfo.badgeLabel}</span>
                                  </span>
                                  <span className="block text-[10px] text-slate-400 font-medium">
                                    {statusInfo.subtext}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          <td className="py-4 text-right">
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
                                    className="h-8 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                                    title="Alterar Indicador"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnlinkReferral(item.indicado!.id, item.indicado!.nome)}
                                    className="h-8 px-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs"
                                    title="Desvincular Indicação"
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
                                    className="h-8 px-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs"
                                    title="Ver Detalhes do Usuário"
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

              <div className="lg:hidden space-y-4">
                {referrals.map((item) => {
                  const isCompleted = item.status === IndicacaoStatus.COMPLETED;

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 text-left shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Data da Indicação
                          </span>
                          <span className="text-xs font-mono text-slate-200">
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
                                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                    statusInfo.badgeClass
                                  )}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  <span>{statusInfo.badgeLabel}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {statusInfo.subtext}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                            Quem Indicou (Indicador)
                          </span>
                          {item.indicador ? (
                            <div>
                              <Link
                                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicador.id}`}
                                className="font-bold text-sm text-white hover:text-purple-400 block truncate"
                              >
                                {item.indicador.nome}
                              </Link>
                              <div className="flex items-center justify-between mt-1 text-xs text-slate-400 font-mono">
                                <span>{phoneMask(item.indicador.telefone) || "—"}</span>
                                {item.indicador.telefone && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenWhatsApp(item.indicador!.telefone, item.indicador!.nome)
                                    }
                                    className="text-[#25D366] hover:opacity-80 p-1"
                                  >
                                    <WhatsAppIcon className="h-4 w-4 fill-current" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic block">Não identificado</span>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                            Quem Foi Indicado (Novo Motorista)
                          </span>
                          {item.indicado ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado.id}`}
                                  className="font-bold text-sm text-white hover:text-blue-400 block truncate"
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
                              <div className="flex items-center justify-between mt-1 text-xs text-slate-400 font-mono">
                                <span>{phoneMask(item.indicado.telefone) || "—"}</span>
                                {item.indicado.telefone && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenWhatsApp(item.indicado!.telefone, item.indicado!.nome)
                                    }
                                    className="text-[#25D366] hover:opacity-80 p-1"
                                  >
                                    <WhatsAppIcon className="h-4 w-4 fill-current" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic block">Não identificado</span>
                          )}
                        </div>
                      </div>

                      {item.indicado && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
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
                            className="h-8 px-2.5 rounded-lg border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 gap-1.5"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Alterar</span>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnlinkReferral(item.indicado!.id, item.indicado!.nome)}
                            disabled={removeReferralMutation.isPending}
                            className="h-8 px-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold gap-1.5"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Desvincular</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${item.indicado!.id}`)}
                            className="h-8 px-2.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs font-bold gap-1.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Ver Perfil</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <span>
                    Página {page} de {totalPages} ({total} indicações no total)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 px-3 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 px-3 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40"
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
