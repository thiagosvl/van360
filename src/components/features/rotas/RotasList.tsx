import React from "react";
import { useNavigate } from "react-router-dom";
import { Route as RouteIcon, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/notifications/toast";

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
        description="Configure suas rotas de ida e volta para gerenciar os itinerários diários e organizar as paradas dos passageiros e escolas."
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
              "bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 relative px-4 text-left cursor-pointer group border",
              isDestaRotaAtiva ? "border-emerald-500 shadow-sm" : "border-gray-100/50"
            )}
          >
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-2xs",
                  isDestaRotaAtiva
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100/70 border border-slate-200/80 text-[#1a3a5c]"
                )}
              >
                <RouteIcon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isDestaRotaAtiva ? "text-white stroke-[2.5]" : "text-[#1a3a5c]"
                  )}
                />
              </div>
            </div>

            <div className="flex-grow min-w-0 pr-2 space-y-0.5">
              <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-snug transition-colors break-words">
                {rota.nome}
              </p>
              <div className="text-[10px] text-slate-400 font-medium leading-tight">
                <span>
                  {rota.numero_passageiros === 1 ? "1 parada" : `${rota.numero_passageiros || 0} paradas`}{" "}
                  {rota.veiculo?.placa ? `• ${rota.veiculo.placa}` : ""}
                </span>
              </div>
              {isDestaRotaAtiva && (
                <div className="pt-0.5">
                  <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[9px] font-bold px-1.5 py-0.5 leading-none uppercase">
                    EM ANDAMENTO
                  </span>
                </div>
              )}
            </div>

            {(canGerenciar || canExcluir) && (
              <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {canGerenciar && (
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Editar rota"
                    className="rounded-lg text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 h-8 w-8 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDestaRotaAtiva) {
                        toast.error("Rota em andamento.", {
                          description: "Para editar, encerre ou conclua a execução primeiro.",
                        });
                        return;
                      }
                      navigate(ROUTES.PRIVATE.MOTORISTA.ROUTE_EDIT.replace(":id", rota.id));
                    }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                )}
                {canExcluir && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDestaRotaAtiva) {
                        toast.error("Rota em andamento.", {
                          description: "Para excluir, encerre ou conclua a execução primeiro.",
                        });
                        return;
                      }
                      onDeleteRoute(rota.id, rota.nome);
                    }}
                  >
                    {isDeletingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
