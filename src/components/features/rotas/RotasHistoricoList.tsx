import { useNavigate } from "react-router-dom";
import { History, Check, X, Calendar, Clock, Route, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { ROUTES } from "@/constants/routes";
import { RouteExecutionStatus } from "@/types/route";
import { formatDateTime, formatarDuracao } from "@/utils/formatters";
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
            className="bg-white p-3.5 sm:p-5 rounded-[24px] border border-[#e5e5e5] shadow-xs flex items-center gap-2.5 sm:gap-3.5 active:scale-[0.99] transition-all duration-200 text-left cursor-pointer group hover:border-[#d4d4d4] min-w-0"
          >
            <div className="shrink-0">
              <div
                className={cn(
                  "h-10 w-10 sm:h-11 sm:w-11 rounded-[18px] flex items-center justify-center transition-colors shrink-0",
                  exec.status === RouteExecutionStatus.INICIADA
                    ? "bg-emerald-500 text-white shadow-xs"
                    : exec.status === RouteExecutionStatus.CONCLUIDA
                      ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                      : "bg-[#e7000b]/10 text-[#e7000b] border border-[#e7000b]/20"
                )}
              >
                {exec.status === RouteExecutionStatus.INICIADA ? (
                  <Route className="w-5 h-5 text-white" />
                ) : exec.status === RouteExecutionStatus.CONCLUIDA ? (
                  <Check className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
                ) : (
                  <X className="w-5 h-5 text-[#e7000b] stroke-[2.5]" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-1 space-y-1">
              <p className="font-semibold text-[#0a0a0a] text-sm sm:text-base leading-snug break-words">
                {exec.rota?.nome || "Rota Removida"}
              </p>

              <div className="text-xs text-[#737373] font-normal leading-tight flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#737373]" />
                  {formatDateTime(exec.iniciada_em)}
                </span>
                {exec.finalizada_em && (
                  <>
                    <span className="text-[#e5e5e5]">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#737373]" />
                      {formatarDuracao(exec.iniciada_em, exec.finalizada_em)}
                    </span>
                  </>
                )}
              </div>

              <div className="pt-0.5">
                {exec.status === RouteExecutionStatus.INICIADA ? (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-[18px] text-[11px] font-medium px-2.5 py-0.5 leading-none">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                    </span>
                    <span>Em andamento</span>
                  </span>
                ) : exec.status === RouteExecutionStatus.CONCLUIDA ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-[18px] text-[11px] font-medium px-2.5 py-0.5 leading-none">
                    Concluída
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#e7000b] border border-red-200/60 rounded-[18px] text-[11px] font-medium px-2.5 py-0.5 leading-none">
                    Cancelada
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
            className="h-10 px-5 rounded-[18px] text-xs font-medium text-[#0a0a0a] border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            {isFetching && <Loader2 className="w-4 h-4 animate-spin text-[#0a0a0a]" />}
            <span>{isFetching ? "Buscando..." : "Ver mais"}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
