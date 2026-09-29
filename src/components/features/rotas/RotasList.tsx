import React from "react";
import { useNavigate } from "react-router-dom";
import { Route as RouteIcon, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/notifications/toast";
import { obterChamadaRapida } from "@/utils/domain/route/routeStorage.utils";

interface RotasListProps {
  rotas: any[];
  execucoesAtivas: any[];
  isLoading: boolean;
  canGerenciar: boolean;
  canExcluir: boolean;
  deletePendingId?: string | null;
  onDeleteRoute: (id: string, nome: string) => void;
  onOpenCreateRoute: () => void;
}

export function RotasList({
  rotas,
  execucoesAtivas,
  isLoading,
  canGerenciar,
  canExcluir,
  deletePendingId,
  onDeleteRoute,
  onOpenCreateRoute,
}: RotasListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <ListSkeleton count={3} />;
  }

  if (rotas.length === 0) {
    return (
      <UnifiedEmptyState
        icon={RouteIcon}
        title="Nenhuma rota configurada"
        description="Configure suas rotas de ida e volta para gerenciar os itinerários diários e organizar as paradas dos alunos e escolas."
        action={
          canGerenciar
            ? {
              label: "Configurar Primeira Rota",
              onClick: onOpenCreateRoute,
            }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-3 text-left">
      {rotas.map((rota) => {
        const execucaoDestaRota = execucoesAtivas.find((e) => e.rota_id === rota.id);
        const isDestaRotaAtiva = !!execucaoDestaRota;
        const isDeletingThis = deletePendingId === rota.id;
        const chamadaSalva = rota.id ? obterChamadaRapida(rota.id) : null;
        const temChamadaSalva = chamadaSalva !== null;

        return (
          <div
            key={rota.id}
            onClick={() => {
              if (isDestaRotaAtiva && execucaoDestaRota) {
                navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", execucaoDestaRota.id));
              } else {
                navigate(`${ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", rota.id)}?preview=true`);
              }
            }}
            className={cn(
              "bg-white p-3.5 sm:p-4 rounded-xl shadow-diff-shadow flex items-center justify-between gap-3 active:scale-[0.99] transition-all duration-150 relative text-left cursor-pointer group border",
              isDestaRotaAtiva ? "border-emerald-500 shadow-sm" : "border-slate-100 hover:border-slate-200"
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={cn(
                  "h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all shadow-2xs shrink-0",
                  isDestaRotaAtiva
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100/70 border border-slate-200/80 text-[#1a3a5c]"
                )}
              >
                <RouteIcon
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                    isDestaRotaAtiva ? "text-white stroke-[2.5]" : "text-[#1a3a5c]"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5 pr-1">
                <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-snug transition-colors line-clamp-2 break-words">
                  {rota.nome}
                </p>
                <div className="text-[11px] text-slate-400 font-medium leading-tight flex items-center gap-1.5 flex-wrap">
                  <span>
                    {rota.numero_passageiros === 1 ? "1 parada" : `${rota.numero_passageiros || 0} paradas`}{" "}
                    {rota.veiculo?.placa ? `• ${rota.veiculo.placa}` : ""}
                  </span>
                </div>
                {temChamadaSalva && !isDestaRotaAtiva && (
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Chamada Feita
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {isDestaRotaAtiva ? (
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[10px] font-bold px-2 py-1 leading-none uppercase">
                  EM ANDAMENTO
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  title="Fazer chamada de alunos para esta rota"
                  className="h-8 px-2.5 sm:px-3 text-xs font-bold rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`${ROUTES.PRIVATE.MOTORISTA.ROUTE_EXECUTE.replace(":id", rota.id)}?preview=true&openChamada=true`);
                  }}
                >
                  <Users className="w-3.5 h-3.5 text-[#1a3a5c]" />
                  <span>Chamada</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
