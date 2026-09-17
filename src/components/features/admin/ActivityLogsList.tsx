import { useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, Eye, FileText, Clock, Loader2 } from "lucide-react";
import { AdminUserLogItem } from "@/services/api/admin.api";
import { Button } from "@/components/ui/button";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { toast } from "@/utils/notifications/toast";
import { ROUTES } from "@/constants/routes";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { phoneMask } from "@/utils/masks";
import { formatRelativeTime } from "@/utils/formatters/date";
import { safeCloseDialog } from "@/hooks";

interface ActivityLogsListProps {
  logs: AdminUserLogItem[];
  isLoading?: boolean;
  hideUserColumn?: boolean;
  highlightFirst?: boolean;
}

function getActionBadgeStyle(acao: string) {
  const normalized = acao.toUpperCase();
  if (normalized.includes("LOGIN") || normalized.includes("SESSAO")) {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  if (normalized.includes("CRIAR") || normalized.includes("CRIAD") || normalized.includes("CADASTRO") || normalized.includes("CADASTRAD") || normalized.includes("ADICIONAR")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (normalized.includes("PRINCIPAL")) {
    return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
  }
  if (normalized.includes("NOTIFICACAO")) {
    return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  }
  if (normalized.includes("ATUALIZAR") || normalized.includes("ATUALIZAD") || normalized.includes("ALTERAR") || normalized.includes("ALTERAD") || normalized.includes("EDITAR") || normalized.includes("EDITAD") || normalized.includes("CONCEDER")) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  if (normalized.includes("EXCLUIR") || normalized.includes("EXCLUID") || normalized.includes("DELETAR") || normalized.includes("DELETAD") || normalized.includes("CANCELAR") || normalized.includes("CANCELAD") || normalized.includes("RESETAR") || normalized.includes("RESETAD")) {
    return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  }
  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
}

export function ActivityLogsList({
  logs,
  isLoading,
  hideUserColumn = false,
  highlightFirst = true,
}: ActivityLogsListProps) {
  const [selectedLog, setSelectedLog] = useState<AdminUserLogItem | null>(null);

  const handleCloseModal = () => {
    safeCloseDialog(() => setSelectedLog(null));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <AdminEmptyState
        icon={Terminal}
        title="Nenhum log de atividade encontrado"
        description="Não há registros de atividades registradas para este filtro de busca."
      />
    );
  }

  const latestLog = highlightFirst && logs.length > 0 ? logs[0] : null;
  const remainingLogs = highlightFirst ? logs.slice(1) : logs;

  const latestUserName = latestLog
    ? hideUserColumn
      ? latestLog.acao.replace(/_/g, " ")
      : (latestLog.usuarios?.apelido || latestLog.usuarios?.nome || latestLog.entidade_tipo)
    : "";

  return (
    <>
      <div className="space-y-3">
        {latestLog && (
          <div className="p-4 rounded-2xl bg-blue-950/30 border-2 border-blue-500/60 shadow-lg shadow-blue-500/10 relative space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 break-words">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                  {!hideUserColumn && (latestLog.usuario_id || latestLog.usuarios?.id) ? (
                    <Link
                      to={`${ROUTES.PRIVATE.ADMIN.USERS}/${latestLog.usuario_id || latestLog.usuarios?.id}`}
                      className="hover:text-blue-400 hover:underline transition-colors"
                    >
                      {latestUserName}
                    </Link>
                  ) : (
                    <span>{latestUserName}</span>
                  )}
                </h4>
                <p className="text-xs font-medium text-slate-200 leading-relaxed break-words">
                  {latestLog.descricao}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-blue-500/20 gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-200 text-xs font-extrabold font-mono shadow-sm shadow-blue-500/10">
                <Clock className="h-4 w-4 text-blue-400" />
                {formatRelativeTime(latestLog.created_at)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(latestLog)}
                className="h-8 px-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">INSPECIONAR</span>
              </Button>
            </div>
          </div>
        )}

        {remainingLogs.map((log) => {
          const userId = log.usuario_id || log.usuarios?.id;
          const displayName = hideUserColumn
            ? log.acao.replace(/_/g, " ")
            : (log.usuarios?.apelido || log.usuarios?.nome || log.entidade_tipo);

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4 transition-colors hover:bg-slate-900/90"
            >
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold font-mono text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800/80 shrink-0">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {formatRelativeTime(log.created_at)}
              </span>

              <div className="space-y-1.5 md:space-y-0.5 min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between gap-2 md:block">
                  <h5 className="text-xs font-bold text-slate-100 break-words md:truncate leading-tight">
                    {!hideUserColumn && userId ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}`}
                        className="hover:text-blue-400 hover:underline transition-colors"
                      >
                        {displayName}
                      </Link>
                    ) : (
                      <span>{displayName}</span>
                    )}
                  </h5>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                    className="md:hidden h-7 w-7 p-0 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white shrink-0"
                    title="Ver detalhes da atividade"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="text-xs text-slate-300 md:text-slate-400 leading-relaxed md:leading-normal break-words md:truncate">
                  {log.descricao}
                </p>

                <div className="pt-1 md:hidden">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/80">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(log)}
                className="hidden md:flex h-7 w-7 p-0 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white shrink-0"
                title="Ver detalhes da atividade"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      {selectedLog && (
        <AdminBaseDialog
          open={!!selectedLog}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
          }}
          maxWidth="lg"
        >
          <AdminBaseDialog.Header
            title="Detalhes da Atividade"
            subtitle="Informações registradas no sistema"
            icon={<FileText className="w-5 h-5 text-blue-400" />}
            onClose={handleCloseModal}
          />
          <AdminBaseDialog.Body>
            <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ação</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mt-1 ${getActionBadgeStyle(selectedLog.acao)}`}>
                  {selectedLog.acao.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entidade</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/80 mt-1">
                  {selectedLog.entidade_tipo}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usuário / Autor</p>
              {selectedLog.usuarios ? (
                <>
                  <p className="text-sm font-bold text-white uppercase">
                    {(selectedLog.usuario_id || selectedLog.usuarios?.id) ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${selectedLog.usuario_id || selectedLog.usuarios?.id}`}
                        className="hover:text-blue-400 hover:underline transition-colors"
                        onClick={handleCloseModal}
                      >
                        {selectedLog.usuarios.apelido || selectedLog.usuarios.nome}
                      </Link>
                    ) : (
                      selectedLog.usuarios.apelido || selectedLog.usuarios.nome
                    )}
                  </p>
                  {selectedLog.usuarios.apelido && selectedLog.usuarios.nome && (
                    <p className="text-xs text-slate-400">Nome: {selectedLog.usuarios.nome}</p>
                  )}
                  {selectedLog.usuarios.email && (
                    <p className="text-xs font-semibold text-slate-400">{selectedLog.usuarios.email}</p>
                  )}
                  {selectedLog.usuarios.telefone && (
                    <p className="text-xs font-mono text-slate-400">{phoneMask(selectedLog.usuarios.telefone)}</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 uppercase font-semibold">Sistema</p>
              )}
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Descrição da Ação</p>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed break-words">{selectedLog.descricao}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data e Hora</p>
                <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                  {new Date(selectedLog.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Endereço IP</p>
                <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">{selectedLog.ip_address || "—"}</p>
              </div>
              {selectedLog.entidade_id && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ID da Entidade</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5 break-all">{selectedLog.entidade_id}</p>
                </div>
              )}
            </div>

            {selectedLog.meta && Object.keys(selectedLog.meta).length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Metadados Completos (JSON)</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(JSON.stringify(selectedLog.meta, null, 2));
                      toast.success("Metadados copiados para a área de transferência!");
                    }}
                    className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                  >
                    Copiar JSON
                  </Button>
                </div>
                <pre className="bg-slate-950 text-emerald-400 border border-slate-800 p-3.5 rounded-xl text-[11px] overflow-x-auto font-mono max-h-48 scrollbar-thin select-all leading-tight">
                  {JSON.stringify(selectedLog.meta, null, 2)}
                </pre>
              </div>
            )}
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </>
  );
}
