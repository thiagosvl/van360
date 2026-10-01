import { useState } from "react";
import { History, ChevronLeft, ChevronRight, RefreshCw, Calendar, Phone } from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { useAdminUserLogs } from "@/hooks/api/admin/useAdminLogHooks";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";
import { AtividadeAcao } from "@/types/enums";
import { formatDateBR } from "@/utils/formatters/date";
import { phoneMask } from "@/utils/masks";

export interface AdminUserActivityHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhone?: string | null;
  dataInicio?: string;
  dataFim?: string;
}

export default function AdminUserActivityHistoryDialog({
  open,
  onClose,
  userId,
  userName,
  userPhone,
  dataInicio,
  dataFim,
}: AdminUserActivityHistoryDialogProps) {
  const [page, setPage] = useState(1);
  const [acaoFilter, setAcaoFilter] = useState("all");

  const { data: logsData, isLoading, isFetching, refetch } = useAdminUserLogs(
    open ? userId : "",
    {
      page,
      limit: 20,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      acao: acaoFilter === "all" ? undefined : acaoFilter,
    }
  );

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const periodSubtitle = dataInicio && dataFim
    ? dataInicio === dataFim
      ? `Atividades em ${formatDateBR(dataInicio)}`
      : `Atividades de ${formatDateBR(dataInicio)} até ${formatDateBR(dataFim)}`
    : "Histórico de atividades";

  const totalPages = logsData ? Math.max(1, Math.ceil(logsData.total / logsData.limit)) : 1;

  return (
    <AdminBaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      maxWidth="3xl"
    >
      <AdminBaseDialog.Header
        title={userName}
        subtitle={periodSubtitle}
        icon={<History className="w-5 h-5 text-blue-400" />}
        onClose={handleClose}
      />
      <AdminBaseDialog.Body>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              {userPhone && (
                <span className="inline-flex items-center gap-1.5 text-slate-400 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  {phoneMask(userPhone)}
                </span>
              )}
              {dataInicio && (
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {formatDateBR(dataInicio)} {dataFim && dataFim !== dataInicio ? `a ${formatDateBR(dataFim)}` : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={acaoFilter}
                onValueChange={(val) => {
                  setPage(1);
                  setAcaoFilter(val);
                }}
              >
                <SelectTrigger className="h-8 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs focus-visible:ring-0 min-w-[140px]">
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 max-h-64">
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.values(AtividadeAcao).map((acao) => (
                    <SelectItem key={acao} value={acao} className="text-xs">
                      {acao.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-8 px-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                title="Recarregar"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <ActivityLogsList
            logs={logsData?.data || []}
            isLoading={isLoading && !logsData}
            hideUserColumn={true}
            highlightFirst={false}
          />

          {logsData && logsData.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800/80 gap-3">
              <p className="text-xs font-semibold text-slate-400">
                Página {logsData.page} de {totalPages} ({logsData.total} atividades registradas)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </AdminBaseDialog.Body>
    </AdminBaseDialog>
  );
}
