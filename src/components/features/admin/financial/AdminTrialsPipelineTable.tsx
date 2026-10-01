import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Search, RefreshCw, Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { formatDateBR } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import type { TrialPipelineItem } from "@/services/api/admin/admin-financial.api";

interface AdminTrialsPipelineTableProps {
  trials: TrialPipelineItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

type PeriodFilter = "todos" | "1a2" | "3a5" | "6a10" | "mais10";

function formatCurrency(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AdminTrialsPipelineTable({ trials, isLoading, onRefresh }: AdminTrialsPipelineTableProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("todos");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    return {
      todos: trials.length,
      ate2: trials.filter((t) => t.diasRestantes <= 2).length,
      de3a5: trials.filter((t) => t.diasRestantes >= 3 && t.diasRestantes <= 5).length,
      de6a10: trials.filter((t) => t.diasRestantes >= 6 && t.diasRestantes <= 10).length,
      mais10: trials.filter((t) => t.diasRestantes > 10).length,
    };
  }, [trials]);

  const filteredTrials = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return trials.filter((t) => {
      if (periodFilter === "1a2" && t.diasRestantes > 2) return false;
      if (periodFilter === "3a5" && (t.diasRestantes < 3 || t.diasRestantes > 5)) return false;
      if (periodFilter === "6a10" && (t.diasRestantes < 6 || t.diasRestantes > 10)) return false;
      if (periodFilter === "mais10" && t.diasRestantes <= 10) return false;

      if (!cleanSearch) return true;

      const apelido = (t.apelido || "").toLowerCase();
      const nome = (t.nome || "").toLowerCase();
      return apelido.includes(cleanSearch) || nome.includes(cleanSearch);
    });
  }, [trials, periodFilter, search]);

  return (
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
                placeholder="Buscar por apelido ou nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-950/90 border-slate-800 text-xs text-white placeholder-slate-500 pl-8 rounded-xl h-9"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            </div>

            {onRefresh && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-9 w-9 border-slate-800 bg-slate-950/90 text-slate-400 hover:text-white rounded-xl shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 touch-pan-x pt-1">
          <button
            type="button"
            onClick={() => setPeriodFilter("todos")}
            className={cn(
              "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
              periodFilter === "todos"
                ? "bg-blue-600/20 border-blue-500 text-white shadow-lg"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
            )}
          >
            <span className="text-[11px] font-bold text-blue-300 block uppercase tracking-wider">Todos</span>
            <span className="text-base font-black">{counts.todos} trials</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodFilter("1a2")}
            className={cn(
              "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
              periodFilter === "1a2"
                ? "bg-rose-600/20 border-rose-500 text-white shadow-lg"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
            )}
          >
            <span className="text-[11px] font-bold text-rose-400 block uppercase tracking-wider">Em 1 a 2 dias</span>
            <span className="text-base font-black text-white">{counts.ate2} trials</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodFilter("3a5")}
            className={cn(
              "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
              periodFilter === "3a5"
                ? "bg-amber-600/20 border-amber-500 text-white shadow-lg"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
            )}
          >
            <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider">Em 3 a 5 dias</span>
            <span className="text-base font-black text-white">{counts.de3a5} trials</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodFilter("6a10")}
            className={cn(
              "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
              periodFilter === "6a10"
                ? "bg-sky-600/20 border-sky-500 text-white shadow-lg"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
            )}
          >
            <span className="text-[11px] font-bold text-sky-400 block uppercase tracking-wider">Em 6 a 10 dias</span>
            <span className="text-base font-black text-white">{counts.de6a10} trials</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodFilter("mais10")}
            className={cn(
              "w-[140px] shrink-0 sm:w-auto sm:shrink text-left p-3 rounded-2xl border transition-all",
              periodFilter === "mais10"
                ? "bg-purple-600/20 border-purple-500 text-white shadow-lg"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
            )}
          >
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Mais de 10 dias</span>
            <span className="text-base font-black text-white">{counts.mais10} trials</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-xs">Carregando pipeline de vencimento...</span>
          </div>
        ) : filteredTrials.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            Nenhum trial encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-slate-900/30">
                  <th className="py-3 px-4">Motorista</th>
                  <th className="py-3 px-3">Vencimento</th>
                  <th className="py-3 px-3 text-center">Dias Acessados</th>
                  <th className="py-3 px-3">Ações</th>
                  <th className="py-3 px-3">Indicação</th>
                  <th className="py-3 px-4 text-right">Plano Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredTrials.map((item) => {
                  const dias = item.diasRestantes;
                  const dataFormatada = formatDateBR(item.trialEndsAt);
                  const apelidoExibicao = item.apelido?.trim() || item.nome;

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
                        <div>
                          <Link
                            to={`${ROUTES.PRIVATE.ADMIN.USERS}/${item.usuarioId}`}
                            className="font-bold text-white text-xs hover:text-blue-400 hover:underline transition-colors block"
                          >
                            {apelidoExibicao}
                          </Link>
                          {item.apelido?.trim() && item.apelido.trim() !== item.nome && (
                            <span className="text-slate-400 text-[11px] block">{item.nome}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-xs font-bold ${diasTextoCor}`}>
                          em {dias} {dias === 1 ? "dia" : "dias"}{" "}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
