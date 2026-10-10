import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Eye,
  Loader2,
  Smartphone,
  MessageSquare,
  Mail,
  MessageCircle,
  RotateCcw,
  Clock,
  Copy,
  Check,
  Search,
  X,
  Send,
  AlertTriangle,
  XCircle,
  FilterX,
} from "lucide-react";
import { AdminNotificationLogItem } from "@/services/api/admin/admin-notification.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { AdminPeriodFilter } from "@/components/ui/AdminPeriodFilter";
import { toast } from "@/utils/notifications/toast";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { formatRelativeTime, formatDateTimeToBR } from "@/utils/formatters/date";
import { formatCurrency } from "@/utils/formatters/currency";
import { phoneMask } from "@/utils/masks";
import { formatShortName, getDriverDisplayName } from "@/utils/formatters";
import { ROUTES } from "@/constants/routes";
import {
  useAdminRetryNotification,
  useAdminRetryBulkNotifications,
} from "@/hooks/api/admin/useAdminNotificationHooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotificationCategoryEnum,
  NOTIFICATION_CATEGORY_TABS,
  getEventMeta,
  getAudienceInfo,
  formatRecipientContact,
} from "@/utils/formatters/notificationEvents";
import {
  NotificationChannelEnum,
  NotificationStatusEnum,
} from "@/types/enums";

export const NOTIFICATION_FILTER_ALL = "all";

export interface NotificationFiltersState {
  categoria: NotificationCategoryEnum;
  canal: string;
  status: string;
  search: string;
}

interface NotificationLogsListProps {
  notifications: AdminNotificationLogItem[];
  isLoading?: boolean;
  filters?: NotificationFiltersState;
  onFiltersChange?: (newFilters: NotificationFiltersState) => void;
  hideDriverColumn?: boolean;
  enableSelection?: boolean;
  startDate?: string;
  endDate?: string;
  onPeriodChange?: (start: string, end: string) => void;
  showPeriodFilter?: boolean;
  searchPlaceholder?: string;
  onResetAllFilters?: () => void;
  isPeriodActive?: boolean;
}

function renderChannelBadge(canal: string) {
  const norm = (canal || "").toUpperCase();
  if (norm === NotificationChannelEnum.FIREBASE) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm">
        <Smartphone className="h-3.5 w-3.5 text-amber-400" />
        <span>Push App</span>
      </span>
    );
  }
  if (norm === NotificationChannelEnum.WABA || norm === NotificationChannelEnum.EVOLUTION) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">
        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
        <span>WhatsApp</span>
      </span>
    );
  }
  if (norm === NotificationChannelEnum.RESEND) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm">
        <Mail className="h-3.5 w-3.5 text-purple-400" />
        <span>E-mail</span>
      </span>
    );
  }
  if (norm === NotificationChannelEnum.SMS) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 shadow-sm">
        <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
        <span>SMS</span>
      </span>
    );
  }
  if (norm === NotificationChannelEnum.TELEGRAM) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
        <Send className="h-3.5 w-3.5 text-sky-400" />
        <span>Telegram</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-secondary text-secondary-foreground border border-border">
      <span>{canal}</span>
    </span>
  );
}

function renderStatusBadge(status: string) {
  const norm = (status || "").toUpperCase();
  if (norm === NotificationStatusEnum.SENT) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Entregue</span>
      </span>
    );
  }
  if (norm === NotificationStatusEnum.FAILED) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        <span>Falhou</span>
      </span>
    );
  }
  if (norm === NotificationStatusEnum.PROCESSING) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
        <span>Enviando...</span>
      </span>
    );
  }
  if (norm === NotificationStatusEnum.RETRY_PENDING) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <RotateCcw className="h-3 w-3 text-amber-400" />
        <span>Nova Tentativa</span>
      </span>
    );
  }
  if (norm === NotificationStatusEnum.CANCELLED) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-muted/60 text-muted-foreground border border-border">
        <XCircle className="h-3 w-3 text-muted-foreground" />
        <span>Cancelado</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
      <Clock className="h-3 w-3 text-sky-400" />
      <span>Na Fila</span>
    </span>
  );
}

