import { useState } from "react";
import { Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminLogs } from "@/hooks/api/adminHooks";
import { getNowBR, toPersistenceString } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";

export default function AdminActivityHistory() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [limit, setLimit] = useState("25");

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

      <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e]">
        <CardHeader className="pb-2 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
              Logs do Sistema
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileFiltersOpen(p => !p)}
                className={`md:hidden h-8 rounded-xl px-2 flex items-center gap-1.5 ${isMobileFiltersOpen ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setLogsPage(1); refetchLogs(); }}
                disabled={isFetchingLogs}
                className="h-8 rounded-xl text-blue-400 hover:bg-blue-500/10 px-3 flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLogs ? "animate-spin" : ""}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 ${!isMobileFiltersOpen ? 'hidden md:grid' : ''}`}>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</Label>
              <Input
                type="text"
                placeholder="Documento, Telefone ou ID..."
                value={logsFilter.search_cpf}
                onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, search_cpf: e.target.value })) }}
                className="h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Início</Label>
              <Input
                type="date"
                value={logsFilter.dataInicio}
                onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataInicio: e.target.value })) }}
                className="h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Fim</Label>
              <Input
                type="date"
                value={logsFilter.dataFim}
                onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataFim: e.target.value })) }}
                className="h-10 rounded-xl bg-slate-900/90 border-slate-800 text-slate-100 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</Label>
              <Select value={logsFilter.acao} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, acao: val })) }}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-[13px] focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.values(AtividadeAcao).map(acao => (
                    <SelectItem key={acao} value={acao} className="text-[13px]">{acao.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidade</Label>
              <Select value={logsFilter.entidade} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, entidade: val })) }}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-[13px] focus-visible:ring-0">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="all">Todas as entidades</SelectItem>
                  {Object.values(AtividadeEntidadeTipo).map(ent => (
                    <SelectItem key={ent} value={ent} className="text-[13px]">{ent.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ActivityLogsList logs={logsData?.data || []} isLoading={isFetchingLogs} />

          {!isFetchingLogs && logsData && logsData.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-800 gap-4">
              <p className="text-xs font-semibold text-slate-400">
                Página {logsData.page} de {Math.max(1, Math.ceil(logsData.total / logsData.limit))} ({logsData.total} logs)
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                  <Select value={limit} onValueChange={(val) => { setLimit(val); setLogsPage(1); }}>
                    <SelectTrigger className="h-8 rounded-xl bg-slate-900 border-slate-800 text-slate-200 text-xs focus-visible:ring-0 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
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
                    className="rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logsPage >= Math.ceil(logsData.total / logsData.limit)}
                    onClick={() => setLogsPage(p => p + 1)}
                    className="rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
