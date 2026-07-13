import { useState } from "react";
import { Terminal, Eye } from "lucide-react";
import { AdminUserLogItem } from "@/services/api/admin.api";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { toast } from "@/utils/notifications/toast";
import { Loader2 } from "lucide-react";

interface ActivityLogsListProps {
  logs: AdminUserLogItem[];
  isLoading?: boolean;
}

export function ActivityLogsList({ logs, isLoading }: ActivityLogsListProps) {
  const [selectedLog, setSelectedLog] = useState<AdminUserLogItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Terminal className="h-12 w-12 mx-auto text-slate-300" />
        <p className="text-xs font-bold text-slate-400">Nenhum log de atividade encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto mt-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Data e Hora</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ação</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Usuário</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Entidade</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">IP</th>
              <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Dados</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const dateFormatted = new Date(log.created_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              const actionLabel = log.acao.replace(/_/g, " ").toLowerCase();

              return (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 text-xs font-semibold text-slate-600">
                    {dateFormatted}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/50">
                      {actionLabel}
                    </span>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    {log.usuarios ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[#1a3a5c] uppercase">{log.usuarios.nome}</span>
                        <span className="text-[10px] font-medium text-slate-500">{log.usuarios.telefone}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">—</span>
                    )}
                  </td>
                  <td className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    {log.entidade_tipo}
                  </td>
                  <td className="py-4">
                    <div className="text-xs font-medium text-slate-600 max-w-[360px] whitespace-normal break-words" title={log.descricao}>
                      {log.descricao}
                    </div>
                  </td>
                  <td className="py-4 hidden md:table-cell">
                    <code className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-mono text-slate-500">
                      {log.ip_address || "—"}
                    </code>
                  </td>
                  <td className="py-4 text-right">
                    {log.meta && Object.keys(log.meta).length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-2 flex items-center gap-1.5 ml-auto"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Inspecionar</span>
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 pr-4">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4 mb-4">
        {logs.map((log) => {
          const dateFormatted = new Date(log.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          const actionLabel = log.acao.replace(/_/g, " ").toLowerCase();

          return (
            <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {dateFormatted}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/50">
                  {actionLabel}
                </span>
              </div>

              {log.usuarios && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#1a3a5c] uppercase">{log.usuarios.nome}</span>
                  <span className="text-[10px] font-medium text-slate-500">{log.usuarios.telefone}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-500 uppercase tracking-wide">
                    {log.entidade_tipo}
                  </span>
                  {log.ip_address && (
                    <code className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 font-mono text-slate-500">
                      {log.ip_address}
                    </code>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed break-words break-all">
                  {log.descricao}
                </p>
              </div>

              {log.meta && Object.keys(log.meta).length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-3 flex items-center gap-1.5"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Inspecionar</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedLog && (
        <BaseDialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <BaseDialog.Header
            title="Metadados da Atividade"
            icon={<Terminal className="w-5 h-5 text-[#1a3a5c] bg-[#1a3a5c]/5 rounded-full p-0.5" />}
            onClose={() => setSelectedLog(null)}
          />
          <BaseDialog.Body>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ação</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 uppercase">{selectedLog.acao.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entidade ID</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5 break-all" title={selectedLog.entidade_id}>
                    {selectedLog.entidade_id}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dados Completos (JSON)</p>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs overflow-x-auto font-mono max-h-[320px] scrollbar-thin select-all">
                  {JSON.stringify(selectedLog.meta, null, 2)}
                </pre>
              </div>
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(JSON.stringify(selectedLog.meta, null, 2));
                toast.success("Metadados copiados para a área de transferência!");
              }}
              className="w-full h-11 rounded-xl bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/15 hover:bg-[#1a3a5c]/95"
            >
              Copiar JSON
            </Button>
          </BaseDialog.Footer>
        </BaseDialog>
      )}
    </>
  );
}
