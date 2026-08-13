import { ROUTES } from "@/constants/routes";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { ResponsavelPassageiro } from "@/types/responsavel";
import { Bus, ChevronRight, LogOut, User } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const ResponsavelSelecionarPassageiro: React.FC = () => {
  const navigate = useNavigate();
  const { passageiros, selectPassageiro, logout } = useResponsavelAuth();

  const handleSelect = (p: ResponsavelPassageiro) => {
    selectPassageiro(p);
    navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-bold text-slate-950 shadow-md shadow-amber-500/20">
              V
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Van360</span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate(ROUTES.PUBLIC.LOGIN);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 mx-auto w-full max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white">Selecione o Passageiro</h1>
            <p className="text-sm text-slate-400 mt-1">
              Localizamos mais de um cadastro ativo vinculado ao seu telefone. Escolha qual deseja visualizar:
            </p>
          </div>

          <div className="grid gap-3">
            {passageiros.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left transition-all hover:border-amber-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base group-hover:text-amber-400 transition-colors">
                      {p.nome}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Bus className="h-3.5 w-3.5 text-slate-500" />
                      <span>{p.motorista_nome}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
