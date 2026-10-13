import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLayout } from "@/contexts/LayoutContext";
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
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminPeriodFilter } from "@/components/ui/AdminPeriodFilter";
import { getNowBR, toPersistenceString } from "@/utils/dateUtils";
import { cpfCnpjMask } from "@/utils/masks";

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

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminLoginAttempts() {
  const { setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Tentativas de Login");
  }, [setPageTitle]);

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
      <Card className="border border-border shadow-xs rounded-xl overflow-hidden bg-card">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              Histórico de acessos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsMobileFiltersOpen(p => !p)}
                className={`md:hidden h-9 rounded-lg px-2.5 flex items-center gap-1.5 border transition-all text-xs font-medium ${
                  isMobileFiltersOpen
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-secondary/60 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filtros</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setPage(1); refetchLogs(); }}
                disabled={isFetchingLogs}
                className="h-9 rounded-lg text-primary bg-secondary/60 border border-border hover:bg-secondary hover:text-primary px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLogs ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 ${!isMobileFiltersOpen ? 'hidden md:grid' : ''}`}>
            <div className="flex flex-col gap-1.5 text-left">
              <Label className="text-xs font-medium text-muted-foreground block leading-none">Usuário</Label>
              <Input
                type="text"
                placeholder="Documento, telefone ou ID..."
                value={filters.cpf}
                onChange={(e) => { setPage(1); setFilters(p => ({ ...p, cpf: e.target.value })) }}
                className="h-9 w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
              />
            </div>
            <AdminPeriodFilter
              label="Período das tentativas"
              defaultPreset="ontem"
              startDate={filters.dataInicio}
              endDate={filters.dataFim}
              onChange={(start, end) => {
                setPage(1);
                setFilters(p => ({ ...p, dataInicio: start, dataFim: end }));
              }}
            />
          </div>

          {isFetchingLogs ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-xs font-normal text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : attemptsData.length === 0 ? (
            <AdminEmptyState
              icon={ShieldAlert}
              title="Nenhuma tentativa de login encontrada"
              description="Nenhum registro de acesso corresponde aos filtros de busca aplicados."
            />
          ) : (
            <>
              {/* MOBILE CARDS VIEW */}
              <div className="md:hidden space-y-3 mb-4 text-left">
                {attemptsData.map((attempt) => {
                  const dateFormatted = new Date(attempt.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={attempt.id}
                      className="p-3.5 bg-card rounded-xl border border-border shadow-xs space-y-2 text-left"
                    >
                      {/* LINHA 1: STATUS & DISPOSITIVO */}
                      <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                        {attempt.sucesso ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Sucesso</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="h-3 w-3" />
                            <span className="text-[10px] font-medium">Falha</span>
                          </div>
                        )}
                        <span className="text-xs font-medium text-foreground truncate max-w-[160px]">
                          {attempt.dispositivo || "Desconhecido"}
                        </span>
                      </div>

                      {/* LINHA 2: DOCUMENTO FORMATADO & MOTIVO DA FALHA */}
                      <div className="py-0.5 space-y-1">
                        <span className="text-xs font-semibold font-mono text-foreground block break-words">
                          {cpfCnpjMask(attempt.login_tentado)}
                        </span>
                        {!attempt.sucesso && attempt.motivo_falha && (
                          <p className="text-xs font-normal text-rose-400 leading-snug break-words">
                            {attempt.motivo_falha}
                          </p>
                        )}
                      </div>

                      {/* LINHA 3: DATA & HORA & IP */}
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-left">
                        <span className="text-xs font-mono text-muted-foreground">
                          {dateFormatted}
                        </span>
                        {attempt.ip && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground shrink-0">
                            {attempt.ip}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 pl-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Data e hora</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground">Documento tentado</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Dispositivo</th>
                      <th className="pb-3 text-xs font-medium text-muted-foreground hidden md:table-cell">IP</th>
                      <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground text-right">Infos</th>
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
                        <tr key={attempt.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors group">
                          <td className="py-3.5 pl-4">
                            <div className="flex items-center gap-2">
                              {attempt.sucesso ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">Sucesso</span>
                                </div>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 cursor-help">
                                      <XCircle className="h-3.5 w-3.5" />
                                      <span className="text-xs font-medium">Falha</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-[250px] p-3 text-xs bg-popover text-popover-foreground font-normal shadow-md border border-border">
                                    {attempt.motivo_falha || "Motivo desconhecido"}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 text-xs font-normal text-muted-foreground font-mono">
                            {dateFormatted}
                          </td>
                          <td className="py-3.5">
                            <span className="text-xs font-semibold text-foreground font-mono">
                              {cpfCnpjMask(attempt.login_tentado)}
                            </span>
                          </td>
                          <td className="py-3.5 hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-normal">{attempt.dispositivo || "Desconhecido"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 hidden md:table-cell">
                            <code className="text-xs bg-secondary px-2 py-0.5 rounded-md border border-border font-mono text-muted-foreground">
                              {attempt.ip || "—"}
                            </code>
                          </td>
                          <td className="py-3.5 pr-4 text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <span className="text-xs font-medium">UA</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[300px] p-3 text-xs break-words font-mono bg-popover text-popover-foreground border border-border shadow-md">
                                <p className="font-semibold text-foreground mb-1 font-sans text-xs">User Agent original</p>
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
            </>
          )}

          {total > 0 && attemptsData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border gap-4">
              <p className="text-xs font-normal text-muted-foreground">
                Página {page} de {Math.max(1, Math.ceil(total / limit))} ({total} tentativas)
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Exibir:</Label>
                  <Select value={limitStr} onValueChange={(val) => { setLimitStr(val); setPage(1); }}>
                    <SelectTrigger className="h-9 rounded-lg bg-background border border-border text-foreground text-xs focus-visible:ring-0 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
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
                    size="icon"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-9 w-9 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-9 w-9 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-40"
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
