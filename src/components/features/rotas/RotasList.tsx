import { useNavigate } from "react-router-dom";
import { Route as RouteIcon, ChevronRight } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { ROUTES } from "@/constants/routes";

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
            className="bg-white p-3.5 sm:p-5 rounded-[24px] border border-[#e5e5e5] shadow-xs flex items-center justify-between gap-2.5 sm:gap-3.5 active:scale-[0.99] transition-all duration-200 text-left cursor-pointer group hover:border-[#d4d4d4]"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[18px] flex items-center justify-center transition-colors shrink-0 bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] group-hover:bg-[#ebebeb]">
                <RouteIcon className="w-5 h-5 text-[#0a0a0a]" />
              </div>

              <div className="min-w-0 flex-1 space-y-1 pr-1">
                <p className="font-semibold text-[#0a0a0a] text-sm sm:text-base leading-snug line-clamp-2 break-words">
                  {rota.nome}
                </p>
                <div className="text-xs text-[#737373] font-normal leading-tight flex items-center gap-1.5 flex-wrap">
                  <span>
                    {rota.numero_passageiros === 1 ? "1 parada" : `${rota.numero_passageiros || 0} paradas`}
                  </span>
                  {rota.veiculo?.placa && (
                    <>
                      <span>•</span>
                      <span>{rota.veiculo.placa}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isDestaRotaAtiva ? (
              <div className="shrink-0 flex items-center">
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-[18px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] sm:text-xs font-medium leading-none shrink-0">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="sm:hidden">Em rota</span>
                  <span className="hidden sm:inline">Em andamento</span>
                </span>
              </div>
            ) : (
              <div className="shrink-0 text-[#737373] group-hover:text-[#0a0a0a] transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
