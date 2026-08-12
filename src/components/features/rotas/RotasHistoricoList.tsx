import { useNavigate } from "react-router-dom";
import { History, Check, X, Calendar, Clock, Route, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { ROUTES } from "@/constants/routes";
import { RouteExecutionStatus } from "@/types/route";
import { formatDateTime } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface RotasHistoricoListProps {
  execucoes: any[];
  isLoading: boolean;
  isFetching?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
}

export function RotasHistoricoList({
  execucoes,
  isLoading,
  isFetching = false,
  hasMore = false,
  onLoadMore,
  totalCount
}: RotasHistoricoListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <ListSkeleton count={4} />;
  }

  if (execucoes.length === 0) {
    return (
      <UnifiedEmptyState
        icon={History}
        title="Nada para exibir"
        description="O histórico das rotas executadas aparecerá aqui assim que você concluir sua primeira rota."
      />
    );
  }

  return (
    <div className="space-y-3">
      {execucoes.map((exec) => {
        const isAtiva = exec.status === RouteExecutionStatus.INICIADA;

        return (
          <div
            key={exec.id}
            onClick={() => {
              navigate(
                isAtiva
                  ? `${ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", exec.id)}`
                  : `${ROUTES.PRIVATE.MOTORISTA.ROUTE_DETAILS.replace(":id", exec.id)}`
              );
            }}
            className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50 relative px-4 text-left cursor-pointer group"
          >
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-2xs",
                  exec.status === RouteExecutionStatus.INICIADA
                    ? "bg-emerald-600 text-white"
                    : exec.status === RouteExecutionStatus.CONCLUIDA
                      ? "bg-emerald-50 border border-emerald-200/80 text-emerald-700"
                      : "bg-rose-50 border border-rose-100 text-rose-600"
                )}
              >
                {exec.status === RouteExecutionStatus.INICIADA ? (
                  <Route className="w-4 h-4 text-white stroke-[2.5]" />
                ) : exec.status === RouteExecutionStatus.CONCLUIDA ? (
                  <Check className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                ) : (
                  <X className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                )}
              </div>
            </div>

            <div className="flex-grow min-w-0 pr-2 space-y-0.5">
              <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-snug transition-colors break-words">
                {exec.rota?.nome || "Rota Removida"}
              </p>

              <div className="text-[10px] text-slate-400 font-medium leading-tight flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {formatDateTime(exec.iniciada_em)}
                </span>
                {exec.finalizada_em && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {Math.round(
                        (new Date(exec.finalizada_em).getTime() - new Date(exec.iniciada_em).getTime()) / 60000
                      )}{" "}
                      min
                    </span>
                  </>
                )}
              </div>

              <div className="pt-0.5">
                {exec.status === RouteExecutionStatus.INICIADA ? (
                  <span className="inline-block bg-[#1a3a5c]/10 text-[#1a3a5c] border border-[#1a3a5c]/20 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                    EM ANDAMENTO
                  </span>
                ) : exec.status === RouteExecutionStatus.CONCLUIDA ? (
                  <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                    CONCLUÍDA
                  </span>
                ) : (
                  <span className="inline-block bg-rose-50 text-rose-600 border border-rose-100 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                    CANCELADA
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && onLoadMore && (
        <div className="pt-3 pb-2 flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={isFetching}
            onClick={onLoadMore}
            className="h-11 px-6 rounded-2xl text-xs font-bold text-[#1a3a5c] border-slate-200 bg-white hover:bg-slate-50 shadow-2xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            {isFetching && <Loader2 className="w-4 h-4 animate-spin text-[#1a3a5c]" />}
            <span>{isFetching ? "Buscando..." : "Ver mais"}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
