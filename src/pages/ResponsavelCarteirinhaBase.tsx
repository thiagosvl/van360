import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { useCarteirinhaQuery } from "@/hooks/api/useResponsavelAuthApi";
import { ArrowLeftRight, LogOut, User } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const ResponsavelCarteirinhaBase: React.FC = () => {
  const navigate = useNavigate();
  const { token, passageiros, passageiroSelecionado, logout } = useResponsavelAuth();

  const passageiroId = passageiroSelecionado?.id || null;
  const { data: carteirinha, isLoading, error } = useCarteirinhaQuery(passageiroId, token);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const handleSwitchPassageiro = () => {
    navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT);
  };

  const nomeExibicao = carteirinha?.nome || passageiroSelecionado?.nome || "Passageiro";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 px-4 py-4 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950 shadow-md shadow-amber-500/20">
              V
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Van360</span>
          </div>

          <div className="flex items-center gap-2">
            {passageiros.length > 1 && (
              <button
                onClick={handleSwitchPassageiro}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-slate-700 transition-all"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Trocar Passageiro</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md text-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              <p className="text-sm font-medium text-slate-400">Carregando carteirinha...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400 text-sm">
              Erro ao carregar os dados do passageiro.
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-4 backdrop-blur-xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <User className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {nomeExibicao}
              </h1>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
