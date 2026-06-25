import { useState } from "react";
import { Terminal, Filter, RefreshCw, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminLogs } from "@/hooks/api/adminHooks";
import { AdminUserLogItem } from "@/services/api/admin.api";
import { getNowBR, toPersistenceString } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { toast } from "@/utils/notifications/toast";
import { Loader2 } from "lucide-react";

export default function AdminActivityHistory() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [limit, setLimit] = useState("25");
  const [selectedLog, setSelectedLog] = useState<AdminUserLogItem | null>(null);

  const today = toPersistenceString(getNowBR());
  const sevenDaysAgo = toPersistenceString(new Date(getNowBR().getTime() - 7 * 24 * 60 * 60 * 1000));

  const [logsFilter, setLogsFilter] = useState({
    dataInicio: sevenDaysAgo,
    dataFim: today,
    acao: "all",
    entidade: "all",
    search_cpf: "",
  });

  const { data: logsData, isFetching: isFetchingLogs, refetch: refetchLogs } = useAdminLogs({
    page: logsPage,
    limit: parseInt(limit),
    dataInicio: logsFilter.dataInicio || undefined,
    dataFim: logsFilter.dataFim || undefined,
    acao: logsFilter.acao === "all" ? undefined : logsFilter.acao,
    entidade: logsFilter.entidade === "all" ? undefined : logsFilter.entidade,
    search_cpf: logsFilter.search_cpf || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-headline font-black text-[#1a3a5c] tracking-tight flex items-center gap-2">
          <Terminal className="h-6 w-6 text-blue-600" />
          Histórico de Atividades
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Acompanhe todas as atividades registradas no sistema globalmente.
        </p>
      </div>

      <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden animate-in fade-in duration-300 bg-white">
        <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
              Logs do Sistema
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileFiltersOpen(p => !p)}
                className={`md:hidden h-8 rounded-xl px-2 flex items-center gap-1.5 ${isMobileFiltersOpen ? 'bg-[#1a3a5c]/10 text-[#1a3a5c]' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setLogsPage(1); refetchLogs(); }}
                disabled={isFetchingLogs}
                className="h-8 rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-3 flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLogs ? "animate-spin" : ""}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 ${!isMobileFiltersOpen ? 'hidden md:grid' : ''}`}>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</Label>
              <Input
                type="text"
                placeholder="CPF, Telefone ou ID..."
                value={logsFilter.search_cpf}
                onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, search_cpf: e.target.value })) }}
                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Início</Label>
              <Input
                type="date"
                value={logsFilter.dataInicio}
                onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataInicio: e.target.value })) }}
                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Fim</Label>
              <Input
                type="date"
                value={logsFilter.dataFim}
                onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataFim: e.target.value })) }}
                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</Label>
              <Select value={logsFilter.acao} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, acao: val })) }}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.values(AtividadeAcao).map(acao => (
                    <SelectItem key={acao} value={acao} className="text-[13px]">{acao.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidade</Label>
              <Select value={logsFilter.entidade} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, entidade: val })) }}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as entidades</SelectItem>
                  {Object.values(AtividadeEntidadeTipo).map(ent => (
                    <SelectItem key={ent} value={ent} className="text-[13px]">{ent.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isFetchingLogs ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
            </div>
          ) : !logsData || logsData.data.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Terminal className="h-12 w-12 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-400">Nenhum log de atividade encontrado.</p>
            </div>
          ) : (
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
                    {logsData.data.map((log) => {
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
                {logsData.data.map((log) => {
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

              {logsData.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Página {logsData.page} de {Math.max(1, Math.ceil(logsData.total / logsData.limit))} ({logsData.total} logs)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                      <Select value={limit} onValueChange={(val) => { setLimit(val); setLogsPage(1); }}>
                        <SelectTrigger className="h-8 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-0 w-[70px]">
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
                      variant="outline"
                      size="sm"
                      disabled={logsPage <= 1}
                      onClick={() => setLogsPage(p => p - 1)}
                      className="rounded-xl border-slate-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={logsPage >= Math.ceil(logsData.total / logsData.limit)}
                      onClick={() => setLogsPage(p => p + 1)}
                      className="rounded-xl border-slate-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
