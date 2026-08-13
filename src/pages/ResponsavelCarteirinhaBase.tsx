import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { useCarteirinhaQuery } from "@/hooks/api/useResponsavelAuthApi";
import { ResponsavelDadosComplementaresDialog } from "@/components/dialogs/ResponsavelDadosComplementaresDialog";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { CarteirinhaSkeleton } from "@/components/skeletons/CarteirinhaSkeleton";
import { ArrowLeftRight, LogOut, User } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const ResponsavelCarteirinhaBase: React.FC = () => {
  const navigate = useNavigate();
  const { token, passageiros, passageiroSelecionado, logout, refetchPassageiros } = useResponsavelAuth();

  const passageiroId = passageiroSelecionado?.id || null;
  const { data: carteirinha, isLoading, error, refetch } = useCarteirinhaQuery(passageiroId, token);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const handleSwitchPassageiro = () => {
    navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT);
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetch(),
      refetchPassageiros()
    ]);
  };

  const nomeExibicao = carteirinha?.nome || passageiroSelecionado?.nome || "Passageiro";

  const isMissingComplementares = Boolean(
    carteirinha &&
    (!carteirinha.cpf_responsavel || carteirinha.cpf_responsavel.trim() === "" ||
     !carteirinha.email_responsavel || carteirinha.email_responsavel.trim() === "")
  );

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-800 flex flex-col">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3.5 sticky top-0 z-50 shadow-xs">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto cursor-pointer"
              onClick={() => navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME)}
            />
          </div>

          <div className="flex items-center gap-2">
            {passageiros.length > 1 && (
              <button
                onClick={handleSwitchPassageiro}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-[#1a3a5c] hover:bg-blue-100 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-[#1a3a5c]" />
                <span className="hidden sm:inline">Trocar Passageiro</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <main className="flex-1 p-4 max-w-md mx-auto w-full">
          {isLoading ? (
            <div className="py-4">
              <CarteirinhaSkeleton />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 text-sm font-medium text-center">
              Erro ao carregar os dados do passageiro.
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-[#1a3a5c]">
                <User className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold text-[#1a3a5c] tracking-tight">
                {nomeExibicao}
              </h1>
            </div>
          )}
        </main>
      </PullToRefreshWrapper>

    {passageiroId && token && (
      <ResponsavelDadosComplementaresDialog
        open={isMissingComplementares}
        passageiroId={passageiroId}
        passageiroNome={nomeExibicao}
        initialCpf={carteirinha?.cpf_responsavel || ""}
        initialEmail={carteirinha?.email_responsavel || ""}
        token={token}
        onSuccess={() => {
          refetch();
          refetchPassageiros();
        }}
      />
    )}
  </div>
);
};
