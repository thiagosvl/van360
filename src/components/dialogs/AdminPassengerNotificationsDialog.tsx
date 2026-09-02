import { useState } from "react";
import { Bell, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { NotificationLogsList } from "@/components/features/admin/NotificationLogsList";
import { useAdminPassengerNotifications } from "@/hooks/api/adminHooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface AdminPassengerNotificationsDialogProps {
  open: boolean;
  onClose: () => void;
  passageiroId: string;
  passageiroNome: string;
}

export default function AdminPassengerNotificationsDialog({
  open,
  onClose,
  passageiroId,
  passageiroNome,
}: AdminPassengerNotificationsDialogProps) {
  const [page, setPage] = useState(1);
  const [limitStr, setLimitStr] = useState("25");

  const { data, isFetching, refetch } = useAdminPassengerNotifications(passageiroId, {
    page,
    limit: parseInt(limitStr),
  });

  return (
    <AdminBaseDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} maxWidth="4xl">
      <AdminBaseDialog.Header
        title={`Notificações — ${passageiroNome}`}
        subtitle="Histórico de mensagens disparadas para os responsáveis deste aluno"
        icon={<Bell className="w-5 h-5 text-indigo-400" />}
        onClose={onClose}
      />
      <AdminBaseDialog.Body>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {data ? `${data.total} ${data.total === 1 ? "notificação registrada" : "notificações registradas"}` : "Carregando..."}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => { setPage(1); refetch(); }}
              disabled={isFetching}
              className="h-8 rounded-xl text-blue-400 bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:text-blue-300 hover:border-slate-700/80 px-3 flex items-center gap-1.5 transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Atualizar</span>
            </Button>
          </div>

          <NotificationLogsList notifications={data?.data || []} isLoading={isFetching} />

          {data && data.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800 gap-4">
              <p className="text-xs font-semibold text-slate-400">
                Página {data.page} de {Math.max(1, Math.ceil(data.total / data.limit))} ({data.total} total)
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                  <Select value={limitStr} onValueChange={(val) => { setLimitStr(val); setPage(1); }}>
                    <SelectTrigger className="h-8 rounded-xl bg-slate-800/60 border-slate-700/80 text-xs text-slate-100 focus-visible:ring-0 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="250">250</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={page >= Math.ceil(data.total / data.limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminBaseDialog.Body>
    </AdminBaseDialog>
  );
}
