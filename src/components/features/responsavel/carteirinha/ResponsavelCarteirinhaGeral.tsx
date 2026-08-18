import React, { useState } from "react";
import { ResponsavelCarteirinhaData } from "@/types/responsavel";
import { ResponsavelNotificarAusenciaDialog } from "@/components/dialogs/ResponsavelNotificarAusenciaDialog";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { FileSignature, CalendarOff, ArrowRight, User, Receipt, Users, FileText, ChevronRight } from "lucide-react";
import { openBrowserLink } from "@/utils/browser";
import { TrackingCard } from "@/components/features/tracking/TrackingCard";

interface ResponsavelCarteirinhaGeralProps {
  carteirinha: ResponsavelCarteirinhaData;
  onRefresh?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const ResponsavelCarteirinhaGeral: React.FC<ResponsavelCarteirinhaGeralProps> = ({
  carteirinha,
  onRefresh,
  onSelectTab,
}) => {
  const { token } = useResponsavelAuth();
  const [ausenciaDialogOpen, setAusenciaDialogOpen] = useState(false);

  const contratoPendente = carteirinha.contrato && carteirinha.contrato.status === "pendente_assinatura";
  const temRotas = (carteirinha.rotas || []).length > 0;
  const temContrato = Boolean(carteirinha.contrato);

  const handleAssinarContrato = () => {
    if (carteirinha.contrato?.token_acesso) {
      openBrowserLink(`${window.location.origin}/assinar/${carteirinha.contrato.token_acesso}`);
    }
  };

  const handleTabClick = (tabKey: string) => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <TrackingCard
        passageiroId={carteirinha.id}
        passageiroNome={carteirinha.nome}
      />

      {/* 1. Bloco de Ações Rápidas (Destaques) */}
      {(contratoPendente || temRotas) && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none px-1 block">
            AÇÕES RÁPIDAS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contratoPendente && (
              <button
                type="button"
                onClick={handleAssinarContrato}
                className="w-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl p-4 shadow-xs transition-all active:scale-[0.98] flex items-center justify-between gap-3 text-left border border-amber-400/30 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <FileSignature className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-sm leading-tight text-white truncate">
                      Assinar Contrato
                    </span>
                    <span className="text-[11px] text-amber-100 font-medium block truncate mt-0.5">
                      Pendente de assinatura online
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/80 shrink-0" />
              </button>
            )}

            {temRotas && (
              <button
                type="button"
                onClick={() => setAusenciaDialogOpen(true)}
                className="w-full bg-white hover:bg-slate-50 text-[#1a3a5c] rounded-2xl p-4 shadow-xs border border-slate-200/80 transition-all active:scale-[0.98] flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                    <CalendarOff className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-sm leading-tight text-[#1a3a5c] truncate">
                      Notificar Ausência
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block truncate mt-0.5">
                      Avisar falta no transporte
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Bloco de Botões de Acesso Rápido às Abas */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none px-1 block">
          ACESSO RÁPIDO
        </span>
        <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-xs p-3 space-y-1.5">
          {/* 1. Contrato */}
          <button
            type="button"
            onClick={() => temContrato && handleTabClick("contrato")}
            disabled={!temContrato}
            className={`w-full p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors text-left ${temContrato ? "hover:bg-slate-50 cursor-pointer" : "opacity-50 cursor-not-allowed"
              }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#16314f] block truncate">
                  Contrato do Aluno
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Visualizar ou assinar contrato do transporte
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          {/* 2. Responsáveis */}
          <button
            type="button"
            onClick={() => handleTabClick("responsaveis")}
            className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#16314f] block truncate">
                  Responsáveis Cadastrados
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Contatos e telefones vinculados
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          {/* 3. Ausências */}
          <button
            type="button"
            onClick={() => temRotas && handleTabClick("ausencias")}
            disabled={!temRotas}
            className={`w-full p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors text-left ${temRotas ? "hover:bg-slate-50 cursor-pointer" : "opacity-50 cursor-not-allowed"
              }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <CalendarOff className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#16314f] block truncate">
                  Ausências
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Faltas agendadas e histórico
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          {/* 4. Parcelas */}
          <button
            type="button"
            onClick={() => handleTabClick("parcelas")}
            className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#16314f] block truncate">
                  Parcelas & Pagamentos
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Histórico financeiro e recibos
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          {/* 5. Dados Pessoais */}
          <button
            type="button"
            onClick={() => handleTabClick("dados-pessoais")}
            className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#16314f] flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#16314f] block truncate">
                  Dados Pessoais
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Informações do passageiro, endereço e observações
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
        </div>
      </div>

      {/* Modal de Notificar Ausência */}
      {temRotas && (
        <ResponsavelNotificarAusenciaDialog
          open={ausenciaDialogOpen}
          onOpenChange={setAusenciaDialogOpen}
          passageiroId={carteirinha.id}
          passageiroNome={carteirinha.nome}
          rotas={carteirinha.rotas || []}
          token={token || ""}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
