import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ClockAlert,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { formatDateBR } from "@/utils/formatters";
import { phoneMask } from "@/utils/masks";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import type { TrialPipelineItem } from "@/services/api/admin/admin-financial.api";

interface AdminTrialsPipelineTableProps {
  trials: TrialPipelineItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

type PeriodFilter = "todos" | "1a2" | "3a5" | "6a10" | "mais10";
type SortField = "diasAcessados" | "totalAcoes";
type SortDirection = "asc" | "desc";

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminTrialsPipelineTable({ trials, isLoading, onRefresh }: AdminTrialsPipelineTableProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("todos");
  const [searchActive, setSearchActive] = useState("");
  const [sortFieldActive, setSortFieldActive] = useState<SortField | null>(null);
  const [sortDirectionActive, setSortDirectionActive] = useState<SortDirection>("desc");
  const [pageActive, setPageActive] = useState(1);
  const pageSize = 20;

  const [searchExpired, setSearchExpired] = useState("");
  const [sortFieldExpired, setSortFieldExpired] = useState<SortField>("totalAcoes");
  const [sortDirectionExpired, setSortDirectionExpired] = useState<SortDirection>("desc");
  const [pageExpired, setPageExpired] = useState(1);

  const activeTrials = useMemo(() => {
    return trials.filter((t) => t.diasRestantes >= 0);
  }, [trials]);

  const recentExpiredTrials = useMemo(() => {
    return trials.filter((t) => t.diasRestantes < 0);
  }, [trials]);

  const handleCopyPhone = (phone: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(phoneMask(phone));
    toast.success("Telefone copiado para a área de transferência!");
  };

  const handlePeriodFilterChange = (filter: PeriodFilter) => {
    setPeriodFilter(filter);
    setPageActive(1);
  };

  const handleSortToggleActive = (field: SortField) => {
    setPageActive(1);
    if (sortFieldActive !== field) {
      setSortFieldActive(field);
      setSortDirectionActive("desc");
      return;
    }

    if (sortDirectionActive === "desc") {
      setSortDirectionActive("asc");
      return;
    }

    setSortFieldActive(null);
    setSortDirectionActive("desc");
  };

  const handleSortToggleExpired = (field: SortField) => {
    setPageExpired(1);
    if (sortFieldExpired !== field) {
      setSortFieldExpired(field);
      setSortDirectionExpired("desc");
      return;
    }

    setSortDirectionExpired((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const activeCounts = useMemo(() => {
    return {
      todos: activeTrials.length,
      ate2: activeTrials.filter((t) => t.diasRestantes <= 2).length,
      de3a5: activeTrials.filter((t) => t.diasRestantes >= 3 && t.diasRestantes <= 5).length,
      de6a10: activeTrials.filter((t) => t.diasRestantes >= 6 && t.diasRestantes <= 10).length,
      mais10: activeTrials.filter((t) => t.diasRestantes > 10).length,
    };
  }, [activeTrials]);

  const filteredActiveTrials = useMemo(() => {
    const cleanSearch = searchActive.trim().toLowerCase();

    const filtered = activeTrials.filter((t) => {
      if (periodFilter === "1a2" && t.diasRestantes > 2) return false;
      if (periodFilter === "3a5" && (t.diasRestantes < 3 || t.diasRestantes > 5)) return false;
      if (periodFilter === "6a10" && (t.diasRestantes < 6 || t.diasRestantes > 10)) return false;
      if (periodFilter === "mais10" && t.diasRestantes <= 10) return false;

      if (!cleanSearch) return true;

      const apelido = (t.apelido || "").toLowerCase();
      const nome = (t.nome || "").toLowerCase();
      const telefone = (t.telefone || "").replace(/\D/g, "");
      return apelido.includes(cleanSearch) || nome.includes(cleanSearch) || telefone.includes(cleanSearch);
    });

    if (!sortFieldActive) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = a[sortFieldActive];
      const valB = b[sortFieldActive];

      if (valA !== valB) {
        return sortDirectionActive === "asc" ? valA - valB : valB - valA;
      }

      return a.diasRestantes - b.diasRestantes;
    });
  }, [activeTrials, periodFilter, searchActive, sortFieldActive, sortDirectionActive]);

  const totalActive = filteredActiveTrials.length;
  const totalPagesActive = Math.max(1, Math.ceil(totalActive / pageSize));

  const paginatedActiveTrials = useMemo(() => {
    const start = (pageActive - 1) * pageSize;
    return filteredActiveTrials.slice(start, start + pageSize);
  }, [filteredActiveTrials, pageActive, pageSize]);

  const filteredExpiredTrials = useMemo(() => {
    const cleanSearch = searchExpired.trim().toLowerCase();

    const filtered = recentExpiredTrials.filter((t) => {
      if (!cleanSearch) return true;
      const apelido = (t.apelido || "").toLowerCase();
      const nome = (t.nome || "").toLowerCase();
      const telefone = (t.telefone || "").replace(/\D/g, "");
      return apelido.includes(cleanSearch) || nome.includes(cleanSearch) || telefone.includes(cleanSearch);
    });

    return [...filtered].sort((a, b) => {
      const valA = a[sortFieldExpired];
      const valB = b[sortFieldExpired];

      if (valA !== valB) {
        return sortDirectionExpired === "asc" ? valA - valB : valB - valA;
      }

      return b.diasRestantes - a.diasRestantes;
    });
  }, [recentExpiredTrials, searchExpired, sortFieldExpired, sortDirectionExpired]);

  const totalExpired = filteredExpiredTrials.length;
  const totalPagesExpired = Math.max(1, Math.ceil(totalExpired / pageSize));

  const paginatedExpiredTrials = useMemo(() => {
    const start = (pageExpired - 1) * pageSize;
    return filteredExpiredTrials.slice(start, start + pageSize);
  }, [filteredExpiredTrials, pageExpired, pageSize]);

  return (
    <div className="space-y-6">
      {/* TABELA 1: TRIALS EM ANDAMENTO (PIPELINE A VENCER) */}
      <Card className="border border-slate-800/80 bg-[#131b2e] rounded-3xl shadow-xl overflow-hidden text-left">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Vencimento de Trials</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">
                    {activeTrials.length} em andamento
                  </span>
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acompanhamento de trials ordenados por data de expiração, histórico de ações e uso real.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="Buscar por nome, apelido ou telefone..."
                  value={searchActive}
                  onChange={(e) => {
                    setSearchActive(e.target.value);
                    setPageActive(1);
                  }}
                  className="bg-slate-950/90 border-slate-800 text-xs text-white placeholder-slate-500 pl-8 rounded-xl h-9"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              </div>

              {onRefresh && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-9 w-9 rounded-xl border-slate-800 bg-slate-950/90 text-slate-300 hover:text-white shrink-0"
                  title="Atualizar lista de trials"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-blue-400")} />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 touch-pan-x">
            <button
              type="button"
              onClick={() => handlePeriodFilterChange("todos")}
              className={cn(
                "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
                periodFilter === "todos"
                  ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              )}
            >
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Todos</span>
              <span className="text-base font-black text-white">{activeCounts.todos} trials</span>
            </button>

            <button
              type="button"
              onClick={() => handlePeriodFilterChange("1a2")}
              className={cn(
                "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
                periodFilter === "1a2"
                  ? "bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-500/10"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              )}
            >
              <span className="text-[11px] font-bold text-rose-400 block uppercase tracking-wider">Em 1 a 2 dias</span>
              <span className="text-base font-black text-white">{activeCounts.ate2} trials</span>
            </button>

            <button
              type="button"
              onClick={() => handlePeriodFilterChange("3a5")}
              className={cn(
                "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
                periodFilter === "3a5"
                  ? "bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              )}
            >
              <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider">Em 3 a 5 dias</span>
              <span className="text-base font-black text-white">{activeCounts.de3a5} trials</span>
            </button>

            <button
              type="button"
              onClick={() => handlePeriodFilterChange("6a10")}
              className={cn(
                "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
                periodFilter === "6a10"
                  ? "bg-sky-600/20 border-sky-500 text-white shadow-lg"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              )}
            >
              <span className="text-[11px] font-bold text-sky-400 block uppercase tracking-wider">Em 6 a 10 dias</span>
              <span className="text-base font-black text-white">{activeCounts.de6a10} trials</span>
            </button>

            <button
              type="button"
              onClick={() => handlePeriodFilterChange("mais10")}
              className={cn(
                "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
                periodFilter === "mais10"
                  ? "bg-purple-600/20 border-purple-500 text-white shadow-lg"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              )}
            >
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Mais de 10 dias</span>
              <span className="text-base font-black text-white">{activeCounts.mais10} trials</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-xs">Carregando pipeline de vencimento...</span>
            </div>
          ) : filteredActiveTrials.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Nenhum trial em andamento encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-slate-900/30">
                    <th className="py-3 px-4">Motorista</th>
                    <th className="py-3 px-3">Vencimento</th>
                    <th className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleSortToggleActive("diasAcessados")}
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 hover:text-white transition-colors cursor-pointer select-none",
                          sortFieldActive === "diasAcessados" && "text-blue-400 font-black"
                        )}
                      >
                        <span>Dias Acessados</span>
                        {sortFieldActive === "diasAcessados" ? (
                          sortDirectionActive === "desc" ? (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 opacity-60 shrink-0" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleSortToggleActive("totalAcoes")}
                        className={cn(
                          "inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer select-none",
                          sortFieldActive === "totalAcoes" && "text-blue-400 font-black"
                        )}
                      >
                        <span>Ações</span>
                        {sortFieldActive === "totalAcoes" ? (
                          sortDirectionActive === "desc" ? (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 opacity-60 shrink-0" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Indicação</th>
                    <th className="py-3 px-4 text-right">Plano Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {paginatedActiveTrials.map((item) => {
                    const dias = item.diasRestantes;
                    const dataFormatada = formatDateBR(item.trialEndsAt);
                    const apelidoExibicao = item.apelido?.trim() || item.nome;
                    const cleanPhone = item.telefone?.replace(/\D/g, "");

                    let diasTextoCor = "text-slate-300";
                    if (dias <= 2) {
                      diasTextoCor = "text-rose-400";
                    } else if (dias <= 5) {
                      diasTextoCor = "text-amber-400";
                    } else if (dias <= 10) {
                      diasTextoCor = "text-sky-400";
                    }

                    return (
                      <tr key={item.assinaturaId} className="hover:bg-slate-800/25 transition-colors">
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <Link
                              to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.usuarioId}`}
                              className="font-bold text-white text-xs hover:text-blue-400 hover:underline transition-colors block"
                            >
                              {apelidoExibicao}
                            </Link>
                            {item.apelido?.trim() && item.apelido.trim() !== item.nome && (
                              <span className="text-slate-400 text-[11px] block">{item.nome}</span>
                            )}
                            {cleanPhone && (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => handleCopyPhone(item.telefone!, e)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") handleCopyPhone(item.telefone!, e);
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[11px] font-mono cursor-pointer select-all shrink-0 mt-0.5"
                                title="Clique para copiar o número do WhatsApp"
                              >
                                <WhatsAppIcon className="h-3 w-3 shrink-0" />
                                <span>{phoneMask(item.telefone || "")}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`text-xs font-bold ${diasTextoCor}`}>
                            {dias === 0 ? "Vence hoje" : `em ${dias} ${dias === 1 ? "dia" : "dias"}`}{" "}
                            <span className="text-slate-400 font-normal">({dataFormatada})</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-bold">
                            {item.diasAcessados} {item.diasAcessados === 1 ? "dia" : "dias"}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold font-mono">
                              {item.totalAcoes} ações
                            </span>
                            {item.alunos > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                                {item.alunos} {item.alunos === 1 ? "aluno" : "alunos"}
                              </span>
                            )}
                            {item.escolas > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.escolas} {item.escolas === 1 ? "escola" : "escolas"}
                              </span>
                            )}
                            {item.veiculos > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.veiculos} {item.veiculos === 1 ? "veículo" : "veículos"}
                              </span>
                            )}
                            {item.rotas > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.rotas} {item.rotas === 1 ? "rota" : "rotas"}
                              </span>
                            )}
                            {item.contratos > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.contratos} {item.contratos === 1 ? "contrato" : "contratos"}
                              </span>
                            )}
                            {item.solicitacoes > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.solicitacoes} {item.solicitacoes === 1 ? "solicitação" : "solicitações"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-xs text-slate-300 font-medium">
                            {item.indicadoPor || "-"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap text-slate-300">
                          <span className="font-bold text-white text-xs block">
                            {formatCurrency(item.valorMensal)}/mês
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {formatCurrency(item.valorAnual)}/ano
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium">
                  Listando <strong className="text-white">{totalActive > 0 ? (pageActive - 1) * pageSize + 1 : 0}</strong> a{" "}
                  <strong className="text-white">{Math.min(pageActive * pageSize, totalActive)}</strong> de{" "}
                  <strong className="text-white">{totalActive}</strong> {totalActive === 1 ? "trial" : "trials"}
                </span>

                {totalPagesActive > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs mr-2 font-medium">
                      Página {pageActive} de {totalPagesActive}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pageActive <= 1}
                      onClick={() => setPageActive((p) => Math.max(1, p - 1))}
                      className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pageActive >= totalPagesActive}
                      onClick={() => setPageActive((p) => Math.min(totalPagesActive, p + 1))}
                      className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Próxima página"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABELA 2: TRIALS VENCIDOS RECENTEMENTE (ÚLTIMOS 5 DIAS) */}
      <Card className="border border-rose-500/30 bg-[#131b2e] rounded-3xl shadow-xl overflow-hidden text-left">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-800/80 bg-rose-950/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <ClockAlert className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Trials Vencidos Recentemente</span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    {recentExpiredTrials.length} nos últimos 5 dias
                  </span>
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Motoristas com trial expirado nos últimos 5 dias que ainda não ativaram plano. Priorize contato com quem teve alto engajamento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="Buscar vencidos por nome ou telefone..."
                  value={searchExpired}
                  onChange={(e) => {
                    setSearchExpired(e.target.value);
                    setPageExpired(1);
                  }}
                  className="bg-slate-950/90 border-slate-800 text-xs text-white placeholder-slate-500 pl-8 rounded-xl h-9"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
              <span className="text-xs">Carregando trials vencidos recentemente...</span>
            </div>
          ) : filteredExpiredTrials.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Nenhum trial expirado nos últimos 5 dias encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-slate-900/30">
                    <th className="py-3 px-4">Motorista</th>
                    <th className="py-3 px-3">Venceu em</th>
                    <th className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleSortToggleExpired("diasAcessados")}
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 hover:text-white transition-colors cursor-pointer select-none",
                          sortFieldExpired === "diasAcessados" && "text-rose-400 font-black"
                        )}
                      >
                        <span>Dias Acessados</span>
                        {sortFieldExpired === "diasAcessados" ? (
                          sortDirectionExpired === "desc" ? (
                            <ArrowDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 opacity-60 shrink-0" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleSortToggleExpired("totalAcoes")}
                        className={cn(
                          "inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer select-none",
                          sortFieldExpired === "totalAcoes" && "text-rose-400 font-black"
                        )}
                      >
                        <span>Ações</span>
                        {sortFieldExpired === "totalAcoes" ? (
                          sortDirectionExpired === "desc" ? (
                            <ArrowDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <ArrowUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 opacity-60 shrink-0" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Indicação</th>
                    <th className="py-3 px-4 text-right">Plano Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {paginatedExpiredTrials.map((item) => {
                    const diasAtras = Math.abs(item.diasRestantes);
                    const dataFormatada = formatDateBR(item.trialEndsAt);
                    const apelidoExibicao = item.apelido?.trim() || item.nome;
                    const cleanPhone = item.telefone?.replace(/\D/g, "");
                    const isHotLead = item.totalAcoes >= 10 || item.diasAcessados >= 2;

                    return (
                      <tr key={item.assinaturaId} className="hover:bg-rose-950/10 transition-colors">
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.usuarioId}`}
                                className="font-bold text-white text-xs hover:text-blue-400 hover:underline transition-colors"
                              >
                                {apelidoExibicao}
                              </Link>
                              {isHotLead && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold border bg-amber-500/15 text-amber-400 border-amber-500/30">
                                  <Flame className="h-2.5 w-2.5" />
                                  Lead Quente
                                </span>
                              )}
                            </div>
                            {item.apelido?.trim() && item.apelido.trim() !== item.nome && (
                              <span className="text-slate-400 text-[11px] block">{item.nome}</span>
                            )}
                            {cleanPhone && (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => handleCopyPhone(item.telefone!, e)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") handleCopyPhone(item.telefone!, e);
                                }}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[11px] font-mono cursor-pointer select-all shrink-0 mt-0.5"
                                title="Clique para copiar o número do WhatsApp"
                              >
                                <WhatsAppIcon className="h-3 w-3 shrink-0" />
                                <span>{phoneMask(item.telefone || "")}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-xs font-bold text-rose-400">
                            {diasAtras === 0 ? "Venceu hoje" : `Venceu há ${diasAtras} ${diasAtras === 1 ? "dia" : "dias"}`}{" "}
                            <span className="text-slate-400 font-normal">({dataFormatada})</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-bold">
                            {item.diasAcessados} {item.diasAcessados === 1 ? "dia" : "dias"}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono">
                              {item.totalAcoes} ações
                            </span>
                            {item.alunos > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                                {item.alunos} {item.alunos === 1 ? "aluno" : "alunos"}
                              </span>
                            )}
                            {item.escolas > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.escolas} {item.escolas === 1 ? "escola" : "escolas"}
                              </span>
                            )}
                            {item.veiculos > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.veiculos} {item.veiculos === 1 ? "veículo" : "veículos"}
                              </span>
                            )}
                            {item.rotas > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.rotas} {item.rotas === 1 ? "rota" : "rotas"}
                              </span>
                            )}
                            {item.contratos > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.contratos} {item.contratos === 1 ? "contrato" : "contratos"}
                              </span>
                            )}
                            {item.solicitacoes > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/60 text-slate-400 text-xs">
                                {item.solicitacoes} {item.solicitacoes === 1 ? "solicitação" : "solicitações"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-xs text-slate-300 font-medium">
                            {item.indicadoPor || "-"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap text-slate-300">
                          <span className="font-bold text-white text-xs block">
                            {formatCurrency(item.valorMensal)}/mês
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {formatCurrency(item.valorAnual)}/ano
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium">
                  Listando <strong className="text-white">{totalExpired > 0 ? (pageExpired - 1) * pageSize + 1 : 0}</strong> a{" "}
                  <strong className="text-white">{Math.min(pageExpired * pageSize, totalExpired)}</strong> de{" "}
                  <strong className="text-white">{totalExpired}</strong> {totalExpired === 1 ? "trial vencido" : "trials vencidos"}
                </span>

                {totalPagesExpired > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs mr-2 font-medium">
                      Página {pageExpired} de {totalPagesExpired}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pageExpired <= 1}
                      onClick={() => setPageExpired((p) => Math.max(1, p - 1))}
                      className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pageExpired >= totalPagesExpired}
                      onClick={() => setPageExpired((p) => Math.min(totalPagesExpired, p + 1))}
                      className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      title="Próxima página"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
