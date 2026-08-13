import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { ResponsavelPassageiro } from "@/types/responsavel";
import { formatShortName } from "@/utils/formatters/name";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, ChevronRight, LogOut, User } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const ResponsavelSelecionarPassageiro: React.FC = () => {
  const navigate = useNavigate();
  const { passageiros, selectPassageiro, logout, refetchPassageiros, isLoading } = useResponsavelAuth();

  const handleSelect = (p: ResponsavelPassageiro) => {
    selectPassageiro(p);
    navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
  };

  const handleRefresh = async () => {
    await refetchPassageiros();
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-800 flex flex-col">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3.5 sticky top-0 z-50 shadow-xs">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto"
            />
          </div>

          <button
            onClick={() => {
              logout();
              navigate(ROUTES.PUBLIC.LOGIN);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-500" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <main className="flex-1 p-3.5 sm:p-6 mx-auto w-full max-w-2xl min-w-0">
          <div className="space-y-6 min-w-0">
            <div>
              <h1 className="text-xl font-bold text-[#1a3a5c]">Selecione o Passageiro</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Encontramos os passageiros vinculados à sua conta. Escolha qual carteirinha deseja acessar:
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-3 min-w-0">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 w-full"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl shrink-0" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 min-w-0">
                {passageiros.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 text-left shadow-xs transition-all hover:border-[#1a3a5c]/30 hover:shadow-md hover:bg-slate-50/50 cursor-pointer w-full min-w-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white transition-all shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#1a3a5c] text-sm sm:text-base leading-snug group-hover:text-[#1a3a5c] transition-colors truncate">
                          {formatShortName(p.nome, true)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Bus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{p.motorista_nome}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#1a3a5c] transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </PullToRefreshWrapper>
    </div>
  );
};
