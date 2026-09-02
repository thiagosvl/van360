import { useState, useMemo } from "react";
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
} from "lucide-react";
import { AdminNotificationLogItem } from "@/services/api/admin/admin-notification.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { toast } from "@/utils/notifications/toast";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { formatRelativeTime, formatDateTimeToBR } from "@/utils/formatters/date";
import { formatCurrency } from "@/utils/formatters/currency";
import {
  NotificationCategoryEnum,
  getEventMeta,
  getAudienceInfo,
  formatRecipientContact,
} from "@/utils/formatters/notificationEvents";

interface NotificationLogsListProps {
  notifications: AdminNotificationLogItem[];
  isLoading?: boolean;
}

const CATEGORY_TABS: { key: NotificationCategoryEnum; label: string }[] = [
  { key: NotificationCategoryEnum.TODOS, label: "Todas" },
  { key: NotificationCategoryEnum.ROTA, label: "Rotas" },
  { key: NotificationCategoryEnum.COBRANCA, label: "Cobranças" },
  { key: NotificationCategoryEnum.CONTRATO, label: "Contratos" },
  { key: NotificationCategoryEnum.MOTORISTA, label: "Motorista" },
];

function renderChannelBadge(canal: string) {
  const norm = (canal || "").toUpperCase();
  if (norm === "FIREBASE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm">
        <Smartphone className="h-3.5 w-3.5 text-amber-400" />
        <span>Push App</span>
      </span>
    );
  }
  if (norm === "WABA" || norm === "EVOLUTION") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">
        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
        <span>WhatsApp</span>
      </span>
    );
  }
  if (norm === "RESEND") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm">
        <Mail className="h-3.5 w-3.5 text-purple-400" />
        <span>E-mail</span>
      </span>
    );
  }
  if (norm === "SMS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 shadow-sm">
        <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
        <span>SMS</span>
      </span>
    );
  }
  if (norm === "TELEGRAM") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
        <Send className="h-3.5 w-3.5 text-sky-400" />
        <span>Telegram</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
      <span>{canal}</span>
    </span>
  );
}