export function NotificationLogsList({
  notifications,
  isLoading,
  filters,
  onFiltersChange,
  hideDriverColumn = true,
  enableSelection = true,
  startDate,
  endDate,
  onPeriodChange,
  showPeriodFilter = false,
  searchPlaceholder,
  onResetAllFilters,
  isPeriodActive = false,
}: NotificationLogsListProps) {
  const [selectedNotification, setSelectedNotification] = useState<AdminNotificationLogItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const singleRetryMutation = useAdminRetryNotification();
  const bulkRetryMutation = useAdminRetryBulkNotifications();

  const isEligibleForRetry = (status: string) => {
    const norm = (status || "").toUpperCase();
    return (
      norm === NotificationStatusEnum.FAILED ||
      norm === NotificationStatusEnum.RETRY_PENDING ||
      norm === NotificationStatusEnum.CANCELLED ||
      norm === "ERROR"
    );
  };

  const isControlled = !!(filters && onFiltersChange);

  const [localFilters, setLocalFilters] = useState<NotificationFiltersState>({
    categoria: NotificationCategoryEnum.TODOS,
    canal: NOTIFICATION_FILTER_ALL,
    status: NOTIFICATION_FILTER_ALL,
    search: "",
  });

  const activeFilters = isControlled ? filters : localFilters;

  const updateFilters = (partial: Partial<NotificationFiltersState>) => {
    const next = { ...activeFilters, ...partial };
    if (isControlled && onFiltersChange) {
      onFiltersChange(next);
    } else {
      setLocalFilters(next);
    }
  };

  const handleResetFilters = () => {
    const clean: NotificationFiltersState = {
      categoria: NotificationCategoryEnum.TODOS,
      canal: NOTIFICATION_FILTER_ALL,
      status: NOTIFICATION_FILTER_ALL,
      search: "",
    };
    if (isControlled && onFiltersChange) {
      onFiltersChange(clean);
    } else {
      setLocalFilters(clean);
    }
  };

  const hasActiveFilters =
    activeFilters.categoria !== NotificationCategoryEnum.TODOS ||
    activeFilters.canal !== NOTIFICATION_FILTER_ALL ||
    activeFilters.status !== NOTIFICATION_FILTER_ALL ||
    activeFilters.search.trim() !== "";

  const filteredNotifications = useMemo(() => {
    if (isControlled) {
      return notifications;
    }

    return notifications.filter((item) => {
      const meta = getEventMeta(item.evento);
      if (
        activeFilters.categoria !== NotificationCategoryEnum.TODOS &&
        meta.category !== activeFilters.categoria
      ) {
        return false;
      }

      if (activeFilters.canal !== NOTIFICATION_FILTER_ALL) {
        if ((item.canal || "").toUpperCase() !== activeFilters.canal.toUpperCase()) {
          return false;
        }
      }

      if (activeFilters.status !== NOTIFICATION_FILTER_ALL) {
        if ((item.status || "").toUpperCase() !== activeFilters.status.toUpperCase()) {
          return false;
        }
      }

      if (activeFilters.search.trim()) {
        const term = activeFilters.search.toLowerCase();
        const nomeAluno = ((item.payload?.nomePassageiro as string) || "").toLowerCase();
        const nomeResp = ((item.payload?.nomeResponsavel as string) || "").toLowerCase();
        const destinatario = (item.destinatario || "").toLowerCase();
        const evento = (item.evento || "").toLowerCase();
        const titulo = meta.title.toLowerCase();

        return (
          nomeAluno.includes(term) ||
          nomeResp.includes(term) ||
          destinatario.includes(term) ||
          evento.includes(term) ||
          titulo.includes(term)
        );
      }

      return true;
    });
  }, [isControlled, notifications, activeFilters]);

  const eligibleNotifications = useMemo(() => {
    return filteredNotifications.filter((n) => isEligibleForRetry(n.status));
  }, [filteredNotifications]);

  const handleRetrySingle = async (id: string) => {
    try {
      const res = await singleRetryMutation.mutateAsync({ id, executeImmediately: true });
      if (res.success) {
        toast.success(res.message || "Notificação reenviada com sucesso!");
        if (selectedNotification && selectedNotification.id === id) {
          setSelectedNotification({
            ...selectedNotification,
            status: res.status || NotificationStatusEnum.SENT,
            erro_mensagem: null,
            provider_message_id: res.providerMessageId || selectedNotification.provider_message_id,
          });
        }
      } else {
        toast.error(res.message || "Falha ao reenviar notificação.");
        if (selectedNotification && selectedNotification.id === id) {
          setSelectedNotification({
            ...selectedNotification,
            status: res.status || NotificationStatusEnum.FAILED,
            erro_mensagem: res.error || res.message,
          });
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Erro ao processar retentativa.");
    }
  };

  const handleRetryBulkSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      const res = await bulkRetryMutation.mutateAsync({ ids: Array.from(selectedIds) });
      toast.success(res.message || `${selectedIds.size} notificações reenfileiradas com sucesso!`);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Erro ao reprocessar notificações selecionadas.");
    }
  };

  const handleCopyPayload = () => {
    if (!selectedNotification) return;
    navigator.clipboard.writeText(JSON.stringify(selectedNotification.payload, null, 2));
    setCopied(true);
    toast.success("Payload copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3 bg-secondary/40 p-3 sm:p-4 rounded-2xl border border-border/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={
                  searchPlaceholder ||
                  (hideDriverColumn
                    ? "Buscar aluno, evento, contato..."
                    : "Buscar motorista, aluno, evento ou contato...")
                }
                value={activeFilters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-9 pr-9 h-9 w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
              />
              {activeFilters.search && (
                <button
                  type="button"
                  onClick={() => updateFilters({ search: "" })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <div className="w-full sm:w-40">
                <Select
                  value={activeFilters.canal}
                  onValueChange={(val) => updateFilters({ canal: val })}
                >
                  <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                    <SelectValue placeholder="Canal" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value={NOTIFICATION_FILTER_ALL}>Todos os Canais</SelectItem>
                    <SelectItem value={NotificationChannelEnum.WABA}>WhatsApp (WABA)</SelectItem>
                    <SelectItem value={NotificationChannelEnum.EVOLUTION}>WhatsApp (Evolution)</SelectItem>
                    <SelectItem value={NotificationChannelEnum.FIREBASE}>Push App</SelectItem>
                    <SelectItem value={NotificationChannelEnum.RESEND}>E-mail</SelectItem>
                    <SelectItem value={NotificationChannelEnum.SMS}>SMS</SelectItem>
                    <SelectItem value={NotificationChannelEnum.TELEGRAM}>Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={activeFilters.status}
                  onValueChange={(val) => updateFilters({ status: val })}
                >
                  <SelectTrigger className="h-9 w-full rounded-lg bg-background border border-border text-foreground text-sm focus-visible:ring-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value={NOTIFICATION_FILTER_ALL}>Todos os Status</SelectItem>
                    <SelectItem value={NotificationStatusEnum.SENT}>Entregue</SelectItem>
                    <SelectItem value={NotificationStatusEnum.FAILED}>Falhou</SelectItem>
                    <SelectItem value={NotificationStatusEnum.PENDING}>Na Fila</SelectItem>
                    <SelectItem value={NotificationStatusEnum.PROCESSING}>Enviando</SelectItem>
                    <SelectItem value={NotificationStatusEnum.RETRY_PENDING}>Nova Tentativa</SelectItem>
                    <SelectItem value={NotificationStatusEnum.CANCELLED}>Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showPeriodFilter && onPeriodChange && (
                <div className="w-full sm:w-auto shrink-0">
                  <AdminPeriodFilter
                    startDate={startDate}
                    endDate={endDate}
                    onChange={onPeriodChange}
                    defaultPreset="hoje"
                  />
                </div>
              )}

              {(hasActiveFilters || isPeriodActive) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleResetFilters();
                    if (onResetAllFilters) onResetAllFilters();
                  }}
                  className="h-9 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 border border-border px-3 flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"
                >
                  <FilterX className="h-3.5 w-3.5" />
                  <span>Limpar Filtros</span>
                </Button>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0 -mx-1 px-1 touch-pan-x">
            {NOTIFICATION_CATEGORY_TABS.map((tab) => {
              const isActive = activeFilters.categoria === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => updateFilters({ categoria: tab.key })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Carregando histórico de notificações...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12">
            <AdminEmptyState
              icon={Bell}
              title={hasActiveFilters ? "Nenhuma notificação filtrada" : "Nenhuma notificação encontrada"}
              description={
                hasActiveFilters
                  ? "Nenhum registro corresponde aos filtros de busca selecionados."
                  : "Ainda não constam notificações disparadas para este registro."
              }
            />
          </div>
        ) : (
          <>
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {enableSelection && (
                  <th className="py-3.5 px-3 w-10 text-center">
                    <Checkbox
                      checked={
                        eligibleNotifications.length > 0 &&
                        eligibleNotifications.every((n) => selectedIds.has(n.id))
                          ? true
                          : eligibleNotifications.some((n) => selectedIds.has(n.id))
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const next = new Set(selectedIds);
                          eligibleNotifications.forEach((n) => next.add(n.id));
                          setSelectedIds(next);
                        } else {
                          const next = new Set(selectedIds);
                          eligibleNotifications.forEach((n) => next.delete(n.id));
                          setSelectedIds(next);
                        }
                      }}
                      disabled={eligibleNotifications.length === 0}
                    />
                  </th>
                )}
                <th className="py-3.5 px-5">Evento & Detalhes</th>
                {!hideDriverColumn && <th className="py-3.5 px-4">Motorista</th>}
                <th className="py-3.5 px-4">Destinatário</th>
                <th className="py-3.5 px-4">Canal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data e Hora</th>
                <th className="py-3.5 px-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">

              {filteredNotifications.map((item) => {
                const meta = getEventMeta(item.evento);
                const Icon = meta.icon;
                const audience = getAudienceInfo(item);
                const formattedContact = formatRecipientContact(item.destinatario, item.canal);
                const nomeAluno = item.payload?.nomePassageiro
                  ? formatShortName(item.payload.nomePassageiro as string, true)
                  : undefined;
                const valorCobranca = item.payload?.valor as number | undefined;

                return (
                  <tr key={item.id} className="hover:bg-secondary/40 transition-colors group">
                    {enableSelection && (
                      <td className="py-3.5 px-3 text-center">
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={(checked) => {
                            const next = new Set(selectedIds);
                            if (checked) {
                              next.add(item.id);
                            } else {
                              next.delete(item.id);
                            }
                            setSelectedIds(next);
                          }}
                          disabled={!isEligibleForRetry(item.status)}
                        />
                      </td>
                    )}

                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${meta.iconBg}`}>
                          <Icon className={`h-5 w-5 ${meta.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                            {meta.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground font-medium mt-0.5">
                            {nomeAluno && (
                              <span>
                                Aluno: <strong className="text-foreground font-semibold">{nomeAluno}</strong>
                              </span>
                            )}
                            {valorCobranca !== undefined && Number(valorCobranca) > 0 && (
                              <>
                                <span className="text-muted-foreground/60">•</span>
                                <span className="text-emerald-500 font-semibold">{formatCurrency(Number(valorCobranca))}</span>
                              </>
                            )}
                            <span className="text-muted-foreground/60">•</span>
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">{item.evento}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {!hideDriverColumn && (
                      <td className="py-3.5 px-4">
                        {item.usuarios || item.usuario_id || item.payload?.nomeMotorista ? (
                          <div>
                            {item.usuario_id ? (
                              <Link
                                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.usuario_id}`}
                                className="font-semibold text-primary hover:underline block truncate max-w-[150px]"
                              >
                                {getDriverDisplayName(item.usuarios || { nomeMotorista: item.payload?.nomeMotorista as string }, { shortName: true, fallback: "Motorista" })}
                              </Link>
                            ) : (
                              <span className="font-semibold text-foreground block truncate max-w-[150px]">
                                {getDriverDisplayName(item.usuarios || { nomeMotorista: item.payload?.nomeMotorista as string }, { shortName: true, fallback: "Motorista" })}
                              </span>
                            )}
                            {(item.usuarios?.telefone || item.payload?.telefoneMotorista) && (
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {phoneMask((item.usuarios?.telefone || item.payload?.telefoneMotorista) as string)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">—</span>
                        )}
                      </td>
                    )}

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-semibold uppercase tracking-wider border ${audience.badgeStyle}`}>
                            {audience.label}
                          </span>
                          <span className="font-semibold text-foreground truncate">
                            {audience.primaryName}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground font-medium mt-0.5">
                          {formattedContact}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderChannelBadge(item.canal)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        {renderStatusBadge(item.status)}
                        {item.tentativas > 0 && (
                          <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                            {item.tentativas}/{item.max_tentativas} {item.tentativas === 1 ? "tentativa" : "tentativas"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-medium text-foreground block text-xs">
                          {formatRelativeTime(item.created_at)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                          {formatDateTimeToBR(item.created_at, { includeTime: true })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg bg-background border border-border hover:bg-primary/10 hover:text-primary text-muted-foreground px-3 flex items-center gap-1.5 ml-auto text-xs font-medium transition-all"
                        onClick={() => setSelectedNotification(item)}
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Inspecionar</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-3">
          {filteredNotifications.map((item) => {
            const meta = getEventMeta(item.evento);
            const Icon = meta.icon;
            const audience = getAudienceInfo(item);
            const formattedContact = formatRecipientContact(item.destinatario, item.canal);
            const nomeAluno = item.payload?.nomePassageiro
              ? formatShortName(item.payload.nomePassageiro as string, true)
              : undefined;
            const valorCobranca = item.payload?.valor as number | undefined;

            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 bg-card rounded-2xl border border-border shadow-xs space-y-3 text-left"
              >
                <div className="flex items-start justify-between gap-2.5 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {enableSelection && (
                      <div className="pt-0.5 shrink-0">
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={(checked) => {
                            const next = new Set(selectedIds);
                            if (checked) next.add(item.id);
                            else next.delete(item.id);
                            setSelectedIds(next);
                          }}
                          disabled={!isEligibleForRetry(item.status)}
                        />
                      </div>
                    )}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center border shrink-0 ${meta.iconBg}`}>
                      <Icon className={`h-4 w-4 ${meta.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-headline font-semibold text-foreground leading-tight truncate">
                        {meta.title}
                      </h4>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5 truncate">
                        {item.evento}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                {(nomeAluno || valorCobranca !== undefined) && (
                  <div className="bg-secondary/40 p-2.5 rounded-xl border border-border flex items-center justify-between text-xs">
                    {nomeAluno && (
                      <span className="font-medium text-muted-foreground">
                        Aluno: <strong className="text-foreground">{nomeAluno}</strong>
                      </span>
                    )}
                    {valorCobranca !== undefined && Number(valorCobranca) > 0 && (
                      <span className="font-semibold text-emerald-500">
                        {formatCurrency(Number(valorCobranca))}
                      </span>
                    )}
                  </div>
                )}

                {!hideDriverColumn && (item.usuarios || item.usuario_id || item.payload?.nomeMotorista) && (
                  <div className="bg-secondary/40 p-2.5 rounded-xl border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Motorista:</span>
                    {item.usuario_id ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.usuario_id}`}
                        className="font-semibold text-primary hover:underline truncate max-w-[200px]"
                      >
                        {getDriverDisplayName(item.usuarios || { nomeMotorista: item.payload?.nomeMotorista as string }, { shortName: true, fallback: "Ver Motorista" })}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {getDriverDisplayName(item.usuarios || { nomeMotorista: item.payload?.nomeMotorista as string }, { shortName: true, fallback: "—" })}
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold uppercase text-muted-foreground tracking-wider block">
                      Destinatário ({audience.label})
                    </span>
                    <p className="font-semibold text-foreground truncate">
                      {audience.primaryName}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {formattedContact}
                    </p>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-semibold uppercase text-muted-foreground tracking-wider block">
                      Canal de Envio
                    </span>
                    <div className="flex justify-end pt-0.5">
                      {renderChannelBadge(item.canal)}
                    </div>
                    <span className="text-[10px] text-muted-foreground block pt-1">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 rounded-lg bg-background border border-border text-foreground hover:text-primary hover:bg-primary/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    onClick={() => setSelectedNotification(item)}
                  >
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span className="sm:hidden">Inspecionar</span>
                    <span className="hidden sm:inline">Inspecionar Detalhes Técnicos</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}
      </div>

      {enableSelection && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-popover/95 border border-border shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-semibold text-popover-foreground whitespace-nowrap">
              {selectedIds.size} {selectedIds.size === 1 ? "selecionada" : "selecionadas"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
              disabled={bulkRetryMutation.isPending}
            >
              Limpar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleRetryBulkSelected}
              disabled={bulkRetryMutation.isPending}
              className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              {bulkRetryMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              <span>Retentar Selecionadas</span>
            </Button>
          </div>
        </div>
      )}

      {selectedNotification && (
        <AdminBaseDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelectedNotification(null);
          }}
          maxWidth="2xl"
          description="Inspecionar detalhes da notificação enviada"
        >
          <AdminBaseDialog.Header
            title="Detalhes da Notificação"
            subtitle={`Evento: ${selectedNotification.evento}`}
            icon={<Bell className="w-5 h-5 text-primary" />}
            onClose={() => setSelectedNotification(null)}
          />

          <AdminBaseDialog.Body>
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-secondary/40 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider block">Status</span>
                  <div>{renderStatusBadge(selectedNotification.status)}</div>
                </div>

                <div className="p-3 bg-secondary/40 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider block">Canal</span>
                  <div>{renderChannelBadge(selectedNotification.canal)}</div>
                </div>

                <div className="p-3 bg-secondary/40 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider block">Tentativas</span>
                  <span className="text-xs font-mono font-semibold text-foreground">
                    {selectedNotification.tentativas} de {selectedNotification.max_tentativas}
                  </span>
                </div>

                <div className="p-3 bg-secondary/40 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider block">Data de Criação</span>
                  <span className="text-[11px] font-mono text-foreground font-semibold block truncate">
                    {formatDateTimeToBR(selectedNotification.created_at, { includeTime: true })}
                  </span>
                </div>
              </div>

              {!hideDriverColumn && (selectedNotification.usuarios || selectedNotification.usuario_id) && (
                <div className="p-3.5 bg-secondary/40 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider block">Motorista Associado</span>
                    <span className="text-xs font-semibold text-foreground">
                      {getDriverDisplayName(selectedNotification.usuarios, { shortName: true, fallback: "Motorista" })}
                    </span>
                    {selectedNotification.usuarios?.apelido && selectedNotification.usuarios.nome && (
                      <p className="text-xs text-muted-foreground">Nome: {selectedNotification.usuarios.nome}</p>
                    )}
                    {selectedNotification.usuarios?.telefone && (
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {phoneMask(selectedNotification.usuarios.telefone)}
                      </p>
                    )}
                  </div>
                  {selectedNotification.usuario_id && (
                    <Link
                      to={`${ROUTES.PRIVATE.ADMIN.USERS}/${selectedNotification.usuario_id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver perfil
                    </Link>
                  )}

                </div>
              )}

              <div className="p-3.5 bg-secondary/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider block">Destinatário Real</span>
                  <span className="text-xs font-mono font-semibold text-foreground">
                    {formatRecipientContact(selectedNotification.destinatario, selectedNotification.canal)}
                  </span>
                </div>
                {selectedNotification.provider_message_id && (
                  <div className="text-right">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider block">Provider Message ID</span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px] block">
                      {selectedNotification.provider_message_id}
                    </span>
                  </div>
                )}
              </div>

              {selectedNotification.erro_mensagem && (
                <div className="p-3.5 bg-destructive/10 rounded-xl border border-destructive/20 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-destructive block">Mensagem de Erro:</span>
                    <p className="text-xs font-mono text-destructive mt-0.5 break-all">
                      {selectedNotification.erro_mensagem}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Payload Completo (Variáveis Enviadas)
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPayload}
                    className="h-7 text-xs font-medium text-foreground bg-secondary/60 hover:bg-secondary rounded-lg px-2.5 flex items-center gap-1.5 border-border"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copiado!" : "Copiar JSON"}</span>
                  </Button>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl border border-border max-h-72 overflow-y-auto font-mono text-xs text-foreground leading-relaxed shadow-inner">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedNotification.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </AdminBaseDialog.Body>

          <AdminBaseDialog.Footer>
            {selectedNotification && isEligibleForRetry(selectedNotification.status) && (
              <AdminBaseDialog.Action
                label={singleRetryMutation.isPending ? "Enviando..." : "Retentar Envio Agora"}
                variant="primary"
                icon={<RotateCcw className="h-4 w-4 mr-1.5" />}
                isLoading={singleRetryMutation.isPending}
                disabled={singleRetryMutation.isPending}
                onClick={() => handleRetrySingle(selectedNotification.id)}
              />
            )}
            <AdminBaseDialog.Action
              label="Fechar"
              variant="secondary"
              onClick={() => setSelectedNotification(null)}
            />
          </AdminBaseDialog.Footer>
        </AdminBaseDialog>
      )}
    </>
  );
}
