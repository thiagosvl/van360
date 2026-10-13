import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminUsers, useAdminStats } from "@/hooks/api/adminHooks";
import { SubscriptionStatus, SUBSCRIPTION_VITALICIO_FILTER, UserType } from "@/types/enums";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Loader2,
  Plus,
  Bus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Infinity as InfinityIcon,
  XCircle,
  CalendarOff,
  Calendar,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { phoneMask } from "@/utils/masks";
import { useLayout } from "@/contexts/LayoutContext";
import { SubscriptionStatusBadge, SUBSCRIPTION_STATUS_DETAILS, ExtendedSubscriptionStatus } from "@/components/ui/SubscriptionStatusBadge";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { ROUTES } from "@/constants/routes";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { cn } from "@/lib/utils";
import { resolveOrigemAtribuicao } from "@/utils/acquisition-channel.utils";
import { AcquisitionBadge } from "@/components/ui/AcquisitionBadge";

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  ...Object.entries(SUBSCRIPTION_STATUS_DETAILS).map(([value, detail]) => ({
    value,
    label: detail.label,
  })),
];

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || "";

  const { openAdminCreateUserDialog, setPageTitle, openImageFullscreen } = useLayout();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  const updateStatusFilter = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (newStatus) {
        p.set("status", newStatus);
      } else {
        p.delete("status");
      }
      return p;
    });
  };

  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data: stats } = useAdminStats();
  const { data, isLoading } = useAdminUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    tipo: UserType.MOTORISTA,
  });

  useEffect(() => {
    setPageTitle("Usuários");
  }, [setPageTitle]);

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const kpiCards = useMemo(() => {
    const isTotalSelected = statusFilter === "";

    const totalCard = {
      key: "total",
      title: "Total de motoristas",
      value: stats?.totalMotoristas ?? total,
      subtext: "Cadastrados na base",
      cardBorder: isTotalSelected
        ? "border-primary shadow-xs ring-2 ring-primary/80"
        : "border-border/80 shadow-xs",
      iconBg: "bg-primary/10 text-primary border-primary/20",
      icon: <Bus className="h-5 w-5" />,
      isSelected: isTotalSelected,
      onClick: () => updateStatusFilter(""),
    };

    const statusItems: Array<{ status: ExtendedSubscriptionStatus; val: number | undefined; icon: React.ReactNode }> = [
      { status: SubscriptionStatus.ACTIVE, val: stats?.assinaturas?.active, icon: <ShieldCheck className="h-5 w-5" /> },
      { status: SubscriptionStatus.TRIAL, val: stats?.assinaturas?.trial, icon: <Clock className="h-5 w-5" /> },
      { status: SUBSCRIPTION_VITALICIO_FILTER, val: stats?.assinaturas?.vitalicio, icon: <InfinityIcon className="h-5 w-5" /> },
      { status: SubscriptionStatus.PAST_DUE, val: stats?.assinaturas?.past_due, icon: <AlertTriangle className="h-5 w-5" /> },
      { status: SubscriptionStatus.EXPIRED, val: stats?.assinaturas?.expired, icon: <CalendarOff className="h-5 w-5" /> },
      { status: SubscriptionStatus.CANCELED, val: stats?.assinaturas?.canceled, icon: <XCircle className="h-5 w-5" /> },
    ];

    const statusCards = statusItems.map((item) => {
      const detail = SUBSCRIPTION_STATUS_DETAILS[item.status];
      const isSelected = statusFilter === item.status;
      return {
        key: item.status,
        title: detail.pluralLabel,
        value: item.val ?? 0,
        subtext: detail.subtext,
        cardBorder: isSelected
          ? cn(detail.cardBorder, "ring-2 ring-offset-2 ring-offset-background ring-primary scale-[1.02]")
          : detail.cardBorder,
        iconBg: detail.iconBg,
        icon: item.icon,
        isSelected,
        onClick: () => updateStatusFilter(item.status),
      };
    });

    return [totalCard, ...statusCards];
  }, [stats, total, statusFilter]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 mb-2 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-0 touch-pan-x">
        {kpiCards.map((card) => (
          <AdminKpiCard
            key={card.key}
            {...card}
            className={cn(
              "w-[170px] sm:w-[190px] shrink-0 md:w-auto md:shrink flex flex-col justify-between cursor-pointer transition-all duration-200",
              card.isSelected && "bg-secondary/70 border-primary/50"
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-muted-foreground">
          Listando {users.length} de {total} motorista{total !== 1 ? "s" : ""}
        </span>
        <Button
          onClick={() => openAdminCreateUserDialog((userId) => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}`))}
          className="rounded-xl h-9 bg-primary text-xs font-medium shadow-xs hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Novo motorista</span>
        </Button>
      </div>

      <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou ID..."
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
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 -mx-1 px-1 touch-pan-x">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={statusFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStatusFilter(f.value)}
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
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <AdminEmptyState
              icon={Users}
              title="Nenhum usuário encontrado"
              description={
                search || statusFilter !== ""
                  ? "Nenhum motorista corresponde à busca ou filtros selecionados."
                  : "Ainda não há motoristas cadastrados no sistema."
              }
            />
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto [scrollbar-width:thin]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="pb-3 text-xs font-semibold text-muted-foreground">Nome</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Telefone</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Cadastro</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground hidden xl:table-cell">Origem</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground">Plano</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const sub = Array.isArray(user.assinaturas) ? user.assinaturas[0] : null;

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-border/40 hover:bg-secondary/40 transition-colors cursor-pointer"
                          onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                        >
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              {user.logo_url?.trim() && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openImageFullscreen({ imageUrl: user.logo_url!, alt: user.nome });
                                  }}
                                  className="h-10 w-10 rounded-xl bg-card border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                                >
                                  <img
                                    src={user.logo_url}
                                    alt={user.nome}
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                                  {user.nome}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {user.apelido || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 hidden md:table-cell">
                            <span className="text-xs text-foreground/80 font-mono">
                              {phoneMask(user.telefone || "") || "—"}
                            </span>
                          </td>
                          <td className="py-3.5 hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground block font-mono">
                              {new Date(user.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </td>
                          <td className="py-3.5 hidden xl:table-cell">
                            <AcquisitionBadge
                              origem={resolveOrigemAtribuicao(
                                user.metadados_cadastro as Record<string, unknown> | null,
                                user.dispositivo_cadastro,
                                user.canal_aquisicao
                              )}
                            />
                          </td>
                          <td className="py-3.5">
                            <span className="text-xs font-medium text-foreground">
                              {sub?.planos?.nome || "—"}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <SubscriptionStatusBadge status={sub?.status} dataVencimento={sub?.data_vencimento} />
                          </td>
                          <td className="py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-primary hover:bg-secondary hover:text-primary h-8 px-2.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3 mb-4">
                {users.map((user) => {
                  const sub = Array.isArray(user.assinaturas) ? user.assinaturas[0] : null;
                  const phoneFormatted = phoneMask(user.telefone || "");
                  const dateFormatted = new Date(user.created_at).toLocaleDateString("pt-BR");

                  return (
                    <div
                      key={user.id}
                      onClick={() => navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`)}
                      className="p-4 bg-secondary/30 rounded-2xl border border-border/80 space-y-3 text-left cursor-pointer hover:bg-secondary/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {user.logo_url?.trim() && (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                openImageFullscreen({ imageUrl: user.logo_url!, alt: user.nome });
                              }}
                              className="h-10 w-10 rounded-xl bg-card border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                            >
                              <img
                                src={user.logo_url}
                                alt={user.nome}
                                className="h-full w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                              {user.nome}
                            </h3>
                            {user.apelido && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {user.apelido}
                              </p>
                            )}
                          </div>
                        </div>
                        <SubscriptionStatusBadge status={sub?.status} dataVencimento={sub?.data_vencimento} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground gap-4">
                        <div>
                          <span className="text-[11px] font-medium text-muted-foreground block">Telefone</span>
                          <span className="font-mono text-foreground">{phoneFormatted || "—"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-medium text-muted-foreground block">Cadastro</span>
                          <span className="font-mono text-foreground">{dateFormatted}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground block mb-1">Origem</span>
                        <AcquisitionBadge
                          origem={resolveOrigemAtribuicao(
                            user.metadados_cadastro as Record<string, unknown> | null,
                            user.dispositivo_cadastro,
                            user.canal_aquisicao
                          )}
                        />
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-medium text-muted-foreground block">Plano</span>
                          <span className="text-xs font-semibold text-foreground">{sub?.planos?.nome || "—"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-primary hover:bg-secondary hover:text-primary h-8 px-2.5 flex items-center gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${ROUTES.PRIVATE.ADMIN.USERS}/${user.id}`);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Ver detalhes</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <p className="text-xs font-medium text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="h-9 w-9 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-9 w-9 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
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