function renderStatusBadge(status: string) {
  const norm = (status || "").toUpperCase();
  if (norm === "SENT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Entregue</span>
      </span>
    );
  }
  if (norm === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        <span>Falhou</span>
      </span>
    );
  }
  if (norm === "PROCESSING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
        <span>Enviando...</span>
      </span>
    );
  }
  if (norm === "RETRY_PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <RotateCcw className="h-3 w-3 text-amber-400" />
        <span>Nova Tentativa</span>
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

export function NotificationLogsList({ notifications, isLoading }: NotificationLogsListProps) {
  const [selectedNotification, setSelectedNotification] = useState<AdminNotificationLogItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategoryEnum>(NotificationCategoryEnum.TODOS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const meta = getEventMeta(item.evento);
      if (categoryFilter !== NotificationCategoryEnum.TODOS && meta.category !== categoryFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
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
  }, [notifications, categoryFilter, searchTerm]);

  const handleCopyPayload = () => {
    if (!selectedNotification) return;
    navigator.clipboard.writeText(JSON.stringify(selectedNotification.payload, null, 2));
    setCopied(true);
    toast.success("Payload copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="text-xs font-semibold text-slate-400">Carregando histórico de notificações...</span>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <AdminEmptyState
        icon={Bell}
        title="Nenhuma notificação encontrada"
        description="Ainda não constam notificações disparadas para este registro."
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
            {CATEGORY_TABS.map((tab) => {
              const isActive = categoryFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCategoryFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar aluno, evento, contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 h-9 rounded-xl bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus-visible:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-5">Evento & Detalhes</th>
                <th className="py-3.5 px-4">Destinatário</th>
                <th className="py-3.5 px-4">Canal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data e Hora</th>
                <th className="py-3.5 px-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredNotifications.map((item) => {
                const meta = getEventMeta(item.evento);
                const Icon = meta.icon;
                const audience = getAudienceInfo(item);
                const formattedContact = formatRecipientContact(item.destinatario);
                const nomeAluno = item.payload?.nomePassageiro as string | undefined;
                const valorCobranca = item.payload?.valor as number | undefined;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${meta.iconBg}`}>
                          <Icon className={`h-5 w-5 ${meta.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight">
                            {meta.title}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 font-medium mt-0.5">
                            {nomeAluno && (
                              <span>
                                Aluno: <strong className="text-slate-300 font-semibold">{nomeAluno}</strong>
                              </span>
                            )}
                            {valorCobranca !== undefined && Number(valorCobranca) > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-emerald-400 font-semibold">{formatCurrency(Number(valorCobranca))}</span>
                              </>
                            )}
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-[10px] text-slate-500 uppercase">{item.evento}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider border ${audience.badgeStyle}`}>
                            {audience.label}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">
                            {audience.primaryName}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 font-medium mt-0.5">
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
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {item.tentativas}/{item.max_tentativas} {item.tentativas === 1 ? "tentativa" : "tentativas"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-300 block text-xs">
                          {formatRelativeTime(item.created_at)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {formatDateTimeToBR(item.created_at, { includeTime: true })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 px-3 flex items-center gap-1.5 ml-auto text-xs font-bold transition-all"
                        onClick={() => setSelectedNotification(item)}
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-400" />
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
            const formattedContact = formatRecipientContact(item.destinatario);
            const nomeAluno = item.payload?.nomePassageiro as string | undefined;
            const valorCobranca = item.payload?.valor as number | undefined;

            return (
              <div
                key={item.id}
                className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg space-y-3 text-left"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${meta.iconBg}`}>
                      <Icon className={`h-5 w-5 ${meta.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-headline font-bold text-slate-100 leading-tight">
                        {meta.title}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">
                        {item.evento}
                      </p>
                    </div>
                  </div>

                  {renderStatusBadge(item.status)}
                </div>

                {(nomeAluno || valorCobranca !== undefined) && (
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs">
                    {nomeAluno && (
                      <span className="font-medium text-slate-300">
                        Aluno: <strong className="text-white">{nomeAluno}</strong>
                      </span>
                    )}
                    {valorCobranca !== undefined && Number(valorCobranca) > 0 && (
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(Number(valorCobranca))}
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                      Destinatário ({audience.label})
                    </span>
                    <p className="font-semibold text-slate-200 truncate">
                      {audience.primaryName}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {formattedContact}
                    </p>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                      Canal de Envio
                    </span>
                    <div className="flex justify-end pt-0.5">
                      {renderChannelBadge(item.canal)}
                    </div>
                    <span className="text-[10px] text-slate-500 block pt-1">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-blue-400 hover:bg-slate-700/60 text-xs font-bold flex items-center justify-center gap-1.5"
                    onClick={() => setSelectedNotification(item)}
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-400" />
                    <span>Inspecionar Detalhes Técnicos</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="py-12">
            <AdminEmptyState
              icon={Bell}
              title="Nenhuma notificação filtrada"
              description="Nenhum registro corresponde aos filtros ou busca selecionados."
            />
          </div>
        )}
      </div>

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
            icon={<Bell className="w-5 h-5 text-blue-400" />}
            onClose={() => setSelectedNotification(null)}
          />

          <AdminBaseDialog.Body>
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Status</span>
                  <div>{renderStatusBadge(selectedNotification.status)}</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Canal</span>
                  <div>{renderChannelBadge(selectedNotification.canal)}</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Tentativas</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {selectedNotification.tentativas} de {selectedNotification.max_tentativas}
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Data de Criação</span>
                  <span className="text-[11px] font-mono text-slate-300 font-semibold block truncate">
                    {formatDateTimeToBR(selectedNotification.created_at, { includeTime: true })}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Destinatário Real</span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {formatRecipientContact(selectedNotification.destinatario)}
                  </span>
                </div>
                {selectedNotification.provider_message_id && (
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Provider Message ID</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px] block">
                      {selectedNotification.provider_message_id}
                    </span>
                  </div>
                )}
              </div>

              {selectedNotification.erro_mensagem && (
                <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-rose-300 block">Mensagem de Erro:</span>
                    <p className="text-xs font-mono text-rose-200 mt-0.5 break-all">
                      {selectedNotification.erro_mensagem}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Payload Completo (Variáveis Enviadas)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPayload}
                    className="h-7 text-xs font-bold text-blue-400 hover:text-blue-300 bg-slate-800 hover:bg-slate-700 rounded-lg px-2.5 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copiado!" : "Copiar JSON"}</span>
                  </Button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-72 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed shadow-inner">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(selectedNotification.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </AdminBaseDialog.Body>

          <AdminBaseDialog.Footer>
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
