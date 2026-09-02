import { useState } from "react";
import { Bell, Eye, Loader2, Send } from "lucide-react";
import { AdminNotificationLogItem } from "@/services/api/admin/admin-notification.api";
import { Button } from "@/components/ui/button";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { toast } from "@/utils/notifications/toast";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { formatRelativeTime } from "@/utils/formatters/date";

interface NotificationLogsListProps {
  notifications: AdminNotificationLogItem[];
  isLoading?: boolean;
}

function getChannelBadgeStyle(canal: string) {
  const normalized = canal.toUpperCase();
  if (normalized === "WABA" || normalized === "EVOLUTION") {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (normalized === "FIREBASE") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  if (normalized === "SMS") {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  if (normalized === "RESEND") {
    return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  }
  return "bg-slate-500/15 text-slate-400 border-slate-500/30";
}

function getStatusBadgeStyle(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "SENT") {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (normalized === "FAILED") {
    return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  }
  if (normalized === "RETRY_PENDING") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  if (normalized === "PROCESSING") {
    return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
  }
  if (normalized === "PENDING") {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  return "bg-slate-500/15 text-slate-400 border-slate-500/30";
}

export function NotificationLogsList({ notifications, isLoading }: NotificationLogsListProps) {
  const [selectedNotification, setSelectedNotification] = useState<AdminNotificationLogItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <AdminEmptyState
        icon={Bell}
        title="Nenhuma notificação encontrada"
        description="Não há histórico de notificações registradas para este motorista."
      />
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto mt-2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/80">
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Data e Hora</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Canal</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Evento</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Destinatário</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tentativas</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {notifications.map((item) => {
              const channelBadge = getChannelBadgeStyle(item.canal);
              const statusBadge = getStatusBadgeStyle(item.status);

              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 text-xs font-mono font-semibold text-slate-300 whitespace-nowrap">
                    {formatRelativeTime(item.created_at)}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${channelBadge}`}>
                      {item.canal}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-bold text-slate-200 uppercase tracking-wide">
                    {item.evento}
                  </td>
                  <td className="py-4 text-xs font-mono font-semibold text-slate-300 whitespace-nowrap">
                    {item.destinatario}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadge}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                    {item.tentativas}/{item.max_tentativas}
                  </td>
                  <td className="py-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-xl text-blue-400 hover:bg-slate-800 hover:text-blue-300 px-2.5 flex items-center gap-1.5 ml-auto"
                      onClick={() => setSelectedNotification(item)}
                      title="Ver detalhes da notificação"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Inspecionar</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3 mb-4">
        {notifications.map((item) => {
          const channelBadge = getChannelBadgeStyle(item.canal);
          const statusBadge = getStatusBadgeStyle(item.status);

          return (
            <div
              key={item.id}
              className="p-3.5 bg-[#172136] rounded-2xl border border-slate-700/80 shadow-md space-y-2 text-left"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${channelBadge}`}>
                  {item.canal}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${statusBadge}`}>
                  {item.status}
                </span>
              </div>

              <div className="py-1 space-y-1">
                <p className="text-xs font-bold text-slate-100 uppercase leading-snug break-words">
                  {item.evento}
                </p>
                <p className="text-xs font-mono text-slate-400 break-words">
                  {item.destinatario}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-slate-200">
                    {formatRelativeTime(item.created_at)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ({item.tentativas}/{item.max_tentativas})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-600 hover:text-white flex items-center justify-center shadow-sm active:scale-95 transition-all shrink-0"
                  onClick={() => setSelectedNotification(item)}
                  title="Inspecionar notificação"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedNotification && (
        <AdminBaseDialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)} maxWidth="lg">
          <AdminBaseDialog.Header
            title="Detalhes da Notificação"
            subtitle="Informações técnicas da fila de envio"
            icon={<Send className="w-5 h-5 text-blue-400" />}
            onClose={() => setSelectedNotification(null)}
          />
          <AdminBaseDialog.Body>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Canal</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mt-1 ${getChannelBadgeStyle(selectedNotification.canal)}`}>
                  {selectedNotification.canal}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mt-1 ${getStatusBadgeStyle(selectedNotification.status)}`}>
                  {selectedNotification.status}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tentativas</p>
                <p className="text-xs font-mono font-bold text-slate-300 mt-1">
                  {selectedNotification.tentativas} de {selectedNotification.max_tentativas}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Evento</p>
                <p className="text-sm font-bold text-white uppercase">{selectedNotification.evento}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Destinatário</p>
                <p className="text-xs font-mono font-semibold text-slate-300 break-all">{selectedNotification.destinatario}</p>
              </div>
            </div>

            {selectedNotification.erro_mensagem && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-1">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Mensagem de Erro</p>
                <p className="text-xs font-mono text-rose-200 break-words leading-relaxed">{selectedNotification.erro_mensagem}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Criado em</p>
                <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                  {new Date(selectedNotification.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Próxima Tentativa</p>
                <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                  {selectedNotification.proxima_tentativa_em ? new Date(selectedNotification.proxima_tentativa_em).toLocaleString("pt-BR") : "—"}
                </p>
              </div>
              {selectedNotification.provider_message_id && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ID no Provedor</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5 break-all">{selectedNotification.provider_message_id}</p>
                </div>
              )}
              {selectedNotification.id && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ID da Notificação (Fila)</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5 break-all">{selectedNotification.id}</p>
                </div>
              )}
            </div>

            {selectedNotification.payload && Object.keys(selectedNotification.payload).length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Payload (JSON)</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(JSON.stringify(selectedNotification.payload, null, 2));
                      toast.success("Payload copiado para a área de transferência!");
                    }}
                    className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                  >
                    Copiar JSON
                  </Button>
                </div>
                <pre className="bg-slate-950 text-emerald-400 border border-slate-800 p-3.5 rounded-xl text-[11px] overflow-x-auto font-mono max-h-48 scrollbar-thin select-all leading-tight">
                  {JSON.stringify(selectedNotification.payload, null, 2)}
                </pre>
              </div>
            )}
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </>
  );
}
