import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MonitorSmartphone,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiClient } from "@/services/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNowBR, toPersistenceString } from "@/utils/dateUtils";

export interface LoginAttempt {
  id: string;
  login_tentado: string;
  ip: string | null;
  user_agent: string | null;
  dispositivo: string | null;
  sucesso: boolean;
  motivo_falha: string | null;
  created_at: string;
}

// Hook simples de debounce caso não exista um utilitário global
function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminLoginAttempts() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limitStr, setLimitStr] = useState("25");
  const limit = parseInt(limitStr);

  const todayStr = toPersistenceString(getNowBR());
  const yesterdayStr = toPersistenceString(new Date(getNowBR().getTime() - 24 * 60 * 60 * 1000));

  const [filters, setFilters] = useState({
    dataInicio: yesterdayStr,
    dataFim: todayStr,
    cpf: "",
  });

  const debouncedCpf = useDebounce(filters.cpf, 500);

  const isTypingCpf = debouncedCpf.length > 0 && debouncedCpf.length < 14;

  const {
    data: attemptsResponse,
    isFetching: isFetchingLogs,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ["admin", "login-attempts", filters.dataInicio, filters.dataFim, debouncedCpf, page],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LoginAttempt[]; total: number }>("/admin/login-attempts", {
        params: {
          page,
          limit,
          data_inicio: filters.dataInicio || undefined,
          data_fim: filters.dataFim || undefined,
          search_cpf: debouncedCpf || undefined,
        }
      });
      return data;
    },
    enabled: !isTypingCpf,
    staleTime: 60 * 1000,
  });

  const attemptsData = attemptsResponse?.data || [];
  const total = attemptsResponse?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
              Tentativas de Login
            </h1>
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Monitore todos os acessos ao sistema, incluindo falhas e bloqueios.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden animate-in fade-in duration-300 bg-white">
        <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
              Histórico de Acessos
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
                onClick={() => { setPage(1); refetchLogs(); }}
                disabled={isFetchingLogs}
                className="h-8 rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-3 flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLogs ? "animate-spin" : ""}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 ${!isMobileFiltersOpen ? 'hidden md:grid' : ''}`}>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</Label>
              <Input
                type="text"
                placeholder="CPF, Telefone ou ID..."
                value={filters.cpf}
                onChange={(e) => { setPage(1); setFilters(p => ({ ...p, cpf: e.target.value })) }}
                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Início</Label>
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => { setPage(1); setFilters(p => ({ ...p, dataInicio: e.target.value })) }}
                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Fim</Label>
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => { setPage(1); setFilters(p => ({ ...p, dataFim: e.target.value })) }}
                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] transition-colors"
              />
            </div>
          </div>

          {isFetchingLogs ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c] mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando histórico...</p>
            </div>
          ) : attemptsData.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-100">
                <ShieldAlert className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500">Nenhuma tentativa de login encontrada.</p>
              <p className="text-xs text-slate-400">Tente ajustar os filtros de busca acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 pl-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Data e Hora</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">CPF Tentado</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Dispositivo</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">IP</th>
                    <th className="pb-4 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Infos</th>
                  </tr>
                </thead>
                <tbody>
                  {attemptsData.map((attempt) => {
                    const dateFormatted = new Date(attempt.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <tr key={attempt.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-2">
                            {attempt.sucesso ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sucesso</span>
                              </div>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 cursor-help">
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Falha</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[250px] p-3 text-xs bg-slate-800 text-white font-medium shadow-xl border-0">
                                  {attempt.motivo_falha || "Motivo desconhecido"}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-600">
                          {dateFormatted}
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-bold text-[#1a3a5c]">
                            {attempt.login_tentado}
                          </span>
                        </td>
                        <td className="py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MonitorSmartphone className="h-4 w-4" />
                            <span className="text-xs font-semibold">{attempt.dispositivo || "Desconhecido"}</span>
                          </div>
                        </td>
                        <td className="py-4 hidden md:table-cell">
                          <code className="text-[10px] bg-white px-2 py-1 rounded-md border border-slate-200 font-mono text-slate-500 shadow-sm">
                            {attempt.ip || "—"}
                          </code>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <span className="text-xs font-bold">UA</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[300px] p-3 text-xs break-words font-mono bg-white text-slate-600 border border-slate-200 shadow-xl">
                              <p className="font-bold text-slate-800 mb-1 font-sans text-[10px] uppercase tracking-widest">User Agent Original</p>
                              {attempt.user_agent || "Nenhum agente fornecido"}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {total > 0 && attemptsData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-4">
              <p className="text-xs font-semibold text-slate-400">
                Página {page} de {Math.max(1, Math.ceil(total / limit))} ({total} tentativas)
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                  <Select value={limitStr} onValueChange={(val) => { setLimitStr(val); setPage(1); }}>
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
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-xl border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl border-slate-200"
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
