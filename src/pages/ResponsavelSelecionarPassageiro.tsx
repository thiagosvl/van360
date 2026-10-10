import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { useLayoutSafe } from "@/contexts/LayoutContext";
import { ResponsavelPassageiro } from "@/types/responsavel";
import { formatShortName } from "@/utils/formatters/name";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, ChevronRight, LogOut, User } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const ResponsavelSelecionarPassageiro: React.FC = () => {
  const navigate = useNavigate();
  const { passageiros, selectPassageiro, logout, refetchPassageiros, isLoading } = useResponsavelAuth();
  const layoutContext = useLayoutSafe();
  const setPageTitle = layoutContext?.setPageTitle;

  useEffect(() => {
    if (setPageTitle) {
      setPageTitle("Selecionar Aluno");
    }
    document.title = "Selecionar Aluno | Van360";
  }, [setPageTitle]);

  const handleSelect = (p: ResponsavelPassageiro) => {
    selectPassageiro(p);
    navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
  };

  const handleRefresh = async () => {
    await refetchPassageiros();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0a0a0a] flex flex-col">
      <header className="border-b border-[#e5e5e5] bg-white px-4 sm:px-6 lg:px-8 pt-[calc(0.875rem+var(--safe-area-top))] pb-3.5 sticky top-0 z-50 shadow-xs">
        <div className="mx-auto flex max-w-4xl lg:max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate(ROUTES.PUBLIC.LOGIN);
            }}
            className="flex items-center gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] px-3.5 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#e5e5e5] transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-[#737373]" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mx-auto w-full max-w-4xl lg:max-w-5xl min-w-0 pb-[calc(2.5rem+var(--safe-area-bottom))]">
          <div className="space-y-6 min-w-0">
            <div>
              <h1 className="text-xl font-semibold text-[#0a0a0a] tracking-tight">Selecione o Aluno</h1>
              <p className="text-xs sm:text-sm text-[#737373] mt-1">
                Encontramos os alunos vinculados à sua conta. Escolha qual carteirinha deseja acessar:
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-3 min-w-0">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-[24px] border border-[#e5e5e5] bg-white p-4 w-full"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <Skeleton className="h-12 w-12 rounded-[18px] shrink-0" />
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
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="group flex items-center justify-between rounded-[24px] border border-[#e5e5e5] bg-white p-4 text-left shadow-xs transition-all hover:border-primary/40 hover:shadow-sm cursor-pointer w-full min-w-0 overflow-hidden active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary transition-all shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#0a0a0a] text-sm sm:text-base leading-snug group-hover:text-primary transition-colors truncate">
                          {formatShortName(p.nome, true)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#737373] mt-0.5">
                          <Bus className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                          <span className="truncate font-medium">{p.motorista_nome}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-[#737373] group-hover:text-primary transition-colors shrink-0 ml-2" />
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
