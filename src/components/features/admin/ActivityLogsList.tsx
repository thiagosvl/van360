import { useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, Eye, FileText } from "lucide-react";
import { AdminUserLogItem } from "@/services/api/admin.api";
import { Button } from "@/components/ui/button";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { toast } from "@/utils/notifications/toast";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";

interface ActivityLogsListProps {
  logs: AdminUserLogItem[];
  isLoading?: boolean;
  hideUserColumn?: boolean;
}

function getActionBadgeStyle(acao: string) {
  const normalized = acao.toUpperCase();
  if (normalized.includes("LOGIN") || normalized.includes("SESSAO")) {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  if (normalized.includes("CRIAR") || normalized.includes("CADASTRO") || normalized.includes("ADICIONAR")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (normalized.includes("ATUALIZAR") || normalized.includes("ALTERAR") || normalized.includes("EDITAR") || normalized.includes("CONCEDER")) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  if (normalized.includes("EXCLUIR") || normalized.includes("DELETAR") || normalized.includes("CANCELAR") || normalized.includes("RESETAR")) {
    return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  }
  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
}

export function ActivityLogsList({ logs, isLoading, hideUserColumn = false }: ActivityLogsListProps) {
  const [selectedLog, setSelectedLog] = useState<AdminUserLogItem | null>(null);

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

  return (
    <>
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto mt-2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/80">
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Data e Hora</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ação</th>
              {!hideUserColumn && (
                <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuário</th>
              )}
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Entidade</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {logs.map((log) => {
              const dateFormatted = new Date(log.created_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              const actionLabel = log.acao.replace(/_/g, " ");
              const badgeStyle = getActionBadgeStyle(log.acao);
              const userId = log.usuario_id || log.usuarios?.id;

              return (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 text-xs font-mono font-semibold text-slate-300 whitespace-nowrap">
                    {dateFormatted}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                      {actionLabel}
                    </span>
                  </td>
                  {!hideUserColumn && (
                    <td className="py-4">
                      {log.usuarios ? (
                        userId ? (
                          <Link
                            to={`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}?tab=logs`}
                            className="text-xs font-bold text-slate-100 uppercase hover:text-blue-400 hover:underline transition-colors"
                          >
                            {log.usuarios.nome}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold text-slate-100 uppercase">{log.usuarios.nome}</span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sistema</span>
                      )}
                    </td>
                  )}
                  <td className="py-4 text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    {log.entidade_tipo}
                  </td>
                  <td className="py-4 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-xl text-blue-400 hover:bg-slate-800 hover:text-blue-300 px-2.5 flex items-center gap-1.5 ml-auto"
                      onClick={() => setSelectedLog(log)}
                      title="Ver detalhes da atividade"
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

      {/* MOBILE CARDS VIEW */}
      <div className="md:hidden space-y-3 mb-4">
        {logs.map((log) => {
          const dateFormatted = new Date(log.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          const actionLabel = log.acao.replace(/_/g, " ");
          const badgeStyle = getActionBadgeStyle(log.acao);
          const userId = log.usuario_id || log.usuarios?.id;

          return (
            <div key={log.id} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${badgeStyle}`}>
                  {actionLabel}
                </span>
                <span className="text-[10px] font-bold font-mono text-slate-400 shrink-0">
                  {dateFormatted}
                </span>
              </div>

              {!hideUserColumn && log.usuarios && (
                <div className="pt-1">
                  {userId ? (
                    <Link
                      to={`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}?tab=logs`}
                      className="text-xs font-bold text-slate-100 uppercase hover:text-blue-400 hover:underline transition-colors"
                    >
                      {log.usuarios.nome}
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-slate-100 uppercase">{log.usuarios.nome}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-400 uppercase tracking-wide">
                  {log.entidade_tipo}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-xl text-blue-400 hover:bg-slate-800 hover:text-blue-300 px-3 flex items-center gap-1.5"
                  onClick={() => setSelectedLog(log)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Inspecionar</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE DETALHES COMPLETO DO LOG COM ADMINBASEDIALOG */}
      {selectedLog && (
        <AdminBaseDialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)} maxWidth="lg">
          <AdminBaseDialog.Header
            title="Detalhes da Atividade"
            subtitle="Informações registradas no sistema"
            icon={<FileText className="w-5 h-5 text-blue-400" />}
            onClose={() => setSelectedLog(null)}
          />
          <AdminBaseDialog.Body>
            {/* BADGES AÇÃO & ENTIDADE */}
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

            {/* USUÁRIO / AUTOR */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usuário / Autor</p>
              {selectedLog.usuarios ? (
                <>
                  <p className="text-sm font-bold text-white uppercase">
                    {(selectedLog.usuario_id || selectedLog.usuarios?.id) ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${selectedLog.usuario_id || selectedLog.usuarios?.id}?tab=logs`}
                        className="hover:text-blue-400 hover:underline transition-colors"
                        onClick={() => setSelectedLog(null)}
                      >
                        {selectedLog.usuarios.nome}
                      </Link>
                    ) : (
                      selectedLog.usuarios.nome
                    )}
                  </p>
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

            {/* DESCRIÇÃO COMPLETA */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Descrição da Ação</p>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed break-words">{selectedLog.descricao}</p>
            </div>

            {/* DATA, HORA, IP & ENTIDADE ID */}
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

            {/* METADADOS JSON */}
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
